<template>
  <div class="home-drawer-container">
    <!-- 1. 顶部独立导航栏 (类似 test.vue) -->
    <div class="top-nav">
      <el-button type="primary" link @click="drawerVisible = true" class="menu-btn">
        <el-icon :size="20"><Menu /></el-icon>
        <span class="menu-text">菜单</span>
      </el-button>
      <h1 class="page-title">我的博客首页</h1>
      
      <!-- 右上角用户状态 (保持 Home 原有逻辑) -->
      <div class="nav-right">
        <div v-if="userStore.isLoggedIn" class="user-info">
          <el-avatar :size="28" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <span class="username">{{ userStore.userInfo?.username || 'User' }}</span>
          <el-button link type="primary" size="small" @click="handleLogout">退出</el-button>
        </div>
        
        <div v-else class="login-tip" @click="goToLogin">
          <el-icon><User /></el-icon>
          <span>未登录 (点击登录)</span>
        </div>
      </div>
    </div>

    <!-- 2. 侧边栏抽屉 (类似 test.vue) -->
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
        
        <!-- 博客管理入口 -->
        <el-menu-item index="/blog">
          <el-icon><Edit /></el-icon>
          <span>博客新增/管理</span>
        </el-menu-item>

        <el-menu-item index="/visualization" :disabled="!userStore.isLoggedIn">
          <el-icon><DataLine /></el-icon>
          <span>可视化模块</span>
        </el-menu-item>
        
        <el-menu-item index="/report" :disabled="!userStore.isLoggedIn">
          <el-icon><TrendCharts /></el-icon>
          <span>统计报表</span>
        </el-menu-item>

        <el-menu-item index="/excelbatch" :disabled="!userStore.isLoggedIn">
          <el-icon><Upload /></el-icon>
          <span>批量导入</span>
        </el-menu-item>

        <el-menu-item index="/rabbitmq" :disabled="!userStore.isLoggedIn">
          <el-icon><Operation /></el-icon>
          <span>消息队列模块</span>
        </el-menu-item>

        <el-menu-item index="/elasticsearch" :disabled="!userStore.isLoggedIn">
          <el-icon><Search /></el-icon>
          <span>ES模糊查询</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <!-- 3. 主内容区域：仅博客列表 (Home 原有逻辑) -->
    <div class="main-content">
      <el-card class="list-card">
        <template #header>
          <div class="card-header">
            <span>最新文章 ({{ blogStore.total }})</span>
            <!-- 如果已登录，显示一个快速新增按钮 -->
            <el-button v-if="userStore.isLoggedIn" type="primary" size="small" @click="router.push('/blog')">
              + 新增文章
            </el-button>
          </div>
        </template>
        
        <div v-if="blogStore.loading" class="loading-tip">加载中...</div>
        
        <div v-else-if="blogStore.articles.length === 0" class="empty-tip">
          暂无文章，登录后点击右上角“+ 新增文章”添加一篇吧～
        </div>
        
        <div v-else class="article-list">
          <div v-for="article in blogStore.articles" :key="article.id" class="article-item">
            <div class="article-content">
              <div class="article-header">
                <h3 class="article-title">{{ article.title }}</h3>
                <span 
                  v-if="article.attachments && article.attachments.length > 0" 
                  class="attachment-indicator"
                  @click="showAttachments(article)"
                >
                  <el-icon><Paperclip /></el-icon>
                  {{ article.attachments.length }} 附件
                </span>
              </div>
              <p class="article-preview">{{ article.content }}</p>
            </div>
            
            <!-- 关键点：只有登录用户才显示删除按钮 -->
            <!-- <el-button 
              v-if="userStore.isLoggedIn" 
              type="danger" 
              link
              size="small" 
              @click="handleDelete(article.id)"
            >
              删除
            </el-button> -->
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
      <div v-else class="empty-attachment">暂无附件</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBlogStore } from '@/stores/blog'
// 引入所需图标 (合并了 test.vue 和 home.vue 的图标)
import { Menu, HomeFilled, Edit, DataLine, TrendCharts, Upload, User, Paperclip, Document, Download , Operation,Search} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const blogStore = useBlogStore()

// 导航状态
const drawerVisible = ref(false)

// 计算当前激活的菜单项 (用于 Drawer 中的高亮)
const activeMenuIndex = computed(() => {
  if (route.path === '/blog') return '/blog'
  if (route.path === '/visualization') return '/visualization'
  if (route.path === '/report') return '/report'
  if (route.path === '/excelbatch') return '/excelbatch'
  return '/home'
})

// 菜单选择处理
const handleMenuSelect = (index) => {
  drawerVisible.value = false
  
  // 权限检查
  if (!userStore.isLoggedIn && index !== '/home' && index !== '/login') {
    ElMessage.warning('请先登录后再访问此功能')
    router.push({ path: '/login', query: { redirect: index } })
    return
  }
  
  router.push(index)
}

// 登录/退出逻辑
const goToLogin = () => {
  router.push({ path: '/login', query: { redirect: '/home' } })
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 列表操作
const handleSizeChange = (val) => {
  blogStore.fetchArticlesHome(1, val)
}

const handleCurrentChange = (val) => {
  blogStore.fetchArticlesHome(val, blogStore.pageSize)
}

const handleDelete = (id) => {
  blogStore.deleteArticle(id)
}

// 附件相关逻辑
const dialogVisible = ref(false)
const currentAttachments = ref([])

const showAttachments = (article) => {
  currentAttachments.value = article.attachments || []
  dialogVisible.value = true
}

const downloadAttachment = async (attachment) => {
  if (!attachment.filePath) {
    ElMessage.warning('附件路径不存在')
    return
  }
  try {
    let fileUrl = attachment.filePath
    const apiBase = import.meta.env.VITE_APP_BASE_API || ''
    let backendOrigin = ''
    if (apiBase.startsWith('http')) {
      backendOrigin = apiBase.replace(/\/api$/, '')
    } else {
      backendOrigin = 'http://localhost:8080' 
    }

    if (!fileUrl.startsWith('http')) {
      const cleanPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`
      fileUrl = `${backendOrigin}/uploads${cleanPath}`
    }
    
    const response = await axios.get(fileUrl, { responseType: 'blob' })
    const blob = new Blob([response.data])
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = attachment.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(link.href)
    ElMessage.success('开始下载')
  } catch (error) {
    console.error('Download failed:', error)
    ElMessage.error('下载失败')
  }
}

// 初始化加载数据
onMounted(() => {
  //if (blogStore.articles.length === 0) {
    blogStore.fetchArticlesHome(1, 10)
  //}
})
</script>

<style scoped>
.home-drawer-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 顶部导航样式 (复刻 test.vue) */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 关键：两端对齐 */
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
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
  font-size: 20px;
  color: #303133;
  font-weight: 600;
  flex: 1; /* 让标题占据中间空间 */
  text-align: left;
  padding-left: 10px;
}

.nav-right {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.login-tip {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #f56c6c;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.3s;
}
.login-tip:hover {
  color: #ff4949;
}

/* 主内容样式 */
.main-content {
  flex: 1;
  max-width: 1000px;
  width: 100%;
  margin: 20px auto;
  padding: 0 20px;
}

.list-card {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.2s;
}
.article-item:hover {
  background-color: #fafafa;
}

.article-content {
  flex: 1;
  margin-right: 15px;
}

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
  font-weight: 600;
}

.attachment-indicator {
  font-size: 12px;
  color: #909399;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.attachment-indicator:hover {
  color: #409EFF;
}

.article-preview {
  margin: 0;
  color: #606266;
  line-height: 1.6;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 旧版 WebKit 浏览器 */
  line-clamp: 2;         /* 标准属性，消除警告 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-tip {
  text-align: center;
  color: #909399;
  padding: 40px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 对话框样式 */
.dialog-attachment-list { display: flex; flex-direction: column; gap: 10px; }
.dialog-attachment-item { display: flex; align-items: center; padding: 8px 12px; background-color: #f5f7fa; border-radius: 4px; cursor: pointer; transition: background-color 0.2s; }
.dialog-attachment-item:hover { background-color: #e4e7ed; }
.attachment-name { flex: 1; margin: 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.download-icon { color: #409eff; }
.empty-attachment { text-align: center; color: #909399; padding: 20px; }
</style>