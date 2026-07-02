/**
 * 运行时 API / WebSocket / MinIO 地址。
 * - 浏览器 / electron:dev：使用构建时 .env 变量（开发走 /api 代理）。
 * - Electron 生产包：优先使用 exe 同目录 app-config.json（经主进程注入）。
 */
const fallback = {
  apiBaseUrl: (process.env.VUE_APP_BASE_API || '/api').replace(/\/$/, ''),
  wsUrl: (process.env.VUE_APP_WS_URL || '').replace(/\/$/, ''),
  minioBaseUrl: (process.env.VUE_APP_MINIO_BASE_URL || '').replace(/\/$/, '')
}

const runtime = { ...fallback, configPath: '' }

let initPromise = null

export async function initRuntimeConfig() {
  if (initPromise) {
    return initPromise
  }
  initPromise = (async() => {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.getRuntimeConfig === 'function') {
      try {
        const cfg = await window.electronAPI.getRuntimeConfig()
        if (cfg && cfg.apiBaseUrl) {
          runtime.apiBaseUrl = String(cfg.apiBaseUrl).replace(/\/$/, '')
        }
        if (cfg && cfg.wsUrl) {
          runtime.wsUrl = String(cfg.wsUrl).replace(/\/$/, '')
        }
        if (cfg && cfg.minioBaseUrl) {
          runtime.minioBaseUrl = String(cfg.minioBaseUrl).replace(/\/$/, '')
        }
        if (cfg && cfg.configPath) {
          runtime.configPath = cfg.configPath
        }
        if (cfg && !cfg.configPath && process.env.NODE_ENV === 'production') {
          console.warn('[runtimeConfig] 未加载 app-config.json，使用打包默认值', cfg.searchedPaths)
        }
      } catch (e) {
        console.warn('[runtimeConfig] 读取 Electron 配置失败，使用构建默认值', e)
      }
    }
    return runtime
  })()
  return initPromise
}

export function getConfigPath() {
  return runtime.configPath || ''
}

export function getApiBaseUrl() {
  return runtime.apiBaseUrl || fallback.apiBaseUrl
}

export function getWsUrl() {
  return runtime.wsUrl || fallback.wsUrl
}

export function getMinioBaseUrl() {
  return runtime.minioBaseUrl || fallback.minioBaseUrl
}

/** 用于错误提示：从 API 地址提取主机部分 */
export function getBackendHint() {
  const base = getApiBaseUrl()
  if (/^https?:\/\//i.test(base)) {
    try {
      const u = new URL(base.endsWith('/') ? base : base + '/')
      return u.host
    } catch (_) {
      return base
    }
  }
  return '后端服务（请确认已启动）'
}
