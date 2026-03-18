import React, { useState, useEffect, useRef } from "react";

interface EditableCellProps {
    value: string;
    onChange: (v: string) => void;
    type?: "text" | "number";
    className?: string;
    placeholder?: string;
    maxLength?: number;
    readOnly?: boolean;
}

export const EditableCell: React.FC<EditableCellProps> = ({ 
    value, 
    onChange, 
    type = "text",
    className = "",
    placeholder = "-----",
    maxLength,
    readOnly = false
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
            onDoubleClick={() => !readOnly && setIsEditing(true)}
            className={`min-h-[1.5rem] flex items-center transition-all rounded px-1 
                ${readOnly 
                    ? "cursor-default opacity-80"
                    : "cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800"
                } ${className}`}
        >
            {value ? (
                value
            ) : (
                <span className="text-red-500 text-xs text-bold">
                    {placeholder}
                </span>
            )}
        </div>
    );
};
