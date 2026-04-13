import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Cross, // Replaced Hand with Cross
    Church, 
    Heart, 
    BookOpen, 
    BarChart3, 
    Sparkles 
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/index',
    },
];

export default function Home() {
    const appName = import.meta.env.VITE_APP_NAME || 'AGCMI';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Welcome Home" />

            <div className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 py-12">
                
                {/* Spiritual Ambient Background */}
                <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent dark:from-red-900/5" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center space-y-10 w-full max-w-6xl"
                >
                    {/* Header Section */}
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <motion.div 
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 shadow-sm dark:bg-red-600/10 dark:text-red-500"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Church size={32} />
                        </motion.div>

                        <div className="space-y-2">
                            <motion.h1
                                className="flex items-center justify-center gap-4 text-3xl font-bold tracking-tight text-gray-900 md:text-5xl dark:text-white"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Welcome Home
                                <motion.span
                                    className="inline-block text-blue-600 dark:text-red-500"
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        opacity: [0.8, 1, 0.8] 
                                    }}
                                    transition={{ 
                                        duration: 4, 
                                        repeat: Infinity, 
                                        ease: "easeInOut" 
                                    }}
                                >
                                    <Cross size={36} strokeWidth={2.5} />
                                </motion.span>
                            </motion.h1>
                            <p className="mx-auto max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-400">
                                Grace and peace to you! Manage your spiritual walk and church stewardship at <span className="font-semibold text-blue-600 dark:text-red-500">{appName}</span>.
                            </p>
                        </div>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        
                        {/* 1. Tithes & Offerings */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
                        >
                            <div>
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10">
                                    <Heart size={24} />
                                </div>
                                <h3 className="text-lg font-bold dark:text-white uppercase tracking-tight">Giving</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                    Securely manage your tithes, offerings, and missions support to help grow our local ministry.
                                </p>
                            </div>
                        </motion.div>

                        {/* 2. Daily Devotions */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
                        >
                            <div>
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-600/10">
                                    <BookOpen size={24} />
                                </div>
                                <h3 className="text-lg font-bold dark:text-white uppercase tracking-tight">Daily Devotion</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                    Stay connected with the Word. Submit your daily reflections and track your personal spiritual walk.
                                </p>
                            </div>
                        </motion.div>

                        {/* 3. Reports & Analytics */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
                        >
                            <div>
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-600/10">
                                    <BarChart3 size={24} />
                                </div>
                                <h3 className="text-lg font-bold dark:text-white uppercase tracking-tight">Reports</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                    Access ministry insights and analytical progress reports for church leadership and transparency.
                                </p>
                            </div>
                        </motion.div>

                    </div>

                    {/* Status Badge */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600 dark:bg-gray-800/50 dark:text-gray-300">
                           <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                            </span>
                            Faithful in Service
                            <Sparkles size={14} className="text-yellow-500" />
                        </span>
                    </motion.div>
                </motion.div>
            </div>

            <footer className="py-10 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                    © {new Date().getFullYear()} AGCMI - Cabuyao • Soli Deo Gloria
                </p>
            </footer>
        </AppLayout>
    );
}
