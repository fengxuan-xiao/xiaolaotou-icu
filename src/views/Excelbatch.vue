<template>
  <div class="excel-batch-container">

    <!-- 标题栏 -->
    <div class="header-actions">
      <h2>批量导入</h2>
      <el-button type="primary" link @click="router.push('/home')">
        <el-icon>
          <HomeFilled />
        </el-icon>
        <span style="margin-left: 5px;">返回首页</span>
      </el-button>
    </div>


    <!-- 上方：操作区域 -->
    <el-card class="operation-area" shadow="never">
      <div class="flex-row align-center justify-between">
        <div class="left-actions flex-row align-center gap-10">
          <!-- 下载模板 -->
          <el-button type="primary" link @click="store.handleDownloadTemplate">
            <el-icon><Download /></el-icon>
            下载模板
          </el-button>

          <!-- 文件选择 -->
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            :on-change="store.handleFileChange"
            :file-list="fileList"
            accept=".xlsx,.xls"
          >
            <el-button type="primary" plain>
              <el-icon><Upload /></el-icon>
              选择 Excel 文件
            </el-button>
          </el-upload>

          <!-- 批量导入按钮 -->
          <el-button 
            type="success" 
            :loading="store.loading" 
            :disabled="!store.selectedFile"
            @click="store.handleImport"
          >
            批量导入
          </el-button>
        </div>

        <div class="right-actions flex-row align-center gap-10">
          <!-- 搜索框 -->
          <el-input
            v-model="store.queryParams.keyword"
            placeholder="请输入相关信息搜索"
            style="width: 200px"
            clearable
            @clear="store.resetQuery"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <!-- 查询按钮 -->
          <el-button type="primary" @click="store.fetchList(store.queryParams.type)">
            查询
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 下方：数据显示区域 -->
    <el-card class="data-area" shadow="never" style="margin-top: 20px;">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 成功列表 Tab -->
        <el-tab-pane label="成功列表" name="SUCCESS">
          <el-table 
            :data="store.successList" 
            v-loading="store.loading" 
            border 
            stripe
            style="width: 100%"
          >
            <el-table-column prop="id" label="ID" width="200" />
            <el-table-column prop="title" label="文章标题" width="200" />
            <el-table-column prop="content" label="文章内容" width="150" show-overflow-tooltip />
            <el-table-column prop="authorName" label="作者名称" width="150"/>
            <el-table-column prop="tags" label="标签" width="120" />
            <el-table-column prop="importTime" label="导入时间" width="180" />
          </el-table>
        </el-tab-pane>

        <!-- 失败列表 Tab -->
        <el-tab-pane label="失败列表" name="FAIL">
          <el-table 
            :data="store.failList" 
            v-loading="store.loading" 
            border 
            stripe
            style="width: 100%"
          >
            <el-table-column prop="rowIndex" label="行号" width="200" />
            <el-table-column prop="title" label="文章标题" width="200" />
            <el-table-column prop="content" label="文章内容" width="150" show-overflow-tooltip />
            <el-table-column prop="authorName" label="作者名称" width="150"/>
            <el-table-column prop="tags" label="标签" width="120" />
            <el-table-column prop="failReason" label="失败原因" show-overflow-tooltip />
            <el-table-column prop="importTime" label="尝试时间" width="180" />
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="store.queryParams.pageNum"
          v-model:page-size="store.queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="store.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="store.handleSizeChange"
          @current-change="store.handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useExcelBatchStore } from '@/stores/excelbatch'
import { Download, Upload, Search } from '@element-plus/icons-vue'

const router = useRouter()

const store = useExcelBatchStore()

// 控制当前激活的 Tab
const activeTab = ref('SUCCESS')

// 用于 el-upload 显示已选文件
const fileList = computed(() => {
  if (store.selectedFile) {
    return [{ name: store.selectedFile.name, url: '' }]
  }
  return []
})

// 监听 Tab 切换，重新加载数据
const handleTabChange = (tabName) => {
  store.fetchList(tabName)
}

// 初始化加载一次数据
store.fetchList('SUCCESS')
</script>

<style scoped>
.excel-batch-container {
  padding: 20px;
}

.flex-row {
  display: flex;
}

.align-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-10 {
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 5px;
}

.header-actions h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
</style>