import fs from 'fs-extra'
import { readFileSync } from 'node:fs'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  copyCommonFiles,
  copyLangSpecificFiles,
  deepMergeJson,
  isTextFile,
  replaceAutoExtInContent,
  resolveAutoExt
} from '../src/project.js'

describe('resolveAutoExt', () => {
  describe('.auto.js 文件', () => {
    it('lang=ts 时解析为 .ts', () => {
      const result = resolveAutoExt('main.auto.js', 'ts')
      expect(result).toEqual({ targetExt: '.ts', destFileName: 'main.ts' })
    })

    it('lang=js 时解析为 .js', () => {
      const result = resolveAutoExt('main.auto.js', 'js')
      expect(result).toEqual({ targetExt: '.js', destFileName: 'main.js' })
    })
  })

  describe('.auto.jsx 文件', () => {
    it('lang=ts 时解析为 .tsx', () => {
      const result = resolveAutoExt('App.auto.jsx', 'ts')
      expect(result).toEqual({ targetExt: '.tsx', destFileName: 'App.tsx' })
    })

    it('lang=js 时解析为 .jsx', () => {
      const result = resolveAutoExt('App.auto.jsx', 'js')
      expect(result).toEqual({ targetExt: '.jsx', destFileName: 'App.jsx' })
    })
  })

  it('非 auto 文件返回 null', () => {
    expect(resolveAutoExt('index.html', 'ts')).toBeNull()
    expect(resolveAutoExt('package.json', 'js')).toBeNull()
    expect(resolveAutoExt('style.css', 'ts')).toBeNull()
  })

  it('嵌套路径中的 auto 文件能正确解析', () => {
    const result = resolveAutoExt('vite.config.auto.js', 'ts')
    expect(result).toEqual({ targetExt: '.ts', destFileName: 'vite.config.ts' })
  })
})

describe('replaceAutoExtInContent', () => {
  it('替换 .auto.js 为 .js', () => {
    expect(replaceAutoExtInContent("import App from './App.auto.js'")).toBe(
      "import App from './App.js'"
    )
  })

  it('替换 .auto.jsx 为 .jsx', () => {
    expect(replaceAutoExtInContent("import Counter from './Counter.auto.jsx'")).toBe(
      "import Counter from './Counter.jsx'"
    )
  })

  it('同时替换多种 auto 后缀', () => {
    const content = "import a from './a.auto.js'\nimport b from './b.auto.jsx'"
    expect(replaceAutoExtInContent(content)).toBe("import a from './a.js'\nimport b from './b.jsx'")
  })

  it('无 auto 后缀时内容不变', () => {
    const content = "import foo from './foo'\nconsole.log('hello')"
    expect(replaceAutoExtInContent(content)).toBe(content)
  })

  it('HTML 中的 script src 替换', () => {
    expect(replaceAutoExtInContent('<script src="src/main.auto.js" type="module"></script>')).toBe(
      '<script src="src/main.js" type="module"></script>'
    )
  })
})

describe('deepMergeJson', () => {
  it('基础属性合并', () => {
    const target = { name: 'app', version: '1.0.0' }
    const source = { version: '2.0.0', description: 'test' }
    const result = deepMergeJson(target, source)
    expect(result).toEqual({ name: 'app', version: '2.0.0', description: 'test' })
  })

  it('嵌套对象递归合并', () => {
    const target = { scripts: { dev: 'vite', build: 'vite build' } }
    const source = { scripts: { preview: 'vite preview' } }
    const result = deepMergeJson(target, source)
    expect(result).toEqual({
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' }
    })
  })

  it('数组直接覆盖而非合并', () => {
    const target = { files: ['a', 'b'] }
    const source = { files: ['c'] }
    const result = deepMergeJson(target, source)
    expect(result).toEqual({ files: ['c'] })
  })

  it('源值为 null 时覆盖目标值', () => {
    const target = { name: 'app' }
    const source = { name: null }
    const result = deepMergeJson(target, source)
    expect(result).toEqual({ name: null })
  })

  it('目标对象被原地修改', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    const result = deepMergeJson(target, source)
    expect(result).toBe(target)
    expect(target).toEqual({ a: 1, b: 2 })
  })

  it('深层嵌套递归合并', () => {
    const target = { a: { b: { c: 1, d: 2 } } }
    const source = { a: { b: { e: 3 } } }
    const result = deepMergeJson(target, source)
    expect(result).toEqual({ a: { b: { c: 1, d: 2, e: 3 } } })
  })
})

describe('isTextFile', () => {
  it('JS 文件返回 true', () => {
    expect(isTextFile('index.js')).toBe(true)
  })

  it('JSX 文件返回 true', () => {
    expect(isTextFile('App.jsx')).toBe(true)
  })

  it('HTML 文件返回 true', () => {
    expect(isTextFile('index.html')).toBe(true)
  })

  it('ICO 文件返回 false', () => {
    expect(isTextFile('favicon.ico')).toBe(false)
  })

  it('PNG 文件返回 false', () => {
    expect(isTextFile('logo.png')).toBe(false)
  })

  it('扩展名大小写不敏感', () => {
    expect(isTextFile('index.HTML')).toBe(true)
    expect(isTextFile('index.JS')).toBe(true)
  })
})

describe('copyCommonFiles', () => {
  const tmpDir = path.join(process.cwd(), '.test-copyCommon')

  beforeEach(async () => {
    await fs.ensureDir(tmpDir)
  })

  afterEach(async () => {
    await fs.remove(tmpDir)
  })

  it('auto 文件重命名并替换内容', async () => {
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    await fs.ensureDir(srcDir)

    await fs.writeFile(path.join(srcDir, 'main.auto.js'), "import './App.auto.js'")
    await fs.ensureDir(destDir)

    await copyCommonFiles(srcDir, destDir, 'ts')

    expect(await fs.pathExists(path.join(destDir, 'main.ts'))).toBe(true)
    expect(readFileSync(path.join(destDir, 'main.ts'), 'utf-8')).toBe("import './App.js'")
  })

  it('非 auto 文本文件替换内容中的引用', async () => {
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    await fs.ensureDir(srcDir)

    await fs.writeFile(path.join(srcDir, 'index.html'), '<script src="src/main.auto.js">')
    await fs.ensureDir(destDir)

    await copyCommonFiles(srcDir, destDir, 'ts')

    expect(readFileSync(path.join(destDir, 'index.html'), 'utf-8')).toBe(
      '<script src="src/main.js">'
    )
  })

  it('二进制文件直接复制', async () => {
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    await fs.ensureDir(srcDir)

    const binaryContent = Buffer.from([0x89, 0x50, 0x4e, 0x47])
    await fs.writeFile(path.join(srcDir, 'logo.png'), binaryContent)
    await fs.ensureDir(destDir)

    await copyCommonFiles(srcDir, destDir, 'ts')

    const copied = readFileSync(path.join(destDir, 'logo.png'))
    expect(Buffer.compare(copied, binaryContent)).toBe(0)
  })

  it('递归处理子目录', async () => {
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    await fs.ensureDir(path.join(srcDir, 'sub'))

    await fs.writeFile(path.join(srcDir, 'sub', 'App.auto.jsx'), "import './main.auto.js'")
    await fs.ensureDir(destDir)

    await copyCommonFiles(srcDir, destDir, 'js')

    expect(await fs.pathExists(path.join(destDir, 'sub', 'App.jsx'))).toBe(true)
    expect(readFileSync(path.join(destDir, 'sub', 'App.jsx'), 'utf-8')).toBe("import './main.js'")
  })

  it('lang=js 时 auto.jsx 解析为 .jsx', async () => {
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    await fs.ensureDir(srcDir)

    await fs.writeFile(path.join(srcDir, 'App.auto.jsx'), 'export default App')
    await fs.ensureDir(destDir)

    await copyCommonFiles(srcDir, destDir, 'js')

    expect(await fs.pathExists(path.join(destDir, 'App.jsx'))).toBe(true)
  })
})

describe('copyLangSpecificFiles', () => {
  const tmpDir = path.join(process.cwd(), '.test-copyLang')

  beforeEach(async () => {
    await fs.ensureDir(tmpDir)
  })

  afterEach(async () => {
    await fs.remove(tmpDir)
  })

  it('package.json 深度合并', async () => {
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    await fs.ensureDir(srcDir)
    await fs.ensureDir(destDir)

    await fs.writeJson(path.join(destDir, 'package.json'), {
      name: 'app',
      scripts: { dev: 'vite' },
      dependencies: { vue: '^3.0.0' }
    })
    await fs.writeJson(path.join(srcDir, 'package.json'), {
      scripts: { build: 'vite build' },
      devDependencies: { typescript: '^5.0.0' }
    })

    await copyLangSpecificFiles(srcDir, destDir)

    const merged = await fs.readJson(path.join(destDir, 'package.json'))
    expect(merged.name).toBe('app')
    expect(merged.scripts.dev).toBe('vite')
    expect(merged.scripts.build).toBe('vite build')
    expect(merged.dependencies.vue).toBe('^3.0.0')
    expect(merged.devDependencies.typescript).toBe('^5.0.0')
  })

  it('目标不存在 package.json 时直接复制', async () => {
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    await fs.ensureDir(srcDir)
    await fs.ensureDir(destDir)

    await fs.writeJson(path.join(srcDir, 'package.json'), { name: 'new-app' })

    await copyLangSpecificFiles(srcDir, destDir)

    const result = await fs.readJson(path.join(destDir, 'package.json'))
    expect(result.name).toBe('new-app')
  })

  it('非 package.json 文件直接覆盖', async () => {
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    await fs.ensureDir(srcDir)
    await fs.ensureDir(destDir)

    await fs.writeJson(path.join(destDir, 'tsconfig.json'), { compilerOptions: { strict: false } })
    await fs.writeJson(path.join(srcDir, 'tsconfig.json'), { compilerOptions: { strict: true } })

    await copyLangSpecificFiles(srcDir, destDir)

    const result = await fs.readJson(path.join(destDir, 'tsconfig.json'))
    expect(result.compilerOptions.strict).toBe(true)
  })

  it('递归处理子目录', async () => {
    const srcDir = path.join(tmpDir, 'src')
    const destDir = path.join(tmpDir, 'dest')
    await fs.ensureDir(path.join(srcDir, 'sub'))
    await fs.ensureDir(destDir)

    await fs.writeFile(path.join(srcDir, 'sub', 'env.d.ts'), 'declare module "*.vue"')

    await copyLangSpecificFiles(srcDir, destDir)

    expect(await fs.pathExists(path.join(destDir, 'sub', 'env.d.ts'))).toBe(true)
  })
})
