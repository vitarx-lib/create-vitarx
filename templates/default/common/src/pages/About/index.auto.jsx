import vitarxLogo from '@/assets/vitarx.svg'
import Footer from '@/components/Footer'
import { RouterLink } from 'vitarx-router'

export default function AboutPage() {
  return (
    <div class='page-wrapper'>
      <nav class='navbar'>
        <div class='navbar-brand'>
          <img src={vitarxLogo} alt='Vitarx' class='navbar-logo' />
          <span class='navbar-title'>Vitarx</span>
        </div>
        <div class='navbar-nav'>
          <RouterLink to='home' class='nav-link'>
            首页
          </RouterLink>
          <RouterLink to='about' class='nav-link active'>
            关于
          </RouterLink>
        </div>
      </nav>

      <section class='about-hero'>
        <h1 class='about-hero-title'>
          关于 <span class='hero-title-gradient'>Vitarx</span>
        </h1>
        <p class='about-hero-desc'>
          一个创新的前端框架，将 Vue 的响应式系统与 React 的 JSX
          语法完美融合，为开发者带来全新的开发体验
        </p>
      </section>

      <section class='about-content'>
        <div class='about-content-inner'>
          <div class='about-card'>
            <h2 class='about-card-title'>
              <span class='about-card-title-icon'>💡</span>
              什么是 Vitarx？
            </h2>
            <p>
              Vitarx 是一个面向现代 Web 开发的前端框架。它汲取了 Vue 响应式系统的简洁高效与 React
              JSX 语法的灵活表达，构建出一套兼具开发体验与运行性能的技术方案。
            </p>
            <p>
              在 Vitarx 中，你可以使用熟悉的 JSX
              语法编写组件，同时享受响应式数据绑定带来的便利——无需手动管理 DOM
              更新，数据变化自动同步到视图。
            </p>
          </div>

          <div class='about-card'>
            <h2 class='about-card-title'>
              <span class='about-card-title-icon'>✨</span>
              主要特性
            </h2>
            <div class='about-list'>
              <div class='about-list-item'>
                <span class='about-list-item-icon'>✓</span>
                <span>Vue 响应式系统 + React JSX 语法的最佳组合</span>
              </div>
              <div class='about-list-item'>
                <span class='about-list-item-icon'>✓</span>
                <span>简洁直觉的 API 设计，学习成本极低</span>
              </div>
              <div class='about-list-item'>
                <span class='about-list-item-icon'>✓</span>
                <span>细粒度更新，高性能渲染引擎</span>
              </div>
              <div class='about-list-item'>
                <span class='about-list-item-icon'>✓</span>
                <span>内置路由系统，支持嵌套路由与懒加载</span>
              </div>
              <div class='about-list-item'>
                <span class='about-list-item-icon'>✓</span>
                <span>完全类型化 API，优秀的 TypeScript 支持</span>
              </div>
              <div class='about-list-item'>
                <span class='about-list-item-icon'>✓</span>
                <span>轻量核心，无冗余依赖</span>
              </div>
            </div>
          </div>

          <div class='about-card'>
            <h2 class='about-card-title'>
              <span class='about-card-title-icon'>🚀</span>
              快速开始
            </h2>
            <div class='about-steps'>
              <div class='about-step'>
                <span class='about-step-num'>1</span>
                <div class='about-step-content'>
                  <p>
                    安装核心框架：<code>npm install vitarx</code>
                  </p>
                </div>
              </div>
              <div class='about-step'>
                <span class='about-step-num'>2</span>
                <div class='about-step-content'>
                  <p>
                    安装路由插件：<code>npm install vitarx-router</code>
                  </p>
                </div>
              </div>
              <div class='about-step'>
                <span class='about-step-num'>3</span>
                <div class='about-step-content'>
                  <p>
                    配置构建工具：<code>npm install @vitarx/plugin-vite -D</code>
                  </p>
                </div>
              </div>
              <div class='about-step'>
                <span class='about-step-num'>4</span>
                <div class='about-step-content'>
                  <p>创建第一个组件，开始构建你的应用</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
