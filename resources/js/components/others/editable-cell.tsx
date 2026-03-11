import React from "react";

interface EditableCellProps {
    value: string;
    onChange: (v: string) => void;
    type?: "text" | "number";
}

export const EditableCell: React.FC<EditableCellProps> = ({ 
    value, 
    onChange, 
    type = "text" 
}) => (
    <input
        type="text" // Keep as text to prevent browser 'spinner' UI issues
        value={value}
        onChange={(e) => {
            const val = e.target.value;
            
            // If it's a number field, only allow digits via Regex
            if (type === "number" && val !== "" && !/^\d+$/.test(val)) {
                return;
            }
            
            onChange(val);
        }}
        className="w-full h-8 px-2 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 rounded outline-none text-[11px] font-semibold transition-all hover:border-gray-300 dark:hover:border-slate-700 dark:text-slate-200"
    />
);
