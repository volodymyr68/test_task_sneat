import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  
  return match ? match[2] : null
}

function recursiveLayouts(route) {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i])

    return route
  }

  return setupLayouts([route])[0]
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }

    return { top: 0 }
  },
  extendRoutes: pages => [
    ...pages.map(route => {
      if (route.path !== '/login' && route.path !== '/register') {
        route.meta = { ...route.meta, requiresAuth: true }
      }

      return recursiveLayouts(route)
    }),
  ],
})

async function checkAuth() {
  try {
    const token = getCookie('accessToken')
    if (!token) throw new Error('No token found')

    const res = await fetch('/api/auth/check', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${decodeURI(token)}`,
      },
    })

    if (!res.ok) throw new Error('Invalid token')

    return true
  } catch (error) {
    console.error('Auth check failed:', error)
    
    return false
  }
}

router.beforeEach(async (to, from, next) => {
  try {
    const isAuthenticated = await checkAuth()

    if (to.meta.requiresAuth && !isAuthenticated) {
      next({ path: '/login' })
    } else {
      next()
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    next({ path: '/login' })
  }
})

export { router }
export default function (app) {
  app.use(router)
}
