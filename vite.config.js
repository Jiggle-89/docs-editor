import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  optimizeDeps: {
    include: ['@ckeditor/ckeditor5-react', 'ckeditor5']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'ckeditor-react': ['@ckeditor/ckeditor5-react'],
          'ckeditor5': ['ckeditor5']
        }
      }
    }
  },
  resolve: {
    alias: {
      'ckeditor5': path.resolve(__dirname, 'node_modules/ckeditor5/dist/ckeditor5.js')
    }
  },
  define: {
    global: {}
  }
})
