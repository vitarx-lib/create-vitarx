import type { ProjectOptions } from '../prompt.js'

/**
 * 根据用户配置生成项目文件
 *
 * @param {Object} options - 项目配置选项
 * @param {string} options.packageName - 包名称或项目名称
 * @param {string} options.template - 项目模板名称
 * @param {boolean} options.typescript - 是否使用TypeScript
 * @throws {Error} 当模板不存在时抛出异常
 */
export default async function generateProject(options: ProjectOptions) {}
