import React, { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as ExcelJS from "exceljs";
import { Buffer } from "buffer";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Save, 
    Trash2, 
    ShoppingCart, 
    Box, 
    CircleAlert, 
    PackagePlus, 
    FileUp, 
    Keyboard,
    Loader2,
    UploadCloud,
    AlertCircle,
    FileSpreadsheet
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

// Asset imports (Assuming these paths exist in your project)
import Step1 from "@/assets/WpsGuide/Step1.jpg";
import Step2 from "@/assets/WpsGuide/Step2.jpg";
import Step3 from "@/assets/WpsGuide/Step3.jpg";

if (typeof window !== "undefined") {
    window.Buffer = window.Buffer || Buffer;
}

/* -------------------------------------------------------------------------- */
/* SCHEMA & TYPES                                                             */
/* -------------------------------------------------------------------------- */

export const schema = z.object({
    storeCode: z.string().min(1, "Store Code is required."),
    store: z.string().min(1, "Store Name is required."),
    plu: z.string().min(1, "PLU is required."),
    itemDescp: z.string().min(1, "Item description is required."),
    locationCode: z.string().min(1, "Location code is required."),
    qtyPcs: z.string().min(1, "Quantity is required."),
    qtyCase: z.string().min(1, "Case Quantity is required."),
    qtyOnHand: z.string().min(1, "Quantity on hand is required.")
});

export type FormData = z.infer<typeof schema>;

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                            */
/* -------------------------------------------------------------------------- */

export const FormCard: React.FC = () => {
    const [mode, setMode] = useState<"manual" | "upload">("manual");
    const [requests, setRequests] = useState<FormData[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Upload States
    const [loading, setLoading] = useState(false);
    const [encryptionError, setEncryptionError] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { storeCode: "", store: "", plu: "", itemDescp: "", locationCode: "", qtyPcs: "", qtyCase: "", qtyOnHand: "" },
    });

    /* --------------------------- ExcelJS Processing Logic ------------------- */
    const processExcel = async (file: File) => {
        try {
            setLoading(true);
            setEncryptionError(false);

            const arrayBuffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            
            // Attempt to load. Browser-side ExcelJS will throw on RC4/Old WPS encryption.
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];
            if (!worksheet) throw new Error("Empty worksheet.");

            let headerRowNumber = -1;
            let stCode = "";
            let stName = "";
            const excelHeaderMap: { [key: number]: string } = {};
            const importedItems: FormData[] = [];

            // STEP 1: Metadata & Header Anchor Search
            worksheet.eachRow((row, rowNumber) => {
                const label = row.getCell(3).value?.toString().trim(); // Column C
                const value = row.getCell(4).value?.toString().trim(); // Column D

                if (label === "Store Code") stCode = value || "";
                if (label === "Store Name") stName = value || "";

                if (headerRowNumber === -1) {
                    row.eachCell((cell) => {
                        if (cell.value?.toString().toUpperCase().trim() === "PLU") {
                            headerRowNumber = rowNumber;
                        }
                    });
                }
            });

            if (headerRowNumber === -1) throw new Error("Could not find 'PLU' header column.");

            // STEP 2: Map Columns
            const anchorRow = worksheet.getRow(headerRowNumber);
            anchorRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const rawHeader = cell.value?.toString().toUpperCase().trim() || "";
                
                if (rawHeader === "PLU") excelHeaderMap[colNumber] = "plu";
                else if (rawHeader.includes("ITEM DESCRIPTION")) excelHeaderMap[colNumber] = "itemDescp";
                else if (rawHeader.includes("LOCATION")) excelHeaderMap[colNumber] = "locationCode";
                else if (rawHeader.includes("QTC PCS")) excelHeaderMap[colNumber] = "qtyPcs";
                else if (rawHeader.includes("QTY CASE")) excelHeaderMap[colNumber] = "qtyCase";
                else if (rawHeader.includes("ON HAND")) excelHeaderMap[colNumber] = "qtyOnHand";
            });

            // STEP 3: Data Extraction
            let isEndOfTable = false;
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber <= headerRowNumber || isEndOfTable) return;

                const rowData: any = {
                    storeCode: stCode,
                    store: stName
                };
                
                let hasValidPlu = false;

                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    const mappedKey = excelHeaderMap[colNumber];
                    let val = cell.value;

                    // Handle Objects/Formulas
                    if (val && typeof val === 'object') {
                        if ('result' in val) val = (val as any).result;
                        else if ('richText' in val) val = (val as any).richText.map((t: any) => t.text).join("");
                    }

                    const strVal = val?.toString().toUpperCase().trim() || "";
                    if (strVal.startsWith("REASON") || strVal.includes("PREPARED BY")) {
                        isEndOfTable = true;
                    }

                    if (mappedKey) {
                        rowData[mappedKey] = val?.toString() || "";
                        if (mappedKey === "plu" && val && !isNaN(Number(val))) {
                            hasValidPlu = true;
                        }
                    }
                });

                if (hasValidPlu && !isEndOfTable) {
                    importedItems.push(rowData as FormData);
                }
            });

            setRequests(prev => [...prev, ...importedItems]);
            toast.success(`Staged ${importedItems.length} items from ${file.name}`);
            setMode("manual"); // Switch back to see the table

        } catch (error: any) {
            console.error(error);
            if (error.message.includes("signature")) {
                setEncryptionError(true);
            } else {
                toast.error(error.message || "Failed to process Excel");
            }
        } finally {
            setLoading(false);
        }
    };

    /* --------------------------- Submission Logic ---------------------------- */
    const addToRequests = async () => {
        const isValid = await form.trigger();
        if (!isValid) return;

        const currentValues = form.getValues();
        setRequests(prev => [...prev, currentValues]);
        
        form.reset({
            ...currentValues,
            plu: "", itemDescp: "", locationCode: "", qtyPcs: "", qtyCase: "", qtyOnHand: ""
        });
        toast.success("Added to list.");
    };

    const handleFinalSubmit = async () => {
        if (requests.length === 0) return;
        setIsSubmitting(true);
        try {
            await axios.post('/api/manual-allocation', { items: requests });
            toast.success("Request Generated!");
            setRequests([]);
        } catch (error) {
            toast.error("Submission failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 w-full">
            <Card className="w-full shadow-sm border-gray-200 dark:border-gray-800">
                <CardHeader className="border-b py-2 px-4 flex flex-row items-center justify-between">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <Box size={16} className="text-orange-600" />
                        Manual Allocation Request
                    </h2>
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
                        <Button 
                            variant={mode === "manual" ? "default" : "ghost"} 
                            size="sm" onClick={() => setMode("manual")} 
                            className="h-7 text-[10px] px-3 uppercase font-bold cursor-pointer"
                        >
                            <Keyboard size={12} className="mr-1" /> Manual
                        </Button>
                        <Button 
                            variant={mode === "upload" ? "default" : "ghost"} 
                            size="sm" onClick={() => setMode("upload")} 
                            className="h-7 text-[10px] px-3 uppercase font-bold cursor-pointer"
                        >
                            <FileUp size={12} className="mr-1" /> Upload
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="pt-4">
                    {mode === "manual" ? (
                        <Form {...form}>
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <SectionTitle title="Store Info" />
                                <div className="grid grid-cols-2 gap-3">
                                    <TextField form={form} name="storeCode" label="Store Code" />
                                    <TextField form={form} name="store" label="Store Name" />
                                </div>

                                <SectionTitle title="Item Details" />
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <TextField form={form} name="plu" label="PLU" />
                                    <TextField form={form} name="itemDescp" label="Description" />
                                    <TextField form={form} name="locationCode" label="Location Code" />
                                    <TextField form={form} name="qtyPcs" label="Quantity (PCS)" />
                                    <TextField form={form} name="qtyCase" label="Quantity (Case)" />
                                    <TextField form={form} name="qtyOnHand" label="Quantity (On Hand)" />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button type="button" onClick={addToRequests} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-8 text-xs gap-1">
                                        <PackagePlus size={16} /> Add to Requests
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    ) : (
                        <div className="space-y-4">
                            {encryptionError && <WpsErrorNotice onDismiss={() => setEncryptionError(false)} />}
                            
                            <div 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { e.preventDefault(); processExcel(e.dataTransfer.files[0]); }}
                                className="relative group cursor-pointer flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                            >
                                <input 
                                    type="file" accept=".xlsx" 
                                    onChange={(e) => e.target.files?.[0] && processExcel(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={loading}
                                />
                                {loading ? <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" /> : <UploadCloud className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mb-4 transition-colors" />}
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* STAGED TABLE */}
            {requests.length > 0 && (
                <Card className="w-full">
                    <CardHeader className="py-2 px-4 border-b bg-slate-50">
                        <h3 className="text-[11px] font-bold text-gray-500 flex items-center gap-2">
                            <ShoppingCart size={14} /> STAGED ITEMS ({requests.length})
                        </h3>
                    </CardHeader>
                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-[12px]">
                            <thead className="bg-white sticky top-0 border-b shadow-sm z-10">
                                <tr>
                                    <th className="p-2 text-left bg-white">Store Code</th>
                                    <th className="p-2 text-left bg-white">Store Name</th>
                                    <th className="p-2 text-left bg-white">PLU</th>
                                    <th className="p-2 text-left bg-white">Item Description</th>
                                    <th className="p-2 text-left bg-white">Location Code</th>
                                    <th className="p-2 text-left bg-white">Qty (Pcs)</th>
                                    <th className="p-2 text-left bg-white">Qty (Case)</th>
                                    <th className="p-2 text-left bg-white">Qty (On Hand)</th>
                                    <th className="p-2 text-right bg-white">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {requests.map((req, i) => (
                                    <tr key={i} className="hover:bg-blue-50/30">
                                        <td className="p-2 text-gray-500">{req.storeCode}</td>
                                        <td className="p-2 text-gray-500">{req.store}</td>
                                        <td className="p-2 text-gray-500">{req.plu}</td>
                                        <td className="p-2 text-gray-500">{req.itemDescp}</td>
                                        <td className="p-2 text-gray-500">{req.locationCode}</td>
                                        <td className="p-2 text-gray-500">{req.qtyPcs}</td>
                                        <td className="p-2 text-gray-500">{req.qtyCase}</td>
                                        <td className="p-2 text-gray-500">{req.qtyOnHand}</td>
                                        <td className="p-2 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setRequests(r => r.filter((_, idx) => idx !== i))} className="h-7 w-7 text-red-500">
                                                <Trash2 size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t flex flex-col items-end gap-2 bg-gray-50/30">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><CircleAlert size={12}/> Review staged data before generating request.</span>
                        <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 h-10 px-10 gap-2 uppercase font-bold text-xs shadow-md">
                            {isSubmitting ? "Processing..." : "Generate Request"} <Save size={16} />
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

/* --------------------------- SUB-COMPONENTS ---------------------------- */

const WpsErrorNotice = ({ onDismiss }: { onDismiss: () => void }) => (
    <div className="p-6 border-2 border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 rounded-xl space-y-4 text-sm text-red-900 dark:text-red-200 shadow-sm mb-4">
        <h3 className="font-bold flex items-center gap-2 text-red-950 dark:text-red-100 text-base">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
            WPS Encryption Detected
        </h3>
        <p>Your WPS file uses an outdated encryption method. Please re-save as <strong>Excel Workbook (*.xlsx)</strong> and remove any passwords.</p>
        <div className="grid grid-cols-3 gap-2 py-2">
            <img src={Step1} alt="Save As" className="rounded border border-red-200 h-20 object-cover w-full" />
            <img src={Step2} alt="Format" className="rounded border border-red-200 h-20 object-cover w-full" />
            <img src={Step3} alt="Decrypt" className="rounded border border-red-200 h-20 object-cover w-full" />
        </div>
        <Button onClick={onDismiss} variant="destructive" size="sm" className="w-full">Dismiss & Try Again</Button>
    </div>
);

const SectionTitle = ({ title }: { title: string }) => (
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</div>
);

const TextField = ({ form, name, label }: any) => (
    <FormField control={form.control} name={name} render={({ field }) => (
        <FormItem className="space-y-0.5">
            <FormLabel className="text-[10px] font-bold">{label}</FormLabel>
            <FormControl>
                <Input {...field} value={field.value ?? ""} className="uppercase h-8 text-xs shadow-none border-gray-300 focus:ring-1" />
            </FormControl>
            <FormMessage className="text-[9px]" />
        </FormItem>
    )} />
);
