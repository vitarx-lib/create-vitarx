import vitarxLogo from '@/assets/vitarx.svg'
import Counter from '@/components/Counter'
import Footer from '@/components/Footer'
import { onMounted } from 'vitarx'
import { RouterLink } from 'vitarx-router'

const FEATURES = [
  {
    icon: '⚡',
    color: 'teal',
    name: '极致性能',
    desc: '基于细粒度响应式系统，仅更新真正变化的部分，零虚拟 DOM 开销'
  },
  {
    icon: '🔄',
    color: 'orange',
    name: '响应式驱动',
    desc: '直觉式的响应式 API，自动追踪依赖关系，数据变更即刻反映到视图'
  },
  {
    icon: '🧩',
    color: 'purple',
    name: 'JSX 表达力',
    desc: '使用 JSX 语法构建组件，结合 TypeScript 获得完整的类型推导与智能提示'
  },
  {
    icon: '🛤️',
    color: 'red',
    name: '内置路由',
    desc: '开箱即用的路由系统，支持嵌套路由、懒加载与导航守卫'
  },
  {
    icon: '📐',
    color: 'yellow',
    name: 'TypeScript 优先',
    desc: '完全类型化的 API 设计，从路由参数到组件 Props 全链路类型安全'
  },
  {
    icon: '🪶',
    color: 'blue',
    name: '轻量精简',
    desc: '核心运行时极小，无冗余依赖，构建产物体积可控，加载速度优异'
  }
]

export default function AppHomePage() {
  onMounted(() => {
    console.log('AppHomePage mounted')
  })

  return (
    <div class='page-wrapper'>
      <nav class='navbar'>
        <div class='navbar-brand'>
          <img src={vitarxLogo} alt='Vitarx' class='navbar-logo' />
          <span class='navbar-title'>Vitarx</span>
        </div>
        <div class='navbar-nav'>
          <RouterLink to='home' class='nav-link active'>
            首页
          </RouterLink>
          <RouterLink to='about' class='nav-link'>
            关于
          </RouterLink>
        </div>
      </nav>

      <section class='hero'>
        <div class='hero-inner'>
          <div class='hero-badge'>
            <span class='hero-badge-dot' />
            Next-Gen Frontend Framework
          </div>
          <h1 class='hero-title'>
            用 <span class='hero-title-gradient'>Vitarx</span> 构建
            <br />
            现代化 Web 应用
          </h1>
          <p class='hero-desc'>
            融合 Vue 响应式系统与 React JSX 语法优势，为开发者提供简洁高效、类型安全的全新开发体验
          </p>
          <div class='hero-actions'>
            <RouterLink to='about' class='btn btn-primary'>
              快速开始 →
            </RouterLink>
            <a
              href='https://vitarx.cn'
              target='_blank'
              rel='noopener noreferrer'
              class='btn btn-ghost'
            >
              查看文档
            </a>
          </div>
        </div>
      </section>

      <section class='section'>
        <div class='section-inner'>
          <div class='section-header'>
            <span class='section-label'>核心特性</span>
            <h2 class='section-title'>为什么选择 Vitarx？</h2>
            <p class='section-desc'>精心设计的架构与 API，让复杂应用的开发变得简单而愉悦</p>
          </div>
          <div class='features-grid'>
            {FEATURES.map((item) => (
              <div class='feature-card'>
                <div class={`feature-icon-wrap ${item.color}`}>{item.icon}</div>
                <h3 class='feature-name'>{item.name}</h3>
                <p class='feature-desc'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section class='counter-section'>
        <Counter />
      </section>

      <Footer />
    </div>
  )
}
