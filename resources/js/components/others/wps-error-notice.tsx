import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import your assets - adjust paths based on your folder structure
import Step1 from "@/assets/WpsGuide/Step1.jpg";
import Step2 from "@/assets/WpsGuide/Step2.jpg";
import Step3 from "@/assets/WpsGuide/Step3.jpg";

interface WpsErrorNoticeProps {
    onDismiss: () => void;
}

export const WpsErrorNotice: React.FC<WpsErrorNoticeProps> = ({ onDismiss }) => (
    <div className="p-4 border-2 border-red-200 bg-red-50 rounded-xl space-y-3 text-sm text-red-900 mb-4 shadow-md animate-in fade-in zoom-in-95 duration-200">
        <h3 className="font-bold flex items-center gap-2 text-red-950 text-base">
            <AlertCircle size={20} className="text-red-600" /> 
            WPS Encryption Detected
        </h3>
        <p className="text-xs">
            Your report is protected. Re-save it as <strong>Excel Workbook (.xlsx)</strong> following these steps:
        </p>
        <div className="grid grid-cols-3 gap-2 py-1">
            <div className="flex flex-col gap-1">
                <img src={Step1} alt="Save As" className="rounded border border-red-200 h-16 w-full object-cover" />
                <span className="text-[8px] text-center uppercase font-bold text-red-400">1. Save As</span>
            </div>
            <div className="flex flex-col gap-1">
                <img src={Step2} alt="Format" className="rounded border border-red-200 h-16 w-full object-cover" />
                <span className="text-[8px] text-center uppercase font-bold text-red-400">2. Select .xlsx</span>
            </div>
            <div className="flex flex-col gap-1">
                <img src={Step3} alt="Decrypt" className="rounded border border-red-200 h-16 w-full object-cover" />
                <span className="text-[8px] text-center uppercase font-bold text-red-400">3. Decrypt</span>
            </div>
        </div>
        <Button 
            onClick={onDismiss} 
            variant="destructive" 
            size="sm" 
            className="w-full h-8 text-[10px] font-bold uppercase tracking-wider"
        >
            Dismiss & Retry
        </Button>
    </div>
);
