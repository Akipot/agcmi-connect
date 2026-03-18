import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
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
    readOnly?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onChange?: (val: string) => void;
    description?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ 
    form, 
    name, 
    label, 
    isNumber = false,
    maxLength,
    placeholder,
    readOnly = false,
    onKeyDown,
    onChange,
    description
}) => (
    <TooltipProvider delayDuration={200}>
        <FormField 
            control={form.control} 
            name={name} 
            render={({ field }) => (
                <FormItem className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                        <FormLabel className="text-[11px] font-bold text-gray-600 dark:text-slate-400">
                            {label}
                        </FormLabel>
                        
                        {/* Tooltip Icon Container */}
                        {description && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button type="button" className="cursor-help outline-none">
                                        <Info size={12} className="text-orange-500 hover:text-orange-600 transition-colors" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-slate-900 text-white text-[10px] px-2 py-1 border-none shadow-lg">
                                    <p>{description}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>

                    <FormControl>
                        <Input 
                            {...field} 
                            readOnly={readOnly}
                            placeholder={placeholder}
                            onKeyDown={onKeyDown}
                            className={cn(
                                "uppercase h-8 text-xs shadow-none border-gray-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 focus:border-orange-500 dark:focus:border-orange-500 transition-colors",
                                readOnly && "bg-gray-100 cursor-not-allowed opacity-75"
                            )} 
                            onChange={(e) => {
                                if (readOnly) return;
                                const val = e.target.value;
                                if (maxLength && val.length > maxLength) return;
                                if (isNumber && val !== "" && !/^\d+$/.test(val)) return;

                                field.onChange(val);
                                if (onChange) onChange(val);
                            }}
                        />
                    </FormControl>
                    <FormMessage className="text-[9px]" />
                </FormItem>
            )} 
        />
    </TooltipProvider>
);
