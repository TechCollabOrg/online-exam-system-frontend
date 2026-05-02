import request from '@/utils/request'

/**
 * 题库 API：增删改查、分页、刷题入口列表、下拉选项。
 */

/**
 * 新建题库。
 * @param {object} data 题库信息
 * @returns {Promise}
 */
export function repoAdd(data) {
  return request({
    url: 'repo',
    method: 'post',
    data
  })
}

/**
 * 分页查询题库。
 * @param {object} params 分页参数
 * @returns {Promise}
 */
export function repoPaging(params) {
  return request({
    url: 'repo/paging',
    method: 'get',
    params
  })
}

/**
 * 删除题库。
 * @param {string|number} id 题库 id
 * @returns {Promise}
 */
export function repoDel(id) {
  return request({
    url: 'repo/' + id,
    method: 'delete'
  })
}

/**
 * 更新题库。
 * @param {string|number} id 题库 id
 * @param {object} data 题库数据
 * @returns {Promise}
 */
export function repoUpdate(id, data) {
  return request({
    url: 'repo/' + id,
    method: 'put',
    data
  })
}

/**
 * 获取题库简要列表（下拉/选择用）。
 * @param {object} params 筛选参数
 * @returns {Promise}
 */
export function fetchPaging(params) {
  return request({
    url: 'repo/list',
    method: 'get',
    params
  })
}
