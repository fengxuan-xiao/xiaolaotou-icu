// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service = axios.create({
  //env.development.properties
  //baseURL: 'http://localhost:8080',  // 后端 API 前缀  本地开发地址
  //baseURL: '', // 代理前缀，实际请求会转发到后端
    // 【修改点】从环境变量中读取 baseURL
  // import.meta.env.VITE_APP_BASE_API 会分别读取 .env.development 或 .env.production 中的值
  baseURL: import.meta.env.VITE_APP_BASE_API || '', 

  
  timeout: 5000    // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    let token = localStorage.getItem('token')
    debugger;
    if (token) {
      // 假设后端要求 Header 中携带 Authorization: Bearer <token>
      //config.headers['Authorization'] = `Bearer ${token}`

      // 【修复点 1】处理 [object Object] 的情况
      if (token === '[object Object]') {
        console.error('Token is [object Object]. Clearing storage...')
        localStorage.removeItem('token')
        // 可选：强制跳转登录页
        // window.location.href = '/login'
        return Promise.reject(new Error('Token format error, please re-login'))
      }

      // 【修复点 2】处理 JSON 字符串的情况 (例如存的是 '{"token":"..."}')
      try {
        if (typeof token === 'string' && token.trim().startsWith('{')) {
          const tokenObj = JSON.parse(token)
          // 尝试从常见字段获取 token
          token = tokenObj.token || tokenObj.access_token || tokenObj.data?.token || ''
        }
      } catch (e) {
        // 如果解析失败，说明它可能本来就是纯字符串，保持原样
      }

      // 【修复点 3】确保最终使用的是字符串
      if (token && typeof token === 'string') {
        config.headers['Authorization'] = `Bearer ${token.trim()}`
      } else {
        console.warn('No valid token string found.')
      }

    }
    return config
  },
  error => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 假设后端返回格式为 { code: 200, data: ..., msg: "..." }
    if (res.code !== 200) {
      ElMessage.error(res.msg || '系统错误')
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.error('Response Error:', error)
    let message = '网络异常'
    if (error.response) {
      debugger;
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          console.warn('401 Error Details:', error.response.data) // <--- 打印后端返回的详细错误

          // 可以在这里触发登出逻辑，清除 token
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址出错'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = error.response.data.msg || '连接错误'
      }
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service