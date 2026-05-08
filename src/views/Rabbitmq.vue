<template>
  <div class="rabbitmq-container">
    <!-- 顶部导航栏 (保持与 Blog.vue 风格一致) -->
    <div class="top-nav">
      <el-button type="primary" link @click="$router.back()" class="back-btn">
        <el-icon :size="20"><Back /></el-icon>
        <span class="menu-text">返回</span>
      </el-button>
      <h1 class="page-title">消息队列监控中心</h1>
    </div>

    <!-- 模块切换按钮 -->
    <div class="module-switcher">
      <el-button 
        type="primary" 
        :plain="activeModule !== 'socialSecurity'" 
        @click="switchModule('socialSecurity')"
      >
        社保消息数据
      </el-button>
      <el-button 
        type="success" 
        :plain="activeModule !== 'tax'" 
        @click="switchModule('tax')"
      >
        税务信息数据
      </el-button>
    </div>

    <!-- 主内容区域 -->
    <div class="content-area">
      
      <!-- 社保模块内容 -->
      <div v-if="activeModule === 'socialSecurity'" class="module-panel">
        <el-tabs v-model="socialSecurityTab" class="demo-tabs">
          
          <!-- 1. 未发送列表 -->
          <el-tab-pane label="未发送列表" name="unsent">
            <el-table :data="socialSecurityData.unsent" border style="width: 100%">
              <el-table-column prop="uniqueId" label="数据唯一编号" width="180" />
              <el-table-column prop="companyName" label="单位名称" width="200" />
              <el-table-column prop="companyCode" label="单位编号" width="120" />
              <el-table-column prop="feePeriod" label="费款所属期" width="120" />
              <el-table-column prop="correspondingPeriod" label="对应费款所属期" width="150" />
              <el-table-column prop="area" label="统筹区" width="120" />
              <el-table-column prop="amount" label="金额" width="120">
                <template #default="scope">¥{{ scope.row.amount }}</template>
              </el-table-column>
              <el-table-column prop="taxSerialNo" label="税务流水号" width="180" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag type="info">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" fixed="right" width="150">
                <template #default="scope">
                  <el-button size="small" type="primary" @click="handleSocialAction('send', scope.row)">发送</el-button>
                  <el-button size="small" type="warning" @click="handleSocialAction('receive', scope.row)">接收</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 2. 成功列表 -->
          <el-tab-pane label="成功列表" name="success">
            <el-table :data="socialSecurityData.success" border style="width: 100%">
              <el-table-column prop="uniqueId" label="数据唯一编号" width="180" />
              <el-table-column prop="companyName" label="单位名称" width="200" />
              <el-table-column prop="companyCode" label="单位编号" width="120" />
              <el-table-column prop="feePeriod" label="费款所属期" width="120" />
              <el-table-column prop="correspondingPeriod" label="对应费款所属期" width="150" />
              <el-table-column prop="area" label="统筹区" width="120" />
              <el-table-column prop="amount" label="金额" width="120">
                <template #default="scope">¥{{ scope.row.amount }}</template>
              </el-table-column>
              <el-table-column prop="taxSerialNo" label="税务流水号" width="180" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag type="success">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 3. 失败列表 -->
          <el-tab-pane label="失败列表" name="failed">
            <el-table :data="socialSecurityData.failed" border style="width: 100%">
              <el-table-column prop="uniqueId" label="数据唯一编号" width="180" />
              <el-table-column prop="companyName" label="单位名称" width="200" />
              <el-table-column prop="companyCode" label="单位编号" width="120" />
              <el-table-column prop="feePeriod" label="费款所属期" width="120" />
              <el-table-column prop="correspondingPeriod" label="对应费款所属期" width="150" />
              <el-table-column prop="area" label="统筹区" width="120" />
              <el-table-column prop="amount" label="金额" width="120">
                <template #default="scope">¥{{ scope.row.amount }}</template>
              </el-table-column>
              <el-table-column prop="taxSerialNo" label="税务流水号" width="180" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag type="danger">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" fixed="right" width="150">
                <template #default="scope">
                  <el-button size="small" type="primary" @click="handleSocialAction('resend', scope.row)">重发</el-button>
                  <el-button size="small" type="danger" @click="handleSocialAction('discard', scope.row)">失败丢弃处理</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

        </el-tabs>
      </div>

      <!-- 税务模块内容 -->
      <div v-if="activeModule === 'tax'" class="module-panel">
        <el-card header="税务处理列表">
          <el-table :data="taxData.processing" border style="width: 100%">
            <el-table-column prop="uniqueId" label="数据唯一编号" width="180" />
            <el-table-column prop="companyName" label="单位名称" width="200" />
            <el-table-column prop="companyCode" label="单位编号" width="120" />
            <el-table-column prop="feePeriod" label="费款所属期" width="120" />
            <el-table-column prop="correspondingPeriod" label="对应费款所属期" width="150" />
            <el-table-column prop="area" label="统筹区" width="120" />
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="scope">¥{{ scope.row.amount }}</template>
            </el-table-column>
            <el-table-column prop="taxSerialNo" label="税务流水号" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag type="warning">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="150">
              <template #default="scope">
                <el-button size="small" type="success" @click="handleTaxAction('success', scope.row)">成功处理</el-button>
                <el-button size="small" type="danger" @click="handleTaxAction('fail', scope.row)">失败处理</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Back } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 当前激活的模块: 'socialSecurity' | 'tax'
const activeModule = ref('socialSecurity')

// 社保当前选中的 Tab
const socialSecurityTab = ref('unsent')

// 模拟社保数据
const socialSecurityData = reactive({
  unsent: [
    { uniqueId: 'SOC20231001001', companyName: '某某科技有限公司', companyCode: 'COMP001', feePeriod: '2023-10', correspondingPeriod: '2023-10', area: '海淀区', amount: 1500.00, taxSerialNo: '', status: '未发送' },
    { uniqueId: 'SOC20231001002', companyName: '另一家企业', companyCode: 'COMP002', feePeriod: '2023-10', correspondingPeriod: '2023-10', area: '朝阳区', amount: 2300.50, taxSerialNo: '', status: '未发送' },
  ],
  success: [
    { uniqueId: 'SOC20230901001', companyName: '历史成功企业', companyCode: 'COMP003', feePeriod: '2023-09', correspondingPeriod: '2023-09', area: '西城区', amount: 5000.00, taxSerialNo: 'TAX202309001', status: '成功' },
  ],
  failed: [
    { uniqueId: 'SOC20231001003', companyName: '失败案例企业', companyCode: 'COMP004', feePeriod: '2023-10', correspondingPeriod: '2023-10', area: '丰台区', amount: 1200.00, taxSerialNo: '', status: '失败' },
  ]
})

// 模拟税务数据
const taxData = reactive({
  processing: [
    { uniqueId: 'TAX20231001001', companyName: '纳税单位A', companyCode: 'TAXCOMP001', feePeriod: '2023-10', correspondingPeriod: '2023-10', area: '全市统筹', amount: 10000.00, taxSerialNo: 'WAITING_001', status: '处理中' },
    { uniqueId: 'TAX20231001002', companyName: '纳税单位B', companyCode: 'TAXCOMP002', feePeriod: '2023-10', correspondingPeriod: '2023-10', area: '全市统筹', amount: 8500.00, taxSerialNo: 'WAITING_002', status: '处理中' },
  ]
})

// 切换模块
const switchModule = (module) => {
  activeModule.value = module
}

// 社保操作处理
const handleSocialAction = (action, row) => {
  let msg = ''
  if (action === 'send') msg = `正在发送数据: ${row.uniqueId}`
  if (action === 'receive') msg = `正在接收数据: ${row.uniqueId}`
  if (action === 'resend') msg = `正在重发数据: ${row.uniqueId}`
  if (action === 'discard') msg = `已丢弃失败数据: ${row.uniqueId}`
  
  ElMessage.info(msg)
  // TODO: 调用后端 API
  console.log('Social Security Action:', action, row)
}

// 税务操作处理
const handleTaxAction = (action, row) => {
  let msg = ''
  if (action === 'success') msg = `标记为成功处理: ${row.uniqueId}`
  if (action === 'fail') msg = `标记为失败处理: ${row.uniqueId}`
  
  ElMessage.info(msg)
  // TODO: 调用后端 API
  console.log('Tax Action:', action, row)
}
</script>

<style scoped>
.rabbitmq-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.top-nav {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.back-btn {
  margin-right: 15px;
  font-size: 16px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.module-switcher {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
}

.content-area {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.module-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>