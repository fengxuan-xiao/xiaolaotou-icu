<template>
  <div class="report-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">博客统计报表</span>
            <!-- 如果有多个报表，可以在这里加个下拉框切换 -->
            <!-- <el-select v-model="currentReportCode" size="small" style="width: 150px; margin-left: 10px;">
              <el-option label="博客统计" value="blog_stats_001" />
              <el-option label="用户分析" value="user_analysis_002" />
            </el-select> -->
          </div>
          
          <div class="header-controls">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              style="margin-right: 10px;"
              :clearable="true"
            />
            <el-button type="primary" size="small" :loading="loading" @click="handleRefresh">
              <el-icon v-if="!loading"><Refresh /></el-icon>
              {{ loading ? '加载中...' : '查询' }}
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 关键点：使用 :key 强制 iframe 在 URL 变化时重新渲染 -->
      <div v-loading="loading" element-loading-text="报表生成中..." style="min-height: 600px;">
        <iframe 
          v-if="showIframe"
          :key="reportUrl" 
          :src="reportUrl" 
          frameborder="0" 
          width="100%" 
          height="800px"
          class="report-iframe"
          @load="handleIframeLoad"
        ></iframe>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const REPORT_CODES = {
  BLOG_STATS: '1217354750058762240', // 备注：博客统计报表 ID
  USER_ANALYSIS: '另一个ID'
}

const reportCode = ref(REPORT_CODES.BLOG_STATS)
const dateRange = ref([])
const loading = ref(false)
const showIframe = ref(true)

// 基础地址
const baseUrl = import.meta.env.VITE_APP_BASE_API || 'http://localhost:8080'

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

// 构造 URL
const reportUrl = computed(() => {
  let url = `${baseUrl}/jmreport/view/${reportCode.value}`
  
  const params = new URLSearchParams()
  if (userStore.token) {
    params.append('token', userStore.token)
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    params.append('startDate', formatDate(dateRange.value[0]))
    params.append('endDate', formatDate(dateRange.value[1]))
  }
  
  const queryString = params.toString()
  //debugger;
  return queryString ? `${url}?${queryString}` : url
})

// 处理刷新/查询
const handleRefresh = () => {
  loading.value = true
  // 通过切换 showIframe 触发重新挂载，或者依靠 key 的变化
  // 这里我们主要依靠 key 的变化，loading 状态由 @load 事件关闭
  showIframe.value = false
  setTimeout(() => {
    showIframe.value = true
  }, 50)
}

// iframe 加载完成回调
const handleIframeLoad = () => {
  loading.value = false
}

// 可选：监听日期变化，自动查询（如果不希望自动，可以注释掉）
watch(dateRange, () => {
  // 如果希望选完日期自动刷新，取消下面注释
  // handleRefresh()
})

</script>

<style scoped>
.report-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.header-controls {
  display: flex;
  align-items: center;
}

.report-iframe {
  background-color: #fff;
  border-radius: 4px;
  /* 防止 iframe 内部滚动条与外部冲突 */
  overflow: hidden; 
}
</style>