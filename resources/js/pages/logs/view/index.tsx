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
    CircleSlash,
    Printer
} from 'lucide-react';
import { WebUrl } from '@/components/others/weburl';
import Pagination from "@/components/others/pagination";
import { Item } from '@radix-ui/react-dropdown-menu';

interface ManualAllocationRequestsDetails {
    Request_ID: number;
    RequestNo: string;
    StoreCode: string;
    StoreName: string;
    PLU: string;
    ItemDescription: string;
    Location: string;
    Tail1: string;
    C2: number;
    Quantity: number;
    OH_AfterAllocation: number;
}

export default function MASViewLogs({ id }: { id: string }) {

    /** ----------- For Loading ------------------------- */
    const [loading, setLoading] = useState(true);

    /**------------------- Data Fetching ------------------- */
    const [data, setData] = useState<ManualAllocationRequestsDetails[]>([]);

   useEffect(() => {
        axios.get(`${WebUrl}/api/logs/get-manual-allocation-logs-details/${id}`)
            .then(res => {
                setData(res.data);
                console.log(res.data);
            })
            .catch(err => {
                console.error('Failed to fetch details:', err);
                toast.error('Failed to load details');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    const requestNo = data.length > 0 ? data[0].RequestNo : 'Loading...';

    const dynamicBreadcrumbs: BreadcrumbItemType[] = [
        {
            title: `${requestNo}`,
            module: 'View Logs',
            href: '/index',
        },
    ];

    /**---------------------------- Searching ----------------------------- */
    const [searchTerm, setSearchTerm] = React.useState('');
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = data.filter(item => {
        const search = searchTerm.toLowerCase();

        return (
            item.RequestNo?.toLowerCase().includes(search) || 
            item.PLU?.toLowerCase().includes(search) ||
            item.StoreName?.toLowerCase().includes(search)
        );
    });

    /**--------------------------- Pagination ----------------------------*/
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = filteredData.slice(startIndex, startIndex + rowsPerPage);


    /**-------------------- Exporting All Data ------------------- */
    const [isReprinting, setIsReprinting] = useState(false);

    const handleExportExcel = async () => {
        if (data.length === 0) {
            toast.error("No data available to export");
            return;
        }

        setIsReprinting(true);

        try {
            const exportData = data.map(item => ({
                'Request No': item.RequestNo,
                'storeCode': item.StoreCode,
                'store': item.StoreName,
                'plu': item.PLU,
                'itemDescp': item.ItemDescription,
                'locationCode': item.Location,
                'tail1': item.Tail1,
                'c2': item.C2,
                'qtyRequest': item.Quantity,
                'ohAfterAllocation': item.OH_AfterAllocation
            }));

            const response = await axios.post(`${WebUrl}/api/reprint-manual-allocation`, 
                { items: exportData },
                { responseType: 'blob' } 
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reprint-${requestNo}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); 
            toast.success("Full report generated successfully!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Export failed. Please check your connection.");
        } finally {
            setIsReprinting(false);
        }
    };


    return (
        <AppLayout breadcrumbs={dynamicBreadcrumbs}>
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
                                    <BreadcrumbLink className="text-[0.75rem]">{dynamicBreadcrumbs[0].module}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-[0.75rem]">{dynamicBreadcrumbs[0].title}</BreadcrumbPage>
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

                           <button
                                onClick={handleExportExcel}
                                disabled={isReprinting || filteredData.length === 0}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                            >
                                {isReprinting ? (
                                    <>
                                        <CircleSlash className="w-4 h-4 animate-spin" />
                                        <span>Reprinting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Printer className="w-4 h-4" />
                                        <span>Reprint</span>
                                    </>
                                )}
                            </button>

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
                                                <th className="px-6 py-4 text-left">Store</th>
                                                <th className="px-6 py-4 text-left">Product</th>
                                                <th className="px-6 py-4 text-left">Location</th>
                                                <th className="px-6 py-4 text-left">Tail 1</th>
                                                <th className="px-6 py-4 text-left">C2</th>
                                                <th className="px-6 py-4 text-left">Quantity</th>
                                                <th className="px-6 py-4 text-left">On Hand After Allocation</th>

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
                                                                                {item.StoreName}
                                                                            </div>
                                                                            <div className="text-xs text-gray-400">
                                                                                {item.StoreCode}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-6 py-4">

                                                                    <div className="flex items-center gap-3">
                                                                        <div>
                                                                            <div className="text-xs font-bold text-orange-600 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                                                                {item.ItemDescription}
                                                                            </div>
                                                                            <div className="text-xs text-gray-400">
                                                                                {item.PLU}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>


                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div>
                                                                            <div className="text-xs text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                                                                {item.Location}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-6 py-4">

                                                                    <div className="flex items-center gap-3">

                                                                        <div>
                                                                            <div className="text-xs text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                                                                {item.Tail1}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div>
                                                                            <div className="text-xs text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                                                                {item.C2}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div>
                                                                            <div className="text-xs text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                                                                {item.Quantity}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div>
                                                                            <div className="text-xs text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                                                                {item.OH_AfterAllocation}
                                                                            </div>
                                                                        </div>
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
