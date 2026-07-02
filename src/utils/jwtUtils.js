import { getToken } from '@/utils/auth'
import { jwtDecode } from 'jwt-decode'
export function parseJwt(token) {
  // 分割JWT的三个部分
  var parts = token.split('.')
  // 解码JWT的payload部分
  var payload = decodeBase64Url(parts[1])
  // 将解码后的payload转换为对象
  return JSON.parse(payload)
}
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

// export function getTokenInfo() {
//     const token = getToken();
//     const user = parseJwt(token);
//     return JSON.parse(user.userInfo)
//   }

/**
 * 解析当前 JWT 载荷中的 userInfo。
 * @param {string} [tokenOverride] 若传入则优先使用（登录成功后 Vuex 已写入，而 Electron file:// 下 Cookie 可能尚未可读）
 */
export function getTokenInfo(tokenOverride) {
  const token =
    typeof tokenOverride === 'string' && tokenOverride.length > 0
      ? tokenOverride
      : getToken()
  if (!token || typeof token !== 'string') {
    throw new Error('登录令牌缺失，请重新登录')
  }
  const decodedToken = jwtDecode(token)
  return JSON.parse(decodedToken.userInfo)
}

export function getRole(tokenOverride) {
  const token =
    typeof tokenOverride === 'string' && tokenOverride.length > 0
      ? tokenOverride
      : getToken()
  if (!token || typeof token !== 'string') {
    throw new Error('登录令牌缺失，请重新登录')
  }
  const decodedToken = jwtDecode(token)
  return JSON.parse(decodedToken.userInfo)['roleId']
}

/** JWT 是否存在且未过期（用于路由守卫，避免过期令牌仍被当作已登录） */
export function isTokenValid(token) {
  if (!token || typeof token !== 'string') {
    return false
  }
  try {
    const decoded = jwtDecode(token)
    if (!decoded.exp) {
      return false
    }
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

