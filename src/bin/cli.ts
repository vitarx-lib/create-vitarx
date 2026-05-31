#!/usr/bin/env node

import { Command } from 'commander'
import fs from 'fs-extra'
import { blue, red } from 'kolorist'
import { fileURLToPath } from 'node:url'
import path from 'path'
import { createProject } from '../project.js'
import { CancelError, promptForOptions } from '../prompt.js'

const _dirname =
  typeof __dirname === 'string' ? __dirname : fileURLToPath(path.dirname(import.meta.url))
// 版本信息从package.json中获取
const packageJson = fs.readJSONSync(path.resolve(_dirname, 'package.json'))

/**
 * 初始化命令行程序
 */
export function initCLI(): Command {
  console.log(blue(`👏🏻欢迎使用 create-vitarx@${packageJson.version}\n`))
  const program = new Command()
  program
    .name('create-vitarx')
    .version(packageJson.version)
    .description('快速创建一个vitarx项目')
    .action(async () => {
      try {
        const root = process.cwd()
        const templateRoot = path.resolve(_dirname, 'templates')
        const options = await promptForOptions(root, templateRoot)
        await createProject(options)
      } catch (error) {
        if (error instanceof CancelError) {
          console.log(error.message)
          process.exit(0)
        }
        console.error(red(`✖ ${error}`))
        process.exit(1)
      }
    })

  return program
}

initCLI().parse()
