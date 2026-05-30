import fs from 'fs-extra'
import { blue, cyan, dim, green, yellow } from 'kolorist'
import path from 'path'
import { type ProjectOptions } from './prompt.js'

/**
 * auto 后缀到目标后缀的映射规则
 *
 * 模板中使用 .auto.js / .auto.jsx 作为语言无关的占位后缀，
 * 生成项目时根据用户选择的语言替换为实际后缀：
 * - .auto.js  → ts 时为 .ts，js 时为 .js
 * - .auto.jsx → ts 时为 .tsx，js 时为 .jsx
 */
const AUTO_EXT_MAP: Record<string, Record<'ts' | 'js', string>> = {
  '.auto.js': { ts: '.ts', js: '.js' },
  '.auto.jsx': { ts: '.tsx', js: '.jsx' }
}

/**
 * 解析文件名中的 auto 后缀
 *
 * 注意：不能使用 path.extname()，因为它只返回最后一个后缀（如 .jsx），
 * 而 auto 后缀是复合后缀（如 .auto.jsx），必须基于文件名尾部匹配
 *
 * @param {string} fileName - 文件名
 * @param {'ts' | 'js'} lang - 语言类型
 * @returns {{ targetExt: string; destFileName: string } | null} 解析结果，非 auto 文件返回 null
 */
function resolveAutoExt(
  fileName: string,
  lang: 'ts' | 'js'
): { targetExt: string; destFileName: string } | null {
  for (const [autoExt, mapping] of Object.entries(AUTO_EXT_MAP)) {
    if (fileName.endsWith(autoExt)) {
      const targetExt = mapping[lang]
      return {
        targetExt,
        destFileName: fileName.slice(0, -autoExt.length) + targetExt
      }
    }
  }
  return null
}

/**
 * 文件内容中 auto 后缀的替换规则
 *
 * 统一替换为 .js，因为 Vite + moduleResolution:"bundler" 模式下
 * .js 导入路径可以正确解析到 .ts/.tsx 文件
 */
const CONTENT_EXT_MAP: Record<string, string> = {
  '.auto.js': '.js',
  '.auto.jsx': '.jsx'
}

/**
 * 替换文件内容中的 auto 后缀引用
 *
 * 模板文件中的 import/require 路径也使用了 .auto.js/.auto.jsx，
 * 需要同步替换，否则运行时无法解析模块
 *
 * @param {string} content - 文件内容
 * @returns {string} 替换后的内容
 */
function replaceAutoExtInContent(content: string): string {
  for (const [autoExt, targetExt] of Object.entries(CONTENT_EXT_MAP)) {
    content = content.replaceAll(autoExt, targetExt)
  }
  return content
}

/**
 * 深度合并两个 JSON 对象
 *
 * 用于语言特定目录的 JSON 配置文件（如 tsconfig.json、package.json）
 * 与 common 目录中同名文件的合并，确保两者配置叠加生效
 *
 * 合并策略：
 * - 双方均为纯对象 → 递归合并
 * - 其他情况（数组、基本类型等）→ 源值直接覆盖目标值
 *
 * @param {Record<string, unknown>} target - 目标对象（会被修改）
 * @param {Record<string, unknown>} source - 源对象
 * @returns {Record<string, unknown>} 合并后的对象
 */
function deepMergeJson(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    const targetVal = target[key]
    const sourceVal = source[key]

    if (
      targetVal !== undefined &&
      typeof targetVal === 'object' &&
      targetVal !== null &&
      !Array.isArray(targetVal) &&
      typeof sourceVal === 'object' &&
      sourceVal !== null &&
      !Array.isArray(sourceVal)
    ) {
      deepMergeJson(targetVal as Record<string, unknown>, sourceVal as Record<string, unknown>)
    } else {
      target[key] = sourceVal
    }
  }
  return target
}

/**
 * 复制 common 目录下的文件到项目目录
 *
 * 处理规则：
 * - 目录 → 递归处理子项
 * - .auto.js / .auto.jsx 文件 → 重命名后缀 + 替换内容中的 auto 引用后写入
 * - 其他文件 → 直接复制
 *
 * @param {string} commonDir - common 模板目录
 * @param {string} projectDir - 项目目标目录
 * @param {'ts' | 'js'} lang - 语言类型
 */
async function copyCommonFiles(
  commonDir: string,
  projectDir: string,
  lang: 'ts' | 'js'
): Promise<void> {
  const entries = fs.readdirSync(commonDir, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(commonDir, entry.name)

    if (entry.isDirectory()) {
      await copyCommonFiles(srcPath, path.join(projectDir, entry.name), lang)
      continue
    }

    const resolved = resolveAutoExt(entry.name, lang)
    const destFileName = resolved ? resolved.destFileName : entry.name
    const destPath = path.join(projectDir, destFileName)

    await fs.ensureDir(path.dirname(destPath))
    // 所有文件都可能包含 auto 引用（如 index.html 中的 script src），统一替换内容
    const content = fs.readFileSync(srcPath, 'utf-8')
    const replaced = replaceAutoExtInContent(content)
    if (content !== replaced) {
      await fs.writeFile(destPath, replaced)
    } else {
      await fs.copy(srcPath, destPath)
    }
  }
}

/**
 * 复制语言特定目录下的文件到项目目录
 *
 * 处理规则：
 * - 目录 → 递归处理子项
 * - JSON 文件且目标已存在同名文件 → 深度合并（如 typescript/package.json 与 common/package.json 合并）
 * - 其他文件 → 直接复制覆盖
 *
 * @param {string} langDir - 语言特定模板目录
 * @param {string} projectDir - 项目目标目录
 * @returns {Promise<void>} 异步操作的无返回值 Promise
 *
 * - 遍历源目录中的所有条目（文件和目录）
 * - 如果是目录，则递归调用自身处理子目录
 * - 如果是 JSON 文件且目标路径已存在，则读取两个 JSON 文件并深度合并后写入；否则直接复制文件
 */
async function copyLangSpecificFiles(langDir: string, projectDir: string): Promise<void> {
  const entries = fs.readdirSync(langDir, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(langDir, entry.name)
    const destPath = path.join(projectDir, entry.name)

    if (entry.isDirectory()) {
      await copyLangSpecificFiles(srcPath, destPath)
      continue
    }

    await fs.ensureDir(path.dirname(destPath))

    if (entry.name === 'package.json' && (await fs.pathExists(destPath))) {
      // JSON 文件深度合并：common 的配置为基础，语言特定的配置叠加
      const existing = await fs.readJson(destPath)
      const incoming = await fs.readJson(srcPath)
      const merged = deepMergeJson(existing, incoming)
      await fs.writeJson(destPath, merged, { spaces: 2 })
    } else {
      await fs.copy(srcPath, destPath)
    }
  }
}

/**
 * 根据模板和配置生成项目文件
 *
 * 执行流程：
 * 1. 校验模板目录是否存在
 * 2. 复制 common 目录（处理 auto 后缀转换）
 * 3. 复制语言特定目录（JSON 深度合并）
 * 4. 覆盖 package.json 中的 name 为项目名称
 *
 * @param {ProjectOptions} options - 项目配置选项
 * @throws {Error} 当模板目录不存在时抛出异常
 */
async function generateProject(options: ProjectOptions): Promise<void> {
  const { templateRoot, template, templateDir, projectDir, lang } = options

  if (!(await fs.pathExists(templateDir))) {
    throw new Error(`模板 "${template}" 不存在于 ${templateRoot}`)
  }

  const commonDir = path.join(templateDir, 'common')
  const langDir = path.join(templateDir, lang === 'ts' ? 'typescript' : 'javascript')

  // 先复制 common 基础文件，再叠加语言特定文件
  await copyCommonFiles(commonDir, projectDir, lang)

  if (await fs.pathExists(langDir)) {
    await copyLangSpecificFiles(langDir, projectDir)
  }

  // 使用用户输入的项目名称覆盖模板中默认的 name 字段
  const pkgPath = path.join(projectDir, 'package.json')
  const pkg = await fs.readJson(pkgPath)
  pkg.name = options.name
  await fs.writeJson(pkgPath, pkg, { spaces: 2 })
}

/**
 * 创建一个新的 vitarx 项目
 *
 * @param {ProjectOptions} options - 项目配置选项
 * @throws {Error} 当模板不存在或其他错误发生时抛出异常
 */
export async function createProject(options: ProjectOptions): Promise<void> {
  const { root, name, projectDir, manager } = options
  console.log(cyan('\n  🚀 初始化项目：') + green(name))
  console.log(cyan('  📂 目标路径：') + blue(projectDir) + '\n')
  await generateProject(options)
  console.log('  ✨ 项目创建成功！')
  console.log(yellow('\n  📝 后续步骤：'))
  console.log(dim('  ──────────────────────────────────────'))

  // 仅在项目目录不是当前工作目录时提示 cd
  if (projectDir !== root) {
    console.log(`  ${green('cd')} ${name}`)
  }

  console.log(`  ${green(manager)} install ${dim('# 安装依赖')}`)
  console.log(`  ${green(manager)} run dev ${dim('# 启动开发服务器')}`)
  console.log(
    `  ${green('git')} init && git add -A && git commit -m "Initial commit"  ${dim('# 创建 git 仓库并提交 (可选)')}`
  )

  console.log(yellow('\n  🎉 开始享受 vitarx 的开发之旅吧！'))
}
