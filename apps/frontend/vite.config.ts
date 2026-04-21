import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: '0.0.0.0', allowedHosts: ['fcretin.ddns.net',
            'shepherd-nail-types-insulin.trycloudflare.com'
        ]  // autorise ton DDNS
    },
    resolve: {
        alias: {
            'FRONT' : path.resolve(__dirname, './src'),
            'COMP'  : path.resolve(__dirname, './src/Component'),
            'HOOKS' : path.resolve(__dirname, './src/hooks'),
            'MEDIA' : path.resolve(__dirname, './src/media'),
            'LIB'   : path.resolve(__dirname, './src/lib'),
            'STYLE' : path.resolve(__dirname, './src/style'),
        },
    },
})