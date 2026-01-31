import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // 'backend' correspond au nom du service dans le docker-compose
        target: 'http://backend:3000', 
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})