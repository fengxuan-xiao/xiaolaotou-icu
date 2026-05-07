import { createRouter, createWebHistory } from 'vue-router'
import Blog from '@/views/Blog.vue'
import Report from '@/views/Report.vue' // 导入新创建的组件

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Blog,
    meta: { title: '我的日记博客' }
  },
  {
    path: '/report',
    name: 'Report',
    component: Report,
    meta: { title: '统计报表' }
  },
  // 如果有可视化模块，也可以类似添加
  // {
  //   path: '/visualization',
  //   name: 'Visualization',
  //   component: () => import('@/views/Visualization.vue'),
  //   meta: { title: '数据可视化' }
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router