import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { useEffect, useState } from 'react';

const BACKGROUND_COLORS = [
    'bg-zinc-950',    // Slate/Black
    'bg-slate-900',   // Deep Blue
    'bg-neutral-900', // Neutral Gray
    'bg-stone-950',   // Warm Black
];

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

const [currentColorIndex, setCurrentColorIndex] = useState(0);

useEffect(() => {
        if (BACKGROUND_COLORS.length <= 1) return;

        const intervalId = setInterval(() => {
            setCurrentColorIndex((prev) => (prev + 1) % BACKGROUND_COLORS.length);
        }, 8000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel - Now with Moving Images */}
            <div 
                className={`relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r overflow-hidden transition-colors duration-[3000ms] ease-in-out ${BACKGROUND_COLORS[currentColorIndex]}`}
            >
                {/* Optional: Grainy texture overlay to make the colors look premium */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-medium tracking-tight"
                >
                    {/* <AppLogoIcon className="mr-2 size-8 fill-current text-white" /> */}
                    {name}
                </Link>
            </div>

            {/* Right Panel - Form (unchanged) */}
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        {/* <AppLogoIcon className="h-10 fill-current text-black sm:h-12" /> */}
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
