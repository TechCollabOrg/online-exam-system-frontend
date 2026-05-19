import request from '@/utils/request'

export function getAiConfig() {
  return request({
    url: 'ai/config',
    method: 'get'
  })
}

export function saveAiConfig(data) {
  return request({
    url: 'ai/config',
    method: 'put',
    data
  })
}

export function testAiConnection(data) {
  return request({
    url: 'ai/config/test-connection',
    method: 'post',
    data,
    timeout: 60000
  })
}

export function fetchAiModels(data) {
  return request({
    url: 'ai/config/models',
    method: 'post',
    data,
    timeout: 60000
  })
}

export function testAiChat(data) {
  return request({
    url: 'ai/config/test-chat',
    method: 'post',
    data,
    timeout: 120000
  })
}

export function getAiConfigStatus() {
  return request({
    url: 'ai/config/status',
    method: 'get'
  })
}
