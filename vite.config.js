import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/Amazon-Fba/',
    server: {
        port: 5181,
        host: true
    }
});
