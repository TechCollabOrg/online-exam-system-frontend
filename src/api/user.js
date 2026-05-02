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
 * POST `/api/user` — 创建用户（后端按角色限制：教师只能创建学生，管理员可创建教师与学生）。
 * 默认密码由服务端写入；请求体对应 UserForm 校验分组。
 * @param {object} data 用户表单字段（用户名、真实姓名、角色等）
 * @returns {Promise<{ code:number, data:string, msg:string }>} 业务包装结果，成功时 data 多为提示文案
 */
export function classAdd(data) {
  return request({
    url: 'user',
    method: 'post',
    data
  })
}

/**
 * POST `/api/auths/login` — 账号登录；服务端校验密码与验证码（若开启）后签发 JWT。
 * 前端通常在 store 中解析 Token 写入 Cookie 与角色缓存。
 * @param {object} data 含用户名、密码及可选验证码字段
 * @returns {Promise} data 为 JWT 字符串（业务码成功时）
 */
export function login(data) {
  return request({
    url: 'auths/login',
    method: 'post',
    data
  })
}

/**
 * POST `/api/auths/verifyCode/{code}` — 单独校验图形验证码是否与 Session 中一致（验证码关闭时后端可能直接返回成功）。
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
 * GET `/api/user/info` — 返回当前 Token 对应用户的展示信息（姓名、头像、角色等），需已登录。
 * @returns {Promise}
 */
export function getInfo() {
  return request({
    url: 'user/info',
    method: 'get'

  })
}

/**
 * DELETE `/api/auths/logout` — 注销会话并清除服务端 Session 中与登录态相关的数据。
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/auths/logout',
    method: 'delete'
  })
}

/**
 * GET `/api/user/paging` — 教师/管理员分页查询用户，可按班级 id、真实姓名筛选。
 * @param {object} params pageNum、pageSize、gradeId、realName 等
 * @returns {Promise} data 为 MyBatis-Plus IPage 结构（records + total）
 */
export function userPaging(params) {
  return request({
    url: 'user/paging',
    method: 'get',
    params
  })
}

/**
 * DELETE `/api/user/{ids}` — 批量删除用户，ids 为逗号分隔的主键字符串。
 * @param {string} ids 用户 id 列表
 * @returns {Promise}
 */
export function userDel(ids) {
  return request({
    url: 'user/' + ids,
    method: 'delete'
  })
}

/**
 * POST `/api/user/import` — Excel 批量导入用户（multipart），服务端解析表格并批量插入。
 * @param {FormData} data 含 file 字段及后端约定的其它表单项
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
 * PUT `/api/user` — 当前用户修改登录密码（旧密码 + 新密码），走 UpdatePassword 校验分组。
 * @param {object} data UserForm 密码相关字段
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
 * PUT `/api/user/grade/join` — 学生通过班级邀请码加入班级（query 传 code）。
 * @param {object} params 至少包含班级码 code
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
 * POST `/api/auths/register` — 自助注册学生账号，校验用户名唯一性与表单规则。
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
 * POST `/api/auths/track-presence` — 上报在线心跳，用于统计学生登录时长（配合仪表盘 stat/daily）。
 * @param {object} data 可含 userId 等（具体以后端约定为准）
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
 * PUT `/api/user/uploadAvatar` — multipart 上传头像文件，返回可访问的 OSS/静态 URL。
 * @param {FormData|object} data 含 file 部分字段 `file`
 * @returns {Promise} data 多为头像 URL 字符串
 */
export function uploadAvatar(data) {
  return request({
    url: 'user/uploadAvatar',
    method: 'put',
    data
  })
}

/**
 * PUT `/api/grades/user/exit` — 当前登录学生退出所属班级关联。
 * @returns {Promise}
 */
export function exitUserGrade() {
  return request({
    url: 'grades/user/exit',
    method: 'put'
  })
}
