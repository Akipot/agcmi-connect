import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    FileSpreadsheet, Trash2, Loader2, UploadCloud, 
    Filter, X, AlertCircle, Info 
} from 'lucide-react';
import { toast } from 'sonner';

declare global {
    interface Window { XLSX: any; }
}

export const MasterDCUpload = () => {
    const [loading, setLoading] = useState(false);
    const [libLoaded, setLibLoaded] = useState(false);
    const [tableData, setTableData] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [scrollTop, setScrollTop] = useState(0);
    const ROW_HEIGHT = 60;
    const VIEWPORT_HEIGHT = 600; 

    const finalHeaders = [
        "VENDOR_CODE", "VENDOR_NAME", "BARCODE", "SKU", "DESCRIPTION", "LOCATION",
        "C2", "BUY PRICE", "TAG", "REAL OH", "OH PICK"
    ];

    const clearStorage = () => {
        localStorage.removeItem('master_dc_db');
        localStorage.removeItem('master_dc');
        localStorage.removeItem('master_dc_expiry');
        setTableData([]);
        setFileName(null);
        setError(null);
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
        script.async = true;
        script.onload = () => setLibLoaded(true);
        document.body.appendChild(script);

        const savedData = localStorage.getItem('master_dc_db');
        const savedName = localStorage.getItem('master_dc');
        const expiryDateStr = localStorage.getItem('master_dc_expiry');
        const today = new Date().toISOString().split('T')[0];

        if (savedData) {
            if (expiryDateStr !== today) {
                clearStorage();
                toast.info("Master DC expired. Please upload latest Master DC.");
            } else {
                try {
                    setTableData(JSON.parse(savedData));
                    setFileName(savedName || "Cached Database");
                } catch (e) { 
                    console.error("Cache corrupted"); 
                    clearStorage();
                }
            }
        }
    }, []);

    const filteredData = useMemo(() => {
        if (!searchQuery) return tableData;
        const lowerSearch = searchQuery.toLowerCase();
        return tableData.filter(row => 
            Object.values(row).some(val => String(val).toLowerCase().includes(lowerSearch))
        );
    }, [tableData, searchQuery]);

    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 5);
    const endIndex = Math.min(filteredData.length, Math.floor((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + 10);
    const translateY = startIndex * ROW_HEIGHT;

    const processExcel = async (file: File) => {
        if (!libLoaded) return;
        setError(null);

        if (!file.name.toLowerCase().endsWith('.xlsx')) {
            setError("Invalid Format: Please use .xlsx");
            return;
        }

        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            
            setTimeout(() => {
                try {
                    const workbook = window.XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const rows: any[][] = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                    const headerIdx = rows.findIndex(r => r.some(c => c?.toString().trim().toUpperCase() === "SKU"));
                    
                    if (headerIdx !== -1) {
                        const headerRow = rows[headerIdx].map(h => h?.toString().trim().toUpperCase());
                        const mapped = rows.slice(headerIdx + 1).filter(r => r[headerRow.indexOf("SKU")]).map(r => {
                            const obj: any = {};
                            finalHeaders.forEach(h => {
                                const colIdx = headerRow.indexOf(h.toUpperCase());
                                obj[h] = colIdx !== -1 ? r[colIdx]?.toString().trim() : "";
                            });
                            return obj;
                        });

                        const today = new Date().toISOString().split('T')[0];

                        setTableData(mapped);
                        setFileName(file.name);
                        localStorage.setItem('master_dc_db', JSON.stringify(mapped));
                        localStorage.setItem('master_dc', file.name);
                        localStorage.setItem('master_dc_expiry', today);
                    } else { 
                        setError("SKU column not found."); 
                    }
                } catch (err) { 
                    setError("Failed to read .xlsx"); 
                }
                setLoading(false);
            }, 600); 
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-white dark:bg-[#0a0a0a] transition-colors duration-200 font-sans overflow-hidden">
            
            {/* 1. HEADER */}
            <header className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    {/* <FileSpreadsheet size={18} className="text-green-600 dark:text-green-500/80" /> */}
                    <h1 className="text-[15px] font-bold text-slate-800 dark:text-zinc-200 tracking-tight">Upload Master DC</h1>
                </div>
                
                <div className="flex items-center gap-2 text-[11px] font-medium text-amber-600 dark:text-amber-500/80 bg-amber-50 dark:bg-amber-500/5 px-3 py-1.5 rounded border border-amber-100 dark:border-amber-500/10">
                    <Info size={14} />
                    XLSX Required
                </div>
            </header>

            {/* 2. ACTION BAR */}
            <div className="px-6 py-3 bg-white dark:bg-[#0a0a0a] flex items-center justify-between shrink-0 border-b border-slate-50 dark:border-zinc-900/50">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-full max-sm:hidden max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <Filter size={14} className="text-gray-400 dark:text-zinc-600" />
                        </div>
                        <input
                            type="text"
                            placeholder="Filter Master DC..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full h-8 pl-9 pr-8 text-[12px] border border-gray-200 dark:border-zinc-800 rounded bg-gray-50/50 dark:bg-zinc-900/30 text-slate-700 dark:text-zinc-300 focus:bg-white dark:focus:bg-zinc-900 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 outline-none transition-all"
                        />
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-red-500/90 animate-in fade-in slide-in-from-left-1">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}
                </div>

                {fileName && (
                    <div className="flex items-center gap-2">
                        <div className="text-[11px] font-semibold px-3 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-600 dark:text-zinc-300">
                            {fileName} — {tableData.length.toLocaleString()} items
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600" onClick={() => { localStorage.clear(); setTableData([]); setFileName(null); setError(null); }}>
                            <Trash2 size={14} />
                        </Button>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <main className="flex-1 px-6 pb-6 pt-4 flex flex-col gap-4 overflow-hidden relative">
                
                {/* HIGH VISIBILITY LOADING SCREEN */}
                {loading && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a]">
                        <div className="flex flex-col items-center gap-5">
                            {/* Simple CSS Circular Spinner */}
                            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-zinc-300 dark:border-zinc-800 border-t-zinc-900 dark:border-t-white" />
                            
                            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-[0.2em] uppercase">
                                Reading Master DC...
                            </span>
                        </div>
                    </div>
                )}

  

                {!fileName && (
                    <Card className={`border-dashed border-2 transition-colors ${error ? 'border-red-200 bg-red-50/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20'}`}>
                        <CardContent className="p-0">
                            <div className="relative h-48 flex flex-col items-center justify-center group cursor-pointer">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".xlsx" onChange={e => e.target.files?.[0] && processExcel(e.target.files[0])}/>
                                <div className={`p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300 bg-white dark:bg-slate-800`}>
                                    <UploadCloud size={24} className={`${error ? 'text-red-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} />
                                </div>
                                <p className={`text-[13px] font-medium tracking-tight ${error ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {error ? "Format Rejected - Please use .xlsx" : "Drop your .xlsx file here"}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic">Note: .xls and .csv are not supported.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className={`flex-1 flex flex-col border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden bg-white dark:bg-[#0a0a0a] ${!fileName ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}`}>
                    
                    {/* HEADER SECTION */}
                    <div className="flex bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 shrink-0 sticky top-0 z-10">
                        <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 w-[25%] border-r border-zinc-200 dark:border-zinc-800">Store</div>
                        <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 w-[35%] border-r border-zinc-200 dark:border-zinc-800">Product</div>
                        <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex-1 border-r border-zinc-200 dark:border-zinc-800 text-center">Location</div>
                        <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex-1 border-r border-zinc-200 dark:border-zinc-800 text-center">C2</div>
                        <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex-1 border-r border-zinc-200 dark:border-zinc-800 text-center">Buy Price</div>
                        <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex-1 border-r border-zinc-200 dark:border-zinc-800 text-center">Tag</div>
                        <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex-1 border-r border-zinc-200 dark:border-zinc-800 text-center">Real OH</div>
                        <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex-1 text-center">OH Pick</div>
                    </div>

                    {/* BODY SECTION */}
                    <div className="scrollbar flex-1 overflow-auto relative" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
                        <div style={{ height: `${filteredData.length * ROW_HEIGHT}px`, width: '100%' }} />
                        <div className="absolute top-0 left-0 w-full" style={{ transform: `translateY(${translateY}px)` }}>
                            {filteredData.slice(startIndex, endIndex).map((row, idx) => (
                                <div key={idx} className="flex border-b border-zinc-100 dark:border-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group items-center" style={{ height: ROW_HEIGHT }}>
                                    
                                    {/* STACKED: VENDOR CODE & NAME */}
                                    <div className="w-[25%] px-4 flex flex-col justify-center border-r border-zinc-50 dark:border-zinc-900/50 h-full">
                                        <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                                            {row["VENDOR_CODE"]}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate uppercase">
                                            {row["VENDOR_NAME"]}
                                        </span>
                                    </div>

                                    {/* STACKED: SKU & DESCRIPTION */}
                                    <div className="w-[35%] px-4 flex flex-col justify-center border-r border-zinc-50 dark:border-zinc-900/50 h-full">
                                        <span className="text-[13px] font-bold text-orange-600 dark:text-orange-500">
                                            {row["SKU"]}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate uppercase">
                                            {row["DESCRIPTION"]}
                                        </span>
                                    </div>

                                    {/* SINGLE COLUMNS */}
                                    <div className="flex-1 text-center text-[11px] text-zinc-600 dark:text-zinc-400 border-r border-zinc-50 dark:border-zinc-900/50 font-medium">
                                        {row["LOCATION"]}
                                    </div>
                                    <div className="flex-1 text-center text-[11px] text-zinc-600 dark:text-zinc-400 border-r border-zinc-50 dark:border-zinc-900/50 font-medium">
                                        {row["C2"]}
                                    </div>
                                    <div className="flex-1 text-center text-[11px] text-zinc-600 dark:text-zinc-400 border-r border-zinc-50 dark:border-zinc-900/50">
                                        {row["BUY PRICE"]}
                                    </div>
                                    <div className="flex-1 text-center text-[11px] text-zinc-600 dark:text-zinc-400 border-r border-zinc-50 dark:border-zinc-900/50">
                                        {row["TAG"]}
                                    </div>
                                    <div className="flex-1 text-center text-[12px] font-bold text-zinc-900 dark:text-zinc-200 border-r border-zinc-50 dark:border-zinc-900/50">
                                        {row["REAL OH"]}
                                    </div>
                                    <div className="flex-1 text-center text-[12px] font-bold text-blue-600 dark:text-blue-400">
                                        {row["OH PICK"]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
