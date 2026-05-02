import request from '@/utils/request'

/**
 * 学生端仪表盘：班级相关统计。
 * @returns {Promise}
 */
export function classCount() {
  return request({
    url: 'stat/student',
    method: 'get'
  })
}

/**
 * 考试场次统计。
 * @returns {Promise}
 */
export function classExamCount() {
  return request({
    url: 'stat/exam',
    method: 'get'
  })
}

/**
 * 汇总统计（多指标）。
 * @returns {Promise}
 */
export function classAllCounts() {
  return request({
    url: 'stat/allCounts',
    method: 'get'
  })
}

/**
 * 日活/每日登录时长等统计。
 * @returns {Promise}
 */
export function getDaily() {
  return request({
    url: 'stat/daily',
    method: 'get'
  })
}
