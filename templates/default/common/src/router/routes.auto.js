import { lazy } from 'vitarx'
import { defineRoutes } from 'vitarx-router'

const routes = defineRoutes(
  {
    path: '/',
    name: 'home',
    component: lazy(() => import('@/pages/Home/index.auto.jsx'))
  },
  {
    path: '/about',
    name: 'about',
    component: lazy(() => import('@/pages/About/index.auto.jsx'))
  }
)

export default routes
