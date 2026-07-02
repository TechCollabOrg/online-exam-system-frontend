/**
 * 在浏览器侧查询当前公网 IP（走浏览器网络栈，可反映 VPN 切换）。
 * 每次登录前调用，不做缓存。
 */
export async function fetchClientPublicIp() {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = controller
    ? setTimeout(() => controller.abort(), 3000)
    : null
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      cache: 'no-store',
      signal: controller ? controller.signal : undefined
    })
    if (!res.ok) {
      return ''
    }
    const json = await res.json()
    return (json && json.ip) ? String(json.ip).trim() : ''
  } catch (e) {
    return ''
  } finally {
    if (timer) clearTimeout(timer)
  }
}
