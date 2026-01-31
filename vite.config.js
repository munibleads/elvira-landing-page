import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                ai: resolve(__dirname, 'ai-solutions.html'),
                waste: resolve(__dirname, 'smart-waste.html'),
            },
        },
    },
})
