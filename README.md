# create-vitarx

一个用于快速创建 VitaRX 项目的命令行工具。

## 功能特性

- 支持 TypeScript 和 JavaScript 项目创建
- 提供项目模板
- 简单易用的命令行界面
- 自动项目依赖配置

## 安装

```bash
npm create vitarx@latest
```

或者使用 yarn：

```bash
yarn create vitarx
```

## 使用方法

1. 创建新项目：

    ```bash
    npm create vitarx@latest my-vitarx-app
    ```

2. 按照提示选择：
   - 项目名称
   - 开发语言（TypeScript/JavaScript）
   - 项目模板

3. 等待项目创建完成

## 项目模板

默认模板包含以下特性：

- 基于 Vite 的开发环境
- VitaRX 核心框架
- VitaRX Router 路由支持
- 代码格式化配置
- 开发服务器热重载

## 命令行选项

```bash
npm create vitarx@latest [项目名] [选项]
```

可用选项：
- `--typescript`: 使用 TypeScript
- `--force`: 强制覆盖目标目录

## 开发要求

- Node.js >= 18.0.0

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](./LICENSE) 文件。
