<template>
  <div class="visualization-container">
    

    <!-- 标题栏 -->
    <div class="header-actions">
      <h2>数据可视化大屏</h2>
      <el-button type="primary" link @click="goHome">
        <el-icon><HomeFilled /></el-icon>
        <span style="margin-left: 5px;">返回首页</span>
      </el-button>
    </div>

    <!-- 顶部操作栏 -->
    <div class="filter-bar">
      <div class="filter-row">
        <!-- 第一行：省市县 -->
        <el-select v-model="queryForm.province" placeholder="请选择省份" style="width: 150px" @change="handleAreaChange('province')">
          <el-option label="浙江省" value="zhejiang" />
          <el-option label="广东省" value="guangdong" />
          <el-option label="江苏省" value="jiangsu" />
        </el-select>
        <el-select v-model="queryForm.city" placeholder="请选择城市" style="width: 150px; margin-left: 10px" @change="handleAreaChange('city')">
          <el-option label="杭州市" value="hangzhou" />
          <el-option label="宁波市" value="ningbo" />
          <el-option label="广州市" value="guangzhou" />
        </el-select>
        <el-select v-model="queryForm.district" placeholder="请选择区县" style="width: 150px; margin-left: 10px">
          <el-option label="西湖区" value="xihu" />
          <el-option label="余杭区" value="yuhang" />
          <el-option label="天河区" value="tianhe" />
        </el-select>
      </div>

      <div class="filter-row" style="margin-top: 10px;width:650px">
        <!-- 第二行：日期范围与操作按钮 -->
        <el-date-picker
          v-model="queryForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="date-picker-custom" 
          style="width: 150px !important;" 
        />
        
        <div style="margin-left: 10px; display: flex; gap: 10px;">
          <el-button type="primary" :loading="loading" @click="handleQuery">
            <el-icon><Search /></el-icon>
            <span>查询</span>
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            <span>重置</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 2x2 网格布局 -->
    <div class="chart-grid">
      <!-- 左上：访问来源统计 (图1) -->
      <div class="chart-wrapper">
        <div ref="chartRef1" class="chart-instance"></div>
      </div>

      <!-- 右上：用户增长趋势 (图2) -->
      <div class="chart-wrapper">
        <div ref="chartRef2" class="chart-instance"></div>
      </div>

      <!-- 左下：旋转滚动柱状图 (图3 - 基于图1旋转并循环滚动) -->
      <div class="chart-wrapper">
        <div ref="chartRef3" class="chart-instance"></div>
      </div>

      <!-- 右下：南丁格尔玫瑰图 (图4) -->
      <div class="chart-wrapper">
        <div ref="chartRef4" class="chart-instance"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { HomeFilled, Search, Refresh } from '@element-plus/icons-vue'


const router = useRouter()

// 获取默认日期范围
const getDefaultDateRange = () => {
  const today = new Date().toISOString().split('T')[0]
  return [today, today]
}

// 筛选表单数据
const queryForm = reactive({
  province: '',
  city: '',
  district: '',
  dateRange: getDefaultDateRange()
})

const loading = ref(false)

// 图表 DOM 引用
const chartRef1 = ref(null)
const chartRef2 = ref(null)
const chartRef3 = ref(null)
const chartRef4 = ref(null)

// 图表实例存储
let charts = []
let scrollTimer3 = null // 用于控制图3滚动的定时器

// 返回首页
const goHome = () => {
  router.push('/blog')
}

// 模拟后端数据获取
const fetchBackendData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        // 图1数据：7个类目
        chart1: {
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [120, 200, 150, 80, 70, 110, 130]
        },
        chart2: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 1000 + 500))
        },
        // 图3数据：为了演示滚动效果，我们使用与图1相同的数据结构，但可以是更多数据
        // 这里我们复用 chart1 的数据作为基础，或者生成新数据
        chart3: {
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [120, 200, 150, 80, 70, 110, 130]
        },
        chart4: [
          { value: 40, name: '技术文章' },
          { value: 38, name: '生活随笔' },
          { value: 32, name: '学习笔记' },
          { value: 30, name: '项目复盘' },
          { value: 28, name: '转载分享' }
        ]
      })
    }, 800)
  })
}

// 初始化图表配置
const initChartsConfig = () => {
  // 1. 左上：柱状图
  if (chartRef1.value) {
    const chart = echarts.init(chartRef1.value)
    chart.setOption({
      title: { text: '访问来源统计', left: 'center' },
      tooltip: { trigger: 'axis' },
      grid: { containLabel: true, bottom: '10%' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ data: [], type: 'bar', itemStyle: { color: '#409EFF' } }]
    })
    charts.push(chart)
  }

  // 2. 右上：折线图
  if (chartRef2.value) {
    const chart = echarts.init(chartRef2.value)
    chart.setOption({
      title: { text: '用户增长趋势', left: 'center' },
      tooltip: { trigger: 'axis' },
      grid: { containLabel: true, bottom: '10%' },
      xAxis: { type: 'category', boundaryGap: false, data: [] },
      yAxis: { type: 'value' },
      series: [{ data: [], type: 'line', smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#67C23A' } }]
    })
    charts.push(chart)
  }

  // 3. 左下：旋转滚动柱状图 (基于图1旋转90度 + 循环滚动)
  if (chartRef3.value) {
    const chart = echarts.init(chartRef3.value)
    const option = {
      title: { text: '实时热度排行 (循环滚动)', left: 'center' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      // X轴为数值轴 (原图1的Y轴)
      xAxis: { 
        type: 'value', 
        boundaryGap: [0, 0.01],
        splitLine: { show: false }
      },
      // Y轴为类目轴 (原图1的X轴)，inverse:true 让第一个数据在最上面
      yAxis: { 
        type: 'category', 
        data: [],
        inverse: true, 
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: [{
        name: '热度指数',
        type: 'bar',
        data: [],
        label: { show: true, position: 'right' },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        barWidth: '60%'
      }]
    }
    chart.setOption(option)
    charts.push(chart)
  }

  // 4. 右下：南丁格尔玫瑰图
  if (chartRef4.value) {
    const chart = echarts.init(chartRef4.value)
    chart.setOption({
      title: { text: '内容分布占比', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { top: 'bottom', type: 'scroll' },
      series: [
        {
          name: '内容类型',
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['50%', '50%'],
          roseType: 'area',
          itemStyle: { borderRadius: 8 },
          data: []
        }
      ]
    })
    charts.push(chart)
  }
}

// 启动左下角图表的循环滚动动画
// 逻辑：将数组第一个元素移到最后，其余前移
const startCircularScroll = (chart, initialCategories, initialData) => {
  if (scrollTimer3) clearInterval(scrollTimer3)
  
  // 深拷贝数据，避免修改原始引用
  let currentCategories = [...initialCategories]
  let currentData = [...initialData]

  scrollTimer3 = setInterval(() => {
    if (currentCategories.length === 0) return

    // 1. 取出第一个元素
    const firstCat = currentCategories.shift()
    const firstVal = currentData.shift()

    // 2. 放到最后
    currentCategories.push(firstCat)
    currentData.push(firstVal)

    // 3. 更新图表
    chart.setOption({
      yAxis: { data: currentCategories },
      series: [{ data: currentData }]
    })
  }, 1500) // 每1.5秒滚动一行
}

// 更新图表数据
const updateChartsData = (data) => {
  // 更新图1
  charts[0].setOption({
    xAxis: { data: data.chart1.categories },
    series: [{ data: data.chart1.data }]
  })

  // 更新图2
  charts[1].setOption({
    xAxis: { data: data.chart2.categories },
    series: [{ data: data.chart2.data }]
  })

  // 更新图3 (启动循环滚动)
  // 注意：这里我们使用 data.chart3 的数据，如果希望完全复用图1数据，可以使用 data.chart1
  const chart3Data = data.chart3 || data.chart1 
  charts[2].setOption({
    yAxis: { data: chart3Data.categories },
    series: [{ data: chart3Data.data }]
  })
  // 重新启动滚动动画
  startCircularScroll(charts[2], chart3Data.categories, chart3Data.data)

  // 更新图4
  charts[3].setOption({
    series: [{ data: data.chart4 }]
  })
}

// 查询按钮点击事件
const handleQuery = async () => {
  loading.value = true
  try {
    const data = await fetchBackendData()
    updateChartsData(data)
  } catch (error) {
    console.error('Fetch data error:', error)
  } finally {
    loading.value = false
  }
}

// 重置按钮点击事件
const handleReset = () => {
  queryForm.province = ''
  queryForm.city = ''
  queryForm.district = ''
  queryForm.dateRange = getDefaultDateRange()
  handleQuery()
}

// 级联选择变化处理
const handleAreaChange = (level) => {
  if (level === 'province') {
    queryForm.city = ''
    queryForm.district = ''
  } else if (level === 'city') {
    queryForm.district = ''
  }
}

// 窗口 resize 处理
const handleResize = () => {
  charts.forEach(chart => chart && chart.resize())
}

onMounted(() => {
  initChartsConfig()
  handleQuery()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (scrollTimer3) clearInterval(scrollTimer3)
  charts.forEach(chart => chart && chart.dispose())
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 强制日期选择器宽度 */
.date-picker-custom {
  width: 150px !important;
  max-width: 150px !important;
}

/* 深度选择器：调整内部输入框的 padding，防止文字溢出或显示不全 */
.date-picker-custom :deep(.el-input__wrapper) {
  padding-left: 5px;
  padding-right: 5px;
}

/* 如果希望 placeholder 文字更小以适应窄宽度 */
.date-picker-custom :deep(.el-input__inner) {
  font-size: 12px; 
}
.visualization-container {
  padding: 10px 20px;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.filter-bar {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
}

.filter-row {
  display: flex;
  align-items: center;
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

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 15px;
  flex: 1;
  min-height: 0;
}

.chart-wrapper {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chart-instance {
  width: 100%;
  flex: 1;
  min-height: 200px;
}

@media (max-width: 768px) {
  .chart-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 350px);
  }
  
  .filter-row {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .filter-row > * {
    margin-left: 0 !important;
  }
  
}
</style>