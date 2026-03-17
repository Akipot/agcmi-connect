import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { FormData } from "@/components/forms/manual-allocation-form";

interface TextFieldProps {
    form: UseFormReturn<FormData>;
    name: keyof FormData;
    label: string;
    isNumber?: boolean;
    maxLength?: number;
    placeholder?: string;
    readOnly?: boolean; // Added readOnly prop
}

export const TextField: React.FC<TextFieldProps> = ({ 
    form, 
    name, 
    label, 
    isNumber = false,
    maxLength,
    placeholder,
    readOnly = false // Default to false
}) => (
    <FormField 
        control={form.control} 
        name={name} 
        render={({ field }) => (
            <FormItem className="space-y-0.5">
                <FormLabel className="text-[11px] font-bold text-gray-600 dark:text-slate-400">
                    {label}
                </FormLabel>
                <FormControl>
                    <Input 
                        {...field} 
                        readOnly={readOnly} // Pass to native input
                        placeholder={placeholder}
                        className={cn(
                            "uppercase h-8 text-xs shadow-none border-gray-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 focus:border-orange-500 dark:focus:border-orange-500 transition-colors",
                            readOnly && "bg-gray-100 cursor-not-allowed opacity-75" // Visual feedback for read-only
                        )} 
                        onChange={(e) => {
                            // If readOnly is true, we prevent typing changes
                            if (readOnly) return;

                            const val = e.target.value;
                            
                            if (maxLength && val.length > maxLength) return;

                            if (isNumber && val !== "" && !/^\d+$/.test(val)) return;

                            field.onChange(val);
                        }}
                    />
                </FormControl>
                <FormMessage className="text-[9px]" />
            </FormItem>
        )} 
    />
);
