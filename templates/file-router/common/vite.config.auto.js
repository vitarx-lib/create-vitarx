import vitarx from '@vitarx/plugin-vite'
import { fileURLToPath, URL } from 'node:url'
import vitarxRouter from 'vitarx-router/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vitarx(), vitarxRouter()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    emptyOutDir: true
  }
})
