import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const repoRoot = path.resolve(__dirname, '..')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(repoRoot, 'src'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
})
