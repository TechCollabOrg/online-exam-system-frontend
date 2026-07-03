/**
 * 在浏览器侧查询当前公网 IP（走浏览器网络栈，可反映 VPN / 代理切换）。
 * 每次登录/登出前调用，不做缓存；多源依次尝试，避免单一接口不可达时回退到服务端出口 IP。
 */

const TIMEOUT_MS = 3000

function isValidIpv4(ip) {
  if (!ip || typeof ip !== 'string') return false
  const trimmed = ip.trim()
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) return false
  return trimmed.split('.').every((part) => {
    const n = Number(part)
    return n >= 0 && n <= 255
  })
}

function fetchWithTimeout(url, options = {}) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null
  return fetch(url, {
    method: 'GET',
    cache: 'no-store',
    signal: controller ? controller.signal : undefined,
    ...options
  }).finally(() => {
    if (timer) clearTimeout(timer)
  })
}

async function fetchFromIpify() {
  const res = await fetchWithTimeout('https://api.ipify.org?format=json')
  if (!res.ok) return ''
  const json = await res.json()
  const ip = json && json.ip ? String(json.ip).trim() : ''
  return isValidIpv4(ip) ? ip : ''
}

async function fetchFromIpApi() {
  const res = await fetchWithTimeout('https://api.ip-api.com/json/?fields=status,query')
  if (!res.ok) return ''
  const json = await res.json()
  if (!json || json.status !== 'success') return ''
  const ip = json.query ? String(json.query).trim() : ''
  return isValidIpv4(ip) ? ip : ''
}

async function fetchFromIpapiCo() {
  const res = await fetchWithTimeout('https://ipapi.co/ip/')
  if (!res.ok) return ''
  const ip = String(await res.text()).trim()
  return isValidIpv4(ip) ? ip : ''
}

async function fetchFromPconline() {
  const res = await fetchWithTimeout('https://whois.pconline.com.cn/ipJson.jsp?json=true')
  if (!res.ok) return ''
  const text = await res.text()
  if (!text) return ''
  const json = JSON.parse(text)
  const ip = json && json.ip ? String(json.ip).trim() : ''
  return isValidIpv4(ip) ? ip : ''
}

const IP_PROVIDERS = [
  fetchFromIpify,
  fetchFromIpApi,
  fetchFromPconline,
  fetchFromIpapiCo
]

export async function fetchClientPublicIp() {
  for (const provider of IP_PROVIDERS) {
    try {
      const ip = await provider()
      if (ip) return ip
    } catch (e) {
      // 尝试下一个来源
    }
  }
  return ''
}
