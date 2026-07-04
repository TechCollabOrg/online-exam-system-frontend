/**
 * 在浏览器侧查询当前公网 IP（走浏览器网络栈，可反映 VPN / 代理切换）。
 * 每次登录/登出前调用，不做缓存；多源依次尝试，避免单一接口不可达时回退到服务端出口 IP。
 */

import { getApiBaseUrl } from '@/utils/runtimeConfig'

const TIMEOUT_MS = 5000

function isValidIpv4(ip) {
  if (!ip || typeof ip !== 'string') return false
  const trimmed = ip.trim()
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) return false
  return trimmed.split('.').every((part) => {
    const n = Number(part)
    return n >= 0 && n <= 255
  })
}

function isPrivateIpv4(ip) {
  if (!isValidIpv4(ip)) return true
  const parts = ip.split('.').map(Number)
  if (parts[0] === 10) return true
  if (parts[0] === 192 && parts[1] === 168) return true
  if (parts[0] === 127) return true
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  return false
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

function fetchFromPconlineJsonp() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return Promise.resolve('')
  }
  return new Promise((resolve) => {
    const callbackName = `pconlineIp_${Date.now()}_${Math.random().toString(36).slice(2)}`
    let script = null
    let timer = null

    const cleanup = () => {
      if (timer) clearTimeout(timer)
      try {
        delete window[callbackName]
      } catch (e) {
        window[callbackName] = undefined
      }
      if (script && script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }

    timer = setTimeout(() => {
      cleanup()
      resolve('')
    }, TIMEOUT_MS)

    window[callbackName] = (data) => {
      cleanup()
      const ip = data && data.ip ? String(data.ip).trim() : ''
      resolve(isValidIpv4(ip) && !isPrivateIpv4(ip) ? ip : '')
    }

    script = document.createElement('script')
    script.src = `https://whois.pconline.com.cn/ipJson.jsp?json=true&callback=${callbackName}`
    script.onerror = () => {
      cleanup()
      resolve('')
    }
    document.head.appendChild(script)
  })
}

async function fetchFromPconline() {
  const res = await fetchWithTimeout('https://whois.pconline.com.cn/ipJson.jsp?json=true')
  if (!res.ok) return ''
  const text = await res.text()
  if (!text) return ''
  const json = JSON.parse(text)
  const ip = json && json.ip ? String(json.ip).trim() : ''
  return isValidIpv4(ip) && !isPrivateIpv4(ip) ? ip : ''
}

async function fetchFromIpipNet() {
  const res = await fetchWithTimeout('https://myip.ipip.net', {
    headers: { Accept: 'text/plain' }
  })
  if (!res.ok) return ''
  const text = String(await res.text()).trim()
  const match = text.match(/(\d{1,3}(?:\.\d{1,3}){3})/)
  const ip = match ? match[1] : ''
  return isValidIpv4(ip) && !isPrivateIpv4(ip) ? ip : ''
}

async function fetchFromIpSb() {
  const res = await fetchWithTimeout('https://api.ip.sb/ip', {
    headers: { Accept: 'text/plain' }
  })
  if (!res.ok) return ''
  const ip = String(await res.text()).trim()
  return isValidIpv4(ip) && !isPrivateIpv4(ip) ? ip : ''
}

async function fetchFromOray() {
  const res = await fetchWithTimeout('https://ddns.oray.com/checkip', {
    headers: { Accept: 'text/plain' }
  })
  if (!res.ok) return ''
  const text = String(await res.text()).trim()
  const match = text.match(/(\d{1,3}(?:\.\d{1,3}){3})/)
  const ip = match ? match[1] : ''
  return isValidIpv4(ip) && !isPrivateIpv4(ip) ? ip : ''
}

async function fetchFromIpify() {
  const res = await fetchWithTimeout('https://api.ipify.org?format=json')
  if (!res.ok) return ''
  const json = await res.json()
  const ip = json && json.ip ? String(json.ip).trim() : ''
  return isValidIpv4(ip) && !isPrivateIpv4(ip) ? ip : ''
}

async function fetchFromIpApi() {
  const res = await fetchWithTimeout('https://api.ip-api.com/json/?fields=status,query')
  if (!res.ok) return ''
  const json = await res.json()
  if (!json || json.status !== 'success') return ''
  const ip = json.query ? String(json.query).trim() : ''
  return isValidIpv4(ip) && !isPrivateIpv4(ip) ? ip : ''
}

async function fetchFromIpapiCo() {
  const res = await fetchWithTimeout('https://ipapi.co/ip/')
  if (!res.ok) return ''
  const ip = String(await res.text()).trim()
  return isValidIpv4(ip) && !isPrivateIpv4(ip) ? ip : ''
}

/** 浏览器无法直连外网 IP 接口时，经同源后端查询出口公网 IP */
async function fetchFromBackend() {
  const base = (getApiBaseUrl() || '/api').replace(/\/$/, '')
  const url = `${base}/auths/client-public-ip`
  const res = await fetchWithTimeout(url, { credentials: 'include' })
  if (!res.ok) return ''
  const json = await res.json()
  const ip = json && json.data ? String(json.data).trim() : ''
  return isValidIpv4(ip) && !isPrivateIpv4(ip) ? ip : ''
}

const IP_PROVIDERS = [
  fetchFromPconlineJsonp,
  fetchFromPconline,
  fetchFromIpipNet,
  fetchFromIpSb,
  fetchFromOray,
  fetchFromIpify,
  fetchFromIpApi,
  fetchFromIpapiCo,
  fetchFromBackend
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
