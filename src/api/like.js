
import request from '@/utils/request'

/**
 * 点赞接口。
 * @param {object} data 目标类型与 id 等
 * @returns {Promise}
 */
export function doLike(data) {
  return request({
    url: 'like/doLike',
    method: 'post',
    data
  })
}
