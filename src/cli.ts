import { Command } from 'commander'
import fs from 'fs-extra'
import { red } from 'kolorist'
import { fileURLToPath } from 'node:url'
import path from 'path'
import { createProject } from './project.js'
const __dirname = fileURLToPath(path.dirname(import.meta.url))
// 版本信息从package.json中获取
const packageJson = fs.readJSONSync(path.resolve(__dirname, '../package.json'))

/**
 * 初始化命令行程序
 */
export function initCLI() {
  const program = new Command()
  program
    .name('create-vitarx')
    .version(packageJson.version)
    .description('创建一个新的vitarx项目')
    .argument('[project-name]', '项目名称')
    .option('-t, --typescript', '使用TypeScript')
    .option('-r, --router', '使用Router')
    .option('-p, --prettier', '使用Prettier')
    .option('-f, --force', '强制覆盖已存在的目录')
    .action(async (projectName: string | undefined, options: Record<string, any>) => {
      try {
        await createProject(projectName, options)
      } catch (error) {
        console.error(red(`✖ ${error}`))
        process.exit(1)
      }
    })

  return program
}
