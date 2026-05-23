import request from '@/utils/request'

export function answerExamPging(params) {
  return request({
    url: 'answers/exam/page',
    method: 'get',
    params
  })
}

export function answerUserPging(params) {
  return request({
    url: 'answers/exam/stu',
    method: 'get',
    params
  })
}

export function answerAbsentPaging(params) {
  return request({
    url: 'answers/exam/absent',
    method: 'get',
    params
  })
}

export function answerDetail(params) {
  return request({
    url: 'answers/detail',
    method: 'get',
    params
  })
}

export function correct(data) {
  return request({
    url: 'answers/correct',
    method: 'put',
    data
  })
}

/** 同步执行 AI 阅卷（逐题评分，题多时耗时长） */
export function triggerAiScore(params) {
  return request({
    url: 'answers/ai-score',
    method: 'post',
    params,
    timeout: 600000
  })
}

// export function scorePaging(data) {
//     return request({
//       url: 'answers/correct',
//       method: 'put',
//       data
//     })
//   }
