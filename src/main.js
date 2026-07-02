/**
 * 前端入口：挂载 Vue 根实例、全局插件与「路由前置守卫」。
 *
 * 读懂本文件的顺序建议：
 * 1）先看下方「白名单 + token」的 router.beforeEach —— 对应需求 STU-01 登录态与未登录跳转。
 * 2）再看 WebSocket 连接守卫 —— 对应教师端 TEA-08 / 公告推送等实时能力（具体 URL 在 .env 的 VUE_APP_WS_URL）。
 * 3）最后看 new Vue({...}) —— 将 router、store 注入整应用；页面模块在 src/views，接口在 src/api。
 *
 * 学生桌面 .exe：由 Electron 加载本应用构建产物，见项目根目录 README 与 electron/main.js。
 */
import Vue from 'vue'
import 'normalize.css/normalize.css' // 基础 CSS 重置，减少各浏览器默认样式差异
import htmlToPdf from '@/utils/htmlToPdf'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import locale from 'element-ui/lib/locale/lang/zh-CN'
import '@/styles/index.scss' // global css
import echarts from 'echarts'
import App from './App'
import store from './store'
import router from './router'
import '@/icons' // icon
import '@/permission' // permission control
import axios from 'axios'
import { getToken, removeToken } from './utils/auth'
import { isTokenValid } from '@/utils/jwtUtils'
// 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // 引入样式
import 'quill/dist/quill.snow.css' // snow theme
import 'quill/dist/quill.bubble.css' // bubble theme
import { connectWebSocket, sendMessage } from '@/utils/websocket'
import { initRuntimeConfig } from '@/utils/runtimeConfig'
import { configureRequestBaseUrl } from '@/utils/request'

// 如果是开发环境，关闭一些提示
if (process.env.NODE_ENV === 'development') {
  console.warn = function(message) {
    if (!message.includes('DOMNodeInserted')) {
      console.log(message)
    }
  }
}

// 定义白名单
Vue.prototype.$echarts = echarts
const whiteList = ['/login', '/register', '/student-client']

// 判断是否有 token（记住我→Cookie / file 下 localStorage；否则 sessionStorage），无则进登录页
router.beforeEach((to, from, next) => {
  let token = getToken()
  // 过期/损坏的 JWT 视为未登录，避免带着旧令牌进首页后接口 403/401
  if (token && !isTokenValid(token)) {
    removeToken()
    try {
      window.localStorage.removeItem('roles')
    } catch (e) { /* ignore */ }
    token = null
  }

  // 检查当前访问的路由是否在白名单内
  if (whiteList.includes(to.path)) {
    // 已登录仍访问登录/注册页时进系统首页（避免 dev 打开登录页却仍带 Cookie 的困惑）
    if (token && to.path === '/login') {
      const r = to.query && to.query.redirect
      const path = typeof r === 'string' && r.startsWith('/') ? r : '/index'
      next({ path, replace: true })
      return
    }
    if (token && to.path === '/register') {
      next({ path: '/index', replace: true })
      return
    }
    // 如果在白名单内，不需要token，直接允许访问
    next()
  } else {
    // 如果不在白名单内，则需要检查token
    if (!token) {
      // 如果没有token，则跳转到登录页面，并携带前往的完整路径以便登录后重定向
      next({ path: '/login', query: { redirect: to.fullPath }})
    } else {
      // 如果有token，则允许访问
      next()
    }
  }
})

// 路由守卫，在路由切换前判断是否连接 WebSocket
router.beforeEach((to, from, next) => {
  const isLoginOrRegister = ['login', 'register'].includes(to.name)
  // 页面加载时 不是登录页或注册页 尝试重新连接
  if (!isLoginOrRegister) {
    connectWebSocket()
  }
  next()
})

axios.defaults.withCredentials = true

/**
 * 可选：接入 mock 假数据时取消下面注释并配置 mock 目录。
 * 上线前请勿在生产环境启用 Mock，以免拦截真实接口。
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }
Vue.use(htmlToPdf)
// 富文本
Vue.use(VueQuillEditor /* 可按需传入全局选项 */)
// Element UI 使用中文语言包 locale
Vue.use(ElementUI, { locale })
// 若改回英文组件文案，可改为 Vue.use(ElementUI)

Vue.config.productionTip = false

// 将 WebSocket 相关方法挂载到 Vue 原型上
Vue.prototype.$connectWebSocket = connectWebSocket
Vue.prototype.$sendMessage = sendMessage

async function bootstrap() {
  await initRuntimeConfig()
  configureRequestBaseUrl()
  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
  })
}

bootstrap()
