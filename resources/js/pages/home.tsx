import AppLayout from '@/layouts/app-layout';
// import { User, type BreadcrumbItem } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Hand } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Welcome',
        href: '/index',
    },
];

export default function Home() {

    // const { auth, store } = usePage().props as unknown as { auth: any, store: Store };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />

            <div className="mt-43 flex flex-col items-center justify-center space-y-4 px-4 text-center">
                <motion.h1
                    className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-[#ebebeb] flex items-center gap-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Hello!
                    <motion.span
                        className="inline-block"
                        style={{ originX: "70%", originY: "70%" }}
                        animate={{ rotate: [0, 15, -10, 15, 0] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "easeInOut",
                        }}
                    >
                        <Hand 
                            size={24} 
                            className="text-yellow-500 fill-yellow-500/20" 
                            strokeWidth={2.5} 
                        />
                    </motion.span>
                </motion.h1>

                <motion.p
                    className="mb-7 max-w-xl text-sm md:text-lg text-gray-600 dark:text-[#ebebeb]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    Welcome to <span className="font-semibold text-blue-600 dark:text-[#bd0000]">{import.meta.env.VITE_APP_NAME}</span>. We're glad to have you here. Feel free to proceed with your transactions seamlessly.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.span
                        className="inline-block cursor-pointer rounded-lg bg-gray-200 dark:bg-gray-700 px-3 py-1 text-xs md:text-sm font-medium text-gray-800 dark:text-gray-100 shadow-sm"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        Always here for you 🚀
                    </motion.span>
                </motion.div>
            </div>

            <footer className="mt-53 flex flex-col items-center justify-center space-y-4 px-4 text-center text-xs text-gray-300 dark:text-[#ebebeb]">
                
                © Alfamart Philippines. All Rights Reserved.
            </footer>
        </AppLayout>
    );
}
