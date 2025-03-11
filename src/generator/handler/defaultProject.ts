import fs from 'fs-extra'
import path from 'path'
import type { ProjectOptions } from '../../prompt.js'

export default async function defaultProject(options: ProjectOptions) {
  const packageJsonPath = path.join(options.targetDir, 'package.json')
  const indexHtmlPath = path.join(options.targetDir, 'index.html')
  const fileType = options.typescript ? 'ts' : 'js'
  const pak = await fs.readJSON(packageJsonPath, { encoding: 'utf-8' })
  pak.name = options.packageName
  // 如果选择了TypeScript，可能需要修改构建命令和依赖
  if (options.typescript) {
    pak.scripts.build = 'tsc && vite build'
    pak.devDependencies = {
      typescript: '^5.8.2',
      '@types/node': '^22.13.10',
      ...pak.devDependencies
    }
    // 写入package.json
    await fs.writeJSON(packageJsonPath, pak, { encoding: 'utf-8', spaces: 2 })
  }
  // 替换index.html中的%ajs%
  const indexHtmlContent = fs
    .readFileSync(indexHtmlPath, { encoding: 'utf-8' })
    .replace('%ajs%', fileType)
  // 写入文件
  await fs.writeFile(indexHtmlPath, indexHtmlContent)

  // 遍历目标目录及其子目录，处理文件扩展名
  await processDirectoryFiles(options.targetDir, fileType)
}

/**
 * 递归处理目录中的文件，替换特定扩展名
 * @param {string} dirPath - 要处理的目录路径
 * @param {string} fileType - 目标文件类型 (ts 或 js)
 */
async function processDirectoryFiles(dirPath: string, fileType: string) {
  // 读取目录内容
  const items = await fs.readdir(dirPath)

  for (const item of items) {
    const itemPath = path.join(dirPath, item)
    const stat = await fs.stat(itemPath)

    if (stat.isDirectory()) {
      // 递归处理子目录
      await processDirectoryFiles(itemPath, fileType)
    } else if (stat.isFile()) {
      // 处理文件扩展名
      if (item.endsWith('.ajx')) {
        // 替换 .ajx 为 .tsx 或 .jsx
        const newPath = itemPath.replace(/\.ajx$/, `.${fileType}x`)
        await fs.rename(itemPath, newPath)
      } else if (item.endsWith('.ajs')) {
        // 替换 .ajs 为 .ts 或 .js
        const newPath = itemPath.replace(/\.ajs$/, `.${fileType}`)
        await fs.rename(itemPath, newPath)
      }
    }
  }
}
