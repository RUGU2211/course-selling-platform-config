import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all service paths to API Gateway
      // Frontend calls /course-management-service/api/courses
      // Proxy forwards to http://localhost:8765/course-management-service/api/courses
      '/course-management-service': {
        target: 'http://localhost:8765',
        changeOrigin: true,
      },
      '/user-management-service': {
        target: 'http://localhost:8765',
        changeOrigin: true,
      },
      '/enrollment-service': {
        target: 'http://localhost:8765',
        changeOrigin: true,
      },
      '/content-delivery-service': {
        target: 'http://localhost:8765',
        changeOrigin: true,
      },
    },
  },
})
