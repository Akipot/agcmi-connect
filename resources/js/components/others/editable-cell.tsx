import React, { useState, useEffect, useRef } from "react";

interface EditableCellProps {
    value: string;
    onChange: (v: string) => void;
    type?: "text" | "number";
    className?: string;
    placeholder?: string;
    maxLength?: number;
    readOnly?: boolean; // New optional prop
}

export const EditableCell: React.FC<EditableCellProps> = ({ 
    value, 
    onChange, 
    type = "text",
    className = "",
    placeholder = "Double-click to edit",
    maxLength,
    readOnly = false // Default to false
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    if (isEditing && !readOnly) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={value}
                maxLength={maxLength}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditing(false);
                    if (e.key === 'Escape') setIsEditing(false);
                }}
                onChange={(e) => {
                    const val = e.target.value;
                    if (type === "number" && val !== "" && !/^\d+$/.test(val)) return;
                    onChange(val);
                }}
                className={`w-full h-8 px-2 bg-white dark:bg-slate-800 border-2 border-blue-500 rounded outline-none text-[11px] font-semibold dark:text-slate-100 ${className}`}
            />
        );
    }

    return (
        <div 
            // Only allow editing if readOnly is false
            onDoubleClick={() => !readOnly && setIsEditing(true)}
            className={`min-h-[1.5rem] flex items-center transition-all rounded px-1 
                ${readOnly 
                    ? "cursor-default opacity-80" // Style for read-only
                    : "cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800" // Style for editable
                } ${className}`}
        >
            {value ? (
                value
            ) : (
                <span className="text-amber-500 text-[10px] italic animate-pulse">
                    {placeholder}
                </span>
            )}
        </div>
    );
};
