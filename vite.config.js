import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  logLevel: 'error',
  plugins: [react()],
  server: {
    proxy: {
      '/v1': {
        target: process.env.VITE_BLUE_API_URL || 'http://localhost:8787',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.VITE_BLUE_API_URL || 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
