import * as React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import { format } from "date-fns";
import { 
    Plus, 
    Search, 
    LayoutPanelLeft, 
    CircleOff, 
    Loader2,
    FootprintsIcon,
    PencilLine
} from 'lucide-react';

// Types
import { Module } from '@/types/maintenance';
import { BreadcrumbItem as BreadcrumbItemType } from '@/types';

// Shadcn & Layout
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
    Sheet, 
    SheetContent, 
    SheetDescription, 
    SheetHeader, 
    SheetTitle, 
    SheetTrigger,
    SheetFooter
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { WebUrl } from '@/components/others/weburl';

const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'Modules',
        module: 'Maintenance',
        href: '/maintenance/modules',
    },
];

export default function Modules() {
    /** ------------------- States ------------------- */
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState<Module[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    // Lazy Loading State
    const [visibleCount, setVisibleCount] = useState(9); 
    const observerTarget = useRef<HTMLDivElement>(null);

    // Edit Mode State
    const [editId, setEditId] = useState<number | null>(null);

    // Form State
    const [form, setForm] = useState({
        module: '',
        isActive: true
    });

    /** ------------------- Data Fetching ------------------- */
    const fetchModules = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${WebUrl}/api/maintenance/modules`);
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch modules", error);
            toast.error('Failed to load modules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, []);

    /** ------------------- Lazy Loading Logic ------------------- */
    const filteredData = useMemo(() => {
        return data.filter(item => 
            item.module.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const [target] = entries;
        if (target.isIntersecting && visibleCount < filteredData.length) {
            setVisibleCount((prev) => prev + 6); 
        }
    }, [filteredData.length, visibleCount]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            threshold: 0.1,
        });
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [handleObserver]);

    const displayedItems = filteredData.slice(0, visibleCount);

    useEffect(() => {
        setVisibleCount(9);
    }, [searchTerm]);

    /** ------------------- Actions ------------------- */
    const openCreateSheet = () => {
        setEditId(null);
        setForm({ module: '', isActive: true });
        setIsSheetOpen(true);
    };

    const openEditSheet = (item: Module) => {
        setEditId(item.module_id);
        setForm({ 
            module: item.module, 
            isActive: !!item.isActive 
        });
        setIsSheetOpen(true);
    };

    const handleSaveModule = async (e: React.FormEvent) => {
        e.preventDefault();
        const moduleName = form.module.trim();

        if (!moduleName) return toast.error("Module name is required");

        // --- DUPLICATE CHECK ---
        const isDuplicate = data.some(item => 
            item.module.toLowerCase() === moduleName.toLowerCase() && 
            item.module_id !== editId
        );

        if (isDuplicate) {
            return toast.error(`Module "${moduleName}" is already registered.`);
        }

        setSubmitting(true);
        try {
            if (editId) {
                await axios.put(`${WebUrl}/api/maintenance/modules/${editId}`, form);
                toast.success('Module updated successfully');
            } else {
                await axios.post(`${WebUrl}/api/maintenance/modules`, form);
                toast.success('Module registered successfully');
            }

            setForm({ module: '', isActive: true });
            setIsSheetOpen(false);
            fetchModules();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Transaction failed';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modules" />
            <Toaster position="top-right" richColors />
            
            {loading ? (
                <div className="space-y-4 p-8">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-44 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="w-full space-y-6 px-4 py-6 md:px-8 lg:px-16">
                    
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink className="text-[0.75rem] flex items-center gap-1">
                                    <FootprintsIcon size={14} />
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink className="text-[0.75rem]">{breadcrumbs[0].module}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[0.75rem]">{breadcrumbs[0].title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Module Registry</h2>
                            <p className="text-xs text-muted-foreground">Configure system modules and active visibility.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <Input
                                    placeholder="Search modules..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-10 shadow-sm text-xs"
                                />
                                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>

                            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button onClick={openCreateSheet} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm text-xs cursor-pointer h-10">
                                        <Plus className="mr-2 h-4 w-4" /> New Module
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="sm:max-w-md">
                                    <SheetHeader>
                                        <SheetTitle>{editId ? 'Edit Module' : 'Register Module'}</SheetTitle>
                                        <SheetDescription>
                                            {editId ? 'Modify the existing module settings.' : 'Fill in the details to add a new system module.'}
                                        </SheetDescription>
                                    </SheetHeader>
                                    
                                    <form onSubmit={handleSaveModule} className="space-y-6 py-8 px-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="module_name">Module Display Name</Label>
                                            <Input 
                                                id="module_name" 
                                                placeholder="e.g., Inventory Management" 
                                                value={form.module}
                                                onChange={(e) => setForm({...form, module: e.target.value})}
                                            />
                                        </div>
                                        
                                        <div className="flex items-center justify-between rounded-xl border p-4 bg-gray-50/50 dark:bg-gray-900/50">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-semibold">Active Status</Label>
                                                <p className="text-[11px] text-muted-foreground">Toggle to enable or disable access.</p>
                                            </div>
                                            <Switch 
                                                checked={form.isActive}
                                                onCheckedChange={(checked: boolean) => setForm({...form, isActive: checked})}
                                            />
                                        </div>

                                        <SheetFooter className="mt-8">
                                            <Button type="submit" disabled={submitting} className="w-full h-11 bg-indigo-600 cursor-pointer">
                                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editId ? 'Save Changes' : 'Register Module')}
                                            </Button>
                                        </SheetFooter>
                                    </form>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-100 py-32 dark:border-gray-800">
                            <CircleOff className="h-12 w-12 text-gray-200 dark:text-gray-800" />
                            <p className="mt-4 text-sm font-medium text-gray-400">No results found for "{searchTerm}".</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                            {displayedItems.map((item) => (
                                <div 
                                    key={item.module_id} 
                                    className="group relative flex flex-col justify-between border rounded-2xl p-6 bg-white dark:bg-gray-900 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-xl hover:shadow-indigo-50/40 transition-all duration-300"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                                <LayoutPanelLeft size={22} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 transition-colors tracking-tight">
                                                    {item.module}
                                                </h4>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide mt-1 ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                    {item.isActive ? '● ACTIVE' : '○ INACTIVE'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Edit Action Button */}
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => openEditSheet(item)}
                                            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-indigo-950 cursor-pointer"
                                        >
                                            <PencilLine className="h-4 w-4 text-indigo-600" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between pt-5 border-t border-gray-50 dark:border-gray-800 mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                                {(item.firstName || 'S').substring(0, 2)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-300 uppercase leading-none mb-1">Created By</span>
                                                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{item.firstName || 'System'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-300 uppercase leading-none mb-1">Date</span>
                                            <span className="text-[11px] font-medium text-gray-500">{item.insertDate ? format(new Date(item.insertDate), 'MMM dd, yyyy') : '---'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div ref={observerTarget} className="w-full flex justify-center py-10">
                        {visibleCount < filteredData.length ? (
                            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-xs font-medium">Loading more modules...</span>
                            </div>
                        ) : filteredData.length > 0 ? (
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                End of List • {filteredData.length} modules total
                            </p>
                        ) : null}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
