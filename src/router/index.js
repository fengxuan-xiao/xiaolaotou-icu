import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Blog from '../views/Blog.vue'
//导入 useUserStore
import { useUserStore } from '@/stores/user' 

const routes = [
  {
    path: '/',
    redirect: '/login' // 添加这一行，访问根路径时自动跳转到登录页
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/blog',
    name: 'Blog',
    component: () => import('@/views/Blog.vue'), // 假设你的博客列表页叫 Blog.vue
    meta: { requiresAuth: true } // 需要登录才能访问
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 【关键】全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isLoggedIn // 从 store 中获取登录状态

  // 如果目标路由需要认证
  if (to.meta.requiresAuth) {
    if (isAuthenticated) {
      // 已登录，允许访问
      next()
    } else {
      // 未登录，重定向到登录页，并记录原本想去的地址（方便登录后跳回）
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    // 不需要认证的路由（如登录页），直接放行
    next()
  }
})

export default router