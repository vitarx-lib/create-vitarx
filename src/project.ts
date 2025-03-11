import fs from 'fs-extra'
import { blue, green } from 'kolorist'
import generateProject from './generator/index.js'
import { promptForOptions } from './prompt.js'

/**
 * 创建一个新的vitarx项目
 *
 * @param {string | undefined} projectName - 项目名称，如果未提供则会通过交互式提示获取
 * @param {any} options - 命令行选项对象
 * @throws {Error} 当模板不存在或其他错误发生时抛出异常
 */
export async function createProject(projectName: string | undefined, options: Record<string, any>) {
  // 收集用户配置
  const resolvedOptions = await promptForOptions(projectName, options)

  // 确保目标目录存在
  fs.ensureDirSync(resolvedOptions.targetDir)

  console.log(`\n正在创建项目 ${green(projectName || '')} 在 ${blue(resolvedOptions.targetDir)}...`)

  // 创建项目
  await generateProject(resolvedOptions)

  // 显示完成信息
  console.log(`\n${green('✓')} 项目创建成功！`)
  console.log('\n下一步:')
  console.log(`  cd ${projectName === '.' || projectName === './' ? '' : projectName}`)
  console.log('  npm install (或 yarn)')
  console.log('  npm run dev (或 yarn dev)')
}
