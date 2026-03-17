import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as ExcelJS from "exceljs";
import { Buffer } from "buffer";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
    Save, Trash2, ShoppingCart, Box, CircleAlert, 
    PackagePlus, FileUp, Keyboard, Loader2, AlertTriangle,
    UploadCloud, Filter, Search, X, Tag, Info, FileText, RefreshCw
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/others/text-field";
import { WpsErrorNotice } from "@/components/others/wps-error-notice";
import { SectionTitle } from "@/components/others/section-title";
import { EditableCell } from "@/components/others/editable-cell";
import { WebUrl } from '@/components/others/weburl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

if (typeof window !== "undefined") {
    window.Buffer = window.Buffer || Buffer;
}

export const schema = z.object({
    storeCode: z.string().min(1, "Required"),
    store: z.string().min(1, "Required"),
    plu: z.string().min(1, "Required"),
    itemDescp: z.string().min(1, "Required"),
    locationCode: z.string().min(1, "Required"),
    qtyPcs: z.string().min(1, "Required"),
    qtyCase: z.string().min(1, "Required"),
    qtyOnHand: z.string().min(1, "Required"),
    ohAfterAllocation: z.string(),
});

export type FormData = z.infer<typeof schema>;

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
            locationCode: "", qtyPcs: "0", qtyCase: "0", qtyOnHand: "0" , ohAfterAllocation: "-"
        },
    });

    const updateRequest = (index: number, field: keyof FormData, value: string) => {
        const formattedValue = field === "locationCode" || field === "itemDescp" 
            ? value.toUpperCase() 
            : value;

        setRequests((prev) => {
            const updated = [...prev];
            const targetPlu = updated[index].plu;

            if (field === "locationCode") {
                return updated.map((item) => {
                    if (item.plu === targetPlu) {
                        return { ...item, [field]: formattedValue };
                    }
                    return item;
                });
            }

            const newItems = [...updated];
            newItems[index] = { ...newItems[index], [field]: formattedValue };
            return newItems;
        });
    };

    /**---------------------------------------- PROCESS EXCEL ---------------------------------- */
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

            // Pass 1: Find Global Store Info and Header Row
            worksheet.eachRow((row, rowNumber) => {
                row.eachCell((cell, colNumber) => {
                    const val = cell.value?.toString().trim() || "";
                    if (val === "Store Code") {
                        const rawCode = row.getCell(colNumber + 1).value?.toString() || "";
                        globalStoreCode = rawCode.replace(/\D/g, ""); 
                    }
                    if (val === "Store Name") {
                        globalStoreName = row.getCell(colNumber + 1).value?.toString() || "";
                    }
                    if (val.toUpperCase() === "PLU" && headerRowNumber === -1) {
                        headerRowNumber = rowNumber;
                    }
                });
            });

            if (headerRowNumber === -1) throw new Error("Could not find 'PLU' column.");

            // Pass 2: Map Columns
            const anchorRow = worksheet.getRow(headerRowNumber);
            anchorRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const rawHeader = cell.value?.toString().toUpperCase().trim() || "";

                if (rawHeader === "PLU") {
                    excelHeaderMap[colNumber] = "plu";
                } 
                else if (rawHeader === "ST_CODE" || rawHeader.includes("STORE CODE")) {
                    excelHeaderMap[colNumber] = "storeCode";
                } 
                else if (rawHeader === "ST_NAME" || rawHeader.includes("STORE NAME")) {
                    excelHeaderMap[colNumber] = "store";
                } 
                else if (rawHeader === "DESCP" || rawHeader.includes("ITEM DESCRIPTION")) {
                    excelHeaderMap[colNumber] = "itemDescp";
                } 
                else if (rawHeader === "LOCATION") {
                    excelHeaderMap[colNumber] = "locationCode";
                }
                else if (rawHeader === "OH_GS" || rawHeader.includes("ON HAND")) {
                    excelHeaderMap[colNumber] = "qtyOnHand";
                } 
                else if (rawHeader === "PER CASE" || rawHeader.includes("QTY CASE") || rawHeader.includes("ALLOCATION")) {
                    excelHeaderMap[colNumber] = "qtyCase";
                } 
                else if (rawHeader.includes("QTY PCS") || rawHeader.includes("QTY (PCS)")) {
                    excelHeaderMap[colNumber] = "qtyPcs";
                }
            });

            const importedItems: FormData[] = [];
            const currentRequests = [...requests]; 
            const existingSet = new Set(currentRequests.map(r => `${r.storeCode}-${r.plu}`));
            let isEndOfTable = false;

            // Pass 3: Collect Data
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber <= headerRowNumber || isEndOfTable) return;

                const rowData: any = { 
                    storeCode: globalStoreCode, 
                    store: globalStoreName, 
                    locationCode: "", 
                    qtyPcs: "0", 
                    qtyCase: "0", 
                    qtyOnHand: "0" ,
                    ohAfterAllocation: "-"
                };
                
                let hasValidPlu = false;

                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    const mappedKey = excelHeaderMap[colNumber];
                    if (!mappedKey) return;

                    let cellVal: any = cell.value;
                    if (cellVal !== null && typeof cellVal === 'object') {
                        if ('result' in cellVal) cellVal = cellVal.result;
                        else if ('richText' in cellVal) cellVal = cellVal.richText.map((rt: any) => rt.text).join("");
                    }

                    let finalVal = (cellVal ?? "").toString().trim();

                    // Stop processing if we hit footer text
                    if (finalVal.toUpperCase().startsWith("REASON") || finalVal.toUpperCase().includes("PREPARED")) {
                        isEndOfTable = true;
                        return;
                    }

                    // VALIDATION: Store Code must be numeric
                    if (mappedKey === "storeCode") {
                        finalVal = finalVal.replace(/\D/g, "");
                    }

                    // Numeric formatting for quantities
                    if (["qtyCase", "qtyPcs", "qtyOnHand"].includes(mappedKey)) {
                        const num = parseFloat(finalVal);
                        finalVal = isNaN(num) ? "0" : Math.round(num).toString();
                    }

                    rowData[mappedKey] = finalVal;
                    if (mappedKey === "plu" && finalVal && !isNaN(Number(finalVal))) {
                        hasValidPlu = true;
                    }
                });

                if (hasValidPlu && !isEndOfTable) {
                    const identifier = `${rowData.storeCode}-${rowData.plu}`;
                    if (!existingSet.has(identifier)) {
                        importedItems.push(rowData as FormData);
                        existingSet.add(identifier); 
                    }
                }
            });

            if (importedItems.length === 0) {
                toast.info("No new items to add.");
            } else {
                setRequests(prev => [...importedItems, ...prev]);
                toast.success(`Imported ${importedItems.length} items.`);
            }

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = "";

        } catch (error: any) {
            toast.error(error.message || "Upload Failed");
        } finally {
            setIsCalculated(false);
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
        setRequests(prev => [currentValues, ...prev]);
        form.reset({ ...currentValues, plu: "", itemDescp: "", qtyPcs: "0", qtyCase: "0" });
        setIsCalculated(false);
        toast.success("Added to top.");
    };

    const [searchQuery, setSearchQuery] = useState("");
    const filteredRequests = requests.filter((req) => {
        const query = searchQuery.toLowerCase();
        return (
            req.storeCode.toLowerCase().includes(query) ||
            req.store.toLowerCase().includes(query) ||
            req.plu.toLowerCase().includes(query) ||
            req.itemDescp.toLowerCase().includes(query)
        );
    });

    /**---------------------------------------- GET LOCATIONS ---------------------------------- */
    // const [isFetchingLocations, setIsFetchingLocations] = useState(false);

    // const handleGetLocations = async () => {
    //     if (requests.length === 0) return;
        
    //     setIsFetchingLocations(true);
    //     try {
    //         const pluList = [...new Set(requests.map(req => req.plu))];
            
    //         const response = await fetch(`${WebUrl}/api/get-ptl-location`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ plu: pluList })
    //         });

    //         if (!response.ok) {
    //             toast.error("Database is offline, please try again later.");
    //             return;
    //         }
            
    //         const locationMap = await response.json();

    //         if (Object.keys(locationMap).length === 0) {
    //             toast.info("No locations found in database.");
    //         }

    //         setRequests(prev => prev.map(req => ({
    //             ...req,
    //             locationCode: locationMap[req.plu] || req.locationCode
    //         })));

    //         toast.success("Locations synced successfully!");

    //     } catch (err: unknown) {
    //         console.error("Lookup Error:", err);
            
    //         if (err instanceof Error) {
    //             toast.error(`Connection Failed: ${err.message}`);
    //         } else {
    //             toast.error("Critical Network Error occurred.");
    //         }
    //     } finally {
    //         setIsFetchingLocations(false);
    //     }
    // };
    /**---------------------------------------- GET LOCATIONS (LOCAL) ---------------------------------- */
    const [isFetchingLocations, setIsFetchingLocations] = useState(false);

        const handleGetLocations = () => {
        if (requests.length === 0) return;
        
        setIsFetchingLocations(true);
        
        setTimeout(() => {
            try {
                const localDataRaw = localStorage.getItem('master_dc_db'); 
                if (!localDataRaw) {
                    toast.error("Master DC not found. Please upload your inventory file to sync locations.");
                    setIsFetchingLocations(false);
                    return;
                }

                const localDb: any[] = JSON.parse(localDataRaw);
                const locationMap: Record<string, string> = {};

                localDb.forEach(item => {
                    if (item.SKU && item.LOCATION) {
                        const cleanSku = String(item.SKU).trim();
                        locationMap[cleanSku] = item.LOCATION;
                    }
                });

                let foundCount = 0;
                
                const updatedRequests = requests.map(req => {
                    const searchKey = String(req.plu).trim();
                    const newLoc = locationMap[searchKey];

                    if (newLoc) {
                        foundCount++;
                        return { ...req, locationCode: newLoc };
                    }
                    return req;
                });

                setRequests(updatedRequests);

                    if (foundCount === 0) {
                    toast.info("No results found in Master DC.");
                } else {
                    toast.success("Locations synced successfully!");
                }

            } catch (err) {
                console.error("Local Lookup Error:", err);
                toast.error("Failed to read local database.");
            } finally {
                setIsFetchingLocations(false);
            }
        }, 400);
    };

    /** -------------------------------------------- Save as Draft --------------------------------------- */
    const [isDraftSaving, setIsDraftSaving] = useState(false);

    const handleSaveDraft = () => {
        setIsDraftSaving(true);
        
        const draftData = {
            items: requests,
            savedDate: new Date().toISOString().split('T')[0] 
        };

        localStorage.setItem('allocation_draft', JSON.stringify(draftData));
        
        setTimeout(() => setIsDraftSaving(false), 500);
        toast.success("Draft saved! It will be available until midnight.");
    };

    /**------------------------------------------------ Load Draft ------------------------------------------ */
    useEffect(() => {
        const rawData = localStorage.getItem('allocation_draft');
        
        if (rawData) {
            const draft = JSON.parse(rawData);
            const today = new Date().toISOString().split('T')[0];

            if (draft.savedDate === today) {
                setRequests(draft.items);
            } else {
                localStorage.removeItem('allocation_draft');
                toast.info("Old draft expired and was cleared.");
            }
        }
    }, []);

    /**------------------------------------------------- Clear Draft ---------------------------------------- */
    const [isClearOpen, setIsClearOpen] = useState(false);

    const handleConfirmClear = () => {
        setRequests([]);
        setSearchQuery("");
        localStorage.removeItem('allocation_draft');
        setIsClearOpen(false);
    };

    /**---------------------------------------- Generate Excel File --------------------------------------- */

    const handleFinalSubmit = async () => {


        const invalidItems = requests.filter(item => 
            !item.locationCode?.trim() || 
            !item.storeCode?.trim() || 
            !item.store?.trim()
        );

        if (invalidItems.length > 0) {

            const missingLoc = requests.filter(i => !i.locationCode?.trim()).length;
            const missingStore = requests.filter(i => !i.storeCode?.trim() || !i.store?.trim()).length;

            let errorMsg = "Missing Information: ";
            if (missingStore > 0) errorMsg += `${missingStore} item(s) need Store details. `;
            if (missingLoc > 0) errorMsg += `${missingLoc} item(s) need a Location Code.`;

            toast.error(errorMsg.trim());
            return;
        }

        if (!isCalculated) {
            toast.error("Please re-calculate stock before generating the file.");
            return;
        }


        setIsSubmitting(true);
        try {
            const response = await axios.post(`${WebUrl}/api/manual-allocation`, 
                { items: requests },
                { responseType: 'blob' } 
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ManualAllocation-${new Date().toISOString().slice(0,10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); 
            toast.success("Excel generated successfully!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Export failed. Please check your connection or data format.");
        } finally {
            setIsSubmitting(false);
            localStorage.removeItem('allocation_draft');
            window.location.reload();
        }
    };

    /**--------------------------- Recalculate Stocks ------------------------- */
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [isCalculated, setIsCalculated] = useState(false);

    const getCalculatedData = (dataToProcess: any[]) => {
        const masterDataRaw = localStorage.getItem("master_dc_db");
        if (!masterDataRaw) return dataToProcess;

        const masterDBArray: any[] = JSON.parse(masterDataRaw);
        const stockBalanceMap = new Map();
        
        masterDBArray.forEach(item => {
            stockBalanceMap.set(String(item.SKU).trim(), Number(item["REAL OH"]) || 0);
        });

        const masterMap = new Map(masterDBArray.map(item => [String(item.SKU).trim(), item]));

        const reversed = [...dataToProcess].reverse();
        const processed = reversed.map(req => {
            const skuKey = String(req.plu).trim();
            const masterMatch = masterMap.get(skuKey);
            let currentRunningBalance = stockBalanceMap.get(skuKey);

            if (masterMatch && currentRunningBalance !== undefined) {
                const c2 = Number(masterMatch["C2"]) || 0;
                const allocation = Number(req.qtyCase) || 0;
                const remaining = currentRunningBalance - (c2 * allocation);
                stockBalanceMap.set(skuKey, remaining);
                return { ...req, ohAfterAllocation: String(remaining) };
            }
            return req;
        });

        return processed.reverse();
    };

    const handleManualCalculate = () => {
        setIsRecalculating(true);
        setIsCalculated(true);
        setTimeout(() => {
            const updated = getCalculatedData(requests);
            setRequests(updated);
            setIsRecalculating(false);
            toast.success("Calculations complete! You're ready to generate.");  
        }, 1000);
    };

    const handleDeleteRow = (indexToRemove: number) => {
        const filtered = requests.filter((_, i) => i !== indexToRemove);
        const recalculated = getCalculatedData(filtered);
        setRequests(recalculated);
        setIsCalculated(checkIfFullyCalculated(recalculated));
        toast.success(`Item removed. Stocks recalculated.`);
    };

    const checkIfFullyCalculated = (data: any[]) => {
        if (data.length === 0) return false;
        
        return data.every(item => 
            item.qtyOnHand !== undefined && 
            item.qtyOnHand !== null && 
            item.qtyOnHand !== ""
        );
    };

    /** ------------------------------ Check PLU and Description ------------------- */

    const pluValue = form.watch("plu");

    React.useEffect(() => {
        if (!pluValue) {
            form.setValue("itemDescp", "");
            form.setValue("locationCode", "");
            return;
        }

        const rawData = localStorage.getItem("master_dc_db");
        if (rawData) {
            try {
                const db = JSON.parse(rawData);

                const match = db.find((item: any) => String(item.SKU) === String(pluValue));
                
                if (match) {
                    form.setValue("itemDescp", match.DESCRIPTION || "", { shouldDirty: true });
                    form.setValue("locationCode", match.LOCATION || "N/A", { shouldDirty: true });
                }
            } catch (error) {
                console.error("Lookup failed:", error);
            }
        }
    }, [pluValue, form]);

    /**--------------------------------- Removed Filtered Items with Recalculation --------------------------- */
    const handleRemoveFiltered = () => {

        const keysToRemove = new Set(
            filteredRequests.map(item => `${item.plu}-${item.storeCode}`)
        );

        const remaining = requests.filter(
            item => !keysToRemove.has(`${item.plu}-${item.storeCode}`)
        );

        const recalculated = getCalculatedData(remaining);
        setRequests(recalculated);
        setSearchQuery(""); 

        setIsCalculated(checkIfFullyCalculated(recalculated));

        toast.success(`Removed ${filteredRequests.length} filtered items. Stocks recalculated.`);
    };

    return (
        <div className="space-y-4 w-full max-w mx-auto p-2">
            {/* Header and Controls */}
            <Card className="w-full shadow-sm border-gray-200 dark:border-slate-800 dark:bg-slate-950">
                <CardHeader className="border-b py-2 px-4 flex flex-row items-center justify-between dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-sm font-bold flex items-center gap-2 dark:text-slate-200">
                        <Box size={16} className="text-orange-600" />
                        Manual Allocation Request
                    </h2>
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-md">
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
                                    <TextField form={form} name="locationCode" label="Location Code" />
                                    <TextField form={form} name="qtyPcs" label="Qty (PCS)" isNumber/>
                                    <TextField form={form} name="qtyCase" label="Qty (Case)" isNumber/>
                                    <TextField form={form} name="qtyOnHand" label="On Hand" isNumber/>
                                </div>
                                <div className="flex justify-end pt-2 gap-2">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => form.reset({ ...form.getValues(), store: "", storeCode: "", plu: "", locationCode: "", itemDescp: "", qtyPcs: "0", qtyCase: "0", qtyOnHand: "0" })}
                                        className="h-8 text-xs font-bold border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
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
                                className="relative group cursor-pointer flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors"
                            >
                                <input type="file" accept=".xlsx" onChange={(e) => e.target.files?.[0] && processExcel(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loading} />
                                {loading ? <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" /> : <UploadCloud className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mb-4 transition-colors" />}
                                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">Click or drag .xlsx file here</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Staged Items Table */}
            {requests.length > 0 ? (
                <Card className="w-full overflow-hidden dark:border-slate-800 dark:bg-slate-950">
                    <CardHeader className="py-2 px-4 border-b bg-slate-50 dark:bg-slate-900 dark:border-slate-800 flex flex-row justify-between items-center">
                        <h3 className="text-[11px] font-bold text-gray-500 dark:text-slate-400 flex items-center gap-2 uppercase">
                            <ShoppingCart size={14} /> STAGED ITEMS ({requests.length})
                        </h3>
                        <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[10px] text-red-500 hover:bg-red-500/10 font-bold uppercase cursor-pointer transition-colors"
                            >
                                Clear All
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
                            <DialogHeader>
                                <DialogTitle className="text-zinc-900 dark:text-zinc-100 text-[15px]">Confirm Action</DialogTitle>
                                <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-[13px]">
                                    This will permanently delete all staged items and your current draft. This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="mt-4 gap-2 sm:gap-0">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setIsClearOpen(false)}
                                    className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={handleConfirmClear}
                                    className="text-[11px] font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 cursor-pointer"
                                >
                                    Clear Everything
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    </CardHeader>

                    <div className="px-4 py-2 border-b border-blue-50 dark:border-blue-900/10 bg-blue-50/40 dark:bg-blue-900/5 flex items-center gap-2">
                        <Info size={12} className="text-blue-500 shrink-0" />
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium italic">
                            Double-click any cell (Store, Location, Qty) to manually correct values.
                        </p>
                    </div>

                    <div className="p-2 border-b dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-2">
    {/* Search Input Container */}
    <div className="relative flex-1 max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Filter size={14} className="text-gray-400 dark:text-slate-500" />
        </div>
        <input
            type="text"
            placeholder="Filter by Store, PLU, or Description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full h-8 pl-9 pr-3 text-[12px] border border-gray-200 dark:border-slate-800 rounded-md bg-gray-50/50 dark:bg-slate-900/50 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-400 outline-none"
        />
        {searchQuery && (
            <button 
                onClick={() => setSearchQuery("")} 
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
                <X size={12} />
            </button>
        )}
    </div>

    {/* Remove Filtered Items Button (Only shows when searching) */}
    {searchQuery && filteredRequests.length > 0 && (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleRemoveFiltered}
            className={cn(
                "h-8 px-3 text-[10px] font-bold gap-2 uppercase flex items-center shadow-sm",
                "animate-in fade-in zoom-in duration-200 cursor-pointer",
                "hover:bg-red-700 hover:scale-105 hover:shadow-md transition-all duration-200",
                "active:scale-95"
            )}
        >
            <Trash2 size={14} className="transition-transform group-hover:rotate-12" />
            Remove Filtered ({filteredRequests.length})
        </Button>
    )}

    {/* Get Locations Button */}
    <Button
        variant="outline"
        size="sm"
        onClick={handleGetLocations}
        disabled={isFetchingLocations || requests.length === 0}
        className="h-8 px-3 text-[10px] font-bold gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-slate-800 dark:text-blue-400 uppercase flex items-center shadow-sm disabled:opacity-50 cursor-pointer"
    >
        {isFetchingLocations ? (
            <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
            <Tag size={14} />
        )}
        {isFetchingLocations ? "Syncing..." : "Get PTL Locations"}
    </Button>

    {/* Recalculate Button */}
    <Button 
        onClick={handleManualCalculate}
        variant="outline"
        className="h-8 px-3 text-[10px] font-bold gap-2 border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-slate-800 dark:text-yellow-400 uppercase flex items-center shadow-sm disabled:opacity-50 cursor-pointer"
        disabled={requests.length === 0 || isRecalculating}
    >
        <RefreshCw size={14} className={cn(isRecalculating && "animate-spin")} />
        {isRecalculating ? "Calculating..." : "Recalculate Stocks"}
    </Button>

    {searchQuery && (
        <span className="text-[10px] text-gray-400 italic whitespace-nowrap">
            Showing {filteredRequests.length} of {requests.length}
        </span>
    )}
</div>

                    <div className="overflow-auto max-h-[500px] scrollbar">
                        <table className="w-full text-[12px]">
                            <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 border-b dark:border-slate-800 shadow-sm z-10">
                                <tr className="text-left text-gray-600 dark:text-slate-400">
                                    <th className="p-3 font-bold uppercase text-[10px]">Store</th>
                                    <th className="p-3 font-bold uppercase text-[10px]">Product</th>
                                    <th className="p-3 font-bold uppercase text-[10px] w-24">Location</th>
                                    <th className="p-3 font-bold uppercase text-[10px] w-20">QTY (PCS)</th>
                                    <th className="p-3 font-bold uppercase text-[10px] w-20">QTY (ON HAND)</th>
                                    <th className="p-3 font-bold uppercase text-[10px] w-24">Allocation (Case)</th>
                                    <th className="p-3 font-bold uppercase text-[10px] w-28 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20">
                                        Remaining DC OH
                                    </th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-slate-800 bg-white dark:bg-slate-950">
                                {filteredRequests.map((req) => {
                                    const originalIndex = requests.findIndex(r => r === req);
                                    
                                    const isInvalid = !req.storeCode?.trim() || !req.store?.trim() || !req.locationCode?.trim();

                                    return (
                                            <tr 
                                                key={`row-${originalIndex}-${req.plu}`} 
                                                className={`transition-colors border-l-[4px] ${
                                                    isInvalid 
                                                        ? "border-l-red-500 bg-red-50/20 dark:bg-red-900/10 hover:bg-red-50/40" 
                                                        : "border-l-transparent hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
                                                }`}
                                            >
                                            <td className="p-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <EditableCell 
                                                        value={req.storeCode} 
                                                        onChange={(v) => updateRequest(originalIndex, "storeCode", v)} 
                                                        className="font-bold text-gray-800 dark:text-slate-200 text-[12px]"
                                                        placeholder="Set Store Code"
                                                        type="number"
                                                        maxLength={4}
                                                    />
                                                    <EditableCell 
                                                        value={req.store} 
                                                        onChange={(v) => updateRequest(originalIndex, "store", v)} 
                                                        className="text-[10px] text-gray-400 font-normal"
                                                        placeholder="Set Store Name"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-bold text-orange-600">{req.plu}</div>
                                                <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate max-w-[150px]">{req.itemDescp}</div>
                                            </td>
                                            <td className="p-2">
                                                <EditableCell value={req.locationCode} onChange={(v) => updateRequest(originalIndex, "locationCode", v)} />
                                            </td>
                                            <td className="p-2 dark:text-slate-300">
                                                <EditableCell value={req.qtyPcs} onChange={(v) => updateRequest(originalIndex, "qtyPcs", v)} type="number" />
                                            </td>
                                            <td className="p-2 dark:text-slate-300">
                                                <EditableCell value={req.qtyOnHand} onChange={(v) => updateRequest(originalIndex, "qtyOnHand", v)} type="number" />
                                            </td>
                                            <td className="p-2 dark:text-slate-300">
                                                <EditableCell value={req.qtyCase} onChange={(v) => updateRequest(originalIndex, "qtyCase", v)} type="number" />
                                            </td>
                                             <td className="p-2 dark:text-slate-300">
                                                {/* <div className="font-bold text-orange-600">{req.ohAfterAllocation}</div> */}
                                                <div className="font-bold text-blue-600">{req.ohAfterAllocation}</div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleDeleteRow(originalIndex)} 
                                                    className="h-7 w-7 text-red-300 hover:text-red-600 cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-slate-600">
                                                <Search size={24} className="opacity-20" />
                                                <p className="text-[11px] font-medium uppercase tracking-wider">{requests.length === 0 ? "No items staged" : `No results for "${searchQuery}"`}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="p-4 border-t dark:border-slate-800 flex flex-col items-end gap-2 bg-gray-50/30 dark:bg-slate-900/30">
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1 font-medium italic">
                            <CircleAlert size={12}/> Verify entries before generating file.
                        </span>
                        
                        <div className="flex flex-col items-end gap-2">
                            {/* Dynamic Alert Message */}
                            {!isCalculated && requests.length > 0 && (
                                <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold animate-pulse flex items-center gap-1 uppercase italic">
                                    <Info size={10} /> Pending Calculation: Please re-calculate stock before generating.
                                </p>
                            )}

                            <div className="flex gap-2">
                                {/* Save as Draft Button */}
                                <Button 
                                    onClick={handleSaveDraft}
                                    disabled={isSubmitting || requests.length === 0} 
                                    variant="outline"
                                    className="border-gray-300 dark:border-slate-700 h-10 px-6 gap-2 uppercase font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    {isDraftSaving ? "Saving..." : "Save as Draft"} <FileText size={16} />
                                </Button>

                                {/* Generate Button with Calculation Focus */}
                                <Button 
                                    onClick={handleFinalSubmit} 
                                    disabled={isSubmitting || requests.length === 0} 
                                    className={cn(
                                        "h-10 px-10 gap-2 uppercase font-bold text-xs shadow-md cursor-pointer transition-all duration-300",
                                        isCalculated 
                                            ? "bg-green-600 hover:bg-green-700 text-white" 
                                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700"
                                    )}
                                >
                                    {isSubmitting ? "Processing..." : "Generate Allocation"} 
                                    {isCalculated ? <Save size={16} /> : <AlertTriangle size={16} className="text-orange-500" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="w-full py-20 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/20">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-full shadow-sm mb-4">
                        <ShoppingCart size={32} className="text-gray-200 dark:text-slate-700" />
                    </div>
                    <p className="text-gray-400 dark:text-slate-500 font-medium text-sm italic">Your manual allocation requests will display here</p>
                    <p className="text-[10px] text-gray-300 dark:text-slate-600 mt-1 uppercase tracking-widest font-bold">Add items manually or upload a report to begin</p>
                </div>
            )}
        </div>
    );
};
