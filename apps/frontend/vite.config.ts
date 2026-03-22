import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '127.0.0.1',  // permet l’accès depuis d’autres machines
        port: 5173,       // ton port
        // allowedHosts: ['fcretin.ddns.net']  // autorise ton DDNS
    },
    resolve: {
        alias: {
            'COMP':  path.resolve(__dirname, './src/Component'),
            'STYLE': path.resolve(__dirname, './src/style'),
            'FRONT': path.resolve(__dirname, './src'),
            'HOOKS': path.resolve(__dirname, './src/hooks'),
            'TOOL':  path.resolve(__dirname, './src/tool'),
        },
    },
})