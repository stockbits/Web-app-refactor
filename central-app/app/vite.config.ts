import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const srcDir = path.resolve(__dirname, 'src')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
})
