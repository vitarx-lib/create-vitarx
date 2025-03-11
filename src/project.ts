import fs from 'fs-extra'
import { blue, green, dim, yellow, cyan } from 'kolorist'
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

  console.log(cyan('\n  🚀 初始化项目：') + green(projectName || resolvedOptions.packageName))
  console.log(cyan('  📂 目标路径：') + blue(resolvedOptions.targetDir) + '\n')
  // 创建项目
  await generateProject(resolvedOptions)
  console.log('  ✨ 项目创建成功！')
  console.log(yellow('\n  📝 后续步骤：'))
  console.log(dim('  ──────────────────────────────────────'))

  if (!projectName?.includes('.')) {
    console.log(`  ${green('cd')} ${resolvedOptions.packageName}`)
  }
  console.log(`  git init && git add -A && git commit -m "Initial commit"`)
  console.log(`  npm install ${dim('# 或使用 yarn')}`)
  console.log(`  npm run dev  ${dim('# 或使用 yarn dev')}\n`)

  console.log(yellow('  🎉 开始享受 VitaRx 的开发之旅吧！\n'))
}
