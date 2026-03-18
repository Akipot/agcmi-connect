import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { FootprintsIcon} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    Eye,
    Download,
    File,
    Filter,
    FileText,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';
import { MasterDCUpload } from "@/components/forms/master-dc-upload";

const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'Upload Master DC',
        module: 'Upload Master DC Report',
        href: '/index',
    },
];

    

export default function MASForm() {
    const { auth, store } = usePage<any>().props;
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    /** ----------- For Loading ------------------------- */
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [loading]);

  

    /**-------------------------- Page Layout ----------------------*/
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Master DC Report" />
            <Toaster position="top-right" />
            {loading ? (
                <div className="space-y-4 p-8">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-full animate-pulse mt-6"></div>
                </div>
            ) : (
                <>
                    {' '}
                    <div className="w-full space-y-6 px-4 py-6 md:px-8 lg:px-16">
                        {/* Breadcrumbs */}
                        <div className="flex flex-col gap-y-2 text-xs font-medium text-gray-700 md:flex-row md:items-center md:justify-between">

                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink className="text-[0.75rem]">
                                            <FootprintsIcon></FootprintsIcon>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <BreadcrumbLink className="text-[0.75rem]">{breadcrumbs[0].module}</BreadcrumbLink>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Module</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <BreadcrumbPage className="text-[0.75rem]">{breadcrumbs[0].title}</BreadcrumbPage>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Page</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>

                        <MasterDCUpload/>
                    </div>

                </>
            )
            }
        </AppLayout >
    );

}
