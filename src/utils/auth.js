import Cookies from 'js-cookie'

const TokenKey = 'Authorization'

/** 统一存「纯 JWT」字符串，避免部分运行环境在 Cookie/Header 中大小写不一致导致带上了 Bearer 前缀后解析失败 */
function normalizeStoredToken(token) {
  if (token == null || typeof token !== 'string') {
    return token
  }

  const t = token.trim()
  const prefix = 'bearer '

  if (t.length >= prefix.length && t.toLowerCase().startsWith(prefix)) {
    return t.slice(prefix.length).trim()
  }

  return t
}

/** Electron 便携包用 file:// 打开页面时，document.cookie 往往无法持久化。 */
function useLocalTokenStorage() {
  return typeof window !== 'undefined' && window.location.protocol === 'file:'
}

const UserIdKey = 'class_activity_system_user_id'
const roleKey = 'class_activity_system_role'
const discussionKey = 'class_activity_system_discussion_id'
const gradeKey = 'class_activity_system_grade_id'

export function getToken() {
  if (useLocalTokenStorage()) {
    const raw =
      window.sessionStorage.getItem(TokenKey) || window.localStorage.getItem(TokenKey) || undefined
    return raw ? normalizeStoredToken(raw) : raw
  }

  const fromSession = window.sessionStorage.getItem(TokenKey)

  if (fromSession) {
    return normalizeStoredToken(fromSession)
  }

  const fromCookie = Cookies.get(TokenKey)

  return fromCookie ? normalizeStoredToken(fromCookie) : undefined
}

/**
 * 保存登录令牌。
 * 未勾选「记住我」：浏览器 http(s) 用 sessionStorage（关闭标签后需重新登录）；勾选 7 天用 Cookie / file 下用 localStorage。
 * @param {string} token JWT
 * @param {{ expiresDays?: number }} [opts] 勾选「记住我」时传入 { expiresDays: 7 }
 */
export function setToken(token, opts = {}) {
  const normalized = normalizeStoredToken(token)
  const remember = !!(opts && opts.expiresDays)

  if (useLocalTokenStorage()) {
    if (remember) {
      window.sessionStorage.removeItem(TokenKey)
      window.localStorage.setItem(TokenKey, normalized)
    } else {
      window.localStorage.removeItem(TokenKey)
      window.sessionStorage.setItem(TokenKey, normalized)
    }
    return
  }

  Cookies.remove(TokenKey)

  window.sessionStorage.removeItem(TokenKey)

  if (remember) {
    return Cookies.set(TokenKey, normalized, { expires: opts.expiresDays })
  }

  window.sessionStorage.setItem(TokenKey, normalized)
}

export function removeToken() {
  window.sessionStorage.removeItem(TokenKey)

  if (useLocalTokenStorage()) {
    window.localStorage.removeItem(TokenKey)
    return
  }

  Cookies.remove(TokenKey)
}

export function getUserId() {
  return localStorage.getItem(UserIdKey)
}

export function setUserId(userId) {
  return localStorage.setItem(UserIdKey, userId)
}

export function removeUserId() {
  return localStorage.removeItem(UserIdKey)
}

export function getRole() {
  return localStorage.getItem(roleKey)
}

export function setRole(role) {
  return localStorage.setItem(roleKey, role)
}

export function removeRole() {
  return localStorage.removeItem(roleKey)
}

export function getDiscussionId() {
  return localStorage.getItem(discussionKey)
}

export function setDiscussionId(id) {
  return localStorage.setItem(discussionKey, id)
}

export function removeDiscussionId() {
  return localStorage.removeItem(discussionKey)
}

export function getGradeId() {
  return localStorage.getItem(gradeKey)
}

export function setGradeId(id) {
  return localStorage.setItem(gradeKey, id)
}

export function removeGradeId() {
  return localStorage.removeItem(gradeKey)
}
