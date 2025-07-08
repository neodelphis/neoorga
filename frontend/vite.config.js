import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        // Permet à Vite d'être accessible depuis le réseau Docker
        host: true,
        // Configuration HMR explicite pour un environnement avec proxy
        hmr: {
            protocol: 'ws',
            host: 'localhost',
        },
    },
})
