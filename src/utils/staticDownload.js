/**
 * 从 public/ 目录下载静态资源（兼容 hash 路由与 publicPath: './'）。
 */

export function resolvePublicAssetUrl(relativePath) {
  const normalized = String(relativePath || '').replace(/^\//, '')
  const base = `${window.location.origin}${window.location.pathname}`
  return new URL(normalized, base).href
}

/**
 * @param {{ path: string, fileName: string }} options
 */
export async function downloadPublicAsset({ path, fileName }) {
  const href = resolvePublicAssetUrl(path)
  const res = await fetch(href, { method: 'GET', credentials: 'same-origin' })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName || 'download'
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/** 间隔触发多次保存，避免浏览器拦截「一次点击多个下载」 */
export async function downloadPublicAssetsBatch(files, gapMs = 500) {
  const list = Array.isArray(files) ? files : []
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    await downloadPublicAsset({
      path: item.path,
      fileName: item.fileName || item.label
    })
    if (i < list.length - 1 && gapMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, gapMs))
    }
  }
}

export async function checkPublicAssetExists(relativePath) {
  const href = resolvePublicAssetUrl(relativePath)
  try {
    const res = await fetch(href, { method: 'HEAD', credentials: 'same-origin' })
    if (res.ok) return true
    if (res.status === 405) {
      const getRes = await fetch(href, { method: 'GET', credentials: 'same-origin' })
      return getRes.ok
    }
    return false
  } catch (_) {
    return false
  }
}
