import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        open: true,
        proxy: {
            '/api/openai': {
                target: 'https://api.openai.com/v1',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api\/openai/, ''); },
            },
            '/api/deepseek': {
                target: 'https://api.deepseek.com',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api\/deepseek/, ''); },
            },
            '/api/gemini': {
                target: 'https://generativelanguage.googleapis.com',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api\/gemini/, ''); },
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
