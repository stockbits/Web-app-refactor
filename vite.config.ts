import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@central-logos': path.resolve(__dirname, 'Central Library/Image Assets/Logos'),
    },
  },
})
