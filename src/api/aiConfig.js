import request from '@/utils/request'

export function getAiConfigOverview() {
  return request({
    url: 'ai/config/overview',
    method: 'get'
  })
}

export function getAiConfig() {
  return request({
    url: 'ai/config',
    method: 'get'
  })
}

export function saveAiFeatureConfig(featureCode, data) {
  return request({
    url: `ai/config/features/${featureCode}`,
    method: 'put',
    data
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

export function getAiConfigStatus(feature) {
  return request({
    url: 'ai/config/status',
    method: 'get',
    params: feature ? { feature } : {}
  })
}
