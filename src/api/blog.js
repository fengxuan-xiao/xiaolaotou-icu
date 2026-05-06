import request from '@/utils/request'

// 1. 添加 params 参数，并设置默认值为空对象 {}
export function getArticles(params = {}) {
  return request({
    url: '/api/articlesPage',
    method: 'get',
    params // 自动将对象序列化为 URL 查询参数 ?page=1&pageSize=10
  })
}

export function addArticle(data) {
  return request({
    url: '/api/articles',
    method: 'post',
    data
  })
}

export function deleteArticle(id) {
  return request({
    url: `/api/articles/${id}`,
    method: 'delete'
  })
}