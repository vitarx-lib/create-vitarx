# 欢迎使用 Vitarx 编写前端项目！

Vitarx 融合 Vue 响应式系统与 React JSX 语法优势，为开发者提供简洁高效、类型安全的全新开发体验。
_____________________________________________________________________

## 开发文档

如果你还不了解 Vitarx 框架，请先阅读[开发文档](https://vitarx.cn/)，以了解 `Vitarx` 框架的基础知识。

## 目录结构

文件后缀取决于你使用的编程语言，Vitarx 支持 TypeScript 和 JavaScript。

```
App (root)
├─ public # 公共文件，编译时原样复制到dist目录
│  └─ favicon.ico
├─ src
│  ├─ assets # 静态资源
│  │  ├─ style.css # 全局样式文件
│  │  └─ vitarx.svg
│  ├─ components # 组件
│  │  ├─ Counter
│  │  │  └─ index.tsx
│  │  └─ Footer
│  │     └─ index.tsx
│  ├─ pages # 页面
│  │  ├─ About
│  │  │  └─ index.tsx # /about
│  │  └─ index.tsx # /
│  ├─ router # 路由
│  │  ├─ index.ts
│  │  └─ routes.ts
│  ├─ App.tsx # 根组件
│  └─ main.ts # 入口文件
├─ .gitignore # Git忽略文件配置
├─ .prettierrc.json # 代码格式化配置文件
├─ README.md # 项目说明文件
├─ env.d.ts # 环境变量声明文件
├─ index.html # 项目入口HTML文件
├─ package.json # 项目配置文件
├─ tsconfig.app.json # 应用程序的TypeScript配置文件
├─ tsconfig.json # 根目录的TypeScript配置文件
├─ tsconfig.node.json # Node.js环境的TypeScript配置文件
└─ vite.config.ts # Vite配置文件
```

## 报告BUG

如果你在开发过程中发现框架存在BUG，请提交issue至：
- [gitee](https://gitee.com/vitarx/core/issues)
- [github](https://github.com/vitarx-lib/core/issues)

## 寻求帮助

有任何问题都可以向作者求助
- 作者QQ：8210856
- 交流群：8203363
