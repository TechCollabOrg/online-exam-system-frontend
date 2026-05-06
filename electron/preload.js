/**
 * Electron 预加载脚本：在隔离上下文中运行，可安全地向渲染进程暴露有限 API。
 * 当前项目仍以 Vue 内 axios + Cookie 为主；此处预留扩展点（如调用系统摄像头原生能力做 STU-03 人脸核验）。
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  /** 查询当前是否为考试 kiosk 模式（供前端决定是否加强提示） */
  getAppMode: () => ipcRenderer.invoke('app:get-mode')
})
