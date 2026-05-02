import request from '@/utils/request'

/**
 * 演示用表格 API（vue-admin-template 示例路径，业务页一般不会调用）。
 */

/**
 * 模板示例表格列表（演示用）。
 * @param {object} params 分页参数
 * @returns {Promise}
 */
export function getList(params) {
  return request({
    url: '/vue-admin-template/table/list',
    method: 'get',
    params
  })
}
