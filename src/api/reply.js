
import request from '@/utils/request'

/**
 * 发表回复。
 * @param {object} data 回复内容
 * @returns {Promise}
 */
export function replyAdd(data) {
  return request({
    url: 'reply/add',
    method: 'post',
    data
  })
}

/**
 * 删除回复。
 * @param {string|number} id 回复 id
 * @returns {Promise}
 */
export function replyDel(id) {
  return request({
    url: `reply/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 查询回复列表（按讨论 id）。
 * @param {string|number} id 讨论 id
 * @returns {Promise}
 */
export function replyquery(id) {
  return request({
    url: `reply/query/${id}`,
    method: 'get'
  })
}
