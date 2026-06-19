import { createRouter } from 'vitarx-router'
import { handleHotUpdate, routes } from 'vitarx-router/auto-routes'

const router = createRouter({
  routes
})

// Handle hot module replacement
if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
