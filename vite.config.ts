import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    base: './',
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
            '@': path.resolve(__dirname, 'resources/js'),
            '@assets': path.resolve(__dirname, 'resources/assets'),
        },
    },
    server: {
        host: 'localhost',         // 👈 binds to localhost only (127.0.0.1)
        port: 5173,
        cors: true,
        strictPort: true,
        hmr: {
            host: 'localhost',     // 👈 HMR (hot module reload) also on localhost
            port: 5173,
        },
    },
});
