import * as React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import { format } from "date-fns";
import { 
    Plus, 
    Search, 
    CircleOff, 
    Loader2,
    PencilLine,
    Layers
} from 'lucide-react';
import { usePage } from '@inertiajs/react';

import { FootprintsIcon, ChurchIcon } from '@phosphor-icons/react';

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
    { title: 'Modules', module: 'Maintenance', href: '/maintenance/modules' },
];

export default function Modules() {
    /** ----------------------- User info ----------------- */
    const { auth } = usePage().props as any;
    const { user, member } = auth;

    /** ------------------- States ------------------- */
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState<Module[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [visibleCount, setVisibleCount] = useState(15); 
    const observerTarget = useRef<HTMLDivElement>(null);

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
            toast.error('Failed to load modules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchModules(); }, []);

    /** ------------------- Filtering & Lazy Loading ------------------- */
    const filteredData = useMemo(() => {
        return data.filter(item => 
            item.module.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && visibleCount < filteredData.length) {
            setVisibleCount((prev) => prev + 10);
        }
    }, [filteredData.length, visibleCount]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [handleObserver]);

    const displayedItems = filteredData.slice(0, visibleCount);

    /** ------------------- Actions ------------------- */
    const openCreateSheet = () => {
        setEditId(null);
        setForm({ module: '', isActive: true });
        setIsSheetOpen(true);
    };

    const openEditSheet = (item: Module) => {
        setEditId(item.module_id);
        setForm({ module: item.module, isActive: !!item.isActive });
        setIsSheetOpen(true);
    };

    const handleSaveModule = async (e: React.FormEvent) => {
        e.preventDefault();
        const moduleName = form.module.trim();
        if (!moduleName) return toast.error("Module name is required");

        if (data.some(item => item.module.toLowerCase() === moduleName.toLowerCase() && item.module_id !== editId)) {
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
            setIsSheetOpen(false);
            fetchModules();
        } catch (error) {
            toast.error('Transaction failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modules" />
            <Toaster position="top-right" richColors />

            {loading ? (
                /* --- Your Skeleton Loader --- */
                <div className="space-y-4 p-8">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-full animate-pulse mt-6"></div>
                </div>
            ) : (
                <div className="w-full space-y-6 px-4 py-6 md:px-8 lg:px-16">
                    {/* --- Your Custom Breadcrumbs --- */}
                    <div className="flex flex-col gap-y-2 text-xs font-medium text-gray-700 md:flex-row md:items-center md:justify-between">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink className="text-[0.75rem]"><FootprintsIcon className="w-4 h-4" /></BreadcrumbLink>
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

                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink className="text-[0.75rem]"><ChurchIcon className="w-4 h-4" /></BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink className="text-[0.75rem]">{auth.member.Church_ID}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-[0.75rem]">{auth.member.FirstName}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    {/* Main Header UI */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Module Registry</h1>
                            <p className="text-xs text-muted-foreground">Manage and configure system application modules.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search modules..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 w-64 h-10 shadow-sm rounded-lg"
                                />
                            </div>
                            <Button onClick={openCreateSheet} className="bg-indigo-600 hover:bg-indigo-700 h-10 px-5 cursor-pointer">
                                <Plus className="w-4 h-4 mr-2" /> New Module
                            </Button>
                        </div>
                    </div>

                    {/* List Content */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <div className="col-span-7">Module Details</div>
                            <div className="col-span-3 text-center">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {filteredData.length === 0 ? (
                            <div className="p-20 text-center space-y-2">
                                <CircleOff className="mx-auto text-muted/20" size={40} />
                                <p className="text-sm text-muted-foreground">No modules found.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {displayedItems.map((item) => (
                                    <div key={item.module_id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors">
                                        <div className="col-span-7 flex items-center gap-4">
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-md">
                                                <Layers size={18} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{item.module}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    By {item.firstName || 'System'} • {item.insertDate ? format(new Date(item.insertDate), 'MMM dd, yyyy') : '---'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openEditSheet(item)} className="h-8 w-8 text-muted-foreground hover:text-indigo-600 cursor-pointer">
                                                <PencilLine size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sentinel for Infinite Scroll */}
                    <div ref={observerTarget} className="flex justify-center py-4">
                        {visibleCount < filteredData.length ? (
                            <Loader2 className="animate-spin text-muted-foreground" size={20} />
                        ) : filteredData.length > 0 && (
                            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">End of results</span>
                        )}
                    </div>
                </div>
            )}

            {/* Retention of your specific Sheet structure */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{editId ? 'Edit Module' : 'Register Module'}</SheetTitle>
                        <SheetDescription>
                            {editId ? 'Modify the existing module settings.' : 'Fill in the details to add a new system module.'}
                        </SheetDescription>
                    </SheetHeader>
                    
                    <form onSubmit={handleSaveModule} className="space-y-6 py-8 px-4">
                        <div className="space-y-2">
                            <Label htmlFor="module_name">Module Name</Label>
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
                            <Button type="submit" disabled={submitting} className="w-full h-11 bg-indigo-600 cursor-pointer text-white">
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editId ? 'Save Changes' : 'Register Module')}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
