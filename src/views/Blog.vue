<template>
  <div class="blog-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <el-button type="primary" link @click="drawerVisible = true" class="menu-btn">
        <el-icon :size="20"><Menu /></el-icon>
        <span class="menu-text">菜单</span>
      </el-button>
      <h1 class="page-title">{{ getCurrentTitle }}</h1>
    </div>

    <!-- 侧边栏抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="导航菜单"
      direction="ltr"
      size="200px"
    >
      <el-menu
        :default-active="activeMenuIndex"
        class="el-menu-vertical-demo"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页 (博客)</span>
        </el-menu-item>
        <el-menu-item index="/visualization">
          <el-icon><DataLine /></el-icon>
          <span>可视化模块</span>
        </el-menu-item>
        <el-menu-item index="/report">
          <el-icon><Document /></el-icon>
          <span>报表模块</span>
        </el-menu-item>
        <el-menu-item index="/rabbitmq">
          <el-icon><Document /></el-icon>
          <span>消息队列模块</span>
        </el-menu-item>
        <el-menu-item index="/elasticsearch">
          <el-icon><Document /></el-icon>
          <span>ES模糊查询模块</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <!-- 主内容区域：现在只保留博客功能，因为其他模块通过路由跳转 -->
    <div class="module-content">
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
          placeholder="请输入内容"
          class="content-textarea"
        />

        <!-- 附件选择区域 -->
        <div class="attachment-area">
          <el-button type="success" plain @click="triggerFileUpload">
            <el-icon><Plus /></el-icon> 添加附件 (图片/Word/Excel)
          </el-button>
          <!-- 隐藏的文件输入框 -->
          <input 
            ref="fileInputRef"
            type="file" 
            multiple 
            accept=".jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
            style="display: none"
            @change="handleFileChange"
          />
          
          <!-- 显示已选文件列表 -->
          <div v-if="attachments.length > 0" class="file-list-preview">
            <div v-for="(file, index) in attachments" :key="index" class="file-item">
              <span class="file-name">{{ file.name }}</span>
              <el-button type="danger" link size="small" @click="removeAttachment(index)">删除</el-button>
            </div>
          </div>
        </div>
        
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

              <div v-if="article.attachments && article.attachments.length > 0" class="article-attachments">
                <div class="attachment-label">附件：</div>
                <div v-for="(att, idx) in article.attachments" :key="idx" class="file-item-display">
                  📎 {{ att.name }}
                </div>
              </div>

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

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router' // 引入路由钩子
import { useBlogStore } from '@/stores/blog'
// 引入所需图标
import { Menu, HomeFilled, DataLine, Document, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus' // 确保引入 ElMessage

// 使用 store
const blogStore = useBlogStore()
const route = useRoute()
const router = useRouter()

// 导航状态
const drawerVisible = ref(false)

// 表单数据
const title = ref('')
const content = ref('')
const attachments = ref([])
const fileInputRef = ref(null)

// 计算当前页面标题
const getCurrentTitle = computed(() => {
  // 可以根据路由 meta 信息动态获取标题，或者简单映射
  if (route.path === '/report') return '统计报表'
  if (route.path === '/visualization') return '数据可视化'
  if (route.path === '/rabbitmq') return '消息队列'
  if (route.path === '/elasticsearch') return '模糊查询'
  return '我的日记博客'
})

// 计算当前激活的菜单项，基于当前路由路径
const activeMenuIndex = computed(() => {
  if (route.path === '/report') return '/report'
  if (route.path === '/visualization') return '/visualization'
  if (route.path === '/rabbitmq') return '/rabbitmq'
  if (route.path === '/elasticsearch') return '/elasticsearch'
  return '/home' // 默认首页
})

// 菜单选择处理：改为路由跳转
const handleMenuSelect = (index) => {
  drawerVisible.value = false // 选择后关闭抽屉
  
  if (index === '/home') {
    router.push('/')
  } else {
    router.push(index)
  }
}

// 触发文件选择
const triggerFileUpload = () => {
  fileInputRef.value.click()
}

// 处理文件选择
const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    attachments.value.push(...files)
  }
  event.target.value = ''
}

// 移除某个附件
const removeAttachment = (index) => {
  attachments.value.splice(index, 1)
}

// 添加文章
const handleAdd = async () => {
  // debugger; // 生产环境请移除
  const success = await blogStore.addArticle(title.value, content.value)
  if (success) {
    title.value = ''
    content.value = ''
    //ElMessage.success('添加成功')
  }
}

// 删除文章
const handleDelete = (id) => {
  blogStore.deleteArticle(id)
}

// 分页事件处理
const handleSizeChange = (val) => {
  blogStore.fetchArticles(1, val)
}

const handleCurrentChange = (val) => {
  blogStore.fetchArticles(val, blogStore.pageSize)
}

// 组件挂载时加载后端数据
onMounted(() => {

  // 只有当当前路由是首页时才加载文章
  if (route.path === '/' || route.path === '/blog') {
     if (blogStore.articles.length === 0) {
      blogStore.fetchArticles(1, 10)
    }
  }
})
</script>

<style scoped>
/* 样式保持不变，略 */
.blog-container {
  max-width: 1000px; 
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  position: relative;
}

.top-nav {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.menu-btn {
  margin-right: 15px;
  font-size: 16px;
}

.menu-text {
  margin-left: 5px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.module-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.input-card {
  margin-bottom: 20px;
}

.content-textarea {
  margin: 15px 0;
}

.attachment-area {
  margin-top: 10px;
  margin-bottom: 15px;
}

.file-list-preview {
  margin-top: 10px;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
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

.article-attachments {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
}

.attachment-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.file-item-display {
  font-size: 13px;
  color: #409eff;
  margin-bottom: 2px;
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>