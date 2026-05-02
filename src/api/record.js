import request from '@/utils/request'

/**
 * 考试记录详情。
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export function recordExamDetail(params) {
  return request({
    url: 'records/exam/detail',
    method: 'get',
    params
  })
}

/**
 * 分页查询考试记录。
 * @param {object} params 分页参数
 * @returns {Promise}
 */
export function recordExamPaging(params) {
  return request({
    url: 'records/exam/paging',
    method: 'get',
    params
  })
}

/**
 * 分页查询练习记录。
 * @param {object} params 分页参数
 * @returns {Promise}
 */
export function recordExercisePaging(params) {
  return request({
    url: 'records/exercise/paging',
    method: 'get',
    params
  })
}

/**
 * 练习记录详情。
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export function recordExerciseDetail(params) {
  return request({
    url: 'records/exercise/detail',
    method: 'get',
    params
  })
}
