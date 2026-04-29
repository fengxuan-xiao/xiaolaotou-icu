// src/stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router' // 注意：在setup外使用router需要特殊处理，或者在action中传入
import { login as apiLogin, register as apiRegister } from '@/api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const loading = ref(false)

  // 计算属性：判断是否已登录
  const isLoggedIn = computed(() => !!token.value)

  // 登录
  async function handleLogin(loginForm) {
    loading.value = true
    try {
      const res = await apiLogin(loginForm)
      // 假设 res.data 是 token
      const newToken = res.data
      
      token.value = newToken
      localStorage.setItem('token', newToken)
      
      ElMessage.success('登录成功')
      return true
    } catch (error) {
      console.error('Login failed', error)
      // 错误通常在 axios 拦截器中已处理，这里可以返回 false 供组件判断
      return false
    } finally {
      loading.value = false
    }
  }

  // 注册
  async function handleRegister(registerForm) {
    loading.value = true
    try {
      await apiRegister(registerForm)
      ElMessage.success('注册成功，请登录')
      return true
    } catch (error) {
      console.error('Register failed', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    ElMessage.info('已退出登录')
    // 注意：路由跳转通常在组件中触发，或者在这里通过参数传入 router
  }

  return { 
    token, 
    userInfo, 
    loading, 
    isLoggedIn, 
    handleLogin, 
    handleRegister, 
    logout 
  }
})