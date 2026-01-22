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
  build: {
    chunkSizeWarningLimit: 1000, // Increased for vendor-mui (860 KB) which is acceptable for a UI library
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - split large dependencies
          if (id.includes('node_modules')) {
            // MUI in its own chunk (large library)
            if (id.includes('@mui')) {
              return 'vendor-mui';
            }
            // React ecosystem (react, react-dom, scheduler together to avoid circular deps)
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // Other node_modules
            return 'vendor-libs';
          }
          // Admin pages - split by category for better caching
          // Note: Keep shared components together to avoid circular references
          if (id.includes('App - Pages/')) {
            const match = id.match(/App - Pages\/([^/]+)/);
            if (match) {
              const category = match[1].toLowerCase().replace(/\s+/g, '-');
              // Group smaller admin sections together
              if (['schedule-admin', 'task-admin', 'user-admin', 'system-admin', 
                   'general-settings', 'self-service-admin', 'jeopardy-admin',
                   'domain-admin', 'resource-admin'].includes(category)) {
                return `admin-${category}`;
              }
              // Larger sections get their own chunks
              return `admin-${category}`;
            }
          }
        },
      },
    },
  },
})
