import fs from 'fs-extra'
import { blue, green, yellow, dim } from 'kolorist'
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

  console.log('\n' + dim('─'.repeat(60)))
  console.log(
    `${yellow('»')} 正在创建项目 ${green(projectName || '')} 在:\n  ${blue(resolvedOptions.targetDir)}`
  )
  console.log(dim('─'.repeat(60)))

  // 创建项目
  await generateProject(resolvedOptions)

  // 显示完成信息
  console.log('\n' + dim('─'.repeat(60)))
  console.log(`${green('✓')} 项目创建成功！`)
  console.log('\n' + yellow('»') + ' 下一步操作:')
  console.log(dim('─'.repeat(60)))
  if (!projectName?.includes('.')) {
    console.log(`  ${blue('$')} ${green('cd')} ${resolvedOptions.packageName}`)
  }
  console.log(`  ${blue('$')} ${green('git init')}`)
  console.log(`  ${blue('$')} ${green('git add .')}`)
  console.log(`  ${blue('$')} ${green('git commit -m "Initial commit"')}`)
  console.log(`  ${blue('$')} ${green('npm install')} ${dim('(或 yarn)')}`)
  console.log(`  ${blue('$')} ${green('npm run dev')} ${dim('(或 yarn dev)')}`)
  console.log(dim('─'.repeat(60)) + '\n')
}
