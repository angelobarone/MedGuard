import { defineConfig } from 'vite';
import path from 'path';
import react from "@vitejs/plugin-react";

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./src/setupTests.js",
        reporters: ['default', 'html'], // default per console, html per pagina
        outputFile: './vitest-report/index.html', // opzionale
        testTimeout: 100000,
    },
});
