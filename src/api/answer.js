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

/** 触发指定考生的主观题 AI 阅卷（异步） */
export function triggerAiScore(params) {
  return request({
    url: 'answers/ai-score',
    method: 'post',
    params
  })
}

// export function scorePaging(data) {
//     return request({
//       url: 'answers/correct',
//       method: 'put',
//       data
//     })
//   }
