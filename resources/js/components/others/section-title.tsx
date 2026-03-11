import React from "react";

interface SectionTitleProps {
    title: string;
    icon?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, icon }) => (
    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 border-b pb-1">
        {icon && <span className="text-gray-300">{icon}</span>}
        {title}
    </div>
);
