/*
 * @Author: 暮安 14122148+muanananan@user.noreply.gitee.com
 * @Date: 2024-03-04 10:34:47
 * @LastEditors: 暮安 14122148+muanananan@user.noreply.gitee.com
 * @LastEditTime: 2024-05-13 11:04:09
 * @FilePath: \vue-admin-template\src\api\user.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'

export function classAdd(data) {
  return request({
    url: 'user',
    method: 'post',
    data
  })
}

export function login(data) {
  return request({
    url: 'auths/login',
    method: 'post',
    data
  })
}
/** 拉取图形验证码（JSON，与校验共用 axios 会话，避免 img 与接口 Session 不一致） */
export function fetchCaptchaJson() {
  return request({
    url: 'auths/captcha/json',
    method: 'get'
  })
}

/** 校验图形验证码：须携带与 {@link fetchCaptchaJson} 一致的 captchaId */
export function verifyCode(data) {
  return request({
    url: 'auths/verifyCode',
    method: 'post',
    data: {
      code: data.code,
      captchaId: data.captchaId
    }
  })
}

export function getInfo() {
  return request({
    url: 'user/info',
    method: 'get'

  })
}

export function logout() {
  return request({
    url: 'auths/logout',
    method: 'delete'
  })
}

export function userPaging(params) {
  return request({
    url: 'user/paging',
    method: 'get',
    params
  })
}
export function userDel(ids) {
  return request({
    url: 'user/' + ids,
    method: 'delete'
  })
}
export function userImport(data) {
  return request({
    url: 'user/import',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

export function changePassword(data) {
  return request({
    url: 'user',
    method: 'put',
    data
  })
}

export function userAddClass(params) {
  return request({
    url: 'user/grade/join',
    method: 'put',
    params
  })
}

export function register(data) {
  return request({
    url: 'auths/register',
    method: 'post',
    data
  })
}
export function trackPresence(data) {
  return request({
    url: 'auths/track-presence',
    method: 'post',
    data
  })
}

export function uploadAvatar(data) {
  return request({
    url: 'user/uploadAvatar',
    method: 'put',
    data
  })
}
// 学生退出班级
export function exitUserGrade() {
  return request({
    url: 'grades/user/exit',
    method: 'put'
  })
}
