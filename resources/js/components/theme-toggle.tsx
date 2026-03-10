'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else if (savedTheme === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            // Check system preference
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(systemPrefersDark);
            if (systemPrefersDark) {
                document.documentElement.classList.add('dark');
            }
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);

        // Update DOM and save preference
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="flex items-center space-x-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <Sun className={`h-4 w-4 transition-colors duration-200 ${!isDark ? 'text-orange-500' : 'text-gray-400'}`} />

            <button
                onClick={toggleTheme}
                className={`cursor-pointer relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${isDark ? 'bg-gray-700' : 'bg-gray-200'} `}
                role="switch"
                aria-checked={isDark}
                aria-label="Toggle dark mode"
            >
                <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${isDark ? 'translate-x-5' : 'translate-x-1'} `}
                />
            </button>

            <Moon className={`h-4 w-4 transition-colors duration-200 ${isDark ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
    );
}
