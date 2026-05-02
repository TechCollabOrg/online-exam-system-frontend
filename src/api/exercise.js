/*
 * @Author: 魏进 3413105907@qq.com
 * @Date: 2024-05-16 14:11:11
 * @LastEditors: 魏进 3413105907@qq.com
 * @LastEditTime: 2024-06-06 18:28:44
 * @FilePath: \online-exam-system-frontend\src\api\exercise.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'

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
