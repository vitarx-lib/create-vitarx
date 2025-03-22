# 欢迎使用 `Vitarx` 框架编写前端项目！

`Vitarx` 是一个现代化的前端框架，结合了 Vue 的响应式系统和 React 的 JSX 语法。
_______________________________________________________


## 开发文档

如果你还不了解 Vitarx 框架，请先阅读[快速上手](https://vitarx.cn/docs/quick-start/index.html)文档，以了解 `Vitarx` 框架的基础知识。

## 目录结构

```
App (root)
├─ dist # 存放打包构建后的文件
├─ public # 静态资源，打包时会被原样复制到 dist 目录下
├─ src # 源代码
│  ├─ assets # 存储资源文件，此文件夹中的资源在项目中使用才会被打包构建。
│  ├─ pages # 存储页面文件，不需要一定要在pages目录存放页面文件，只是建议使用，保持项目结构清晰
│     └─ Home # 页面名称
│        └─ index.tsx # 页面视图
│  ├─ router # 存储路由文件
│     ├─ index.ts
│     └─ routes.ts
│  ├─ widget # 存储组件文件
│     ├─ Counter
│     │  ├─ index.tsx
│  ├─ App.tsx # 项目的根组件
│  └─ main.tsx
├─ .prettierrc.json # 格式化规则
├─ README.md # 项目说明
├─ .gitignore # git 忽略文件
├─ tsconfig.json
├─ package.json
├─ vite.config.ts # vite 配置文件
```

## 报告BUG

如果你在开发过程中发现了框架存在BUG，请提交issue至：
- [github](https://github.com/vitarx-lib/core/issues)
- [gitee](https://gitee.com/vitarx/core/issues)

## 寻求帮助

有任何问题都可以向作者求助，作者QQ：`8210856`
