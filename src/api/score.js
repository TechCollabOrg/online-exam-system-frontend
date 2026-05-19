
import request from '@/utils/request'

export function scorePaging(params) {
  return request({
    url: 'score/paging',
    method: 'get',
    params
  })
}

export function getExamScore(params) {
  return request({
    url: 'score/getExamScore',
    method: 'get',
    params
  })
}

export function exportScores(examId, gradeId) {
  return request({
    url: `score/export/${examId}/${gradeId}`,
    method: 'get',
    responseType: 'blob'
  })
}

/** 学生：本班各场考试班级名次序列（用于排名变化曲线） */
export function studentRankTrend() {
  return request({
    url: 'score/student-rank-trend',
    method: 'get'
  })
}

/** 教师：AI 生成某班某场考试的成绩分析简报 */
export function scoreAiBriefing(params) {
  return request({
    url: 'score/ai-briefing',
    method: 'get',
    params,
    timeout: 120000
  })
}
