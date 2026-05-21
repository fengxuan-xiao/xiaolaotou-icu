import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getSocialMsgList, 
  sendSocialMsg, 
  resendSocialMsg, 
  discardSocialMsg,
  getTaxMsgList,
  processTaxMsg 
} from '@/api/rabbitmq'
import { ElMessage } from 'element-plus'

export const useRabbitmqStore = defineStore('rabbitmq', () => {
  // --- 社保状态 ---
  const socialList = ref([])
  const socialTotal = ref(0)
  
  // --- 税务状态 ---
  const taxList = ref([])
  const taxTotal = ref(0)

  const loading = ref(false)

  // ================= 社保 Actions =================

  /**
   * 加载社保数据
   * @param {Object} params - { status, page, size }
   */
  async function fetchSocialData(params) {
    loading.value = true
    try {
      const res = await getSocialMsgList(params)
      socialList.value = res.data.list || []
      socialTotal.value = res.data.total || 0
    } catch (error) {
      console.error('Fetch social data failed', error)
      ElMessage.error('加载社保数据失败')
    } finally {
      loading.value = false
    }
  }

  async function handleSendSocial(id) {
    try {
      await sendSocialMsg(id)
      ElMessage.success('发送指令已下达')
      return true
    } catch (error) {
      ElMessage.error('发送失败')
      return false
    }
  }

  async function handleResendSocial(id) {
    try {
      await resendSocialMsg(id)
      ElMessage.success('重发指令已下达')
      return true
    } catch (error) {
      ElMessage.error('重发失败')
      return false
    }
  }

  async function handleDiscardSocial(id) {
    try {
      await discardSocialMsg(id)
      ElMessage.success('已丢弃')
      return true
    } catch (error) {
      ElMessage.error('丢弃失败')
      return false
    }
  }

  // ================= 税务 Actions =================

  /**
   * 加载税务数据
   * @param {Object} params - { status, page, size }
   */
  async function fetchTaxData(params) {
    loading.value = true
    try {
      const res = await getTaxMsgList(params)
      taxList.value = res.data.list || []
      taxTotal.value = res.data.total || 0
    } catch (error) {
      console.error('Fetch tax data failed', error)
      ElMessage.error('加载税务数据失败')
    } finally {
      loading.value = false
    }
  }

  async function handleProcessTax(data) {
    try {
      await processTaxMsg(data)
      ElMessage.success(data.result === 0 ? '处理成功' : '已标记失败')
      return true
    } catch (error) {
      ElMessage.error('操作失败')
      return false
    }
  }

  return {
    // State
    socialList,
    socialTotal,
    taxList,
    taxTotal,
    loading,
    
    // Actions
    fetchSocialData,
    handleSendSocial,
    handleResendSocial,
    handleDiscardSocial,
    fetchTaxData,
    handleProcessTax
  }
})