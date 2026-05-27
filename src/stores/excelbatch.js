import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { downloadTemplate, batchImport, getImportList } from '@/api/excelbatch'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user' // 引入用户 Store

export const useExcelBatchStore = defineStore('excelBatch', () => {
  // --- State ---
  const loading = ref(false)
  const selectedFile = ref(null) // 当前选择的文件对象
  
  // 查询参数
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    type: 'SUCCESS' // 默认显示成功列表，或者 'ALL'
  })

  // 列表数据
  const successList = ref([])
  const failList = ref([])
  const total = ref(0)

  // --- Actions ---

  /**
   * 处理文件选择
   */
  const handleFileChange = (file) => {
    // 这里可以根据实际需求校验文件类型和大小
    if (file.raw.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
        file.raw.type !== 'application/vnd.ms-excel') {
      ElMessage.warning('请上传 Excel 文件 (.xlsx 或 .xls)')
      selectedFile.value = null
      return
    }
    selectedFile.value = file.raw
    ElMessage.success(`已选择文件: ${file.name}`)
  }

  /**
   * 下载模板
   */
  const handleDownloadTemplate = async () => {
  try {
    const res = await downloadTemplate()
    
    // 检查返回的是否为有效的 Excel Blob
    // 如果后端报错返回 JSON，type 可能是 application/json
    if (res.type === 'application/json') {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result)
          ElMessage.error(errorData.message || '下载失败')
        } catch (e) {
          ElMessage.error('下载模板失败')
        }
      }
      reader.readAsText(res)
      return
    }

    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '批量导入001模板.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    ElMessage.error('网络请求错误，下载模板失败')
  }
}

  /**
   * 执行批量导入
   */
  const handleImport = async () => {
    if (!selectedFile.value) {
      ElMessage.warning('请先选择 Excel 文件')
      return
    }

    loading.value = true
    try {
      //debugger;
      
      const operator = 'admin' // 替换为实际的操作员用户名，例如 useUserStore().userInfo.name
      
      const res = await batchImport(selectedFile.value)
      if (res.code === 200) {
        const { successCount, failCount } = res.data
        ElMessage.success(`导入完成！成功: ${successCount}, 失败: ${failCount}`)
        
        // 导入成功后，自动刷新当前标签页的数据
        fetchList()
        
        // 清空已选文件，防止重复提交
        selectedFile.value = null
      } else {
        ElMessage.error(res.message || '导入失败')
      }
    } catch (error) {
      ElMessage.error('网络请求错误，导入失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 查询列表数据
   * @param {String} type - 'SUCCESS' 或 'FAIL'
   */
  const fetchList = async (type = queryParams.type) => {
    loading.value = true
    try {
      // 更新查询类型
      queryParams.type = type
      //debugger;
      const res = await getImportList({
        ...queryParams,
        status: type === 'ALL' ? '' : type // 假设后端接口用 status 字段筛选
      })
//debugger
      if (res.code === 200) {
        total.value = res.data.total
        // 根据返回的数据结构，可能需要前端过滤，或者后端直接返回对应类型的列表
        // 这里假设后端根据 status 参数返回了对应数据
        if (type === 'SUCCESS') {
          successList.value = res.data.list
        } else if (type === 'FAIL') {
          failList.value = res.data.list
        } else {
          // 如果是 ALL，可能需要分别赋值或合并，视具体业务而定
          successList.value = res.data.list.filter(item => item.status === 'SUCCESS')
          failList.value = res.data.list.filter(item => item.status === 'FAIL')
        }
      }
    } catch (error) {
      ElMessage.error('查询列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 分页改变
   */
  const handlePageChange = (newPage) => {
    queryParams.pageNum = newPage
    fetchList(queryParams.type)
  }

  /**
   * 每页条数改变
   */
  const handleSizeChange = (newSize) => {
    queryParams.pageSize = newSize
    queryParams.pageNum = 1 // 重置到第一页
    fetchList(queryParams.type)
  }
  
  /**
   * 重置查询
   */
  const resetQuery = () => {
    queryParams.keyword = ''
    queryParams.pageNum = 1
    fetchList(queryParams.type)
  }

  return {
    loading,
    selectedFile,
    queryParams,
    successList,
    failList,
    total,
    handleFileChange,
    handleDownloadTemplate,
    handleImport,
    fetchList,
    handlePageChange,
    handleSizeChange,
    resetQuery
  }
})