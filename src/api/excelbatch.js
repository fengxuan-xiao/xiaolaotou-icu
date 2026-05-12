import request from '@/utils/request' // 假设你有一个封装好的 axios 实例

/**
 * 下载导入模板
 */
export function downloadTemplate() {
  return request({
    url: '/excelbatch/import/template/download',
    method: 'get',
    responseType: 'blob' // 重要：指定响应类型为 blob
  })
}

/**
 * 批量导入 Excel
 * @param {File} file - 选择的 excel 文件
 */
export function batchImport(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/excelbatch/import/batch',
    method: 'post',
    data: formData,
    // headers: {
    //   'Content-Type': 'multipart/form-data'
    // }
  })
}

/**
 * 查询导入记录列表
 * @param {Object} params - 查询参数 { pageNum, pageSize, type: 'SUCCESS'|'FAIL', keyword... }
 */
export function getImportList(params) {
  return request({
    url: '/excelbatch/import/list',
    method: 'get',
    params
  })
}