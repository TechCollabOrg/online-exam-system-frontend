import request from '@/utils/request'

export function getProctorConfig(examId) {
  return request({
    url: `proctor/config/${examId}`,
    method: 'get'
  })
}

export function getProctorToken(examId, role) {
  return request({
    url: 'proctor/token',
    method: 'get',
    params: { examId, role }
  })
}

export function reportProctorEvent(data) {
  return request({
    url: 'proctor/events',
    method: 'post',
    data
  })
}

export function proctorHeartbeat(examId) {
  return request({
    url: 'proctor/heartbeat',
    method: 'post',
    params: { examId }
  })
}

export function listProctorEvents(examId, limit) {
  return request({
    url: 'proctor/events',
    method: 'get',
    params: { examId, limit }
  })
}

export function listProctorParticipants(examId) {
  return request({
    url: 'proctor/participants',
    method: 'get',
    params: { examId }
  })
}

export function requestProctorLeave(data) {
  return request({
    url: 'proctor/leave',
    method: 'post',
    data
  })
}

export function returnProctorLeave(examId) {
  return request({
    url: 'proctor/leave/return',
    method: 'post',
    params: { examId }
  })
}
