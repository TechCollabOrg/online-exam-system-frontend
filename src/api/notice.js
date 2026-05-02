
import request from '@/utils/request'

/**
 * 新增公告。
 * @param {object} data 公告内容
 * @returns {Promise}
 */
export function noticeAdd(data) {
  return request({
    url: 'notices',
    method: 'post',
    data
  })
}

/**
 * 分页查询公告。
 * @param {object} params 分页参数
 * @returns {Promise}
 */
export function noticePaging(params) {
  return request({
    url: 'notices/paging',
    method: 'get',
    params
  })
}

/**
 * 删除公告。
 * @param {string|number} id 公告 id
 * @returns {Promise}
 */
export function noticeDel(id) {
  return request({
    url: 'notices/' + id,
    method: 'delete'
  })
}

/**
 * 更新公告。
 * @param {string|number} id 公告 id
 * @param {object} data 公告内容
 * @returns {Promise}
 */
export function noticeUpdate(id, data) {
  return request({
    url: 'notices/' + id,
    method: 'put',
    data
  })
}

/**
 * 获取最新公告列表。
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export function noticeGetNew(params) {
  return request({
    url: 'notices/new',
    method: 'get',
    params
  })
}
