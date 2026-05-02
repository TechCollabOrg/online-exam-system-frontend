
import request from '@/utils/request'

/**
 * 创建班级。
 * @param {object} data 班级信息
 * @returns {Promise}
 */
export function classAdd(data) {
  return request({
    url: 'grades/add',
    method: 'post',
    data
  })
}

/**
 * 分页查询班级列表。
 * @param {object} params 分页与筛选参数
 * @returns {Promise}
 */
export function classPaging(params) {
  return request({
    url: 'grades/paging',
    method: 'get',
    params
  })
}

/**
 * 删除班级。
 * @param {string|number} id 班级 id
 * @returns {Promise}
 */
export function classDel(id) {
  return request({
    url: '/grades/delete//' + id,
    method: 'delete'
  })
}

/**
 * 更新班级信息。
 * @param {string|number} id 班级 id
 * @param {object} data 班级数据
 * @returns {Promise}
 */
export function classUpdate(id, data) {
  return request({
    url: 'grades/update/' + id,
    method: 'put',
    data
  })
}

/**
 * 获取班级下拉列表（简要列表）。
 * @returns {Promise}
 */
export function fetchClasses() {
  return request({
    url: 'grades/list',
    method: 'get'
  })
}

/**
 * 从班级移除用户。
 * @param {string} ids 用户 id，多个逗号分隔
 * @returns {Promise}
 */
export function userClassRemove(ids) {
  return request({
    url: 'grades/remove/' + ids,
    method: 'patch'
  })
}

/**
 * 教师加入班级。
 * @param {object} params 查询参数（如邀请码等）
 * @returns {Promise}
 */
export function teacherJoinClass(params) {
  return request({
    url: 'grades/teacher/join',
    method: 'get',
    params
  })
}

/**
 * 教师退出班级。
 * @param {string|number} gradeId 班级 id
 * @returns {Promise}
 */
export function teacherExitClass(gradeId) {
  return request({
    url: `grades/teacher/exit/${gradeId}`,
    method: 'delete'
  })
}
