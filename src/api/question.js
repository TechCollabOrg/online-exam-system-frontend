
import request from '@/utils/request'

export function quAdd(data) {
  return request({
    url: 'questions/single',
    method: 'post',
    data
  })
}
export function quPaging(params) {
  return request({
    url: 'questions/paging',
    method: 'get',
    params
  })
}

export function quUpdate(id, data) {
  return request({
    url: `questions/${id}`,
    method: 'put',
    data: data
  })
}

export function quDel(ids) {
  return request({
    url: 'questions/batch/' + ids,
    method: 'delete'
  })
}

export function quDetail(id) {
  return request({
    url: `questions/single/${id}`,
    method: 'get'
  })
}

/** 批量导入试题：支持 Excel（.xls/.xlsx）与 JSON（.json） */
export function importQue(id, data) {
  return request({
    url: `questions/import/${id}`,
    method: 'post',
    data,
    timeout: 120000
  })
}

// fetchDetail, saveData
/**
 * 题库详情
 * @param data
 */
export function fetchDetail(id) {
  // eslint-disable-next-line no-undef
  return post('/exam/api/qu/qu/detail', { id: id })
}

/**
 * 保存题库
 * @param data
 */
export function saveData(data) {
  // eslint-disable-next-line no-undef
  return post('/exam/api/qu/qu/save', data)
}
