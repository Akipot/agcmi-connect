import { useState, useRef, useEffect } from "react";
import { Link } from "@inertiajs/react";
import type { NavItem } from "@/types";
import { ChevronDown } from "lucide-react";
import ReactDOM from "react-dom";
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
    items: NavItem[];
    isCollapsed: boolean;
}

export function NavMain({ items, isCollapsed }: Props) {
    return (
        <nav className="flex flex-col gap-1 px-2">
            {items.map((item, index) => (
                <div key={index}>
                    {item.children && item.children.length > 0 ? (
                        <DropdownNavItem item={item} isCollapsed={isCollapsed} />
                    ) : (
                        <Link
                            href={item.href!}
                            className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            {item.icon && <item.icon className="mr-2 w-4 h-4 flex-shrink-0" />}
                            {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}

function DropdownNavItem({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleEnter = () => {
        if (!isMobile && isCollapsed) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsOpen(true);
        }
    };

    const handleLeave = () => {
        if (!isMobile && isCollapsed) {
            timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
        }
    };

    const toggleMenu = () => {
        if (!isCollapsed || isMobile) {
            setIsOpen((prev) => !prev);
        }
    };

    useEffect(() => {
        if (isOpen && triggerRef.current && isCollapsed && !isMobile) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({ top: rect.top, left: rect.right + 4 });
        }
    }, [isOpen, isCollapsed, isMobile]);

    useEffect(() => {
        setIsOpen(false);
    }, [isCollapsed]);

    const subMenuContent = (
        <div className={`flex flex-col ${isCollapsed && !isMobile ? "min-w-[12rem] bg-white dark:bg-gray-900 border rounded-md shadow-xl p-1" : "gap-1 ml-6 mt-1"}`}>
            {isCollapsed && !isMobile && (
                <div className="px-3 py-2 text-[10px] font-bold uppercase text-gray-400 border-b mb-1">
                    {item.title}
                </div>
            )}
            {item.children?.map((child, idx) => (
                <Link
                    key={idx}
                    href={child.href!}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    {child.icon && <child.icon className="w-4 h-4" />}
                    <span>{child.title}</span>
                </Link>
            ))}
        </div>
    );

    return (
        <div 
            className="relative" 
            ref={triggerRef} 
            onMouseEnter={handleEnter} 
            onMouseLeave={handleLeave}
        >
            <div 
                className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={toggleMenu}
            >
                {item.icon && <item.icon className="mr-2 w-4 h-4 flex-shrink-0" />}
                {!isCollapsed && <span className="flex-1">{item.title}</span>}
                {!isCollapsed && (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                )}
            </div>

            {/* Standard Accordion (When Expanded) */}
            {!isCollapsed && isOpen && subMenuContent}

            {/* Floating Portal (When Collapsed) */}
            {isCollapsed && !isMobile && isOpen &&
                ReactDOM.createPortal(
                    <div 
                        style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 9999 }}
                        onMouseEnter={handleEnter}
                        onMouseLeave={handleLeave}
                    >
                        {subMenuContent}
                    </div>,
                    document.body
                )}
        </div>
    );
}
