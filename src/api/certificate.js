import request from '@/utils/request'

/**
 * 证书 API：模板维护（教师/管理员）、学生「我的证书」分页。
 */

/**
 * 分页查询证书模板。
 * @param {object} params 分页与筛选参数
 * @returns {Promise}
 */
export function certificatePaging(params) {
  return request({
    url: 'certificate/paging',
    method: 'get',
    params
  })
}

/**
 * 删除证书模板。
 * @param {string|number} id 证书 id
 * @returns {Promise}
 */
export function certificateDel(id) {
  return request({
    url: 'certificate/delete/' + id,
    method: 'delete'

  })
}

/**
 * 新增证书模板。
 * @param {object} data 证书数据
 * @returns {Promise}
 */
export function certificateAdd(data) {
  return request({
    url: 'certificate',
    method: 'post',
    data
  })
}

/**
 * 更新证书模板。
 * @param {string|number} id 证书 id
 * @param {object} data 证书数据
 * @returns {Promise}
 */
export function certificateUpdate(id, data) {
  return request({
    url: 'certificate/' + id,
    method: 'put',
    data
  })
}

/**
 * 分页查询当前用户已获得的证书。
 * @param {object} params 分页参数
 * @returns {Promise}
 */
export function certificateMy(params) {
  return request({
    url: 'certificate/paging/my',
    method: 'get',
    params

  })
}
