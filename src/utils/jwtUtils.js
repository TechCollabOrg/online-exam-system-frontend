import { getToken } from '@/utils/auth'
import { jwtDecode } from 'jwt-decode'

/**
 * 手动解析 JWT payload（三段式拆开后 Base64Url 解码）。
 * @param {string} token 原始 JWT 字符串
 * @returns {object} payload 对象
 */
export function parseJwt(token) {
  var parts = token.split('.')
  var payload = decodeBase64Url(parts[1])
  return JSON.parse(payload)
}

/**
 * Base64Url 解码为 UTF-8 字符串。
 * @param {string} input JWT payload 段（未 padding）
 * @returns {string}
 */
function decodeBase64Url(input) {
  var base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  switch (base64.length % 4) {
    case 0:
      break
    case 2:
      base64 += '=='
      break
    case 3:
      base64 += '='
      break
    default:
      throw new Error('Invalid base64 string')
  }
  return decodeURIComponent(atob(base64))
}

/**
 * 从 Cookie 中的 Token 解析 `userInfo` 字段（JSON）。
 * @returns {object}
 */
export function getTokenInfo() {
  const token = getToken()
  const decodedToken = jwtDecode(token)
  return JSON.parse(decodedToken.userInfo)
}

/**
 * 从 Token 中读取角色 id。
 * @returns {*}
 */
export function getRole() {
  const token = getToken()
  const decodedToken = jwtDecode(token)
  return JSON.parse(decodedToken.userInfo)['roleId']
}
