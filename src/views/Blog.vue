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
        <el-menu-item index="/elasticsearch">
          <el-icon><Document /></el-icon>
          <span>Excle批量导入模块</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <!-- 主内容区域 -->
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
              <!-- 修改点：标题和附件指示器在同一行 -->
              <div class="article-header">
                <h3 class="article-title">{{ article.title }}</h3>
                
                <!-- 如果有附件，显示带下划线的图标/文字 -->
                <span 
                  v-if="article.attachments && article.attachments.length > 0" 
                  class="attachment-indicator"
                  @click="showAttachments(article)"
                >
                  <el-icon><Paperclip /></el-icon>
                  {{ article.attachments.length }} 个附件
                </span>
              </div>

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

    <!-- 附件查看对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="附件列表"
      width="30%"
    >
      <div v-if="currentAttachments && currentAttachments.length > 0" class="dialog-attachment-list">
        <div 
          v-for="(att, index) in currentAttachments" 
          :key="index" 
          class="dialog-attachment-item"
          @click="downloadAttachment(att)"
        >
          <el-icon><Document /></el-icon>
          <span class="attachment-name">{{ att.fileName }}</span>
          <el-icon class="download-icon"><Download /></el-icon>
        </div>
      </div>
      <div v-else class="empty-attachment">
        暂无附件
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/stores/blog'
// 引入所需图标
import { Menu, HomeFilled, DataLine, Document, Plus, Paperclip, Download } from '@element-plus/icons-vue'
import { ElMessage, ElDialog } from 'element-plus'
import axios from 'axios' // 用于下载文件

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

// 附件对话框状态
const dialogVisible = ref(false)
const currentAttachments = ref([])

// 计算当前页面标题
const getCurrentTitle = computed(() => {
  if (route.path === '/report') return '统计报表'
  if (route.path === '/visualization') return '数据可视化'
  if (route.path === '/rabbitmq') return '消息队列'
  if (route.path === '/elasticsearch') return '模糊查询'
  if (route.path === '/excelbatch') return 'excel批量处理'
  return '我的日记博客'
})

// 计算当前激活的菜单项
const activeMenuIndex = computed(() => {
  if (route.path === '/report') return '/report'
  if (route.path === '/visualization') return '/visualization'
  if (route.path === '/rabbitmq') return '/rabbitmq'
  if (route.path === '/elasticsearch') return '/elasticsearch'
  if (route.path === '/excelbatch') return '/excelbatch'
  return '/home'
})

// 菜单选择处理
const handleMenuSelect = (index) => {
  drawerVisible.value = false
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
  const success = await blogStore.addArticle(title.value, content.value, attachments.value)
  if (success) {
    title.value = ''
    content.value = ''
    attachments.value = []
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
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

// 【新增】显示附件列表
const showAttachments = (article) => {
  //debugger;
  console.log('Current Article Attachments:', article.attachments);
  currentAttachments.value = article.attachments || []
  dialogVisible.value = true
}

// 【新增】下载附件 - 使用 Axios Blob 方式以支持跨域重命名
const downloadAttachment = async (attachment) => {
  if (!attachment.filePath) {
    ElMessage.warning('附件路径不存在')
    return
  }

  try {
    // 1. 构造完整的文件 URL
    let fileUrl = attachment.filePath
    
    // 获取后端基础地址 (去掉 /api 前缀，因为静态资源通常不在 /api 下)
    const apiBase = import.meta.env.VITE_APP_BASE_API || ''
    // 假设 VITE_APP_BASE_API 是 http://localhost:8080/api 或 /api
    // 我们需要提取出 http://localhost:8080
    let backendOrigin = ''
    if (apiBase.startsWith('http')) {
      backendOrigin = apiBase.replace(/\/api$/, '')
    } else {
      // 如果是相对路径 /api，则使用当前页面的 origin 替换端口为后端端口？
      // 更稳妥的方式是直接硬编码后端地址，或者确保环境变量配置正确
      // 这里假设后端就在 8080
      backendOrigin = 'http://localhost:8080' 
    }

    if (!fileUrl.startsWith('http')) {
      const cleanPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`
      fileUrl = `${backendOrigin}/uploads${cleanPath}`
    }
    
    console.log('Fetching file from:', fileUrl)

    // 2. 使用 Axios 获取 Blob 数据
    // 注意：如果后端静态资源允许匿名访问，不需要带 Token；如果需要鉴权，请保留 headers
    const response = await axios.get(fileUrl, {
      responseType: 'blob', // 关键：指定响应类型为 blob
      // headers: {
      //   'Authorization': `Bearer ${localStorage.getItem('token')}`
      // }
    })

    // 3. 创建 Blob 对象
    const blob = new Blob([response.data])
    
    // 4. 创建下载链接
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    
    // 【关键】这里设置的文件名一定会生效，因为是本地 Blob URL
    link.download = attachment.fileName
    
    // 5. 触发下载
    document.body.appendChild(link)
    link.click()
    
    // 6. 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(link.href)
    
    ElMessage.success('开始下载')
  } catch (error) {
    console.error('Download failed:', error)
    // 如果 Axios 失败（例如跨域被拦截），可以尝试回退到直接链接方式
    // 但直接链接方式无法自定义文件名
    ElMessage.error('下载失败，可能是跨域限制或网络错误')
  }
}

// 组件挂载时加载后端数据
onMounted(() => {
  if (route.path === '/' || route.path === '/blog') {
     if (blogStore.articles.length === 0) {
      blogStore.fetchArticles(1, 10)
    }
  }
})
</script>

<style scoped>
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

/* 新增样式：文章头部容器 */
.article-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.article-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: bold;
}

/* 新增样式：附件指示器（带下划线） */
.attachment-indicator {
  font-size: 14px;
  color: #409eff;
  cursor: pointer;
  text-decoration: underline; /* 下划线 */
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.attachment-indicator:hover {
  color: #66b1ff;
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 对话框内附件列表样式 */
.dialog-attachment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dialog-attachment-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dialog-attachment-item:hover {
  background-color: #e4e7ed;
}

.attachment-name {
  flex: 1;
  margin: 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-icon {
  color: #409eff;
}

.empty-attachment {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>