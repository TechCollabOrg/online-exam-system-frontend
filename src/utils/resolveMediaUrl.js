/**
 * 将后端返回的图片地址转为当前页面可加载的 URL。
 * - 开发环境：后端常返回 http://127.0.0.1:8080/api/...，页面在 localhost:9527 时应改为 /api/... 走 devServer 代理。
 * - Electron file://：相对路径 /api/... 需补全为 VUE_APP_BASE_API 所在源。
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
    return u
  }
  if (u.startsWith('/') && typeof window !== 'undefined' && window.location.protocol === 'file:') {
    const base = process.env.VUE_APP_BASE_API || ''
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
