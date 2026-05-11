<template>
  <div class="visualization-container">

    <!-- 标题栏 -->
    <div class="header-actions">
      <h2>数据可视化大屏</h2>
      <el-button type="primary" link @click="goHome">
        <el-icon>
          <HomeFilled />
        </el-icon>
        <span style="margin-left: 5px;">返回首页</span>
      </el-button>
    </div>

    <!-- 顶部操作栏 -->
    <div class="filter-bar">
      <div class="filter-row">
        <!-- 第一行：省市县 (使用 Store 数据) -->
        <el-select v-model="queryForm.province" placeholder="请选择省份" style="width: 150px" @change="handleProvinceChange"
          :loading="areaStore.loading">
          <el-option v-for="item in areaStore.provinces" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-select v-model="queryForm.city" placeholder="请选择城市" style="width: 150px; margin-left: 10px"
          @change="handleCityChange" :disabled="!queryForm.province" :loading="areaStore.loading">
          <el-option v-for="item in areaStore.cities" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-select v-model="queryForm.district" placeholder="请选择区县" style="width: 150px; margin-left: 10px"
          :disabled="!queryForm.city" :loading="areaStore.loading">
          <el-option v-for="item in areaStore.districts" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>

      <div class="filter-row" style="margin-top: 10px;width:650px">
        <!-- 第二行：日期范围与操作按钮 -->
        <el-date-picker v-model="queryForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="date-picker-custom"
          style="width: 150px !important;" />

        <div style="margin-left: 10px; display: flex; gap: 10px;">
          <el-button type="primary" :loading="loading" @click="handleQuery">
            <el-icon>
              <Search />
            </el-icon>
            <span>查询</span>
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon>
            <span>重置</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 2x2 网格布局 -->
    <div class="chart-grid">
      <div class="chart-wrapper">
        <div ref="chartRef1" class="chart-instance"></div>
      </div>
      <div class="chart-wrapper">
        <div ref="chartRef2" class="chart-instance"></div>
      </div>
      <div class="chart-wrapper">
        <div ref="chartRef3" class="chart-instance"></div>
      </div>
      <div class="chart-wrapper">
        <div ref="chartRef4" class="chart-instance"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus' // 引入消息提示
import * as echarts from 'echarts'
import { HomeFilled, Search, Refresh } from '@element-plus/icons-vue'
import { useAreaStore } from '@/stores/visualization'
import { getVisualizationData } from '@/api/visualization'

const router = useRouter()
const areaStore = useAreaStore()

// 获取默认日期范围 (今年1月1日 至 今天)
const getDefaultDateRange = () => {
  const now = new Date()

  // 1. 获取今年的年份
  const currentYear = now.getFullYear()

  // 2. 构建开始日期：今年1月1日
  const startDate = new Date(currentYear, 0, 1) // 月份从0开始，0代表1月

  // 3. 格式化函数 YYYY-MM-DD
  const formatDate = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // 4. 返回 [开始日期, 结束日期(今天)]
  return [formatDate(startDate), formatDate(now)]
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
let scrollTimer3 = null

// 返回首页
const goHome = () => {
  router.push('/blog')
}

// --- 地区联动逻辑 ---

const handleProvinceChange = async (val) => {
  queryForm.city = ''
  queryForm.district = ''
  if (val) {
    await areaStore.loadCitiesByProvince(val)
  } else {
    areaStore.cities = []
    areaStore.districts = []
  }
}

const handleCityChange = async (val) => {
  queryForm.district = ''
  if (val) {
    await areaStore.loadDistrictsByCity(val)
  } else {
    areaStore.districts = []
  }
}

// --- 图表相关逻辑 ---

const initChartsConfig = () => {
  // 1. 左上：柱状图
  if (chartRef1.value) {
    const chart = echarts.init(chartRef1.value)
    chart.setOption({
      title: { text: '平均参保人数统计', left: 'center' },
      tooltip: { trigger: 'axis' },
      grid: { containLabel: true, bottom: '10%' },
      xAxis: { type: 'category', data: [] },
      yAxis: {
        type: 'value',
        min: 2300,       // 最小值
        max: 2600,     // 最大值 (或者使用 'dataMax' 自动适应最大值)
        interval: 50, // 刻度间隔
        axisLabel: {
          formatter: '{value}' // 格式化标签
        }
      },
      series: [{ data: [], type: 'bar', itemStyle: { color: '#409EFF' } }]
    })
    charts.push(chart)
  }

  // 2. 右上：折线图
  if (chartRef2.value) {
    const chart = echarts.init(chartRef2.value)
    chart.setOption({
      title: { text: '净值趋势', left: 'center' },
      tooltip: { trigger: 'axis' },
      grid: { containLabel: true, bottom: '10%' },
      xAxis: { type: 'category', boundaryGap: false, data: [] },
      //yAxis: { type: 'value' },
      yAxis: {
        type: 'value',
        min: 1.0,       // 改为更直观的数值
        max: 1.7,
        interval: 0.2,  // 调整间隔，让刻度更密集或稀疏
        axisLabel: {
          // 保留两位小数，例如显示 1.00, 1.20
          formatter: (value) => {
            return value.toFixed(6);
          }
        }
      },
      series: [{ data: [], type: 'line', smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#67C23A' } }]
    })
    charts.push(chart)
  }

  // 3. 左下：旋转滚动柱状图
  if (chartRef3.value) {
    const chart = echarts.init(chartRef3.value)
    const option = {
      title: { text: '平均参保金额统计 (循环滚动)', left: 'center' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: {
        type: 'value',
        min: 1500,   // 设置最小值
        max: 2500,   // 设置最大值
        interval: 200,
        boundaryGap: [0, 0.01], splitLine: { show: false }
      },
      yAxis: { type: 'category', data: [], inverse: true, axisTick: { show: false }, axisLine: { show: false } },
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
    //debugger;
    const chart = echarts.init(chartRef4.value)
    chart.setOption({
      title: { text: '参保年龄分布占比', left: 'center' },
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

const startCircularScroll = (chart, initialCategories, initialData) => {
  if (scrollTimer3) clearInterval(scrollTimer3)
  // 防御性编程：如果没有数据则不启动定时器
  if (!initialCategories || initialCategories.length === 0) return

  let currentCategories = [...initialCategories]
  let currentData = [...initialData]

  scrollTimer3 = setInterval(() => {
    if (currentCategories.length === 0) return
    const firstCat = currentCategories.shift()
    const firstVal = currentData.shift()
    currentCategories.push(firstCat)
    currentData.push(firstVal)
    chart.setOption({
      yAxis: { data: currentCategories },
      series: [{ data: currentData }]
    })
  }, 1500)
}

const updateChartsData = (vo) => {
  // 1. 防御性检查
  if (!vo) {
    console.warn('Visualization data is empty or undefined')
    return
  }

  // 更新图1
  if (vo.chart1 && charts[0]) {
    charts[0].setOption({
      xAxis: { data: vo.chart1.categories || [] },
      series: [{ data: vo.chart1.data || [] }]
    })
  }

  // 更新图2
  if (vo.chart2 && charts[1]) {
    charts[1].setOption({
      xAxis: { data: vo.chart2.categories || [] },
      series: [{ data: vo.chart2.data || [] }]
    })
  }

  // 更新图3 (先停再更，最后再启)
  if (vo.chart3 && charts[2]) {
    const chart3Data = vo.chart3

    // A. 先停止当前的滚动定时器，避免冲突
    if (scrollTimer3) {
      clearInterval(scrollTimer3)
      scrollTimer3 = null
    }

    // B. 更新静态数据
    charts[2].setOption({
      yAxis: { data: chart3Data.categories || [] },
      series: [{ data: chart3Data.data || [] }]
    })

    // C. 使用新数据重新启动滚动
    startCircularScroll(charts[2], chart3Data.categories, chart3Data.data)
  }

  //debugger;
  // 更新图4 (南丁格尔玫瑰图)
  if (vo.chart4 && charts[3]) {

    console.log('Raw vo.chart4:', vo.chart4);

    // 1. 获取数据并转换为 ECharts 需要的格式 { name, value }
    // 假设 vo.chart4 是一个对象，包含 categories 和 data，或者直接是数组
    // 这里根据你 chart1-3 的结构，假设 vo.chart4 也有 categories 和 data
    // const pieData = (vo.chart4.categories || []).map((name, index) => {
    //   return {
    //     name: name,
    //     value: vo.chart4.data ? vo.chart4.data[index] : 0
    //   }
    // })
    const pieData = vo.chart4.map(item => ({
      name: item.name,
      value: item.value
    }))

    // 打印调试信息（确认进入此分支）
    console.log('Updating Chart 4 with data:', pieData)

    charts[3].setOption({
      series: [{
        type: 'pie', // 显式指定类型，防止配置丢失
        data: pieData
      }]
    })
  } else {
    console.warn('Chart 4 update skipped. vo.chart4:', vo.chart4, 'charts[3]:', charts[3])
  }
}

// 核心查询方法
const handleQuery = async () => {
  loading.value = true
  try {
    // 1. 处理日期格式：从 "YYYY-MM-DD" 转为 "YYYYMM"
    let startDate = ''
    let endDate = ''

    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      // 例如: "2023-01-01" -> "202301"
      startDate = queryForm.dateRange[0].replace(/-/g, '').substring(0, 6)
      endDate = queryForm.dateRange[1].replace(/-/g, '').substring(0, 6)
    } else {
      // 默认使用当前月份
      const defaultDate = new Date().toISOString().split('T')[0].replace(/-/g, '').substring(0, 6)
      startDate = defaultDate
      endDate = defaultDate
    }

    // 2. 构建请求参数
    const params = {
      province: queryForm.province || undefined,
      city: queryForm.city || undefined,
      district: queryForm.district || undefined,
      startDate: startDate,
      endDate: endDate
    }

    // 3. 调用后端接口
    // 假设 request 拦截器已经处理了 Result 包装，直接返回 data 字段的内容
    // 如果未处理，则需要 const res = await getVisualizationData(params); const vo = res.data;
    const res = await getVisualizationData(params)
    const vo = res.data

    // 4. 更新图表
    updateChartsData(vo)

  } catch (error) {
    console.error('Fetch data error:', error)
    ElMessage.error('数据加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryForm.province = ''
  queryForm.city = ''
  queryForm.district = ''
  queryForm.dateRange = getDefaultDateRange()

  // 重置 Store 中的下级数据
  areaStore.cities = []
  areaStore.districts = []

  handleQuery()
}

const handleResize = () => {
  charts.forEach(chart => chart && chart.resize())
}

onMounted(() => {
  // 1. 初始化加载省份数据
  areaStore.loadProvinces()

  // 2. 初始化图表
  initChartsConfig()

  // 3. 首次查询
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
/* 样式部分保持不变 */
.date-picker-custom {
  width: 150px !important;
  max-width: 150px !important;
}

.date-picker-custom :deep(.el-input__wrapper) {
  padding-left: 5px;
  padding-right: 5px;
}

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

  .filter-row>* {
    margin-left: 0 !important;
  }
}
</style>