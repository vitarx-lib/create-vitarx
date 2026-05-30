import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: { noExternal: true },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/bin/cli.ts'),
      formats: ['cjs'],
      fileName: () => 'index.cjs'
    },
    rolldownOptions: {
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
    outDir: './'
  }
})
