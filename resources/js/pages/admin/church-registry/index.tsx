import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Church, Edit, MapPin, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ChurchType {
    church_id: number;
    churchName: string;
    city: string;
    province: string;
    isActive: boolean;
    latitude: number;
    longitude: number;
}

export default function Index({ churches }: { churches: ChurchType[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Church Registry', href: '/admin/churches' }
    ];

    const openMap = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Church Registry" />
            
            <div className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Church Registry</h1>
                        <p className="text-sm text-gray-500">Manage and monitor all church locations.</p>
                    </div>
                    <Link 
                        href="/admin/churches/create" 
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Plus size={18} /> Add New Church
                    </Link>
                </div>

                {/* Table Section */}
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b text-xs uppercase font-bold text-gray-600">
                            <tr>
                                <th className="px-6 py-4">Church Name</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {churches.map((church) => (
                                <tr key={church.church_id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">{church.churchName}</td>
                                    <td className="px-6 py-4 text-gray-500">{church.city}, {church.province}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${church.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {church.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button 
                                            onClick={() => openMap(church.latitude, church.longitude)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="View on Map"
                                        >
                                            <MapPin size={18} />
                                        </button>
                                        <Link 
                                            href={`/admin/churches/${church.church_id}/edit`}
                                            className="inline-block p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
