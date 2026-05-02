import request from '@/utils/request'

/**
 * 错题本 API：分页、按考试列错题、单题详情、巩固作答提交。
 */

/**
 * 获取某场考试下的错题本题目列表。
 * @param {string|number} examId 考试 id
 * @returns {Promise}
 */
export function getUserBookList(examId) {
  return request({
    url: 'userbooks/question/list/' + examId,
    method: 'get'
  })
}

/**
 * 分页查询错题本记录。
 * @param {object} params 分页参数
 * @returns {Promise}
 */
export function userbookPaging(params) {
  return request({
    url: 'userbooks/paging',
    method: 'get',
    params
  })
}

/**
 * 错题本中单题详情。
 * @param {string|number} quId 题目 id
 * @returns {Promise}
 */
export function getSingleQu(quId) {
  return request({
    url: 'userbooks/question/single/' + quId,
    method: 'get'
  })
}

/**
 * 提交错题再练作答。
 * @param {object} data 作答数据
 * @returns {Promise}
 */
export function fullBook(data) {
  return request({
    url: 'userbooks/full-book',
    method: 'post',
    data
  })
}
