import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '127.0.0.1',
        port: 5173,
        // host: '0.0.0.0', allowedHosts: ['fcretin.ddns.net']  // autorise ton DDNS
    },
    resolve: {
        alias: {
            'FRONT': path.resolve(__dirname, './src'),
            'COMP':  path.resolve(__dirname, './src/Component'),
            'HOOKS': path.resolve(__dirname, './src/hooks'),
            'STYLE': path.resolve(__dirname, './src/style'),
            'MEDIA': path.resolve(__dirname, './src/media'),
        },
    },
})