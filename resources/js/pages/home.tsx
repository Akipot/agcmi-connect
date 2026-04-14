import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    Image as ImageIcon, 
    MoreHorizontal,
    Sparkles,
    Quote
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Home', href: '/index' }];

interface HomeProps {
    dailyVerse: {
        reference: string;
        text: string;
    }
}

export default function Home({ dailyVerse }: HomeProps) {
    // Mock data for "Memories"
    const memories = [
        {
            id: 1,
            member: "Brother Nikko",
            time: "2 hours ago",
            content: "What a blessed Sunday service! The message about God's grace really spoke to my heart today. Grateful for our AGCMI family.",
            image: null, 
            likes: 12,
            comments: 4
        },
        {
            id: 2,
            member: "Sister Jen",
            time: "Yesterday",
            content: "Morning devotion: 'Thy word is a lamp unto my feet.' Feeling refreshed and ready for the week!",
            image: null,
            likes: 24,
            comments: 2
        }
    ];

    const verse = dailyVerse || { 
        text: "Grace and peace be multiplied unto you through the knowledge of God.", 
        reference: "2 Peter 1:2" 
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home Feed" />

            {/* Container centered with max-width */}
            <div className="mx-auto max-w-5xl px-4 py-8 md:grid md:grid-cols-12 md:gap-8">
                
                {/* --- Center Column: The Feed (Now taking 8 columns) --- */}
                <main className="md:col-span-8 space-y-6">
                    
                    {/* Share a Memory Input */}
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-inner">
                                A
                            </div>
                            <button className="flex-1 rounded-full bg-gray-100 px-5 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                                Share a blessing or memory...
                            </button>
                        </div>
                        <div className="mt-4 flex border-t border-gray-100 pt-3 dark:border-gray-800">
                            <button className="flex flex-1 items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-gray-800">
                                <ImageIcon size={18} className="text-green-500" /> Photo
                            </button>
                            <button className="flex flex-1 items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-gray-800">
                                <Sparkles size={18} className="text-yellow-500" /> Testimony
                            </button>
                        </div>
                    </motion.div>

                    {/* Feed Items */}
                    <div className="space-y-6">
                        {memories.map((post) => (
                            <motion.div 
                                key={post.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
                                        <div>
                                            <h4 className="text-sm font-bold dark:text-white">{post.member}</h4>
                                            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-tight">{post.time}</p>
                                        </div>
                                    </div>
                                    <button className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <MoreHorizontal size={20} className="text-gray-400" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="px-4 pb-4">
                                    <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                                        {post.content}
                                    </p>
                                </div>

                                {/* Post Image */}
                                {post.image && (
                                    <div className="bg-gray-50 dark:bg-black/20">
                                        <img src={post.image} alt="Memory" className="w-full object-cover max-h-[400px]" />
                                    </div>
                                )}

                                {/* Interaction Bar */}
                                <div className="flex items-center gap-6 border-t border-gray-50 p-3 px-6 dark:border-gray-800">
                                    <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-500 transition-colors dark:text-gray-400">
                                        <Heart size={20} /> {post.likes}
                                    </button>
                                    <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-500 transition-colors dark:text-gray-400">
                                        <MessageCircle size={20} /> {post.comments}
                                    </button>
                                    <button className="ml-auto p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </main>

                {/* --- Right Column: Sidebar Widgets (4 columns) --- */}
                <aside className="hidden md:col-span-4 md:block">
                    <div className="sticky top-8 space-y-6">
                        
                        {/* Verse of the Day Widget */}
                        <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:to-gray-900"
                    >
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                            <Quote size={20} />
                        </div>
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600/80">Daily Bread</h3>
                        
                        {/* API data rendered here */}
                        <p className="text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-300 italic">
                            "{verse.text.trim()}"
                        </p>
                        <p className="mt-4 text-xs font-bold text-gray-500">— {verse.reference}</p>
                    </motion.div>

                        {/* Church Info / Footer Mini */}
                        <div className="px-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                AGCMI Community Online
                            </div>
                            <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest leading-loose">
                                © {new Date().getFullYear()} AGCMI - Cabuyao <br/> 
                                Soli Deo Gloria
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </AppLayout>
    );
}
