import React, { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as ExcelJS from "exceljs";
import { Buffer } from "buffer";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Save, Trash2, ShoppingCart, Box, CircleAlert, 
    PackagePlus, FileUp, Keyboard, Loader2, 
    UploadCloud, AlertCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
    Form, FormField, FormItem, FormLabel, 
    FormControl, FormMessage,
} from "@/components/ui/form";

// Asset imports for WPS Guide
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
    storeCode: z.string().min(1, "Required"),
    store: z.string().min(1, "Required"),
    plu: z.string().min(1, "Required"),
    itemDescp: z.string().min(1, "Required"),
    locationCode: z.string().min(1, "Required"),
    qtyPcs: z.string().min(1, "Required"),
    qtyCase: z.string().min(1, "Required"),
    qtyOnHand: z.string().min(1, "Required")
});

export type FormData = z.infer<typeof schema>;

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export const FormCard: React.FC = () => {
    const [mode, setMode] = useState<"form" | "upload">("form");
    const [requests, setRequests] = useState<FormData[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [encryptionError, setEncryptionError] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { 
            storeCode: "", store: "", plu: "", itemDescp: "", 
            locationCode: "", qtyPcs: "0", qtyCase: "0", qtyOnHand: "0" 
        },
    });

    const updateRequest = (index: number, field: keyof FormData, value: string) => {
        setRequests((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    /* --------------------------- SMART UPLOAD LOGIC ------------------------- */
    const processExcel = async (file: File) => {
        try {
            setLoading(true);
            setEncryptionError(false);

            const arrayBuffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];
            if (!worksheet) throw new Error("Empty worksheet.");

            let headerRowNumber = -1;
            let globalStoreCode = "";
            let globalStoreName = "";
            const excelHeaderMap: { [key: number]: keyof FormData } = {};

            // 1. Identify Layout & Global Store Info
            worksheet.eachRow((row, rowNumber) => {
                row.eachCell((cell, colNumber) => {
                    const val = cell.value?.toString().trim() || "";
                    const upperVal = val.toUpperCase();

                    // Detect Single-Store Header (Manual Request Form)
                    if (val === "Store Code") globalStoreCode = row.getCell(colNumber + 1).value?.toString() || "";
                    if (val === "Store Name") globalStoreName = row.getCell(colNumber + 1).value?.toString() || "";
                    
                    // Detect Table Header Start
                    if (upperVal === "PLU" && headerRowNumber === -1) {
                        headerRowNumber = rowNumber;
                    }
                });
            });

            if (headerRowNumber === -1) throw new Error("Could not find 'PLU' column.");

            // 2. Map Columns based on identified Header Row
            const anchorRow = worksheet.getRow(headerRowNumber);
            anchorRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const rawHeader = cell.value?.toString().toUpperCase().trim() || "";
                
                if (rawHeader === "PLU") excelHeaderMap[colNumber] = "plu";
                else if (rawHeader === "ST_CODE") excelHeaderMap[colNumber] = "storeCode";
                else if (rawHeader === "ST_NAME") excelHeaderMap[colNumber] = "store";
                else if (rawHeader === "DESCP" || rawHeader.includes("ITEM DESCRIPTION")) excelHeaderMap[colNumber] = "itemDescp";
                // else if (rawHeader.includes("LOCATION")) excelHeaderMap[colNumber] = "locationCode";
                else if (rawHeader === "OH_GS" || rawHeader.includes("ON HAND")) excelHeaderMap[colNumber] = "qtyOnHand";
                else if (rawHeader === "PER CASE" || rawHeader.includes("QTY CASE")) excelHeaderMap[colNumber] = "qtyCase";
                else if (rawHeader.includes("MANUAL REQUEST ALLOCATION_PER CASE") || rawHeader.includes("QTY PCS")) excelHeaderMap[colNumber] = "qtyPcs";
            });

            // 3. Process Data Rows
            const importedItems: FormData[] = [];
            const existingSet = new Set(requests.map(r => `${r.storeCode}-${r.plu}`));
            let isEndOfTable = false;

            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber <= headerRowNumber || isEndOfTable) return;

                const rowData: any = { 
                    storeCode: globalStoreCode, 
                    store: globalStoreName,
                    locationCode: "", qtyPcs: "0", qtyCase: "0", qtyOnHand: "0" 
                };

                let hasValidPlu = false;
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    const mappedKey = excelHeaderMap[colNumber];
                    if (!mappedKey) return;

                    let val = cell.value;
                    if (val && typeof val === 'object' && 'result' in val) val = (val as any).result;

                    if (typeof val === 'number' && (mappedKey === "qtyCase" || mappedKey === "qtyPcs")) {
                        val = Math.floor(val);
                    }
                    
                    const strVal = val?.toString().trim() || "";
                    if (strVal.toUpperCase().startsWith("REASON") || strVal.toUpperCase().includes("PREPARED")) {
                        isEndOfTable = true;
                        return;
                    }

                    rowData[mappedKey] = strVal;
                    if (mappedKey === "plu" && strVal && !isNaN(Number(strVal))) hasValidPlu = true;
                });

                if (hasValidPlu && !isEndOfTable) {
                    const identifier = `${rowData.storeCode}-${rowData.plu}`;
                    if (!existingSet.has(identifier)) {
                        importedItems.push(rowData as FormData);
                        existingSet.add(identifier);
                    }
                }
            });

            // LATEST INSERT AT TOP
            setRequests(prev => [...importedItems, ...prev]);
            toast.success(`Imported ${importedItems.length} items.`);

        } catch (error: any) {
            if (error.message?.includes("signature") || error.message?.includes("encrypted")) {
                setEncryptionError(true);
            } else {
                toast.error(error.message || "Upload Failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const addToRequests = async () => {
        const isValid = await form.trigger();
        if (!isValid) return;

        const currentValues = form.getValues();
        const identifier = `${currentValues.storeCode}-${currentValues.plu}`;
        
        if (requests.some(r => `${r.storeCode}-${r.plu}` === identifier)) {
            toast.error("Duplicate PLU found.");
            return;
        }

        // LATEST INSERT AT TOP
        setRequests(prev => [currentValues, ...prev]);
        form.reset({ ...currentValues, plu: "", itemDescp: "", qtyPcs: "0", qtyCase: "0" });
        toast.success("Added to top.");
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            await axios.post('/api/manual-allocation', { items: requests });
            toast.success("Allocation Generated!");
            setRequests([]);
        } catch (error) {
            toast.error("Submission failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 w-full max-w mx-auto p-2">
            {/* Header and Controls */}
            <Card className="w-full shadow-sm border-gray-200">
                <CardHeader className="border-b py-2 px-4 flex flex-row items-center justify-between">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <Box size={16} className="text-orange-600" />
                        Manual Allocation Request
                    </h2>
                    <div className="flex bg-gray-100 p-1 rounded-md">
                        <Button variant={mode === "form" ? "default" : "ghost"} size="sm" onClick={() => setMode("form")} className="h-7 text-[10px] px-3 font-bold uppercase cursor-pointer">
                            <Keyboard size={12} className="mr-1" /> Form
                        </Button>
                        <Button variant={mode === "upload" ? "default" : "ghost"} size="sm" onClick={() => setMode("upload")} className="h-7 text-[10px] px-3 font-bold uppercase cursor-pointer">
                            <FileUp size={12} className="mr-1" /> Upload
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="pt-4">
                    {mode === "form" ? (
                        <Form {...form}>
                            <form className="space-y-4">
                                <SectionTitle title="Store Info" />
                                <div className="grid grid-cols-2 gap-3">
                                    <TextField form={form} name="storeCode" label="Store Code" isNumber maxLength={4}/>
                                    <TextField form={form} name="store" label="Store Name" />
                                </div>
                                <SectionTitle title="Item Details" />
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <TextField form={form} name="plu" label="PLU" isNumber/>
                                    <TextField form={form} name="itemDescp" label="Description" />
                                    <TextField form={form} name="locationCode" label="Loc Code" />
                                    <TextField form={form} name="qtyPcs" label="Qty (PCS)" isNumber/>
                                    <TextField form={form} name="qtyCase" label="Qty (Case)" isNumber/>
                                    <TextField form={form} name="qtyOnHand" label="On Hand" isNumber/>
                                </div>
                                <div className="flex justify-end pt-2 gap-2">

                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => form.reset({
                                            ...form.getValues(),
                                            store: "",
                                            storeCode: "",
                                            plu: "", 
                                            itemDescp: "", 
                                            qtyPcs: "0", 
                                            qtyCase: "0", 
                                            qtyOnHand: "0"
                                        })}
                                        className="h-8 text-xs font-bold border-gray-300 hover:bg-gray-100 cursor-pointer"
                                    >
                                        Clear Fields
                                    </Button>

                                    <Button 
                                        type="button" 
                                        onClick={addToRequests} 
                                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-8 text-xs gap-1 cursor-pointer"
                                    >
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
                                onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) processExcel(e.dataTransfer.files[0]); }}
                                className="relative group cursor-pointer flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <input type="file" accept=".xlsx" onChange={(e) => e.target.files?.[0] && processExcel(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loading} />
                                {loading ? <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" /> : <UploadCloud className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mb-4 transition-colors" />}
                                <p className="text-sm text-gray-600 font-medium">Click or drag Alfamart Custom Report here</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Staged Items Table */}
            {requests.length > 0 ? (
                <Card className="w-full overflow-hidden">
                    <CardHeader className="py-2 px-4 border-b bg-slate-50 flex flex-row justify-between items-center">
                        <h3 className="text-[11px] font-bold text-gray-500 flex items-center gap-2 uppercase">
                            <ShoppingCart size={14} /> STAGED ITEMS ({requests.length})
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setRequests([])} className="h-6 text-[10px] text-red-500 hover:text-red-700 font-bold uppercase cursor-pointer">Clear All</Button>
                    </CardHeader>
                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-[12px]">
                            <thead className="bg-white sticky top-0 border-b shadow-sm z-10">
                                <tr className="text-left text-gray-600">
                                    <th className="p-3 font-bold uppercase text-[10px]">Store</th>
                                    <th className="p-3 font-bold uppercase text-[10px]">Product</th>
                                    <th className="p-3 font-bold uppercase text-[10px] w-24">Location</th>
                                    <th className="p-3 font-bold uppercase text-[10px] w-20">QTY (PCS)</th>
                                    <th className="p-3 font-bold uppercase text-[10px] w-20">QTY (CASE)</th>
                                    <th className="p-3 font-bold uppercase text-[10px] w-20">QTY (ON HAND)</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {requests.map((req, i) => (
                                    <tr key={`${req.storeCode}-${req.plu}-${i}`} className="hover:bg-blue-50/40 transition-colors animate-in fade-in slide-in-from-top-1">
                                        <td className="p-3">
                                            <div className="font-bold text-gray-700">{req.storeCode}</div>
                                            <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{req.store}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-orange-600">{req.plu}</div>
                                            <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{req.itemDescp}</div>
                                        </td>
                                        <td className="p-2">
                                            <EditableCell value={req.locationCode} onChange={(v) => updateRequest(i, "locationCode", v)} />
                                        </td>
                                        <td className="p-2">
                                            <EditableCell value={req.qtyPcs} onChange={(v) => updateRequest(i, "qtyPcs", v)} type="number" />
                                        </td>
                                        <td className="p-2">
                                            <EditableCell value={req.qtyCase} onChange={(v) => updateRequest(i, "qtyCase", v)} type="number" />
                                        </td>
                                        <td className="p-2">
                                            <EditableCell value={req.qtyOnHand} onChange={(v) => updateRequest(i, "qtyOnHand", v)} type="number" />
                                        </td>
                                        <td className="p-3 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setRequests(prev => prev.filter((_, idx) => idx !== i))} className="h-8 w-8 text-red-400 hover:text-red-600 cursor-pointer">
                                                <Trash2 size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t flex flex-col items-end gap-2 bg-gray-50/30">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium"><CircleAlert size={12}/> Verify top entries before generating file.</span>
                        <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 h-10 px-10 gap-2 uppercase font-bold text-xs shadow-md">
                            {isSubmitting ? "Processing..." : "Generate Allocation"} <Save size={16} />
                        </Button>
                    </div>
                </Card>
            ) : (
                /* EMPTY STATE PLACEHOLDER */
                <div className="w-full py-20 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center bg-gray-50/50">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <ShoppingCart size={32} className="text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-medium text-sm italic">
                        Your manual allocation requests will display here
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest font-bold">
                        Add items manually or upload a report to begin
                    </p>
                </div>
            )}
        </div>
    );
};

/* --------------------------- HELPERS ---------------------------- */

const EditableCell = ({ value, onChange, type = "text" }: { value: string, onChange: (v: string) => void, type?: string }) => (
    <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 px-2 bg-white border border-gray-200 focus:border-blue-500 rounded outline-none text-[11px] font-semibold transition-all"
    />
);

const WpsErrorNotice = ({ onDismiss }: { onDismiss: () => void }) => (
    <div className="p-4 border-2 border-red-200 bg-red-50 rounded-xl space-y-3 text-sm text-red-900 mb-4 shadow-md">
        <h3 className="font-bold flex items-center gap-2 text-red-950 text-base">
            <AlertCircle size={20} className="text-red-600" /> WPS Encryption Detected
        </h3>
        <p className="text-xs">Your report is protected. Re-save it as <strong>Excel Workbook (.xlsx)</strong> following these steps:</p>
        <div className="grid grid-cols-3 gap-2 py-1">
            <img src={Step1} alt="Save As" className="rounded border border-red-200 h-16 w-full object-cover" />
            <img src={Step2} alt="Format" className="rounded border border-red-200 h-16 w-full object-cover" />
            <img src={Step3} alt="Decrypt" className="rounded border border-red-200 h-16 w-full object-cover" />
        </div>
        <Button onClick={onDismiss} variant="destructive" size="sm" className="w-full h-8 text-[10px] font-bold uppercase tracking-wider">Dismiss & Retry</Button>
    </div>
);

const SectionTitle = ({ title }: { title: string }) => (
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 border-b pb-1">{title}</div>
);

const TextField = ({ 
    form, 
    name, 
    label, 
    isNumber = false,
    maxLength // New prop
}: { 
    form: UseFormReturn<FormData>, 
    name: keyof FormData, 
    label: string,
    isNumber?: boolean,
    maxLength?: number 
}) => (
    <FormField control={form.control} name={name} render={({ field }) => (
        <FormItem className="space-y-0.5">
            <FormLabel className="text-[11px] font-bold text-gray-600">{label}</FormLabel>
            <FormControl>
                <Input 
                    {...field} 
                    className="uppercase h-8 text-xs shadow-none border-gray-300 focus:border-orange-500" 
                    onChange={(e) => {
                        const val = e.target.value;
                        
                        // 1. Check Max Length
                        if (maxLength && val.length > maxLength) return;

                        // 2. Check Numeric Regex (Only if isNumber is true)
                        if (isNumber && val !== "" && !/^\d+$/.test(val)) return;

                        field.onChange(val);
                    }}
                />
            </FormControl>
            <FormMessage className="text-[9px]" />
        </FormItem>
    )} />
);
