<template>
  <div class="blog-manage-container">
    <!-- 简单的顶部返回栏 -->
    <div class="top-bar">
      <h2>博客管理 / 新增文章</h2>

      <el-button type="primary" link @click="router.push('/home')">
        <el-icon><ArrowLeft /></el-icon> 
        <span style="margin-left: 5px;">返回首页</span>
      </el-button>
      
    </div>

    <div class="manage-content">
      <!-- 1. 文章增加区域 (保留) -->
      <el-card class="input-card">
        <template #header>
          <span>发布新文章</span>
        </template>
        <el-input
          v-model="title"
          placeholder="请输入标题"
          clearable
          style="margin-bottom: 15px;"
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
          <input 
            ref="fileInputRef"
            type="file" 
            multiple 
            accept=".jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
            style="display: none"
            @change="handleFileChange"
          />
          
          <div v-if="attachments.length > 0" class="file-list-preview">
            <div v-for="(file, index) in attachments" :key="index" class="file-item">
              <span class="file-name">{{ file.name }}</span>
              <el-button type="danger" link size="small" @click="removeAttachment(index)">删除</el-button>
            </div>
          </div>
        </div>
        
        <el-button :loading="blogStore.loading" type="primary" @click="handleAdd">添加文章</el-button>
      </el-card>

      <!-- 2. 文章列表区域 (保留) -->
      <el-card class="list-card" style="margin-top: 20px;">
        <template #header>
          <span>已发布文章 ({{ blogStore.articles.length }})</span>
        </template>
        <div v-if="blogStore.articles.length === 0" class="empty-tip">
          暂无文章
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
                  {{ article.attachments.length }} 个附件
                </span>
              </div>
              <p>{{ article.content }}</p>
            </div>
            <!-- 管理页面始终显示删除按钮 -->
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

    <!-- 附件查看对话框 (复用) -->
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/stores/blog'
import { ArrowLeft, Plus, Paperclip, Document, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const blogStore = useBlogStore()

// 表单数据
const title = ref('')
const content = ref('')
const attachments = ref([])
const fileInputRef = ref(null)

// 附件对话框
const dialogVisible = ref(false)
const currentAttachments = ref([])

// 方法：触发上传
const triggerFileUpload = () => {
  fileInputRef.value.click()
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    attachments.value.push(...files)
  }
  event.target.value = ''
}

const removeAttachment = (index) => {
  attachments.value.splice(index, 1)
}

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

const handleDelete = (id) => {
  blogStore.deleteArticle(id)
}

const handleSizeChange = (val) => {
  blogStore.fetchArticles(1, val)
}

const handleCurrentChange = (val) => {
  blogStore.fetchArticles(val, blogStore.pageSize)
}

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

onMounted(() => {
  if (blogStore.articles.length === 0) {
    blogStore.fetchArticles(1, 10)
  }
})
</script>

<style scoped>
.blog-manage-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.top-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

  justify-content: space-between;
}

.top-bar h2 {
  margin: 0 0 0 15px;
  font-size: 18px;
  color: #303133;
}

/* .manage-content { */
  /* 内容区域 */
/* } */

.input-card, .list-card {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
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

.attachment-indicator {
  font-size: 14px;
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
  display: inline-flex;
  align-items: center;
  gap: 4px;
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

/* 对话框样式 */
.dialog-attachment-list { display: flex; flex-direction: column; gap: 10px; }
.dialog-attachment-item { display: flex; align-items: center; padding: 8px 12px; background-color: #f5f7fa; border-radius: 4px; cursor: pointer; transition: background-color 0.2s; }
.dialog-attachment-item:hover { background-color: #e4e7ed; }
.attachment-name { flex: 1; margin: 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.download-icon { color: #409eff; }
.empty-attachment { text-align: center; color: #909399; padding: 20px; }
</style>