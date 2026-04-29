import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//import App from './App.vue'
// 这里不要 import App from './App.vue'
import Index from './Index.vue' // 新建一个空白壳子
import router from './router' // 引入路由

const app = createApp(Index)

const pinia = createPinia() // 创建 Pinia 实例

app.use(pinia)    // 【重要】先安装 Pinia

app.use(createPinia())   // 注册 Pinia
app.use(ElementPlus)     // 注册 Element Plus（全量引入，简单方便）
app.use(router) // 挂载

app.mount('#app')