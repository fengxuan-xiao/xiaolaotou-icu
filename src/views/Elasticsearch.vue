<template>
  <div class="es-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <el-button type="primary" link @click="$router.back()" class="back-btn">
        <el-icon :size="20"><Back /></el-icon>
        <span class="menu-text">返回</span>
      </el-button>
      <h1 class="page-title">Elasticsearch 模糊查询</h1>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入关键词进行模糊查询 (如: 博客标题, 内容片段)"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch" :loading="loading">
          搜索
        </el-button>
      </div>
    </el-card>

    <!-- 结果列表区域 -->
    <div class="result-area">
      <div v-if="!hasSearched" class="empty-state">
        <el-empty description="请输入关键词开始搜索" />
      </div>

      <div v-else-if="searchResults.length === 0" class="empty-state">
        <el-empty description="未找到相关数据" />
      </div>

      <div v-else class="results-list">
        <div 
          v-for="(item, index) in searchResults" 
          :key="item.id" 
          class="result-item"
          :class="{ 'is-expanded': expandedId === item.id }"
          @click="toggleExpand(item.id)"
        >
          <!-- 简要信息行 -->
          <div class="result-summary">
            <div class="summary-left">
              <span class="doc-id">ID: {{ item.id }}</span>
              <span class="doc-title">{{ item.title }}</span>
            </div>
            <div class="summary-right">
              <el-tag size="small" type="info">Score: {{ item.score }}</el-tag>
              <el-icon class="expand-icon">
                <ArrowDown v-if="expandedId !== item.id" />
                <ArrowUp v-else />
              </el-icon>
            </div>
          </div>

          <!-- 详细内容区域 (点击后展开) -->
          <transition name="expand">
            <div v-if="expandedId === item.id" class="result-detail">
              <el-divider content-position="left">完整文档内容</el-divider>
              <div class="json-viewer">
                <pre>{{ formatJson(item.rawData) }}</pre>
              </div>
              
              <!-- 模拟的操作按钮 -->
              <div class="detail-actions">
                <el-button size="small" type="primary" link>查看详情页</el-button>
                <el-button size="small" type="danger" link>删除文档</el-button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Back, Search, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 搜索状态
const searchKeyword = ref('')
const loading = ref(false)
const hasSearched = ref(false)
const expandedId = ref(null) // 当前展开的文档ID

// 模拟搜索结果数据
const searchResults = ref([])

// 模拟搜索函数
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  hasSearched.value = true
  expandedId.value = null // 重置展开状态

  // 模拟网络请求延迟
  setTimeout(() => {
    // 模拟 ES 返回的数据结构
    searchResults.value = [
      {
        id: '1001',
        title: `关于 ${searchKeyword.value} 的技术博客第一篇`,
        score: 0.95,
        rawData: {
          _index: 'blog-index',
          _id: '1001',
          _source: {
            title: `关于 ${searchKeyword.value} 的技术博客第一篇`,
            content: '这里是详细的内容...',
            author: 'Admin',
            createTime: '2023-10-01 10:00:00',
            tags: ['Vue', 'Elasticsearch']
          }
        }
      },
      {
        id: '1002',
        title: `深入理解 ${searchKeyword.value} 的核心原理`,
        score: 0.88,
        rawData: {
          _index: 'blog-index',
          _id: '1002',
          _source: {
            title: `深入理解 ${searchKeyword.value} 的核心原理`,
            content: '核心原理部分...',
            author: 'TechLead',
            createTime: '2023-10-02 11:00:00',
            tags: ['Java', 'Backend']
          }
        }
      },
      {
        id: '1003',
        title: `${searchKeyword.value} 在微服务架构中的应用`,
        score: 0.75,
        rawData: {
          _index: 'blog-index',
          _id: '1003',
          _source: {
            title: `${searchKeyword.value} 在微服务架构中的应用`,
            content: '微服务应用场景...',
            author: 'Architect',
            createTime: '2023-10-03 12:00:00',
            tags: ['Microservices', 'Cloud']
          }
        }
      }
    ]
    loading.value = false
    ElMessage.success(`找到 ${searchResults.value.length} 条结果`)
  }, 800)
}

// 切换展开/收起
const toggleExpand = (id) => {
  if (expandedId.value === id) {
    expandedId.value = null
  } else {
    expandedId.value = id
  }
}

// 格式化 JSON 显示
const formatJson = (obj) => {
  return JSON.stringify(obj, null, 2)
}
</script>

<style scoped>
.es-container {
  max-width: 1000px;
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

.search-card {
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box .el-input {
  flex: 1;
}

.result-area {
  background-color: #fff;
  border-radius: 8px;
  /* box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05); */
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.result-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-item.is-expanded {
  border-color: #409eff;
  background-color: #f9fafc;
}

.result-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.doc-id {
  font-size: 12px;
  color: #909399;
  background-color: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.doc-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.summary-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expand-icon {
  color: #909399;
  transition: transform 0.3s;
}

.result-detail {
  padding: 0 15px 15px 15px;
  border-top: 1px dashed #ebeef5;
}

.json-viewer {
  background-color: #282c34;
  color: #abb2bf;
  padding: 15px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>