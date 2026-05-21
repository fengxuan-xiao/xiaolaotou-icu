import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue' // 主页布局
import Blog from '../views/Blog.vue' // 博客管理/新增页
import Visualization from '@/views/Visualization.vue'
import Report from '@/views/Report.vue'
import Rabbitmq from '@/views/Rabbitmq.vue'
import Elasticsearch from '@/views/Elasticsearch.vue'
import Excelbatch from '@/views/Excelbatch.vue'
import { useUserStore } from '@/stores/user' 

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  
  {
    path: '/',
    redirect: '/home' // 根路径重定向到 home
  },
  {
    path: '/home',
    name: 'Home',
    component: Home, // 直接使用 Home 组件，不再作为 Layout
    meta: { title: '博客首页' }
  },
  // 独立的管理页面，需要登录
  {
    path: '/blog',
    name: 'BlogManage',
    component: Blog,
    meta: { requiresAuth: true, title: '博客管理模块' }
  },
  {
    path: '/visualization',
    name: 'Visualization',
    component: Visualization,
    meta: { title: '数据可视化模块', requiresAuth: true }
  },
  {
    path: '/report',
    name: 'Report',
    //component: Report,应用启动时立即加载
    component: () => import('@/views/Report.vue'),//懒加载，访问路由时才加载
    meta: { title: '统计报表模块', requiresAuth: true }
  },
  {
    path: '/rabbitmq',
    name: 'Rabbitmq',
    component: Rabbitmq,
    meta: { title: '消息队列模块', requiresAuth: true }
  },
  {
    path: '/elasticsearch',
    name: 'Elasticsearch',
    component: Elasticsearch,
    meta: { title: '模糊查询模块', requiresAuth: true }
  },
  {
    path: '/excelbatch',
    name: 'Excelbatch',
    component: Excelbatch,
    meta: { title: '批量导入模块', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isLoggedIn

  if (to.meta.title) {
    document.title = to.meta.title + ' - 我的博客'
  } else {
    document.title = '我的博客'
  }

  if (to.meta.requiresAuth) {
    if (isAuthenticated) {
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    next()
  }
})

export default router