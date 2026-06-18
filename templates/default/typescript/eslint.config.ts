import eslintPluginVitarx from 'eslint-plugin-vitarx'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  // 忽略 node_modules 和 dist 目录
  { ignores: ['**/node_modules/**', '**/dist/**'] },
  // TypeScript 配置：推荐规则
  ...tseslint.configs.recommended,
  // 基础配置：推荐规则
  eslintPluginVitarx.configs.recommended,
  // 全局配置：JSX + TypeScript 解析器
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    }
  },
  // 启用类型感知规则
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    rules: {
      // Prettier 已处理这些格式化规则，关闭以避免冲突
      'vitarx/jsx-indent': 'off',
      'vitarx/jsx-indent-props': 'off',
      'vitarx/jsx-closing-bracket-location': 'off',
      'vitarx/jsx-closing-tag-location': 'off',
      'vitarx/jsx-first-prop-new-line': 'off',
      'vitarx/jsx-max-props-per-line': 'off',
      'vitarx/jsx-one-expression-per-line': 'off',
      'vitarx/jsx-tag-spacing': 'off',
      'vitarx/jsx-curly-brace-presence': 'off',
      'vitarx/jsx-boolean-value': 'off',
      'vitarx/jsx-self-closing-comp': 'off',
      'vitarx/jsx-props-no-multi-spaces': 'off'
    }
  }
)
