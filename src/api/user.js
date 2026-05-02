/*
 * @Author: 暮安 14122148+muanananan@user.noreply.gitee.com
 * @Date: 2024-03-04 10:34:47
 * @LastEditors: 暮安 14122148+muanananan@user.noreply.gitee.com
 * @LastEditTime: 2024-05-13 11:04:09
 * @FilePath: \vue-admin-template\src\api\user.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'

/**
 * 创建用户（管理员/教师接口封装名与班级接口混用历史命名）。
 * @param {object} data 用户表单
 * @returns {Promise}
 */
export function classAdd(data) {
  return request({
    url: 'user',
    method: 'post',
    data
  })
}

/**
 * 用户登录。
 * @param {object} data 账号密码等
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: 'auths/login',
    method: 'post',
    data
  })
}

/**
 * 校验图形验证码。
 * @param {string} code 用户输入的验证码
 * @returns {Promise}
 */
export function verifyCode(code) {
  return request({
    url: 'auths/verifyCode/' + code,
    method: 'post'
  })
}

/**
 * 获取当前登录用户信息与权限。
 * @returns {Promise}
 */
export function getInfo() {
  return request({
    url: 'user/info',
    method: 'get'

  })
}

/**
 * 退出登录。
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/auths/logout',
    method: 'delete'
  })
}

/**
 * 分页查询用户列表。
 * @param {object} params 分页与筛选
 * @returns {Promise}
 */
export function userPaging(params) {
  return request({
    url: 'user/paging',
    method: 'get',
    params
  })
}

/**
 * 批量删除用户。
 * @param {string} ids 用户 id，逗号分隔
 * @returns {Promise}
 */
export function userDel(ids) {
  return request({
    url: 'user/' + ids,
    method: 'delete'
  })
}

/**
 * Excel 批量导入用户。
 * @param {FormData} data 含文件的表单
 * @returns {Promise}
 */
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

/**
 * 修改密码。
 * @param {object} data 旧密码与新密码
 * @returns {Promise}
 */
export function changePassword(data) {
  return request({
    url: 'user',
    method: 'put',
    data
  })
}

/**
 * 学生加入班级。
 * @param {object} params 如班级邀请码
 * @returns {Promise}
 */
export function userAddClass(params) {
  return request({
    url: 'user/grade/join',
    method: 'put',
    params
  })
}

/**
 * 学生注册。
 * @param {object} data 注册表单
 * @returns {Promise}
 */
export function register(data) {
  return request({
    url: 'auths/register',
    method: 'post',
    data
  })
}

/**
 * 心跳/在线时长上报。
 * @param {object} data 时长或会话信息
 * @returns {Promise}
 */
export function trackPresence(data) {
  return request({
    url: 'auths/track-presence',
    method: 'post',
    data
  })
}

/**
 * 上传用户头像。
 * @param {FormData|object} data 文件数据
 * @returns {Promise}
 */
export function uploadAvatar(data) {
  return request({
    url: 'user/uploadAvatar',
    method: 'put',
    data
  })
}

/**
 * 学生退出当前所在班级。
 * @returns {Promise}
 */
export function exitUserGrade() {
  return request({
    url: 'grades/user/exit',
    method: 'put'
  })
}
