import fs from 'fs-extra'
import { fileURLToPath } from 'node:url'
import path from 'path'
import type { ProjectOptions } from '../prompt.js'
import handler from './handler/index.js'

const __dirname = fileURLToPath(path.dirname(import.meta.url))
/**
 * 根据用户配置生成项目文件
 *
 * @param {Object} options - 项目配置选项
 * @param {string} options.packageName - 包名称或项目名称
 * @param {string} options.template - 项目模板名称
 * @param {boolean} options.typescript - 是否使用TypeScript
 * @throws {Error} 当模板不存在时抛出异常
 */
export default async function generateProject(options: ProjectOptions) {
  const templateDir = path.join(__dirname, `../../template/${options.template}`)
  if (!fs.existsSync(templateDir)) {
    throw new Error(`模板 ${options.template} 不存在`)
  }
  const commonTemplateDir = path.join(templateDir, 'common')
  // 复制公共模板文件到目标目录
  if (fs.existsSync(commonTemplateDir)) {
    await fs.copy(commonTemplateDir, options.targetDir)
  }
  // 获取语言模板目录
  const langTemplateDir = path.join(templateDir, options.typescript ? 'typescript' : 'javascript')
  // 复制语言模板文件到目标目录
  if (fs.existsSync(langTemplateDir)) {
    await fs.copy(langTemplateDir, options.targetDir)
  }
  // 调用自定义处理器
  const handlerName = `${options.template}Project`
  if (handlerName in handler) {
    await handler[handlerName as keyof typeof handler](options)
  }
}
