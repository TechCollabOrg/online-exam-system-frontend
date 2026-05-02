
import request from '@/utils/request'

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
