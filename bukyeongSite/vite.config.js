import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  css: {
    postcss: './postcss.config.js',
  },
  assetsInclude: ['**/*.html'],
  server: {
    fs: {
      strict: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})