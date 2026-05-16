import request from '@/utils/request'

/** 与后端 {@code POST /api/ai/chat} 对应；AI 响应可能较慢，单独放宽超时 */
export function aiChat(data) {
  return request({
    url: 'ai/chat',
    method: 'post',
    data,
    timeout: 120000
  })
}
