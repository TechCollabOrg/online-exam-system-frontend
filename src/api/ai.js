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

/** 考后单题 AI 解析（学生查看答卷） */
export function questionAiReview(data) {
  return request({
    url: 'ai/question-review',
    method: 'post',
    data,
    timeout: 120000
  })
}
