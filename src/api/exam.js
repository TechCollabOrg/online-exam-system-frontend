
import request from '@/utils/request'

export function examPaging(params) {
  return request({
    url: 'exams/paging',
    method: 'get',
    params
  })
}

// export function repoAdd(data) {
//   return request({
//     url: 'repo',
//     method: 'post',
//     data
//   })
// }

export function examDel(ids) {
  return request({
    url: 'exams/' + ids,
    method: 'delete'
  })
}

export function examUpdate(id, data) {
  return request({
    url: `exams/${id}`,
    method: 'put',
    data
  })
}
export function getGradeExamList(params) {
  return request({
    url: 'exams/grade',
    method: 'get',
    params
  })
}

export function getExamDetail(examId) {
  return request({
    url: 'exams/detail?examId=' + examId,
    method: 'get'
  })
}
export function examStart(examId) {
  return request({
    url: 'exams/start?examId=' + examId,
    method: 'get'
  })
}

export function examQuList(examId) {
  return request({
    url: 'exams/question/list/' + examId,
    method: 'get'
  })
}

export function fillAnswer(data) {
  return request({
    url: 'exams/full-answer',
    method: 'post',
    data
  })
}

export function quDetail(params) {
  return request({
    url: 'exams/question/single',
    method: 'get',
    params
  })
}

export function handExam(examId) {
  return request({
    url: 'exams/hand-exam/' + examId,
    method: 'get',
    // 交卷需汇总判分、补录未答题，题量大时可能超过默认 30s
    timeout: 120000
  })
}

export function saveData(data) {
  return request({
    url: 'exams',
    method: 'post',
    data
  })
}

/** 随机组卷预览：按规则抽题，返回题目列表供确认与微调 */
export function randomPreview(data) {
  return request({
    url: 'exams/random-preview',
    method: 'post',
    data
  })
}

export function examCheat(examId) {
  return request({
    url: `exams/cheat/${examId}`,
    method: 'put'

  })
}

export function examCollect(examId) {
  return request({
    url: `exams/collect/${examId}`,
    method: 'get',
    timeout: 120000
  })
}

export function details(examId) {
  return request({
    url: `exams/details/${examId}`,
    method: 'get'
  })
}
