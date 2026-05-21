<template>
  <div class="report-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>博客统计报表</span>
          <div class="header-controls">
            <!-- 日期筛选器 -->
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              style="margin-right: 10px;"
            />
            <el-button type="primary" size="small" @click="refreshReport">刷新</el-button>
          </div>
        </div>
      </template>
      
      <!-- 嵌入 JimuReport -->
      <iframe 
        ref="reportFrame"
        :src="reportUrl" 
        frameborder="0" 
        width="100%" 
        height="800px"
        class="report-iframe"
      ></iframe>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs' // 建议安装 dayjs: npm install dayjs

const userStore = useUserStore()
const reportCode = ref('blog_stats_001') // 替换为你在设计器中保存的 Code
const dateRange = ref([])

// 获取基础 API 地址
const baseUrl = import.meta.env.VITE_APP_BASE_API || 'http://localhost:8080'

// 格式化日期函数
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

// 构造 URL
const reportUrl = computed(() => {
  let url = `${baseUrl}/jmreport/view/${reportCode.value}`
  
  // 构建查询参数
  const params = new URLSearchParams()
  
  // 1. 添加 Token (用于后端鉴权)
  if (userStore.token) {
    params.append('token', userStore.token)
  }
  
  // 2. 添加日期参数 (如果选择了日期)
  if (dateRange.value && dateRange.value.length === 2) {
    params.append('startDate', formatDate(dateRange.value[0]))
    params.append('endDate', formatDate(dateRange.value[1]))
  }
  
  // 拼接 URL
  const queryString = params.toString()
  return queryString ? `${url}?${queryString}` : url
})

const refreshReport = () => {
  const iframe = document.querySelector('.report-iframe')
  if (iframe) {
    // 强制重新加载 iframe 内容
    iframe.src = iframe.src
  }
}
</script>

<style scoped>
.report-container {
  padding: 20px;
}
.header-controls {
  display: flex;
  align-items: center;
}
.report-iframe {
  min-height: 600px;
  background-color: #fff;
  border-radius: 4px;
}
</style>