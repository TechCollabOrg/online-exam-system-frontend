import request from '@/utils/request'

/**
 * 分页查询操作日志。
 * @param {object} params 分页与筛选条件
 * @returns {Promise}
 */
export function getLogPage(params) {
  return request({
    url: '/log',
    method: 'get',
    params
  })
}
