import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    server: { host: '0.0.0.0', port: 5173 },
    resolve: {
        alias: {
            'STYLE': path.resolve(__dirname, './src/style'),
            'FRONT': path.resolve(__dirname, './src'),
            'COMP':  path.resolve(__dirname, './src/Component'),
            'HOOKS': path.resolve(__dirname, './src/hooks'),
            'TOOL':  path.resolve(__dirname, './src/tool'),
        },
    },
})