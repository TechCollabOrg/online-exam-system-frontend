import request from '@/utils/request'

/**
 * 成绩 API：分页查询、导出、单场考试得分明细。
 */

/**
 * 分页查询成绩列表。
 * @param {object} params 分页与考试/班级筛选
 * @returns {Promise}
 */
export function scorePaging(params) {
  return request({
    url: 'score/paging',
    method: 'get',
    params
  })
}

/**
 * 查询某场考试的成绩明细。
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export function getExamScore(params) {
  return request({
    url: 'score/getExamScore',
    method: 'get',
    params
  })
}

/**
 * 导出成绩 Excel。
 * @param {string|number} examId 考试 id
 * @param {string|number} gradeId 班级 id
 * @returns {Promise<Blob>}
 */
export function exportScores(examId, gradeId) {
  return request({
    url: `score/export/${examId}/${gradeId}`,
    method: 'get',
    responseType: 'blob'
  })
}
