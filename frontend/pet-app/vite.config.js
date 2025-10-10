import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', // Use localhost instead
    port: 3000, // Try different port
    strictPort: false, // Allow fallback to other ports
  },
})
