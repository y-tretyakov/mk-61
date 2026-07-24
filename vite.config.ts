import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mk-61/',
  build: {
    outDir: 'dist',
  },
})