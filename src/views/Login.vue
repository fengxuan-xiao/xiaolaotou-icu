<template>
  <div class="page-box">
    <div class="login-card">
      <h2 class="title">博客系统</h2>

      <!-- 切换栏 -->
      <div class="tab-box">
        <span :class="{ active: !isRegister }" @click="switchTab(false)">登录</span>
        <span :class="{ active: isRegister }" @click="switchTab(true)">注册</span>
      </div>

      <!-- 登录表单 -->
      <el-form v-if="!isRegister" ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0" class="form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入账号" prefix-icon="User" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <!-- 使用 store 中的 loading 状态 -->
        <el-button type="primary" class="submit-btn" @click="handleLogin" :loading="userStore.loading">登录</el-button>
      </el-form>

      <!-- 注册表单 -->
      <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="0" class="form">
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入账号" prefix-icon="User" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <!-- 使用 store 中的 loading 状态 -->
        <el-button type="success" class="submit-btn" @click="handleRegister" :loading="userStore.loading">注册</el-button>
      </el-form>
    </div>
  </div>
  <!-- <div class="beian-box">
    <a href="https://beian.mps.gov.cn/#/query/webSearch?code=36073102000210" rel="noreferrer" target="_blank">
      <img src="/public/备案图标.png" alt="公安备案">赣公网安备36073102000210号
    </a>
    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
        赣ICP备2026008359号
      </a>
  </div> -->
  <!-- <a href="https://beian.mps.gov.cn/" target="_blank">
  <img src="备案图标地址" alt="公安备案"> 粤公网安备 XXXXXXXXX号
  </a> -->
</template>

<script setup>
import { ref, reactive } from 'vue'

import { useRouter, useRoute } from 'vue-router' // 引入 useRoute
import { useUserStore } from '@/stores/user' // 引入 User Store

const route = useRoute() // 获取 route 对象
const router = useRouter()// 获取当前路由信息
const userStore = useUserStore()

const isRegister = ref(false)

// 表单引用
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 表单数据
const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', password: '' })

// 表单验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, validator: validatePass, trigger: 'blur' }]
}

const registerRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, validator: validatePass, trigger: 'blur' }]
}

const switchTab = (val) => {
  isRegister.value = val
  // 切换时清空表单验证状态
  if (!val && loginFormRef.value) loginFormRef.value.clearValidate()
  if (val && registerFormRef.value) registerFormRef.value.clearValidate()
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      // 调用 store 中的登录方法
      const success = await userStore.handleLogin(loginForm)
      if (success) {
        // 登录成功后跳转，由组件控制路由逻辑
        // 【修改点】如果有 redirect 参数，则跳回原页面，否则默认跳去 /blog
        const redirect = route.query.redirect || '/blog'
        router.push(redirect)
      }
    }
  })
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      // 调用 store 中的注册方法
      const success = await userStore.handleRegister(registerForm)
      if (success) {
        isRegister.value = false
        // 可选：自动填充登录框
        loginForm.username = registerForm.username
        loginForm.password = '' // 安全起见，注册后清空密码
      }
    }
  })
}
</script>

<style scoped>
/* 保持原有样式不变 */
.page-box { height: 100vh; background: #f5f7fa; display: flex; justify-content: center; align-items: center; }
.login-card { width: 420px; background: #fff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.08); }
.title { text-align: center; font-size: 24px; margin-bottom: 25px; color: #333; }
.tab-box { display: flex; justify-content: center; gap: 40px; margin-bottom: 25px; font-size: 16px; }
.tab-box span { cursor: pointer; color: #999; padding-bottom: 5px; }
.tab-box span.active { color: #409eff; font-weight: bold; border-bottom: 2px solid #409eff; }
.form { display: flex; flex-direction: column; gap: 20px; }
.submit-btn { height: 44px; font-size: 16px; }

</style>