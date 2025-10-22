import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Server configuration (no base path)
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 8080,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
