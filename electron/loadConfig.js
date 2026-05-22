/**
 * 读取学生端桌面配置文件 app-config.json。
 *
 * 注意：portable 单文件 .exe 运行时，app.getPath('exe') 指向临时解压目录，
 * 用户放在「exe 旁边」的配置必须用 electron-builder 提供的 PORTABLE_EXECUTABLE_DIR。
 */
const fs = require('fs')
const path = require('path')
const { app } = require('electron')

const DEFAULT_CONFIG = {
  apiBaseUrl: 'http://127.0.0.1:8080/api',
  wsUrl: 'ws://127.0.0.1:8080/websocket',
  minioBaseUrl: 'http://127.0.0.1:9000'
}

function normalizeConfig(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_CONFIG }
  }
  const apiBaseUrl =
    (raw.apiBaseUrl || raw.api_base_url || raw.baseApi || '').trim() ||
    DEFAULT_CONFIG.apiBaseUrl
  const wsUrl =
    (raw.wsUrl || raw.ws_url || raw.websocketUrl || '').trim() ||
    DEFAULT_CONFIG.wsUrl
  const minioBaseUrl =
    (raw.minioBaseUrl || raw.minio_base_url || raw.minioEndpoint || '').trim() ||
    DEFAULT_CONFIG.minioBaseUrl
  return {
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    wsUrl: wsUrl.replace(/\/$/, ''),
    minioBaseUrl: minioBaseUrl.replace(/\/$/, '')
  }
}

function pushIfExists(list, filePath) {
  if (!filePath) return
  const normalized = path.normalize(filePath)
  if (!list.includes(normalized)) {
    list.push(normalized)
  }
}

/**
 * 配置查找顺序（先命中先用）：
 * 1. portable 单 exe：用户可见目录 PORTABLE_EXECUTABLE_DIR
 * 2. NSIS / win-unpacked：安装目录下 exe 旁
 * 3. 打包进 resources 的默认 app-config.json
 * 4. 开发：electron/app-config.json
 */
function getConfigSearchPaths() {
  const paths = []

  const portableDir = process.env.PORTABLE_EXECUTABLE_DIR
  if (portableDir) {
    pushIfExists(paths, path.join(portableDir, 'app-config.json'))
  }

  const portableFile = process.env.PORTABLE_EXECUTABLE_FILE
  if (portableFile) {
    pushIfExists(paths, path.join(path.dirname(portableFile), 'app-config.json'))
  }

  try {
    pushIfExists(paths, path.join(path.dirname(app.getPath('exe')), 'app-config.json'))
  } catch (_) {
    /* app 未就绪 */
  }

  pushIfExists(paths, path.join(path.dirname(process.execPath), 'app-config.json'))

  if (process.resourcesPath) {
    pushIfExists(paths, path.join(process.resourcesPath, 'app-config.json'))
  }

  pushIfExists(paths, path.join(__dirname, 'app-config.json'))

  return paths
}

/**
 * @returns {{ apiBaseUrl: string, wsUrl: string, configPath?: string, searchedPaths?: string[] }}
 */
function loadAppConfig() {
  const searchedPaths = getConfigSearchPaths()
  for (const filePath of searchedPaths) {
    if (!fs.existsSync(filePath)) continue
    try {
      const text = fs.readFileSync(filePath, 'utf8')
      const parsed = JSON.parse(text)
      const cfg = {
        ...normalizeConfig(parsed),
        configPath: filePath,
        searchedPaths
      }
      console.log('[app-config] 已加载:', filePath)
      return cfg
    } catch (err) {
      console.warn('[app-config] 解析失败:', filePath, err.message)
    }
  }
  console.warn('[app-config] 未找到配置文件，使用内置默认。查找路径:', searchedPaths.join('; '))
  return { ...DEFAULT_CONFIG, searchedPaths }
}

module.exports = { loadAppConfig, DEFAULT_CONFIG, getConfigSearchPaths }
