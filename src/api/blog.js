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

   // 判断 data 是否是 FormData 实例
  const isFormData = data instanceof FormData
  console.log(isFormData)

  return request({
    url: '/api/articles',
    method: 'post',
    data: data,
    // 如果是 FormData，axios 会自动设置 Content-Type 为 multipart/form-data 并添加 boundary
    // 如果显式设置 headers，请确保不要手动设置 Content-Type，让浏览器自动处理 boundary
    // headers: isFormData ? {
    //   'Content-Type': 'multipart/form-data'
    // } : {
    //   'Content-Type': 'application/json'
    // }
    // 【关键修改】如果是 FormData，不要手动设置 Content-Type！
    // Axios 会自动识别 FormData 并设置正确的 "multipart/form-data; boundary=..."
    // 如果手动设置，会丢失 boundary，导致后端解析失败 (415/400)
    // headers: isFormData ? {} : {
    //   'Content-Type': 'multipart/form-data'
    // }
  })
}

export function deleteArticle(id) {
  return request({
    url: `/api/articles/${id}`,
    method: 'delete'
  })
}