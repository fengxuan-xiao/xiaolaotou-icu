import request from '@/utils/request'

export function getArticles() {
  return request({
    url: '/api/articles',
    method: 'get'
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