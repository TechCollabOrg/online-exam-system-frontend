
import request from '@/utils/request'

export function getUserBookList(examId) {
  if (examId == null || examId === '' || Number.isNaN(Number(examId))) {
    return Promise.reject(new Error('无效的考试编号'))
  }
  return request({
    url: 'userbooks/question/list/' + examId,
    method: 'get'
  })
}

export function userbookPaging(params) {
  return request({
    url: 'userbooks/paging',
    method: 'get',
    params
  })
}

export function getSingleQu(quId) {
  if (quId == null || quId === '' || Number.isNaN(Number(quId))) {
    return Promise.reject(new Error('无效的题目编号'))
  }
  return request({
    url: 'userbooks/question/single/' + quId,
    method: 'get'
  })
}

export function fullBook(data) {
  return request({
    url: 'userbooks/full-book',
    method: 'post',
    data
  })
}

