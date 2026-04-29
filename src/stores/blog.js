import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getArticles, addArticle as apiAddArticle, deleteArticle as apiDeleteArticle } from '@/api/blog'
import { ElMessage } from 'element-plus'

export const useBlogStore = defineStore('blog', () => {
  const articles = ref([])
  const loading = ref(false)

  // 获取文章
  async function fetchArticles() {
    debugger;
    loading.value = true
    try {
      const res = await getArticles()
      // 假设 res.data 是数组
      articles.value = res.data || []
    } catch (error) {
      console.error('Fetch articles failed', error)
    } finally {
      loading.value = false
    }
  }

  // 添加文章
  async function addArticle(title, content) {
    if (!title.trim() || !content.trim()) {
      ElMessage.warning('标题和内容不能为空')
      return false
    }
    
    loading.value = true
    try {
      const res = await apiAddArticle({ title: title.trim(), content: content.trim() })
      // 假设返回的是新创建的文章对象
      articles.value.push(res.data)
      ElMessage.success('添加成功')
      return true
    } catch (error) {
      return false
    } finally {
      loading.value = false
    }
  }

  // 删除文章
  async function deleteArticle(id) {
    loading.value = true
    try {
      debugger;
      await apiDeleteArticle(id)
      articles.value = articles.value.filter(item => item.id !== id)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('Delete failed', error)
    } finally {
      loading.value = false
    }
  }

  return { articles, loading, fetchArticles, addArticle, deleteArticle }
})