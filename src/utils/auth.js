import Cookies from 'js-cookie'

/**
 * 登录态与客户端缓存：JWT 放 Cookie；用户 id、角色、班级、讨论上下文等放 localStorage，供 `request` 与业务页读取。
 */

const TokenKey = 'Authorization'
const UserIdKey = 'class_activity_system_user_id'
const roleKey = 'class_activity_system_role'
const discussionKey = 'class_activity_system_discussion_id'
const gradeKey = 'class_activity_system_grade_id'

/** @returns {string|undefined} 当前 JWT / Token */
export function getToken() {
  return Cookies.get(TokenKey)
}

/** @param {string} token 登录令牌 */
export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

/** 清除 Token Cookie */
export function removeToken() {
  return Cookies.remove(TokenKey)
}

/** @returns {string|null} 当前用户 id */
export function getUserId() {
  return localStorage.getItem(UserIdKey)
}

/** @param {string} userId 用户 id */
export function setUserId(userId) {
  return localStorage.setItem(UserIdKey, userId)
}

/** 移除本地存储的用户 id */
export function removeUserId() {
  return localStorage.removeItem(UserIdKey)
}

/** @returns {string|null} 角色标识字符串 */
export function getRole() {
  return localStorage.getItem(roleKey)
}

/** @param {string} role 角色标识 */
export function setRole(role) {
  return localStorage.setItem(roleKey, role)
}

/** 清除角色缓存 */
export function removeRole() {
  return localStorage.removeItem(roleKey)
}

/** @returns {string|null} 当前讨论区上下文 id */
export function getDiscussionId() {
  return localStorage.getItem(discussionKey)
}

/** @param {string} id 讨论 id */
export function setDiscussionId(id) {
  return localStorage.setItem(discussionKey, id)
}

/** 清除讨论区上下文 */
export function removeDiscussionId() {
  return localStorage.removeItem(discussionKey)
}

/** @returns {string|null} 当前班级 id */
export function getGradeId() {
  return localStorage.getItem(gradeKey)
}

/** @param {string} id 班级 id */
export function setGradeId(id) {
  return localStorage.setItem(gradeKey, id)
}

/** 清除班级上下文 */
export function removeGradeId() {
  return localStorage.removeItem(gradeKey)
}
