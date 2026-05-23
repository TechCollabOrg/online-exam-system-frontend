import request from '@/utils/request'

/** 获取全部班级列表（下拉选择用） */
export function getAllGrades() {
  return request({
    url: 'grades/list',
    method: 'get'
  })
}
