import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define:{
    'process.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL),
    'process.env.VITE_FRONTEND_URL': JSON.stringify(process.env.VITE_FRONTEND_URL),
    'process.env.VITE_PROXY_URL': JSON.stringify(process.env.VITE_PROXY_URL),
    'process.env.VITE_SCREENSHOT_API': JSON.stringify(process.env.VITE_SCREENSHOT_API),
  }
})
