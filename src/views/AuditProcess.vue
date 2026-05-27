<template>
  <div class="audit-process-container">
    <!-- 标题栏 -->
    <div class="header-actions">
      <h2>{{ route.meta.title || '审核中心' }}</h2>
      <el-button type="primary" link @click="goHome">
        <el-icon><HomeFilled /></el-icon>
        <span style="margin-left: 5px;">返回首页</span>
      </el-button>
    </div>

    <!-- 1. 筛选与列表 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>我的待办任务</span>
          <br/>
          <el-radio-group v-model="store.queryParams.taskType" @change="store.switchTaskType">
            <el-radio-button label="first_check">初审任务</el-radio-button>
            <el-radio-button label="recheck">复核任务</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <el-table :data="store.todoList" v-loading="store.loading">
        <el-table-column prop="articleTitle" label="文章标题" />
        <el-table-column prop="authorName" label="作者" width="120" />
        <el-table-column prop="createTime" label="提交时间" width="180" />
        <el-table-column label="当前状态" width="120">
          <template #default="{ row }">
            <el-tag :type="store.getStatusType(row.auditStatus)">
              {{ store.getStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="store.viewHistory(row)">查看详情</el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="store.openAuditDialog(row, true)"
              :disabled="!store.canOperate(row)"
            >
              通过
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="store.openAuditDialog(row, false)"
              :disabled="!store.canOperate(row)"
            >
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="store.queryParams.pageNum"
        v-model:page-size="store.queryParams.pageSize"
        :total="store.total"
        @current-change="store.handlePageChange"
        @size-change="store.handleSizeChange"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 2. 审核详情与操作对话框 -->
    <el-dialog 
      v-model="store.dialogVisible" 
      title="审核处理" 
      width="600px"
      @close="store.closeAuditDialog"
    >
      <div v-if="store.currentTask">
        <h3>{{ store.currentTask.articleTitle }}</h3>
        
        <!-- 流程进度条 -->
        <el-steps :active="store.currentStep" finish-status="success" simple style="margin: 20px 0">
          <el-step title="草稿" />
          <el-step title="待初审" />
          <el-step title="待复核" />
          <el-step title="已发布" />
        </el-steps>

        <!-- 审批意见输入 -->
        <el-form :model="store.auditForm" label-width="80px">
          <el-form-item label="审批意见">
            <el-input 
              v-model="store.auditForm.comment" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入审批意见，驳回时必填" 
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="store.dialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="store.confirmAudit" 
            :loading="store.submitting"
          >
            确认{{ store.auditForm.approved ? '通过' : '驳回' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 3. 历史记录面板 -->
    <el-drawer 
      v-model="store.historyDrawerVisible" 
      title="审核历史记录" 
      size="400px"
      @close="store.closeHistoryDrawer"
    >
      <el-timeline v-if="store.historyList.length">
        <el-timeline-item
          v-for="(activity, index) in store.historyList"
          :key="index"
          :timestamp="activity.createTime"
          placement="top"
        >
          <el-card>
            <h4>{{ activity.operatorName }} - {{ activity.action }}</h4>
            <p>{{ activity.comment || '无意见' }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无历史记录" />
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'
import { useAuditProcessStore } from '@/stores/auditProcess'

const router = useRouter()
const route = useRoute()
const store = useAuditProcessStore()

// 初始化加载
onMounted(() => {
  store.loadTodos()
})

const goHome = () => {
  router.push('/home')
}
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.header-actions h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
</style>