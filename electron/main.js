/**
 * Electron 主进程（学生端桌面壳）
 *
 * 与《需求分析文档》对应关系（节选）：
 * - 文档 2.2：学生使用「Windows 桌面客户端」——本进程加载打包后的 Vue 页面，形成可分发 .exe。
 * - STU-06：全屏/防作弊——此处提供「考试模式」可选 kiosk 全屏（浏览器级，非内核级钩子；
 *   文档中的 Alt+Tab 屏蔽等需系统级方案，教学演示可用本参数，正式环境需额外安全模块）。
 * - STU-09：离线答题——仍依赖业务层（前端 localStorage/未来 SQLite + 同步接口）；主进程仅负责窗口与加载。
 *
 * 开发：配合 concurrently 先起 Vue 开发服务，再通过 ELECTRON_START_URL 加载页面。
 * 生产：先执行 npm run build:electron，再 electron-builder 将 dist + 本目录打入安装包/便携 exe。
 */
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

/** 是否启用类似机考的全屏无边框（kiosk），由命令行 --exam-kiosk 或环境变量开启 */
function useExamKiosk() {
  return process.argv.includes('--exam-kiosk') || process.env.EXAM_KIOSK === '1'
}

function createWindow() {
  const kiosk = useExamKiosk()
  const devUrl = process.env.ELECTRON_START_URL
  /**
   * 生产用 loadFile(file://) 时，Chromium 默认会限制从本地页面向 http://127.0.0.1 发跨域 XHR，
   * axios 往往无 response，前端误报「连接后端失败」。开发模式走 http://127.0.0.1:9527 时保持 webSecurity 开启。
   */
  const win = new BrowserWindow({
    width: kiosk ? undefined : 1280,
    height: kiosk ? undefined : 800,
    fullscreen: kiosk,
    kiosk,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: Boolean(devUrl)
    }
  })

  if (devUrl) {
    win.loadURL(devUrl)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    // 生产环境：加载 vue-cli 构建后的 index.html（publicPath 需为相对路径 ./）
    const indexHtml = path.join(__dirname, '../dist/index.html')
    win.loadFile(indexHtml).catch((err) => {
      console.error('加载本地页面失败，请确认已执行 npm run build:electron', err)
    })
  }

  win.once('ready-to-show', () => win.show())

  win.on('enter-full-screen', () => {
    win.webContents.send('native-fullscreen-changed', true)
  })
  win.on('leave-full-screen', () => {
    win.webContents.send('native-fullscreen-changed', false)
  })

  // 需求 STU-10：交卷前由前端二次确认；此处不拦截关闭，便于非考试场景退出
  win.on('closed', () => {
    // 在 Windows 上多窗口时可在此清理引用
  })
}

// 单实例：避免学生误开第二个客户端导致会话混乱（与需求「唯一考试会话」方向一致）
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const w = BrowserWindow.getAllWindows()[0]
    if (w) {
      if (w.isMinimized()) w.restore()
      w.focus()
    }
  })

  app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

/**
 * 预留：若渲染进程需要查询是否为 Electron、是否 kiosk，可通过 ipc 调用。
 * 渲染进程需 contextBridge 暴露接口（见 preload.js）。
 */
ipcMain.handle('app:get-mode', () => ({
  isElectron: true,
  kiosk: useExamKiosk()
}))

/**
 * 渲染进程在「开始考试」等时机请求系统级窗口全屏（不依赖浏览器 Fullscreen API 的手势限制）。
 * 若启动时已带 --exam-kiosk / EXAM_KIOSK=1，窗口已是 kiosk，此处不改状态，避免交卷误退出机考模式。
 */
ipcMain.handle('window:set-fullscreen', (event, flag) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) return { ok: false }
  if (useExamKiosk()) {
    return { ok: true, skipped: true }
  }
  win.setFullScreen(Boolean(flag))
  return { ok: true }
})

ipcMain.handle('window:is-fullscreen', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) return false
  try {
    return Boolean(win.isFullScreen() || (typeof win.isKiosk === 'function' && win.isKiosk()))
  } catch {
    return win.isFullScreen()
  }
})
