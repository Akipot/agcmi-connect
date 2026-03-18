import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { FootprintsIcon} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import {
    CircleOff,
    TrendingUp
} from 'lucide-react';
import { WebUrl } from '@/components/others/weburl';
import { FormCard, type FormData } from "@/components/forms/manual-allocation-form";
import { isMasterDataExpired, clearMasterStorage, STORAGE_KEYS } from '@/lib/storage';

const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'Manual Allocation Form',
        module: 'Process Manual Allocation',
        href: '/index',
    },
];


export default function MASForm() {
    const [loading, setLoading] = useState(true);
    
    const [hasDatabase, setHasDatabase] = useState(false);

    useEffect(() => {    
        const savedData = localStorage.getItem(STORAGE_KEYS.DB);
        
        if (savedData) {
            if (isMasterDataExpired()) {
                clearMasterStorage();
                setHasDatabase(false);
                toast.info("Master DC expired. Please upload latest Master DC.");
            } else {
                setHasDatabase(true);
            }
        } else {
            setHasDatabase(false);
        }

        if (loading) {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    /** ----------------------------------- Check form changes ------------------- */
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; 
            }
        };

        const removeInertiaListener = router.on('before', (event) => {
            const isPrefetch = event.detail.visit.prefetch;
            if (isDirty && !isPrefetch) {
                if (!confirm("Unsaved staged items will be lost. Leave anyway?")) {
                    event.preventDefault();
                }
            }
        });

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            removeInertiaListener();
        };
    }, [isDirty]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manual Allocation Form" />
            <Toaster position="top-right" />
            
            {loading ? (
                <div className="space-y-4 p-8">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-full animate-pulse mt-6"></div>
                </div>
            ) : (
                <div className="w-full space-y-6 px-4 py-6 md:px-8 lg:px-16">
                    {/* Breadcrumbs (Always show these) */}
                    <div className="flex flex-col gap-y-2 text-xs font-medium text-gray-700 md:flex-row md:items-center md:justify-between">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink className="text-[0.75rem]"><FootprintsIcon /></BreadcrumbLink>
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
                    </div>

                    {/* 3. Conditional Rendering: Form vs Onboarding State */}
                    {hasDatabase ? (
                        <FormCard onDirtyChange={setIsDirty} />
                    ) : (
                        <div className="mx-auto max-w-2xl mt-10">
                            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] p-8 md:p-12 shadow-sm">

                                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-zinc-50 dark:bg-zinc-900/50 blur-3xl" />

                                <div className="relative flex flex-col items-center text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 mb-6">
                                        <CircleOff size={40} strokeWidth={1.5} className="text-zinc-400 dark:text-zinc-600" />
                                    </div>

                                    <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                                        Ready to start your allocation?
                                    </h2>
                                    
                                    <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                        To access the <span className="font-semibold text-zinc-700 dark:text-zinc-300">Manual Allocation Form</span>, we first need your Master DC report to link the correct locations and inventory data.
                                    </p>

                                    <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                        <button 
                                            onClick={() => router.visit(`${WebUrl}/upload-master-dc-report`)}
                                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-8 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 w-full sm:w-auto cursor-pointer shadow-lg shadow-zinc-200 dark:shadow-none"
                                        >
                                            Go to Upload Page
                                        </button>
                                        
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-transparent px-8 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 w-full sm:w-auto cursor-pointer"
                                        >
                                            I've already uploaded it
                                        </button>
                                    </div>

                                    <div className="mt-10 w-full rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 p-5 border border-blue-100 dark:border-blue-500/10">
                                        <div className="flex gap-4 text-left">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
                                                <TrendingUp size={20} className="text-blue-700 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-800 dark:text-blue-500">
                                                    Daily Workflow Reminder
                                                </p>
                                                <h4 className="mt-1 text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                                                    Ensure your data is current
                                                </h4>
                                                <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                                                    Inventory levels fluctuate every shift. To ensure your <span className="font-semibold text-zinc-900 dark:text-zinc-200">Manual Allocation</span> is 100% accurate, please upload the latest Master DC report at the start of your workday.
                                                </p>
                                                
                                                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                        Recommended: Daily Sync
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                                        Updates "Real OH" Levels
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
