import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const projectRoot = path.resolve(__dirname, '..')
const workspaceRoot = path.resolve(projectRoot, '..')
const srcDir = path.resolve(projectRoot, 'src')
const centralLogosDir = path.resolve(workspaceRoot, 'Central Library', 'Image Assets', 'Logos')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcDir,
      '@central-logos': centralLogosDir,
    },
  },
  server: {
    fs: {
      allow: [projectRoot, workspaceRoot],
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
})
