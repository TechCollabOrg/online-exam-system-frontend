import request from '@/utils/request'

export function listAiKnowledge(params) {
  return request({
    url: 'ai/knowledge',
    method: 'get',
    params
  })
}

export function getAiKnowledge(id) {
  return request({
    url: `ai/knowledge/${id}`,
    method: 'get'
  })
}

export function addAiKnowledge(data) {
  return request({
    url: 'ai/knowledge',
    method: 'post',
    data
  })
}

export function updateAiKnowledge(id, data) {
  return request({
    url: `ai/knowledge/${id}`,
    method: 'put',
    data
  })
}

export function deleteAiKnowledge(id) {
  return request({
    url: `ai/knowledge/${id}`,
    method: 'delete'
  })
}

export function importBuiltinKnowledge() {
  return request({
    url: 'ai/knowledge/import-builtin',
    method: 'post'
  })
}
