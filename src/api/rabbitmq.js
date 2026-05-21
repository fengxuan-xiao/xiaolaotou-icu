import request from '@/utils/request' // 假设你有一个封装好的 axios 实例，如果没有可以用 axios

// ================= 社保消息接口 =================

/**
 * 获取社保消息列表
 * @param {Object} params - { status: 'unsent'|'sent_pending'|'success'|'failed', page, size }
 */
export function getSocialMsgList(params) {
  return request({
    url: '/rabbitmq/social/list',
    method: 'get',
    params
  })
}

/**
 * 发送社保消息
 */
export function sendSocialMsg(id) {
  return request({
    url: `/rabbitmq/social/send/${id}`,
    method: 'post'
  })
}

/**
 * 重发社保消息
 */
export function resendSocialMsg(id) {
  return request({
    url: `/rabbitmq/social/resend/${id}`,
    method: 'post'
  })
}

/**
 * 丢弃社保消息
 */
export function discardSocialMsg(id) {
  return request({
    url: `/rabbitmq/social/discard/${id}`,
    method: 'post'
  })
}

// ================= 税务消息接口 =================

/**
 * 获取税务消息列表
 * @param {Object} params - { status: 'unprocessed'|'processed', page, size }
 */
export function getTaxMsgList(params) {
  return request({
    url: '/rabbitmq/tax/list',
    method: 'get',
    params
  })
}

/**
 * 处理税务消息 (成功或失败)
 * @param {Object} data - { id, result: 0|1, msg: string }
 */
export function processTaxMsg(data) {
  return request({
    url: `/rabbitmq/tax/process/${data.id}`,
    method: 'post',
    data: {
      result: data.result,
      msg: data.msg
    }
  })
}