import request from '@/utils/request'

/**
 * 查询我的待办任务
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {'first_check' | 'recheck'} params.taskType - 任务类型
 */
export function getMyTodoTasks(params) {
  return request({
    url: '/audit/todo/list',
    method: 'get',
    params
  })
}

/**
 * 提交审批 (通过/驳回)
 * @param {Object} data - 提交数据
 * @param {string|number} data.taskId - 任务ID
 * @param {string} data.processInstanceId - 流程实例ID
 * @param {boolean} data.approved - 是否通过
 * @param {string} data.comment - 审批意见
 */
export function submitAudit(data) {
  return request({
    url: '/audit/approve',
    method: 'post',
    data
  })
}

/**
 * 查询文章审核进度和历史记录
 * @param {string|number} articleId - 文章ID
 */
export function getAuditHistory(articleId) {
  return request({
    url: `/audit/history/${articleId}`,
    method: 'get'
  })
}

/**
 * 启动审核流程 (作者提交文章时调用)
 * @param {string|number} articleId - 文章ID
 */
export function startAuditProcess(articleId) {
  return request({
    url: `/audit/start/${articleId}`,
    method: 'post'
  })
}