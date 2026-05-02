import request from '@/utils/request'

/**
 * 考试模块 API：试卷分页、学生开考、组卷题目、证书绑定等（路径相对环境变量 `VUE_APP_BASE_API`）。
 */

/**
 * 教师端分页查询考试列表。
 * @param {object} params 分页与标题筛选
 * @returns {Promise}
 */
export function examPaging(params) {
  return request({
    url: 'exams/paging',
    method: 'get',
    params
  })
}

/**
 * 批量删除考试。
 * @param {string} ids 考试 id，多个逗号分隔
 * @returns {Promise}
 */
export function examDel(ids) {
  return request({
    url: 'exams/' + ids,
    method: 'delete'
  })
}

/**
 * 更新考试信息。
 * @param {string|number} id 考试 id
 * @param {object} data 考试表单
 * @returns {Promise}
 */
export function examUpdate(id, data) {
  return request({
    url: `exams/${id}`,
    method: 'put',
    data
  })
}

/**
 * 查询班级下的考试列表（学生端）。
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export function getGradeExamList(params) {
  return request({
    url: 'exams/grade',
    method: 'get',
    params
  })
}

/**
 * 获取考试详情（规则、时间等）。
 * @param {string|number} examId 考试 id
 * @returns {Promise}
 */
export function getExamDetail(examId) {
  return request({
    url: 'exams/detail?examId=' + examId,
    method: 'get'
  })
}

/**
 * 学生开始考试。
 * @param {string|number} examId 考试 id
 * @returns {Promise}
 */
export function examStart(examId) {
  return request({
    url: 'exams/start?examId=' + examId,
    method: 'get'
  })
}

/**
 * 获取考试中题目 id 列表。
 * @param {string|number} examId 考试 id
 * @returns {Promise}
 */
export function examQuList(examId) {
  return request({
    url: 'exams/question/list/' + examId,
    method: 'get'
  })
}

/**
 * 考试中填空/作答提交。
 * @param {object} data 答题数据
 * @returns {Promise}
 */
export function fillAnswer(data) {
  return request({
    url: 'exams/full-answer',
    method: 'post',
    data
  })
}

/**
 * 查询考试中某一题的详情。
 * @param {object} params 含 examId、quId 等
 * @returns {Promise}
 */
export function quDetail(params) {
  return request({
    url: 'exams/question/single',
    method: 'get',
    params
  })
}

/**
 * 交卷。
 * @param {string|number} examId 考试 id
 * @returns {Promise}
 */
export function handExam(examId) {
  return request({
    url: 'exams/hand-exam/' + examId,
    method: 'get'
  })
}

/**
 * 创建考试。
 * @param {object} data 考试新增表单
 * @returns {Promise}
 */
export function saveData(data) {
  return request({
    url: 'exams',
    method: 'post',
    data
  })
}

/**
 * 上报切屏等作弊行为。
 * @param {string|number} examId 考试 id
 * @returns {Promise}
 */
export function examCheat(examId) {
  return request({
    url: `exams/cheat/${examId}`,
    method: 'put'

  })
}

/**
 * 收藏错题或题目（业务依后端约定）。
 * @param {string|number} examId 考试 id
 * @returns {Promise}
 */
export function examCollect(examId) {
  return request({
    url: `exams/collect/${examId}`,
    method: 'get'
  })
}

/**
 * 获取考试统计/详情扩展信息。
 * @param {string|number} examId 考试 id
 * @returns {Promise}
 */
export function details(examId) {
  return request({
    url: `exams//details//${examId}`,
    method: 'get'
  })
}
