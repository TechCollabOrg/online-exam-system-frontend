import { post } from '@/utils/request'

/**
 * 通用 POST 分页或列表查询。
 * @param {string} url 接口路径
 * @param {object} query 请求体
 * @returns {Promise}
 */
export function fetchList(url, query) {
  return post(url, query)
}

/**
 * 通用 POST 按 id 查询详情。
 * @param {string} url 接口路径
 * @param {string|number} id 主键
 * @returns {Promise}
 */
export function fetchDetail(url, id) {
  return post(url, { 'id': id })
}

/**
 * 通用 POST 保存（新增或更新）。
 * @param {string} url 接口路径
 * @param {object} data 表单数据
 * @returns {Promise}
 */
export function saveData(url, data) {
  return post(url, data)
}

/**
 * 通用 POST 批量删除。
 * @param {string} url 接口路径
 * @param {string} ids id 列表（多为逗号分隔）
 * @returns {Promise}
 */
export function deleteData(url, ids) {
  return post(url, { 'ids': ids })
}

/**
 * 通用 POST 批量变更状态。
 * @param {string} url 接口路径
 * @param {string} ids id 列表
 * @param {*} state 目标状态
 * @returns {Promise}
 */
export function changeState(url, ids, state) {
  return post(url, { 'ids': ids, 'state': state })
}
