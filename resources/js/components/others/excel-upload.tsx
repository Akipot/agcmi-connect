import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Trash2, Loader2, UploadCloud, Database, AlertCircle } from 'lucide-react';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import Step1 from "@/assets/WpsGuide/Step1.jpg";
import Step2 from "@/assets/WpsGuide/Step2.jpg";
import Step3 from "@/assets/WpsGuide/Step3.jpg";

interface ExcelUploadZoneProps {
    // onDataLoaded: (data: any[], fileName: string) => void;
    onClear: () => void;
}

export const ExcelUploadZone = ({ onClear }: ExcelUploadZoneProps) => {
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);

    const [rowCount, setRowCount] = useState(0);
    const [localData, setLocalData] = useState<any[]>([]); 
    const [isUploading, setIsUploading] = useState(false);
    const [encryptionError, setEncryptionError] = useState(false);
    // The specific headers you requested
    const finalHeaders = [
        "ST_CODE", "ST_NAME", "PLU", "DESC", "C2", 
        "LOCATION CODE", "QTC PCS", "QTY CASE (s)", 
        "QTY ON HAND", "DELIVERY NOTE NUMBER"
    ];

    const processExcel = async (file: File) => {
        try {
            setLoading(true);
            if (typeof window !== 'undefined' && !window.Buffer) {
                window.Buffer = Buffer as any;
            }

            const arrayBuffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];
            if (!worksheet) throw new Error("Empty worksheet.");

            let headerRowNumber = -1;
            let stCode = "";
            let stName = "";
            const excelHeaderMap: { [key: number]: string } = {};
            const jsonData: any[] = [];

            // --- STEP 1: Extract Store Metadata & Find Header Row ---
            worksheet.eachRow((row, rowNumber) => {
                const label = row.getCell(3).value?.toString().trim(); // Column C
                const value = row.getCell(4).value?.toString().trim(); // Column D

                if (label === "Store Code") stCode = value || "";
                if (label === "Store Name") stName = value || "";

                // Find where the table starts
                if (headerRowNumber === -1) {
                    row.eachCell((cell) => {
                        if (cell.value?.toString().toUpperCase().trim() === "PLU") {
                            headerRowNumber = rowNumber;
                        }
                    });
                }
            });

            // --- STEP 2: Map Excel Columns to your Short Keys ---
            const anchorRow = worksheet.getRow(headerRowNumber);
            anchorRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const rawHeader = cell.value?.toString().toUpperCase().trim() || "";
                
                if (rawHeader === "PLU") excelHeaderMap[colNumber] = "PLU";
                else if (rawHeader.includes("ITEM DESCRIPTION")) excelHeaderMap[colNumber] = "DESC";
                else if (rawHeader === "C2") excelHeaderMap[colNumber] = "C2";
                else if (rawHeader.includes("LOCATION")) excelHeaderMap[colNumber] = "LOCATION CODE";
                else if (rawHeader.includes("QTC PCS")) excelHeaderMap[colNumber] = "QTC PCS";
                else if (rawHeader.includes("QTY CASE")) excelHeaderMap[colNumber] = "QTY CASE (s)";
                else if (rawHeader.includes("ON HAND")) excelHeaderMap[colNumber] = "QTY ON HAND";
                else if (rawHeader.includes("DELIVERY NOTE")) excelHeaderMap[colNumber] = "DELIVERY NOTE NUMBER";
            });

            // --- STEP 3: Process Data Rows ---
            let isEndOfTable = false;
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber <= headerRowNumber || isEndOfTable) return;

                const rowData: any = {
                    ST_CODE: stCode,
                    ST_NAME: stName
                };
                
                let hasValidPlu = false;

                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    const mappedKey = excelHeaderMap[colNumber];
                    let val = cell.value;

                    // Handle Excel objects/formulas
                    if (val && typeof val === 'object') {
                        if ('result' in val) val = (val as any).result;
                        else if ('richText' in val) val = (val as any).richText.map((t: any) => t.text).join("");
                    }

                    const strVal = val?.toString().toUpperCase().trim() || "";
                    if (strVal.startsWith("REASON") || strVal.includes("PREPARED BY")) {
                        isEndOfTable = true;
                    }

                    if (mappedKey) {
                        rowData[mappedKey] = val;
                        if (mappedKey === "PLU" && val && !isNaN(Number(val))) {
                            hasValidPlu = true;
                        }
                    }
                });

                if (hasValidPlu && !isEndOfTable) {
                    jsonData.push(rowData);
                }
            });

            setTableData(jsonData);
            // onDataLoaded(jsonData, file.name);
            setFileName(file.name);

        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFileName(null);
        setRowCount(0);
        setLocalData([]);
        onClear();
    };

    return (
        <div className="space-y-4 w-full">
            <Card className="border-dashed border-2 border-muted-foreground/25 mb-2">
                <CardHeader>
                    <h3 className="text-md font-semibold flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        Import Excel Data
                    </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    
                    {encryptionError && (
                        <div className="mt-6 p-6 border-2 border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 rounded-xl space-y-4 text-sm text-red-900 dark:text-red-200 shadow-sm mb-2">
                            <h3 className="font-bold flex items-center gap-2 text-red-950 dark:text-red-100 text-base">
                                <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                                Compatibility Issue: WPS Encryption Detected
                            </h3>
                            <p>
                                Your version of WPS Office is using an outdated encryption method (RC4) that cannot be opened securely in this browser tool. <strong>Please create a compatible copy by following these steps:</strong>
                            </p>
                            
                            <ul className="list-decimal ml-6 space-y-6 marker:font-bold marker:text-red-700 dark:marker:text-red-500">
                                <li>
                                    <p>Open the file in WPS Office, click <strong>Menu/File</strong> {'>'} <strong>Save As</strong>.</p>
                                    <img 
                                        src={Step1} 
                                        alt="WPS Office Save As menu screenshot" 
                                        className="mt-2 border border-red-100 dark:border-red-900 rounded-lg shadow-inner max-w-full h-auto max-h-[150px] opacity-90 hover:opacity-100 transition-opacity" 
                                    />
                                </li>
                                <li>
                                    <p>Select <strong>Excel Workbook (*.xlsx)</strong> as the file type. </p>
                                    <img 
                                        src={Step2}
                                        alt="WPS file type dropdown highlighting .xlsx format" 
                                        className="mt-2 border border-red-100 dark:border-red-900 rounded-lg shadow-inner max-w-full h-auto max-h-[150px] opacity-90 hover:opacity-100 transition-opacity" 
                                    />
                                </li>
                                <li>
                                    <p>In <strong>Encryption/Advanced</strong> settings, <strong>Remove</strong> the password entirely.</p>
                                    <img 
                                        src={Step3}
                                        alt="WPS Encryption settings with password removed" 
                                        className="mt-2 border border-red-100 dark:border-red-900 rounded-lg shadow-inner max-w-full h-auto max-h-[150px] opacity-90 hover:opacity-100 transition-opacity" 
                                    />
                                </li>
                                <li>
                                    <p>Save this new version and <strong>upload it</strong> to the system below.</p>
                                </li>
                            </ul>

                            <div className="pt-4 border-t border-red-200 dark:border-red-900/50 flex justify-between items-center">
                                <button 
                                    onClick={() => setEncryptionError(false)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
                                >
                                    Dismiss & Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {!fileName && (
                        <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); processExcel(e.dataTransfer.files[0]); }} 
                            className="relative group cursor-pointer flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                        >
                            <input 
                                type="file" 
                                accept=".xlsx, .xls, .csv"
                                onChange={(e) => e.target.files?.[0] && processExcel(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={loading}
                            />
                            {loading ? <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" /> : <UploadCloud className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mb-4 transition-colors" />}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                            </p>
                        </div>
                    )}

                    {fileName && (
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center justify-between border border-blue-100 dark:border-blue-800">
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{fileName}</span>
                                        <span className="text-xs text-blue-500">ready to import</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleClear} disabled={isUploading}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>

                            <Button 
                                // onClick={handleDatabaseUpload} 
                                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-12 cursor-pointer"
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing Database...</>
                                ) : (
                                    <><Database className="w-4 h-4" /> Upload to System</>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {tableData.length > 0 && (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-[11px] text-left border-collapse">
                            <thead className="bg-slate-900 text-white sticky top-0">
                                <tr>
                                    {finalHeaders.map((h) => (
                                        <th key={h} className="px-3 py-3 border-b border-slate-700 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tableData.map((row, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                                        {finalHeaders.map((h) => (
                                            <td key={h} className="px-3 py-2 border-b whitespace-nowrap">
                                                {row[h]?.toString() || ""}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};
