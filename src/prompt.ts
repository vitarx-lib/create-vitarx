import fs from 'fs-extra'
import path from 'path'
import prompts, { type Choice } from 'prompts'

/**
 * 命令行选项接口
 */
export interface CommandLineOptions {
  typescript?: boolean
  router?: boolean
  prettier?: boolean
  force?: boolean
}

/**
 * 项目配置选项
 */
export type ProjectOptions = {
  /**
   * 项目名称，也是项目包名
   */
  packageName: string
  /**
   * 模板名称
   */
  template: string
  /**
   * 目标目录
   */
  targetDir: string
  /**
   * 是否使用TypeScript
   */
  typescript: boolean
}

/**
 * 验证项目名称是否有效
 *
 * @param {string} input - 用户输入的项目名称
 * @returns {boolean | string} 如果有效返回true，否则返回错误信息
 */
function validateProjectName(input: string): boolean | string {
  // 检查是否为空
  if (!input.trim()) {
    return '项目名称不能为空'
  }

  // 检查是否包含非法字符（Windows和Unix系统的文件名限制）
  const invalidChars = /[<>:"/\\|?*\x00]/
  if (invalidChars.test(input) && input !== '.' && input !== './') {
    return '项目名称包含非法字符'
  }

  return true
}

/**
 * 收集用户配置选项
 *
 * @param {string} projectName - 项目名称
 * @param {CommandLineOptions} options - 命令行选项对象
 * @returns {Promise<ProjectOptions>} 返回用户配置选项
 */
export async function promptForOptions(
  projectName: string | undefined,
  options: CommandLineOptions = {}
): Promise<ProjectOptions> {
  const cwd = process.cwd()
  let targetDir: string

  // 处理项目名称
  if (!projectName) {
    const res = await prompts({
      type: 'text',
      name: 'projectName',
      message: '项目名称:',
      initial: 'vitarx-project',
      validate: validateProjectName
    })
    projectName = res.projectName
  }
  // 处理特殊情况：当前目录
  if (projectName === '.' || projectName === './') {
    targetDir = cwd
  } else {
    targetDir = path.resolve(cwd, projectName!)
    if (fs.existsSync(targetDir)) {
      if (!options.force) {
        const { action } = await prompts({
          type: 'select',
          name: 'action',
          message: `目标目录 ${projectName} 已存在。请选择操作:`,
          choices: [
            { title: '覆盖', value: 'overwrite', description: '覆盖会删除目录下的所有文件！' },
            { title: '取消', value: 'cancel' }
          ]
        })

        if (action === 'cancel') {
          throw new Error('项目创建已取消')
        } else {
          await fs.remove(targetDir)
        }
      } else {
        await fs.remove(targetDir)
      }
    }
  }

  // 收集其他配置选项
  const selectChoices: Choice[] = []

  // 只有当命令行没有指定选项时，才添加到多选列表中
  if (options.typescript === undefined) {
    selectChoices.push({ title: 'TypeScript', value: 'typescript' })
    selectChoices.push({ title: 'JavaScript', value: 'javascript' })
  }

  let selectedFeatures: string[] = []

  if (selectChoices.length > 0) {
    const result = await prompts({
      type: 'select',
      name: 'script',
      message: '项目语言:',
      choices: selectChoices
    })

    selectedFeatures = result.script
  }

  // 添加模板选择
  const templateChoices: Choice[] = [
    { title: '默认模板', value: 'default', description: '基础的VitaRx项目模板' }
  ]

  const templateResult = await prompts({
    type: 'select',
    name: 'template',
    message: '项目模板:',
    choices: templateChoices
  })

  return {
    packageName: projectName!,
    targetDir,
    template: templateResult.template || 'default',
    typescript: options.typescript ?? selectedFeatures.includes('typescript') ?? false
  }
}
