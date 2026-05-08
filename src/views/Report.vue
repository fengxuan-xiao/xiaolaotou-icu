<template>
  <div class="report-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>统计报表</span>
          <div>
            <!-- 假设 reportCode 是你已经在后端设计好的报表编码 -->
            <el-button type="primary" size="small" @click="openDesigner">设计报表</el-button>
            <el-button type="success" size="small" @click="refreshReport">刷新数据</el-button>
          </div>
        </div>
      </template>
      
      <!-- 使用 iframe 嵌入 JimuReport 预览页面 -->
      <div class="report-iframe-wrapper">
        <iframe 
          :src="reportUrl" 
          frameborder="0" 
          width="100%" 
          height="600px"
          ref="reportFrame"
        ></iframe>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 后端 JimuReport 服务的基地址
const backendBaseUrl = 'http://localhost:8080'

// 报表编码，需在后端设计器中创建后获得
const reportCode = ref('test_report_001') 

// 计算 iframe 的 src
const reportUrl = ref(`${backendBaseUrl}/jmreport/preview/${reportCode.value}`)

// 打开设计器（通常会新窗口打开，因为设计器需要全屏操作）
const openDesigner = () => {
  window.open(`${backendBaseUrl}/jmreport/designer`, '_blank')
}

// 刷新报表（重新加载 iframe）
const refreshReport = () => {
  const frame = document.querySelector('iframe')
  if (frame) {
    frame.contentWindow.location.reload()
  }
}

onMounted(() => {
  // 可以在这里检查后端服务是否可达
  console.log('Report URL:', reportUrl.value)
})
</script>

<style scoped>
.report-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.report-iframe-wrapper {
  width: 100%;
  min-height: 600px;
  border: 1px solid #ebeef5;
}
</style>