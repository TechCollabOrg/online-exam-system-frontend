import request from '@/utils/request'

export function createInviteCode(data) {
  return request({
    url: 'invite-codes',
    method: 'post',
    data
  })
}

export function inviteCodePaging(params) {
  return request({
    url: 'invite-codes/paging',
    method: 'get',
    params
  })
}

export function disableInviteCode(id) {
  return request({
    url: 'invite-codes/' + id + '/disable',
    method: 'put'
  })
}

export function deleteInviteCodes(ids) {
  return request({
    url: 'invite-codes/' + ids,
    method: 'delete'
  })
}
