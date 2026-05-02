
import request from '@/utils/request'

/**
 * 发布讨论帖。
 * @param {object} data 帖子内容
 * @returns {Promise}
 */
export function discussionAdd(data) {
  return request({
    url: 'discussion/add',
    method: 'post',
    data
  })
}

/**
 * 删除讨论帖。
 * @param {string|number} id 帖子 id
 * @returns {Promise}
 */
export function discussionDel(id) {
  return request({
    url: `discussion/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 讨论帖详情。
 * @param {string|number} id 帖子 id
 * @returns {Promise}
 */
export function discussionDetail(id) {
  return request({
    url: `discussion/query/detail/${id}`,
    method: 'get'
  })
}

/**
 * 分页查询「我发布的」讨论（教师/管理员视角）。
 * @param {object} params 分页参数
 * @returns {Promise}
 */
export function discussionpageOwner(params) {
  return request({
    url: `/discussion/query/page/owner`,
    method: 'get',
    params
  })
}

/**
 * 分页查询学生可见讨论列表。
 * @param {object} params 分页参数
 * @returns {Promise}
 */
export function discussionpageStudent(params) {
  return request({
    url: `/discussion/query/page/student`,
    method: 'get',
    params
  })
}

/**
 * 查询讨论下的回复列表。
 * @param {string|number} id 讨论 id
 * @param {string} orderBy 排序字段或方式
 * @returns {Promise}
 */
export function getDiscussionRely(id, orderBy) {
  return request({
    url: `reply/query/${orderBy}/${id}`,
    method: 'get'
  })
}

/**
 * 点赞/取消点赞（讨论或回复）。
 * @param {object} data 点赞参数
 * @returns {Promise}
 */
export function doLike(data) {
  return request({
    url: `/like/doLike`,
    method: 'post',
    data
  })
}
