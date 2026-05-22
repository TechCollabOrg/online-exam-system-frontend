import { getApiBaseUrl, getMinioBaseUrl } from '@/utils/runtimeConfig'

function apiOrigin() {
  const base = getApiBaseUrl() || ''
  if (!/^https?:\/\//i.test(base)) return ''
  try {
    return new URL(base.endsWith('/') ? base : base + '/').origin
  } catch (_) {
    return ''
  }
}

function isElectronFilePage() {
  return typeof window !== 'undefined' && window.location.protocol === 'file:'
}

/**
 * 题图存 MinIO 时多为 http://主机:9000/桶/对象；Electron 或换机后需改读 app-config.minioBaseUrl。
 * 开发环境可走 devServer 的 /minio-media 代理（见 vue.config.js）。
 */
function rewriteMinioUrl(u) {
  if (!/^https?:\/\//i.test(u)) return u
  try {
    const parsed = new URL(u)
    const segs = parsed.pathname.split('/').filter(Boolean)
    if (segs.length < 2) return u

    const looksLikeMinio =
      parsed.port === '9000' ||
      (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost')

    if (!looksLikeMinio) return u

    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && !isElectronFilePage()) {
      return '/minio-media' + parsed.pathname + (parsed.search || '')
    }

    const minioBase = getMinioBaseUrl()
    if (!minioBase) return u

    const root = minioBase.replace(/\/$/, '')
    return root + parsed.pathname + (parsed.search || '')
  } catch (_) {
    return u
  }
}

/**
 * 将后端返回的图片地址转为当前页面可加载的 URL。
 */
export function resolveMediaUrl(url) {
  if (url == null || typeof url !== 'string') {
    return ''
  }
  const u = url.trim()
  if (!u || u.startsWith('data:')) {
    return u
  }

  if (/^https?:\/\//i.test(u)) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        const parsed = new URL(u)
        if (
          (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') &&
          (parsed.port === '8080' || parsed.port === '')
        ) {
          return parsed.pathname + (parsed.search || '')
        }
      } catch (e) {
        /* ignore */
      }
    }

    if (isElectronFilePage()) {
      try {
        const parsed = new URL(u)
        const origin = apiOrigin()
        if (origin && parsed.pathname.startsWith('/api/')) {
          return origin + parsed.pathname + (parsed.search || '')
        }
      } catch (e) {
        /* ignore */
      }
    }

    return rewriteMinioUrl(u)
  }

  if (u.startsWith('/') && typeof window !== 'undefined' && isElectronFilePage()) {
    const base = getApiBaseUrl() || ''
    if (base.startsWith('http')) {
      try {
        return new URL(u, base.endsWith('/') ? base : base + '/').href
      } catch (e) {
        return u
      }
    }
  }
  return u
}

/** 富文本 HTML 内 img src 统一走 resolveMediaUrl */
export function rewriteRichHtmlMediaUrls(html) {
  if (html == null || html === '') return ''
  return String(html).replace(
    /(<img\b[^>]*\bsrc\s*=\s*)(['"])([^'"]+)\2/gi,
    (match, prefix, quote, src) => prefix + quote + resolveMediaUrl(src) + quote
  )
}
