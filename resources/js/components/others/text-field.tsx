import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormData } from "@/components/forms/manual-allocation-form";

interface TextFieldProps {
    form: UseFormReturn<FormData>;
    name: keyof FormData;
    label: string;
    isNumber?: boolean;
    maxLength?: number;
    placeholder?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ 
    form, 
    name, 
    label, 
    isNumber = false,
    maxLength,
    placeholder
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
                        placeholder={placeholder}
                        className="uppercase h-8 text-xs shadow-none border-gray-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 focus:border-orange-500 dark:focus:border-orange-500 transition-colors" 
                        onChange={(e) => {
                            const val = e.target.value;
                            
                            // 1. Max Length Check
                            if (maxLength && val.length > maxLength) return;

                            // 2. Numeric Regex Check
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
