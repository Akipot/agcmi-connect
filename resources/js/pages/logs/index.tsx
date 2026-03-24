import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { FootprintsIcon} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import axios from 'axios';
import * as React from 'react';
import { format } from "date-fns";
import { Input } from '@/components/ui/input';
import {
    Search,
    Eye
} from 'lucide-react';
import { WebUrl } from '@/components/others/weburl';
import Pagination from "@/components/others/pagination";

const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'Manual Allocation Logs',
        module: 'Logs',
        href: '/index',
    },
];

interface ManualAllocationRequests {
    Request_ID: number;
    RequestNo: string;
    TotalStores: number;
    TotalRequests: number;
    created_at: string;
}

export default function MASLogs() {

    /** ----------- For Loading ------------------------- */
    const [loading, setLoading] = useState(true);

    /**------------------- Data Fetching ------------------- */
    const [data, setData] = useState<ManualAllocationRequests[]>([]);

    useEffect(() => {
        axios.get(`${WebUrl}/api/logs/get-manual-allocation-logs`)
            .then(res => {
                setLoading(true);
                setData(res.data);
                
            })
            .catch(err => {
                console.error('Failed to fetch logs:', err);
                toast.error('Failed to load logs');
            })
            .finally(() => {
                setLoading(false);

            });
    }, []);

    /**---------------------------- Searching ----------------------------- */
    const [searchTerm, setSearchTerm] = React.useState('');
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = data.filter(item => {
        const search = searchTerm.toLowerCase();

        return (
            item.RequestNo.toLowerCase().includes(search)
        );
    });


    /**--------------------------- Pagination ----------------------------*/
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = filteredData.slice(startIndex, startIndex + rowsPerPage);

    /**-------------------------- View Details -------------------------------- */
    const [selectedData, setSlectedData] = useState<ManualAllocationRequests | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manual Allocation Logs" />
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

                    <div className="px-4 md:px-8 lg:px-16 py-4">
                        <div className="mb-4 flex items-center justify-between">

                            <div className="relative w-full sm:w-72">
                                <Input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 pr-10 text-xs bg-white dark:bg-gray-800"
                                />
                                <Search
                                    className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                                />
                            </div>

                        </div>



                        <div className="overflow-x-auto rounded-md shadow-sm text-xs">
                            {loading ? (
                                <div className="flex flex-col items-center py-10">
                                    <div className="flex space-x-2 mb-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-gray-600 text-sm">Fetching data...</span>
                                </div>
                            ) : (
                                    <table className="w-full text-left border-collapse table-auto group/table">
                                        <thead>
                                            <tr className="text-[11px] font-bold uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 bg-gray-100 dark:bg-gray-700">
                                                <th className="px-6 py-4 text-left">Request Number</th>
                                                <th className="px-6 py-4 text-left">Total Stores</th>
                                                <th className="px-6 py-4 text-left">Total Request</th>
                                                <th className="px-6 py-4 text-left">Created At</th>
                                                <th className="px-6 py-4 lg:p-0 lg:w-0 lg:group-hover/table:w-28 transition-all duration-300 overflow-hidden">
                                                    <div className="lg:w-0 lg:group-hover/table:w-28 lg:opacity-0 lg:group-hover/table:opacity-100 px-6 py-4 text-right transition-all duration-300">
                                                        Actions
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {currentRows.length > 0 ? (
                                                currentRows.map((item, idx) => {
                                                    const rowNumber = startIndex + idx + 1;

                                                        return (
                                                            <tr
                                                                key={rowNumber}
                                                                className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition-colors"
                                                            >
                                                                <td className="px-6 py-4">

                                                                    <div className="flex items-center gap-3">
                                                                        <div>
                                                                            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                                                                {item.RequestNo}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-6 py-4">

                                                                    <div className="flex items-center gap-3">

                                                                        <div>
                                                                            <div className="text-xs text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                                                                {item.TotalStores}
                                                                            </div>


                                                                        </div>
                                                                    </div>
                                                                </td>


                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div>
                                                                            <div className="text-xs text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                                                                {item.TotalRequests}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-6 py-4">

                                                                    <div className="flex items-center gap-3">

                                                                        <div>
                                                                            <div className="text-xs text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                                                                {item.created_at ? format(new Date(item.created_at), 'MMM dd, yyyy') : 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-6 py-4 lg:p-0 lg:w-0 lg:group-hover:w-28 transition-all duration-300 ease-in-out overflow-hidden">
                                                                    <div className="flex justify-end items-center gap-2 h-full transition-all duration-300 lg:w-0 lg:group-hover:w-28 lg:opacity-0 lg:group-hover:opacity-100 lg:px-0 lg:group-hover:px-6">
                                                                        <button
                                                                            onClick={() => {
                                                                                router.get(`${WebUrl}/logs/view/${item.Request_ID}`);
                                                                            }}
                                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                                                                            title="View Request Details"
                                                                        >
                                                                            <Eye size={14} />
                                                                        </button>
                                                                    </div>
                                                                </td>



                                                            </tr>
                                                        );
                                                    })
                                            ) : (
                                                <tr>
                                                    <td colSpan={10} className="px-4 py-2 text-center text-gray-500 border-b border-gray-200">
                                                        No data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                            )}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            rowsPerPage={rowsPerPage}
                            setCurrentPage={setCurrentPage}
                            setRowsPerPage={setRowsPerPage}
                        />

                    </div>
                   
                </div>
            )}
        </AppLayout>
    );
}
