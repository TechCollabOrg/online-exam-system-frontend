import request from '@/utils/request'

/**
 * 阅卷 API：待阅考试、待阅考生、作答明细、批量打分。
 */

/**
 * 分页查询考试答卷列表（阅卷端）。
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export function answerExamPging(params) {
  return request({
    url: 'answers/exam/page',
    method: 'get',
    params
  })
}

/**
 * 分页查询某学生的考试答卷。
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export function answerUserPging(params) {
  return request({
    url: 'answers/exam/stu',
    method: 'get',
    params
  })
}

/**
 * 查询答卷详情。
 * @param {object} params 查询参数（含答卷 id 等）
 * @returns {Promise}
 */
export function answerDetail(params) {
  return request({
    url: 'answers/detail',
    method: 'get',
    params
  })
}

/**
 * 主观题批改提交。
 * @param {object} data 批改结果
 * @returns {Promise}
 */
export function correct(data) {
  return request({
    url: 'answers/correct',
    method: 'put',
    data
  })
}
