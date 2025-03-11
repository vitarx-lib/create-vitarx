import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // 明确指定为Node环境
  ssr: {
    // 将所有Node.js内置模块标记为外部模块
    noExternal: true
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'cli',
      formats: ['cjs'],
      fileName: () => 'index.cjs'
    },
    rollupOptions: {
      external: [
        'commander',
        'fs-extra',
        'kolorist',
        'prompts',
        'path',
        'url',
        'node:path',
        'node:url',
        'node:fs'
      ]
    },
    target: 'node18',
    sourcemap: false,
    outDir: 'dist'
  }
})
