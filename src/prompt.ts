import fs from 'fs-extra'
import path from 'path'
import prompts from 'prompts'

/**
 * 用户取消操作时抛出的错误
 */
export class CancelError extends Error {
  constructor(message = '操作已取消') {
    super(message)
    this.name = 'CancelError'
  }
}

/**
 * 项目配置选项
 */
export type ProjectOptions = {
  /**
   * 根目录
   */
  root: string
  /**
   * 模板根目录
   */
  templateRoot: string
  /**
   * 项目名称，也是项目包名
   */
  name: string
  /**
   * 语言
   */
  lang: 'ts' | 'js'
  /**
   * 模板名称
   */
  template: string
  /**
   * 项目目录
   */
  projectDir: string
  /**
   * 包管理器
   */
  manager: string
  /**
   * 模板目录
   */
  templateDir: string
}

/**
 * 判断目录是否为空
 *
 * @param {string} dir - 目录路径
 * @returns {boolean} 目录为空返回 true，否则返回 false
 */
export function isDirEmpty(dir: string): boolean {
  if (!fs.existsSync(dir)) return true
  if (!fs.statSync(dir).isDirectory()) return false
  const files = fs.readdirSync(dir)
  return files.length === 0
}

/**
 * 验证项目名称是否有效
 *
 * @param {string} input - 用户输入的项目名称
 * @returns {boolean | string} 如果有效返回true，否则返回错误信息
 */
export function validateProjectName(input: string): boolean | string {
  if (!input.trim()) {
    return '项目名称不能为空'
  }

  if (input === '.' || input === './') {
    return true
  }

  const invalidChars = /[<>:"\\|?*\x00]/
  if (invalidChars.test(input)) {
    return '项目名称包含非法字符'
  }

  if (input.includes('/') && !input.startsWith('@')) {
    return '项目名称包含非法字符'
  }

  if (input.length > 214) {
    return '项目名称不能超过 214 个字符'
  }

  if (input.startsWith('.') || input.startsWith('_')) {
    return '项目名称不能以 . 或 _ 开头'
  }

  if (input !== input.toLowerCase() && !input.startsWith('@')) {
    return '项目名称必须为小写字母'
  }

  if (/\s/.test(input)) {
    return '项目名称不能包含空格'
  }

  return true
}
/**
 * 检测当前使用的包管理器
 *
 * 优先级：
 * 1. npm_config_user_agent 环境变量（由 npm/yarn/pnpm/bun 运行时自动设置）
 * 2. 默认返回 npm
 *
 * @returns {string} 包管理器名称（npm | yarn | pnpm | bun）
 */
export function getPackageManager(): string {
  const userAgent = process.env.npm_config_user_agent

  if (userAgent) {
    if (userAgent.includes('pnpm')) return 'pnpm'
    if (userAgent.includes('yarn')) return 'yarn'
    if (userAgent.includes('bun')) return 'bun'
    if (userAgent.includes('npm')) return 'npm'
  }

  return 'npm'
}
/**
 * 项目名称提示结果
 */
type ProjectNameResult = {
  name: string
  projectDir: string
}

/**
 * 收集项目名称并处理目录冲突
 *
 * @param {string} root - 根目录路径
 * @returns {Promise<ProjectNameResult>} 项目名称和目录路径
 */
async function promptForProjectName(root: string): Promise<ProjectNameResult> {
  const { name } = await prompts({
    type: 'text',
    name: 'name',
    message: '项目名称:',
    initial: 'vitarx-project',
    validate: validateProjectName
  })

  if (name === '.' || name === './') {
    return { name: path.basename(root), projectDir: root }
  }

  const projectDir = path.resolve(root, name)

  if (!isDirEmpty(projectDir)) {
    const { action } = await prompts({
      type: 'select',
      name: 'action',
      message: `项目目录 ${name} 已存在且不为空，请确认操作:`,
      choices: [
        { title: '覆盖', value: 'overwrite', description: '文件可能会被覆盖' },
        { title: '终止', value: 'cancel', description: '终止创建项目' }
      ]
    })

    if (action === 'cancel') {
      throw new CancelError('项目创建已取消')
    }
  }

  return { name, projectDir }
}

/**
 * 收集项目语言选择
 *
 * @returns {Promise<'ts' | 'js'>} 语言类型
 */
async function promptForLang(): Promise<'ts' | 'js'> {
  const { lang } = await prompts({
    type: 'select',
    name: 'lang',
    message: '项目语言:',
    choices: [
      { title: 'TypeScript', value: 'ts' },
      { title: 'JavaScript', value: 'js' }
    ]
  })
  return lang ?? 'ts'
}

/**
 * 收集项目模板选择
 *
 * @returns {Promise<string>} 模板名称
 */
async function promptForTemplate(): Promise<string> {
  const { template } = await prompts({
    type: 'select',
    name: 'template',
    message: '项目模板:',
    choices: [
      { title: '默认项目', value: 'default', description: '基础的Vitarx项目模板' },
      {
        title: '文件路由',
        value: 'file-router',
        description: '使用文件约定路由的Vitarx项目模板'
      }
    ]
  })
  return template ?? 'default'
}

/**
 * 收集用户配置选项
 *
 * @param {string} root - 根目录路径
 * @param {string} templateRoot - 模板根目录路径
 * @returns {Promise<ProjectOptions>} 返回用户配置选项
 */
export async function promptForOptions(
  root: string,
  templateRoot: string
): Promise<ProjectOptions> {
  const { name, projectDir } = await promptForProjectName(root)
  const lang = await promptForLang()
  const template = await promptForTemplate()

  return {
    root,
    templateRoot,
    templateDir: path.resolve(templateRoot, template),
    name,
    projectDir,
    template,
    lang,
    manager: getPackageManager()
  }
}
