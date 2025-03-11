#!/usr/bin/env node

import { initCLI } from './cli.js'

// 初始化并解析命令行参数
const program = initCLI()
program.parse()
