import fs from 'fs-extra'
import { readFileSync } from 'node:fs'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copyCommonFiles, copyLangSpecificFiles, createProject } from '../src/project.js'
import type { ProjectOptions } from '../src/prompt.js'

const TEMPLATES_DIR = path.resolve(process.cwd(), 'templates')
const TMP_ROOT = path.join(process.cwd(), '.test-integration')

let consoleSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  consoleSpy.mockRestore()
})

function createOptions(overrides: Partial<ProjectOptions> = {}): ProjectOptions {
  return {
    root: TMP_ROOT,
    templateRoot: TEMPLATES_DIR,
    name: 'test-project',
    lang: 'ts',
    template: 'default',
    projectDir: path.join(TMP_ROOT, 'test-project'),
    manager: 'npm',
    templateDir: path.join(TEMPLATES_DIR, 'default'),
    ...overrides
  }
}

describe('集成测试：TypeScript 项目完整生成', () => {
  const projectDir = path.join(TMP_ROOT, 'ts-project')

  beforeEach(async () => {
    await fs.ensureDir(TMP_ROOT)
  })

  afterEach(async () => {
    await fs.remove(TMP_ROOT)
  })

  it('common 目录文件全部复制到项目目录', async () => {
    const commonDir = path.join(TEMPLATES_DIR, 'default', 'common')
    await copyCommonFiles(commonDir, projectDir, 'ts')

    expect(await fs.pathExists(path.join(projectDir, 'package.json'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, '.gitignore'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, '.prettierrc.json'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'README.md'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'public', 'favicon.ico'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'assets', 'style.css'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'assets', 'vitarx.svg'))).toBe(true)
  })

  it('auto 文件后缀正确转换为 TypeScript 后缀', async () => {
    const commonDir = path.join(TEMPLATES_DIR, 'default', 'common')
    await copyCommonFiles(commonDir, projectDir, 'ts')

    expect(await fs.pathExists(path.join(projectDir, 'src', 'main.ts'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'App.tsx'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'vite.config.ts'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'router', 'index.ts'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'router', 'routes.ts'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'pages', 'index.tsx'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'pages', 'About', 'index.tsx'))).toBe(
      true
    )
    expect(
      await fs.pathExists(path.join(projectDir, 'src', 'components', 'Counter', 'index.tsx'))
    ).toBe(true)
    expect(
      await fs.pathExists(path.join(projectDir, 'src', 'components', 'Footer', 'index.tsx'))
    ).toBe(true)

    expect(await fs.pathExists(path.join(projectDir, 'src', 'main.auto.js'))).toBe(false)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'App.auto.jsx'))).toBe(false)
  })

  it('文件内容中 auto 引用替换为 .js/.jsx', async () => {
    const commonDir = path.join(TEMPLATES_DIR, 'default', 'common')
    await copyCommonFiles(commonDir, projectDir, 'ts')

    const mainContent = readFileSync(path.join(projectDir, 'src', 'main.ts'), 'utf-8')
    expect(mainContent).toContain("import App from './App.jsx'")
    expect(mainContent).toContain("import router from './router/index.js'")
    expect(mainContent).not.toContain('.auto.js')
    expect(mainContent).not.toContain('.auto.jsx')
  })

  it('二进制文件完整复制不损坏', async () => {
    const commonDir = path.join(TEMPLATES_DIR, 'default', 'common')
    await copyCommonFiles(commonDir, projectDir, 'ts')

    const srcIco = path.join(TEMPLATES_DIR, 'default', 'common', 'public', 'favicon.ico')
    const destIco = path.join(projectDir, 'public', 'favicon.ico')

    const srcBuf = readFileSync(srcIco)
    const destBuf = readFileSync(destIco)
    expect(Buffer.compare(srcBuf, destBuf)).toBe(0)
  })

  it('TypeScript 特定文件复制到项目目录', async () => {
    const commonDir = path.join(TEMPLATES_DIR, 'default', 'common')
    const tsDir = path.join(TEMPLATES_DIR, 'default', 'typescript')
    await copyCommonFiles(commonDir, projectDir, 'ts')
    await copyLangSpecificFiles(tsDir, projectDir)

    expect(await fs.pathExists(path.join(projectDir, 'tsconfig.json'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'tsconfig.app.json'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'tsconfig.node.json'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'env.d.ts'))).toBe(true)
  })

  it('package.json 深度合并（common + typescript）', async () => {
    const commonDir = path.join(TEMPLATES_DIR, 'default', 'common')
    const tsDir = path.join(TEMPLATES_DIR, 'default', 'typescript')
    await copyCommonFiles(commonDir, projectDir, 'ts')
    await copyLangSpecificFiles(tsDir, projectDir)

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'))

    expect(pkg.name).toBe('vitarx-project')
    expect(pkg.private).toBe(true)
    expect(pkg.type).toBe('module')

    expect(pkg.scripts.dev).toBe('vite')
    expect(pkg.scripts.build).toBe('tsc --noEmit && vite build')
    expect(pkg.scripts.preview).toBe('vite preview')
    expect(pkg.scripts.format).toBe('prettier --write src/')

    expect(pkg.dependencies.vitarx).toBeDefined()
    expect(pkg.dependencies['vitarx-router']).toBeDefined()

    expect(pkg.devDependencies.prettier).toBeDefined()
    expect(pkg.devDependencies.typescript).toBeDefined()
    expect(pkg.devDependencies['@types/node']).toBeDefined()
    expect(pkg.devDependencies['@vitarx/plugin-vite']).toBeDefined()
    expect(pkg.devDependencies.vite).toBeDefined()
  })

  it('tsconfig.json 不与 common 合并（非 package.json 直接覆盖）', async () => {
    const commonDir = path.join(TEMPLATES_DIR, 'default', 'common')
    const tsDir = path.join(TEMPLATES_DIR, 'default', 'typescript')
    await copyCommonFiles(commonDir, projectDir, 'ts')
    await copyLangSpecificFiles(tsDir, projectDir)

    const tsconfig = await fs.readJson(path.join(projectDir, 'tsconfig.json'))
    expect(tsconfig.files).toBeDefined()
    expect(tsconfig.references).toBeDefined()
  })
})

describe('集成测试：JavaScript 项目完整生成', () => {
  const projectDir = path.join(TMP_ROOT, 'js-project')

  beforeEach(async () => {
    await fs.ensureDir(TMP_ROOT)
  })

  afterEach(async () => {
    await fs.remove(TMP_ROOT)
  })

  it('auto 文件后缀正确转换为 JavaScript 后缀', async () => {
    const commonDir = path.join(TEMPLATES_DIR, 'default', 'common')
    await copyCommonFiles(commonDir, projectDir, 'js')

    expect(await fs.pathExists(path.join(projectDir, 'src', 'main.js'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'App.jsx'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'vite.config.js'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'router', 'index.js'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'router', 'routes.js'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'pages', 'index.jsx'))).toBe(true)
    expect(
      await fs.pathExists(path.join(projectDir, 'src', 'components', 'Counter', 'index.jsx'))
    ).toBe(true)

    expect(await fs.pathExists(path.join(projectDir, 'src', 'main.auto.js'))).toBe(false)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'App.auto.jsx'))).toBe(false)
  })

  it('JavaScript 特定文件复制到项目目录', async () => {
    const commonDir = path.join(TEMPLATES_DIR, 'default', 'common')
    const jsDir = path.join(TEMPLATES_DIR, 'default', 'javascript')
    await copyCommonFiles(commonDir, projectDir, 'js')
    await copyLangSpecificFiles(jsDir, projectDir)

    expect(await fs.pathExists(path.join(projectDir, 'jsconfig.json'))).toBe(true)
  })

  it('JavaScript 项目不包含 TypeScript 文件', async () => {
    const commonDir = path.join(TEMPLATES_DIR, 'default', 'common')
    const jsDir = path.join(TEMPLATES_DIR, 'default', 'javascript')
    await copyCommonFiles(commonDir, projectDir, 'js')
    await copyLangSpecificFiles(jsDir, projectDir)

    expect(await fs.pathExists(path.join(projectDir, 'tsconfig.json'))).toBe(false)
    expect(await fs.pathExists(path.join(projectDir, 'tsconfig.app.json'))).toBe(false)
    expect(await fs.pathExists(path.join(projectDir, 'env.d.ts'))).toBe(false)
  })

  it('package.json 不包含 TypeScript 依赖', async () => {
    const commonDir = path.join(TEMPLATES_DIR, 'default', 'common')
    const jsDir = path.join(TEMPLATES_DIR, 'default', 'javascript')
    await copyCommonFiles(commonDir, projectDir, 'js')
    await copyLangSpecificFiles(jsDir, projectDir)

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'))
    expect(pkg.scripts.build).toBe('vite build')
    expect(pkg.devDependencies.typescript).toBeUndefined()
    expect(pkg.devDependencies['@types/node']).toBeUndefined()
  })
})

describe('集成测试：createProject 端到端', () => {
  const projectDir = path.join(TMP_ROOT, 'e2e-project')

  beforeEach(async () => {
    await fs.ensureDir(TMP_ROOT)
  })

  afterEach(async () => {
    await fs.remove(TMP_ROOT)
  })

  it('TypeScript 项目完整创建流程', async () => {
    const options = createOptions({
      name: 'my-ts-app',
      lang: 'ts',
      projectDir
    })

    await createProject(options)

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'))
    expect(pkg.name).toBe('my-ts-app')
    expect(pkg.scripts.build).toBe('tsc --noEmit && vite build')
    expect(pkg.devDependencies.typescript).toBeDefined()

    expect(await fs.pathExists(path.join(projectDir, 'src', 'main.ts'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'App.tsx'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'tsconfig.json'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'env.d.ts'))).toBe(true)

    const mainContent = readFileSync(path.join(projectDir, 'src', 'main.ts'), 'utf-8')
    expect(mainContent).not.toContain('.auto.js')
    expect(mainContent).not.toContain('.auto.jsx')

    const htmlContent = readFileSync(path.join(projectDir, 'index.html'), 'utf-8')
    expect(htmlContent).toContain('src/main.ts')
  })

  it('JavaScript 项目完整创建流程', async () => {
    const options = createOptions({
      name: 'my-js-app',
      lang: 'js',
      projectDir
    })

    await createProject(options)

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'))
    expect(pkg.name).toBe('my-js-app')
    expect(pkg.scripts.build).toBe('vite build')
    expect(pkg.devDependencies.typescript).toBeUndefined()

    expect(await fs.pathExists(path.join(projectDir, 'src', 'main.js'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'src', 'App.jsx'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'jsconfig.json'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'tsconfig.json'))).toBe(false)
  })

  it('不存在的模板抛出错误', async () => {
    const options = createOptions({
      template: 'nonexistent',
      templateDir: path.join(TEMPLATES_DIR, 'nonexistent'),
      projectDir
    })

    await expect(createProject(options)).rejects.toThrow('模板 "nonexistent" 不存在于')
  })

  it('项目名称正确覆盖 package.json 的 name 字段', async () => {
    const options = createOptions({
      name: '@org/my-scoped-app',
      lang: 'ts',
      projectDir
    })

    await createProject(options)

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'))
    expect(pkg.name).toBe('@org/my-scoped-app')
  })

  it('输出后续步骤提示', async () => {
    const options = createOptions({
      name: 'my-app',
      lang: 'ts',
      projectDir
    })

    await createProject(options)

    const output = consoleSpy.mock.calls.map((args: string[]) => args.join(' ')).join('\n')
    expect(output).toContain('my-app')
    expect(output).toContain('npm install')
    expect(output).toContain('npm run dev')
  })

  it('当前目录创建时不提示 cd', async () => {
    const options = createOptions({
      name: 'my-app',
      lang: 'ts',
      projectDir: TMP_ROOT,
      root: TMP_ROOT
    })

    await createProject(options)

    const output = consoleSpy.mock.calls.map((args: string[]) => args.join(' ')).join('\n')
    expect(output).not.toMatch(/cd\s+my-app/)
  })

  it('子目录创建时提示 cd', async () => {
    const options = createOptions({
      name: 'my-app',
      lang: 'ts',
      projectDir
    })

    await createProject(options)

    const output = consoleSpy.mock.calls.map((args: string[]) => args.join(' ')).join('\n')
    expect(output).toMatch(/cd\s+my-app/)
  })
})
