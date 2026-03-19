import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  // sans babel → plus de warnings

export default defineConfig({
    plugins: [react()],
    server: { host: '0.0.0.0', port: 5173 },
})