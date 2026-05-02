
import request from '@/utils/request'

/**
 * 新增单题。
 * @param {object} data 题目数据
 * @returns {Promise}
 */
export function quAdd(data) {
  return request({
    url: 'questions/single',
    method: 'post',
    data
  })
}

/**
 * 分页查询题目。
 * @param {object} params 分页与筛选
 * @returns {Promise}
 */
export function quPaging(params) {
  return request({
    url: 'questions/paging',
    method: 'get',
    params
  })
}

/**
 * 更新题目。
 * @param {string|number} id 题目 id
 * @param {object} data 题目数据
 * @returns {Promise}
 */
export function quUpdate(id, data) {
  return request({
    url: `questions/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 批量删除题目。
 * @param {string} ids 题目 id 列表
 * @returns {Promise}
 */
export function quDel(ids) {
  return request({
    url: 'questions/batch/' + ids,
    method: 'delete'
  })
}

/**
 * 单题详情。
 * @param {string|number} id 题目 id
 * @returns {Promise}
 */
export function quDetail(id) {
  return request({
    url: `questions/single/${id}`,
    method: 'get'
  })
}

/**
 * 向题库导入题目（如 Excel）。
 * @param {string|number} id 题库 id
 * @param {FormData|object} data 上传数据
 * @returns {Promise}
 */
export function importQue(id, data) {
  return request({
    url: `questions/import/${id}`,
    method: 'post',
    data
  })
}

/**
 * 遗留接口：题库详情（依赖全局 post，与主 axios 封装并存）。
 * @param {string|number} id 题库 id
 * @returns {Promise}
 */
export function fetchDetail(id) {
  // eslint-disable-next-line no-undef
  return post('/exam/api/qu/qu/detail', { id: id })
}

/**
 * 遗留接口：保存题库（依赖全局 post）。
 * @param {object} data 题库数据
 * @returns {Promise}
 */
export function saveData(data) {
  // eslint-disable-next-line no-undef
  return post('/exam/api/qu/qu/save', data)
}
