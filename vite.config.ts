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
            // MUI in its own chunk (large library ~860KB)
            if (id.includes('@mui')) {
              return 'vendor-mui';
            }
            // All other vendor libraries together to prevent circular chunk dependencies
            // This includes React, other libraries, and their dependencies
            return 'vendor-libs';
          }
          // Admin pages - split by category for better caching
          // Only split pages that don't import from each other to avoid circular refs
          if (id.includes('App - Pages/')) {
            const match = id.match(/App - Pages\/([^/]+)/);
            if (match) {
              const category = match[1].toLowerCase().replace(/\s+/g, '-');
              // Keep related admin sections together to prevent circular dependencies
              // Group 1: Operation-related
              if (['operation-toolkit', 'operations-management'].includes(category)) {
                return 'admin-operations';
              }
              // Group 2: Domain & Resource
              if (['domain-admin', 'resource-admin'].includes(category)) {
                return 'admin-domain-resource';
              }
              // Group 3: Task & Schedule
              if (['task-admin', 'schedule-admin'].includes(category)) {
                return 'admin-task-schedule';
              }
              // Group 4: System & Settings
              if (['system-admin', 'general-settings'].includes(category)) {
                return 'admin-system-settings';
              }
              // Individual chunks for isolated sections
              if (['user-admin', 'jeopardy-admin', 'self-service-admin'].includes(category)) {
                return `admin-${category}`;
              }
            }
          }
        },
      },
    },
  },
})
