import request from '@/utils/request'

/**
 * 刷题练习 API：可刷题库分页、抽题卡、提交作答等。
 */

/**
 * 分页获取题库练习入口列表。
 * @param {object} params 分页参数
 * @returns {Promise}
 */
export function exercisePaging(params) {
  return request({
    url: 'exercises/getRepo',
    method: 'get',
    params
  })
}

/**
 * 在指定题库下分页拉取题目。
 * @param {object} params 分页参数
 * @param {string|number} repoId 题库 id
 * @returns {Promise}
 */
export function getQuestion(params, repoId) {
  return request({
    url: 'exercises/' + repoId,
    method: 'get',
    params
  })
}

/**
 * 练习模式下单题详情。
 * @param {string|number} id 题目 id
 * @returns {Promise}
 */
export function getQuestionDetail(id) {
  return request({
    url: `exercises/question/${id}`,
    method: 'get'
  })
}

/**
 * 提交练习答案。
 * @param {object} data 作答数据
 * @returns {Promise}
 */
export function submitAnswer(data) {
  return request({
    url: `exercises/fillAnswer`,
    method: 'post',
    data
  })
}

/**
 * 查询某题在练习中的作答记录。
 * @param {string|number} repoId 题库 id
 * @param {string|number} quId 题目 id
 * @returns {Promise}
 */
export function getAnswerInfo(repoId, quId) {
  return request({
    url: `exercises/answerInfo/${repoId}/${quId}`,
    method: 'get'
  })
}
