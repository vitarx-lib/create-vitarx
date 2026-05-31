import fs from 'fs-extra'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CancelError, getPackageManager, isDirEmpty, validateProjectName } from '../src/prompt.js'

describe('isDirEmpty', () => {
  const tmpDir = path.join(process.cwd(), '.test-isDirEmpty')

  beforeEach(async () => {
    await fs.ensureDir(tmpDir)
  })

  afterEach(async () => {
    await fs.remove(tmpDir)
  })

  it('目录不存在时返回 true', () => {
    expect(isDirEmpty(path.join(tmpDir, 'not-exist'))).toBe(true)
  })

  it('空目录返回 true', () => {
    expect(isDirEmpty(tmpDir)).toBe(true)
  })

  it('非空目录返回 false', async () => {
    await fs.writeFile(path.join(tmpDir, 'a.txt'), 'hello')
    expect(isDirEmpty(tmpDir)).toBe(false)
  })

  it('路径指向文件时返回 false', async () => {
    const filePath = path.join(tmpDir, 'file.txt')
    await fs.writeFile(filePath, 'hello')
    expect(isDirEmpty(filePath)).toBe(false)
  })
})

describe('validateProjectName', () => {
  it('空字符串返回错误', () => {
    expect(validateProjectName('')).toBe('项目名称不能为空')
  })

  it('纯空格返回错误', () => {
    expect(validateProjectName('   ')).toBe('项目名称不能为空')
  })

  it('当前目录 . 返回 true', () => {
    expect(validateProjectName('.')).toBe(true)
  })

  it('当前目录 ./ 返回 true', () => {
    expect(validateProjectName('./')).toBe(true)
  })

  it('合法名称返回 true', () => {
    expect(validateProjectName('my-project')).toBe(true)
  })

  it('包含非法字符返回错误', () => {
    expect(validateProjectName('my<project')).toBe('项目名称包含非法字符')
    expect(validateProjectName('my>project')).toBe('项目名称包含非法字符')
    expect(validateProjectName('my:project')).toBe('项目名称包含非法字符')
    expect(validateProjectName('my"project')).toBe('项目名称包含非法字符')
    expect(validateProjectName('my|project')).toBe('项目名称包含非法字符')
    expect(validateProjectName('my?project')).toBe('项目名称包含非法字符')
    expect(validateProjectName('my*project')).toBe('项目名称包含非法字符')
  })

  it('超过 214 字符返回错误', () => {
    const longName = 'a'.repeat(215)
    expect(validateProjectName(longName)).toBe('项目名称不能超过 214 个字符')
  })

  it('以 . 开头返回错误', () => {
    expect(validateProjectName('.my-project')).toBe('项目名称不能以 . 或 _ 开头')
  })

  it('以 _ 开头返回错误', () => {
    expect(validateProjectName('_my-project')).toBe('项目名称不能以 . 或 _ 开头')
  })

  it('包含大写字母返回错误', () => {
    expect(validateProjectName('MyProject')).toBe('项目名称必须为小写字母')
  })

  it('scoped 包名允许大写', () => {
    expect(validateProjectName('@MyOrg/my-project')).toBe(true)
  })

  it('包含空格返回错误', () => {
    expect(validateProjectName('my project')).toBe('项目名称不能包含空格')
  })

  it('合法的 scoped 包名返回 true', () => {
    expect(validateProjectName('@org/my-project')).toBe(true)
  })
})

describe('getPackageManager', () => {
  const originalEnv = process.env.npm_config_user_agent

  afterEach(() => {
    process.env.npm_config_user_agent = originalEnv
  })

  it('pnpm 环境返回 pnpm', () => {
    process.env.npm_config_user_agent = 'pnpm/8.0.0 npm/? node/v18.0.0'
    expect(getPackageManager()).toBe('pnpm')
  })

  it('yarn 环境返回 yarn', () => {
    process.env.npm_config_user_agent = 'yarn/1.22.0 npm/? node/v18.0.0'
    expect(getPackageManager()).toBe('yarn')
  })

  it('bun 环境返回 bun', () => {
    process.env.npm_config_user_agent = 'bun/1.0.0 npm/? node/v18.0.0'
    expect(getPackageManager()).toBe('bun')
  })

  it('npm 环境返回 npm', () => {
    process.env.npm_config_user_agent = 'npm/9.0.0 node/v18.0.0'
    expect(getPackageManager()).toBe('npm')
  })

  it('环境变量不存在时默认返回 npm', () => {
    delete process.env.npm_config_user_agent
    expect(getPackageManager()).toBe('npm')
  })
})

describe('CancelError', () => {
  it('默认消息为"操作已取消"', () => {
    const error = new CancelError()
    expect(error.message).toBe('操作已取消')
    expect(error.name).toBe('CancelError')
  })

  it('自定义消息', () => {
    const error = new CancelError('项目创建已取消')
    expect(error.message).toBe('项目创建已取消')
  })

  it('是 Error 的实例', () => {
    const error = new CancelError()
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(CancelError)
  })
})
