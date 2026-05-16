/**
 * 浏览器 Fullscreen API（网页全屏，隐藏地址栏等）。
 * 注意：多数浏览器要求 requestFullscreen 在用户手势的同步调用栈内触发。
 */

export function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  )
}

export function isFullscreenActive() {
  return !!getFullscreenElement()
}

/**
 * @param {Element} [el] 要全屏的元素，默认 document.documentElement
 * @returns {Promise<void>}
 */
export function enterFullscreen(el) {
  const node = el || document.documentElement
  const req =
    node.requestFullscreen ||
    node.webkitRequestFullscreen ||
    node.mozRequestFullScreen ||
    node.msRequestFullscreen
  if (!req) {
    return Promise.reject(new Error('fullscreen unsupported'))
  }
  return Promise.resolve(req.call(node))
}

/**
 * @returns {Promise<void>}
 */
export function exitFullscreen() {
  if (!isFullscreenActive()) {
    return Promise.resolve()
  }
  const doc = document
  const exit =
    doc.exitFullscreen ||
    doc.webkitExitFullscreen ||
    doc.mozCancelFullScreen ||
    doc.msExitFullscreen
  if (!exit) {
    return Promise.resolve()
  }
  return Promise.resolve(exit.call(doc)).catch(() => {})
}

/**
 * 进入考试用「显示全屏」：Electron 学生端走主进程 setFullScreen（不依赖浏览器手势）；浏览器走 Fullscreen API。
 * @returns {Promise<void>}
 */
export function enterExamDisplayMode() {
  if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.setWindowFullscreen === 'function') {
    return Promise.resolve(window.electronAPI.setWindowFullscreen(true)).then(() => {})
  }
  return enterFullscreen()
}

/**
 * 退出考试用显示全屏（网页 API + Electron 窗口全屏一并处理；kiosk 启动时主进程会忽略关窗口全屏）。
 * @returns {Promise<void>}
 */
export function exitExamDisplayMode() {
  const tasks = [exitFullscreen()]
  if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.setWindowFullscreen === 'function') {
    tasks.push(
      Promise.resolve(window.electronAPI.setWindowFullscreen(false)).then(() => {})
    )
  }
  return Promise.all(tasks).then(() => {})
}

/**
 * 是否已处于「考试认为的全屏」（网页全屏或 Electron 窗口全屏 / kiosk）
 * @returns {Promise<boolean>}
 */
export async function isExamDisplayFullscreen() {
  if (isFullscreenActive()) return true
  if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.isWindowFullscreen === 'function') {
    try {
      return Boolean(await window.electronAPI.isWindowFullscreen())
    } catch {
      return false
    }
  }
  return false
}
