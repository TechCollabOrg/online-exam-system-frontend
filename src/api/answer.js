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

/** 同步执行 AI 阅卷，完成后返回（可能耗时较长） */
export function triggerAiScore(params) {
  return request({
    url: 'answers/ai-score',
    method: 'post',
    params,
    timeout: 180000
  })
}

// export function scorePaging(data) {
//     return request({
//       url: 'answers/correct',
//       method: 'put',
//       data
//     })
//   }
