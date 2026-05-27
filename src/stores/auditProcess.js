import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMyTodoTasks, submitAudit, getAuditHistory } from '@/api/auditProcess'
import { usePermissionStore } from './permission' // 假设存在权限Store用于角色判断
import { ElMessage } from 'element-plus'

export const useAuditProcessStore = defineStore('auditProcess', () => {
  // --- State ---
  const todoList = ref([])
  const total = ref(0)
  const loading = ref(false)
  
  // 筛选条件
  const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    taskType: 'first_check' // 'first_check' | 'recheck'
  })

  // 当前选中的任务详情
  const currentTask = ref(null)
  
  // 审核表单数据
  const auditForm = ref({
    comment: '',
    approved: true
  })
  
  // UI 状态
  const dialogVisible = ref(false)
  const historyDrawerVisible = ref(false)
  const historyList = ref([])
  const submitting = ref(false)

  // --- Getters / Computed ---
  
  // 计算当前流程步骤 (用于进度条显示)
  const currentStep = computed(() => {
    if (!currentTask.value) return 0
    const status = currentTask.value.auditStatus
    // 0:草稿, 1:待初审, 2:初审通过(待复核), 3:待复核, 4:复核通过, 5:驳回
    if (status === 1) return 1
    if (status === 2 || status === 3) return 2
    if (status === 4) return 3
    return 0
  })

  // 获取状态文本
  const getStatusText = (status) => {
    const map = { 
      0: '草稿', 
      1: '待初审', 
      2: '初审通过', 
      3: '待复核', 
      4: '复核通过', 
      5: '驳回' 
    }
    return map[status] || '未知'
  }

  // 获取状态标签类型
  const getStatusType = (status) => {
    const map = { 
      0: 'info', 
      1: 'warning', 
      2: 'primary', 
      3: 'warning', 
      4: 'success', 
      5: 'danger' 
    }
    return map[status] || 'info'
  }

  // 权限判断：是否可以操作当前行
  const canOperate = (row) => {
    const permissionStore = usePermissionStore()
    const isCurrentRoleMatched = 
      (queryParams.value.taskType === 'first_check' && permissionStore.hasRole('first_check')) ||
      (queryParams.value.taskType === 'recheck' && permissionStore.hasRole('recheck'))
    
    if (!isCurrentRoleMatched) return false

    // 状态匹配逻辑
    if (queryParams.value.taskType === 'first_check') {
      return row.auditStatus === 1 // 待初审
    } else {
      return row.auditStatus === 3 // 待复核
    }
  }

  // --- Actions ---

  // 加载待办列表
  const loadTodos = async () => {
    loading.value = true
    try {
      debugger;
      const res = await getMyTodoTasks(queryParams.value)
      // 假设后端返回结构为 { code: 200, data: { records: [], total: 0 } }
      todoList.value = res.data.records || []
      total.value = res.data.total || 0
    } catch (error) {
      console.error('加载待办任务失败:', error)
      ElMessage.error('加载数据失败')
    } finally {
      loading.value = false
    }
  }

  // 重置分页并加载
  const resetAndLoad = () => {
    queryParams.value.pageNum = 1
    loadTodos()
  }

  // 打开审核对话框
  const openAuditDialog = (row, isApprove) => {
    currentTask.value = row
    auditForm.value.approved = isApprove
    auditForm.value.comment = ''
    dialogVisible.value = true
  }

  // 关闭审核对话框
  const closeAuditDialog = () => {
    dialogVisible.value = false
    currentTask.value = null
    auditForm.value.comment = ''
  }

  // 提交审核结果
  const confirmAudit = async () => {
    // 校验：驳回必填意见
    if (!auditForm.value.approved && !auditForm.value.comment) {
      ElMessage.warning('驳回时必须填写意见')
      return
    }

    if (!currentTask.value) return

    submitting.value = true
    try {
      await submitAudit({
        taskId: currentTask.value.taskId,
        processInstanceId: currentTask.value.processInstanceId,
        approved: auditForm.value.approved,
        comment: auditForm.value.comment
      })
      
      ElMessage.success('操作成功')
      closeAuditDialog()
      loadTodos() // 刷新列表
    } catch (error) {
      console.error('提交审核失败:', error)
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  }

  // 查看历史记录
  const viewHistory = async (row) => {
    currentTask.value = row
    historyDrawerVisible.value = true
    try {
      const res = await getAuditHistory(row.id) // 假设 row.id 是 articleId
      historyList.value = res.data || []
    } catch (error) {
      console.error('加载历史记录失败:', error)
      ElMessage.error('加载历史记录失败')
    }
  }

  // 关闭历史抽屉
  const closeHistoryDrawer = () => {
    historyDrawerVisible.value = false
    historyList.value = []
  }

  // 切换任务类型
  const switchTaskType = (type) => {
    queryParams.value.taskType = type
    resetAndLoad()
  }

  // 分页改变
  const handlePageChange = (page) => {
    queryParams.value.pageNum = page
    loadTodos()
  }
  
  const handleSizeChange = (size) => {
    queryParams.value.pageSize = size
    resetAndLoad()
  }

  return {
    // State
    todoList,
    total,
    loading,
    queryParams,
    currentTask,
    auditForm,
    dialogVisible,
    historyDrawerVisible,
    historyList,
    submitting,
    
    // Getters/Helpers
    currentStep,
    getStatusText,
    getStatusType,
    canOperate,
    
    // Actions
    loadTodos,
    resetAndLoad,
    openAuditDialog,
    closeAuditDialog,
    confirmAudit,
    viewHistory,
    closeHistoryDrawer,
    switchTaskType,
    handlePageChange,
    handleSizeChange
  }
})