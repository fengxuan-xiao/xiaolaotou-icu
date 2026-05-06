<template>
  <div class="blog-container">
    <h1>我的日记博客</h1>

    <!-- 输入区域123分支测试注释123 1233 -->
    <el-card class="input-card">
      <el-input
        v-model="title"
        placeholder="请输入标题"
        clearable
      />
      <el-input
        v-model="content"
        type="textarea"
        :rows="4"
        placeholdernpm="请输入内容"
        class="content-textarea"
      />
      
      <el-button :loading="blogStore.loading" type="primary" @click="handleAdd">添加文章</el-button>
      <div v-if="blogStore.loading">加载中...</div>
    </el-card>

    <!-- 文章列表 -->
    <el-card class="list-card">
      <template #header>
        <span>文章列表 ({{ blogStore.articles.length }})</span>
      </template>
      <div v-if="blogStore.articles.length === 0" class="empty-tip">
        暂无文章，添加一篇吧～
      </div>
      <div v-else class="article-list">
        <div v-for="article in blogStore.articles" :key="article.id" class="article-item">
          <div class="article-content">
            <h3>{{ article.title }}</h3>
            <p>{{ article.content }}</p>
          </div>
          <el-button type="danger" size="small" @click="handleDelete(article.id)">
            删除
          </el-button>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="blogStore.currentPage"
          v-model:page-size="blogStore.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="blogStore.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>


    </el-card>
  </div>
</template>

<script setup>
import { ref , onMounted} from 'vue'
import { useBlogStore } from '@/stores/blog'

// 使用 store
const blogStore = useBlogStore()

// 表单数据
const title = ref('')
const content = ref('')

// 添加文章
const handleAdd = async () => {
  // addArticle 现在是 async 函数，建议 await 等待结果
  const success = await blogStore.addArticle(title.value, content.value)
  if (success) {
    title.value = ''
    content.value = ''
  }
}

// 删除文章
const handleDelete = (id) => {
  blogStore.deleteArticle(id)
}

// 分页事件处理
const handleSizeChange = (val) => {
  // 每页条数变化，重置到第一页
  blogStore.fetchArticles(1, val)
}

const handleCurrentChange = (val) => {
  // 页码变化
  blogStore.fetchArticles(val, blogStore.pageSize)
}

// 组件挂载时加载后端数据
onMounted(() => {
  //blogStore.fetchArticles()
  // 初始加载第一页
  blogStore.fetchArticles(1, 10)
  console.log('onMounted 执行了')
})



</script>

<style scoped>
.blog-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-card {
  margin-bottom: 20px;
}

.content-textarea {
  margin: 15px 0;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.article-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.article-content {
  flex: 1;
  margin-right: 15px;
}

.article-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.article-content p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
  word-break: break-all;
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>