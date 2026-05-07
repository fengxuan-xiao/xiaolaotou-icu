import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getArticles, addArticle as apiAddArticle, deleteArticle as apiDeleteArticle } from '@/api/blog'
import { ElMessage } from 'element-plus'

export const useBlogStore = defineStore('blog', () => {
  const articles = ref([])
  const loading = ref(false)


  // 新增分页状态
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  // 获取文章
  async function fetchArticles(page = 1, size = 10) {
    debugger;
    loading.value = true
    try {
      // 调用 API 传入分页参数
      const res = await getArticles({ page, pageSize: size })

      //const res = await getArticles()
      // 假设 res.data 是数组
      //articles.value = res.data || []
      // 假设后端返回结构为 { data: { list: [], total: 0 } }
      // 请根据实际后端返回结构调整以下代码
      if (res.data) {
        articles.value = res.data.list || []
        total.value = res.data.total || 0
        currentPage.value = page
        pageSize.value = size
      }
    } catch (error) {
      console.error('Fetch articles failed', error)
    } finally {
      loading.value = false
    }
  }

  // 添加文章
  async function addArticle(title, content) {
    debugger;
    if (!title.trim() || !content.trim()) {
      ElMessage.warning('标题和内容不能为空')
      return false
    }
    
    loading.value = true
    console.log('Before API call');
    try {
      const res = await apiAddArticle({ title: title.trim(), content: content.trim() })
      console.log('API Response:', res);
      // 假设返回的是新创建的文章对象
      //articles.value.push(res.data)
      // 添加成功后，通常建议刷新第一页或者重新获取当前页
      // 这里简单处理：重新获取第一页，或者你可以选择 unshift 到列表头部并 total+1
      await fetchArticles(1, pageSize.value) 
      ElMessage.success('添加成功')
      return true
    } catch (error) {
      console.error('API Error:', error);
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
      //articles.value = articles.value.filter(item => item.id !== id)
      // 删除后，如果当前页数据为空且不是第一页，建议跳回上一页
      // 这里简单处理：刷新当前页
      await fetchArticles(currentPage.value, pageSize.value)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('Delete failed', error)
    } finally {
      loading.value = false
    }
  }

  return { articles, loading,
    total,       // 暴露总条数
    currentPage, // 暴露当前页
    pageSize,    // 暴露每页大小 
    fetchArticles, addArticle, deleteArticle }
})