<template>
  <div class="rabbitmq-container">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <!-- <el-button type="primary" link @click="$router.back()" class="back-btn">
        <el-icon><Back /></el-icon> 返回首页
      </el-button> -->
      <h1 class="page-title">社保-税务消息队列交易中心</h1>

      <el-button type="primary" link @click="$router.back()"  class="back-btn">
        <el-icon><ArrowLeft /></el-icon> 
        <span style="margin-left: 5px;">返回首页</span>
      </el-button>
    </div>

    <!-- 模块切换 -->
    <div class="module-switcher">
      <el-button type="primary" :plain="activeModule !== 'social'" @click="switchModule('social')">
        <el-icon><OfficeBuilding /></el-icon> 社保消息数据
      </el-button>
      <el-button type="success" :plain="activeModule !== 'tax'" @click="switchModule('tax')">
        <el-icon><Coin /></el-icon> 税务消息数据
      </el-button>
    </div>

    <!-- 主内容区 -->
    <div class="content-area">
      
      <!-- ================= 社保模块 ================= -->
      <div v-if="activeModule === 'social'" class="module-panel">
        <el-tabs v-model="socialTab" @tab-change="handleSocialTabChange">
          
          <!-- 1. 未发送列表 -->
          <el-tab-pane label="未发送列表" name="unsent">
            <el-table :data="rabbitmqStore.socialList" border v-loading="rabbitmqStore.loading" style="width: 100%">
              <el-table-column prop="dataNo" label="数据编号" width="160" fixed />
              <el-table-column prop="unitName" label="单位名称" min-width="200" show-overflow-tooltip />
              <el-table-column prop="unitCode" label="单位编号" width="120" />
              <el-table-column prop="feePeriod" label="费款所属期" width="120" align="center" />
              <el-table-column prop="areaCode" label="统筹区" width="120" align="center" />
              <el-table-column prop="amount" label="缴费金额" width="120" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
              <el-table-column label="操作" fixed="right" width="100" align="center">
                <template #default="{ row }">
                  <el-button size="small" type="primary" @click="handleSocialSend(row)">发送</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="rabbitmqStore.socialTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-tab-pane>

          <!-- 2. 已发送未接收 -->
          <el-tab-pane label="已发送未接收" name="sent_pending">
            <el-table :data="rabbitmqStore.socialList" border v-loading="rabbitmqStore.loading" style="width: 100%">
              <el-table-column prop="dataNo" label="数据编号" width="160" fixed />
              <el-table-column prop="unitName" label="单位名称" min-width="200" show-overflow-tooltip />
              <el-table-column prop="sendTime" label="发送时间" width="180" align="center" />
              <el-table-column prop="retryCount" label="重试次数" width="100" align="center" />
              <el-table-column prop="mqTopic" label="MQ主题" width="150" show-overflow-tooltip />
              <el-table-column label="当前状态" width="120" align="center">
                <template #default><el-tag type="warning">等待税务回执</el-tag></template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="rabbitmqStore.socialTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-tab-pane>

          <!-- 3. 成功列表 -->
          <el-tab-pane label="成功列表" name="success">
            <el-table :data="rabbitmqStore.socialList" border v-loading="rabbitmqStore.loading" style="width: 100%">
              <el-table-column prop="dataNo" label="数据编号" width="160" fixed />
              <el-table-column prop="unitName" label="单位名称" min-width="200" show-overflow-tooltip />
              <el-table-column prop="taxSerialNo" label="税务流水号" width="180" show-overflow-tooltip />
              <el-table-column prop="amount" label="缴费金额" width="120" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
              </el-table-column>
              <el-table-column prop="receiveTime" label="回执时间" width="180" align="center" />
              <el-table-column label="处理结果" width="120" align="center">
                <template #default><el-tag type="success">税务处理成功</el-tag></template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="rabbitmqStore.socialTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-tab-pane>

          <!-- 4. 失败列表 -->
          <el-tab-pane label="失败列表" name="failed">
            <el-table :data="rabbitmqStore.socialList" border v-loading="rabbitmqStore.loading" style="width: 100%">
              <el-table-column prop="dataNo" label="数据编号" width="160" fixed />
              <el-table-column prop="unitName" label="单位名称" min-width="200" show-overflow-tooltip />
              <el-table-column prop="receiveMsg" label="失败/回执原因" min-width="250" show-overflow-tooltip />
              <el-table-column prop="receiveTime" label="回执时间" width="180" align="center" />
              <el-table-column label="操作" fixed="right" width="180" align="center">
                <template #default="{ row }">
                  <el-button size="small" type="primary" @click="handleSocialResend(row)">重发</el-button>
                  <el-button size="small" type="danger" @click="handleSocialDiscard(row)">丢弃</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="rabbitmqStore.socialTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- ================= 税务模块 ================= -->
      <div v-if="activeModule === 'tax'" class="module-panel">
        <el-tabs v-model="taxTab" @tab-change="handleTaxTabChange">
          
          <!-- 1. 未处理列表 -->
          <el-tab-pane label="未处理列表" name="unprocessed">
            <el-table :data="rabbitmqStore.taxList" border v-loading="rabbitmqStore.loading" style="width: 100%">
              <el-table-column prop="dataNo" label="数据编号" width="160" fixed />
              <el-table-column prop="unitName" label="单位名称" min-width="200" show-overflow-tooltip />
              <el-table-column prop="unitCode" label="单位编号" width="120" />
              <el-table-column prop="feePeriod" label="费款所属期" width="120" align="center" />
              <el-table-column prop="amount" label="缴费金额" width="120" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
              </el-table-column>
              <el-table-column prop="createTime" label="接收时间" width="180" align="center" />
              <el-table-column label="操作" fixed="right" width="200" align="center">
                <template #default="{ row }">
                  <el-button size="small" type="success" @click="handleTaxSuccess(row)">成功处理</el-button>
                  <el-button size="small" type="danger" @click="openTaxFailDialog(row)">失败处理</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="rabbitmqStore.taxTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-tab-pane>

          <!-- 2. 已处理列表 -->
          <el-tab-pane label="已处理列表" name="processed">
            <el-table :data="rabbitmqStore.taxList" border v-loading="rabbitmqStore.loading" style="width: 100%">
              <el-table-column prop="dataNo" label="数据编号" width="160" fixed />
              <el-table-column prop="unitName" label="单位名称" min-width="200" show-overflow-tooltip />
              <el-table-column prop="processTime" label="处理时间" width="180" align="center" />
              <el-table-column prop="replyTime" label="回执发送时间" width="180" align="center" />
              <el-table-column prop="processResult" label="处理结果" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.processResult === 0 ? 'success' : 'danger'">
                    {{ row.processResult === 0 ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="processMsg" label="处理说明/失败理由" min-width="200" show-overflow-tooltip />
            </el-table>
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="rabbitmqStore.taxTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 税务失败处理对话框 -->
    <el-dialog v-model="failDialogVisible" title="税务反馈：失败处理" width="500px">
      <el-form :model="failForm">
        <el-alert title="请注意：失败处理后将向社保局发送负面回执，请谨慎填写理由。" type="warning" :closable="false" style="margin-bottom: 15px;" />
        <el-form-item label="失败理由" required>
          <el-input v-model="failForm.reason" type="textarea" :rows="4" placeholder="例如：单位编号不存在、费款所属期错误..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="failDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmTaxFail">确认并发送回执</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Back, OfficeBuilding, Coin ,ArrowLeft} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRabbitmqStore } from '@/stores/rabbitmq'

const rabbitmqStore = useRabbitmqStore()

// --- 状态定义 ---
const activeModule = ref('social')
const socialTab = ref('unsent')
const taxTab = ref('unprocessed')

const currentPage = ref(1)
const pageSize = ref(10)

// --- 税务失败对话框 ---
const failDialogVisible = ref(false)
const failForm = reactive({ reason: '', currentRow: null })

// --- 初始化 ---
onMounted(() => {
  loadSocialData()
})

// --- 工具函数 ---
const formatMoney = (val) => {
  if (!val) return '0.00'
  return Number(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

// --- 切换逻辑 ---
const switchModule = (mod) => {
  activeModule.value = mod
  currentPage.value = 1
  if (mod === 'social') loadSocialData()
  else loadTaxData()
}

const handleSocialTabChange = () => {
  currentPage.value = 1
  loadSocialData()
}

const handleTaxTabChange = () => {
  currentPage.value = 1
  loadTaxData()
}

// --- 社保业务逻辑 ---
const loadSocialData = () => {
  rabbitmqStore.fetchSocialData({
    status: socialTab.value,
    page: currentPage.value,
    size: pageSize.value
  })
}

const handleSocialSend = (row) => {
  ElMessageBox.confirm(`确定向税务系统发送数据 ${row.dataNo} 吗？`, '提示').then(async () => {
    const success = await rabbitmqStore.handleSendSocial(row.id)
    if (success) loadSocialData()
  }).catch(() => {})
}

const handleSocialResend = (row) => {
  ElMessageBox.confirm(`确定重新发送数据 ${row.dataNo} 吗？`, '提示').then(async () => {
    const success = await rabbitmqStore.handleResendSocial(row.id)
    if (success) loadSocialData()
  }).catch(() => {})
}

const handleSocialDiscard = (row) => {
  ElMessageBox.confirm('丢弃后该条社保数据将不再处理，确定吗？', '警告', { type: 'warning' }).then(async () => {
    const success = await rabbitmqStore.handleDiscardSocial(row.id)
    if (success) loadSocialData()
  }).catch(() => {})
}

// --- 税务业务逻辑 ---
const loadTaxData = () => {
  rabbitmqStore.fetchTaxData({
    status: taxTab.value,
    page: currentPage.value,
    size: pageSize.value
  })
}

const handleTaxSuccess = (row) => {
  ElMessageBox.confirm('确认数据无误并标记为成功？系统将自动发送成功回执。', '提示').then(async () => {
    const success = await rabbitmqStore.handleProcessTax({ id: row.id, result: 0, msg: '处理成功' })
    if (success) loadTaxData()
  }).catch(() => {})
}

const openTaxFailDialog = (row) => {
  failForm.currentRow = row
  failForm.reason = ''
  failDialogVisible.value = true
}

const confirmTaxFail = async () => {
  if (!failForm.reason) return ElMessage.warning('请填写具体的失败理由')
  
  const success = await rabbitmqStore.handleProcessTax({
    id: failForm.currentRow.id,
    result: 1,
    msg: failForm.reason
  })
  
  if (success) {
    failDialogVisible.value = false
    loadTaxData()
  }
}

// --- 分页通用处理 ---
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 改变每页条数时，重置回第一页
  if (activeModule.value === 'social') loadSocialData()
  else loadTaxData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  if (activeModule.value === 'social') loadSocialData()
  else loadTaxData()
}
</script>

<style scoped>
.rabbitmq-container { 
  padding: 20px; 
  background-color: #f5f7fa;
  min-height: 100vh;
}
.top-nav { 
  display: flex; 
  align-items: center; 
  margin-bottom: 20px; 
  background: #fff;
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.page-title {
  margin: 0 0 0 15px;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}
.module-switcher { 
  margin-bottom: 20px; 
  display: flex;
  gap: 15px;
}
.content-area { 
  background: #fff; 
  padding: 20px; 
  border-radius: 8px; 
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  min-height: 500px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.back-btn {
  margin-left: auto; /* 关键代码：将按钮推到最右侧 */
  /* 原有的样式可以保留，或者微调 */
}
</style>