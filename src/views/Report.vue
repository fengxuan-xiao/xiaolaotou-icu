<template>
  <div class="report-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>统计报表</span>
          <el-button type="primary" size="small" @click="exportReport">导出报表</el-button>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column prop="date" label="日期" width="180" />
        <el-table-column prop="name" label="姓名" width="180" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="amount" label="数值" sortable />
      </el-table>
      
      <div class="pagination-area">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="100"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const tableData = ref([
  { date: '2023-10-01', name: '张三', address: '上海市普陀区金沙江路 1518 弄', amount: 1200 },
  { date: '2023-10-02', name: '李四', address: '北京市朝阳区工体北路', amount: 850 },
  { date: '2023-10-03', name: '王五', address: '深圳市南山区深南大道', amount: 2300 },
  { date: '2023-10-04', name: '赵六', address: '杭州市西湖区灵隐路', amount: 1500 },
])

const exportReport = () => {
  ElMessage.success('报表导出功能开发中...')
  // 这里可以添加实际的导出逻辑，例如调用后端接口生成 Excel
}
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
.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>