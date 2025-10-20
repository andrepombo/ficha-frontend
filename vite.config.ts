import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Always use /painel/ base path for deployment
  base: '/painel/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'fichapinte.com.br',
      'www.fichapinte.com.br',
      'localhost',
      '127.0.0.1',
    ],
    proxy: {
      '/api': {
        // Use localhost for local development, backend for Docker/production
        target: mode === 'development' ? 'http://localhost:8000' : 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}))
