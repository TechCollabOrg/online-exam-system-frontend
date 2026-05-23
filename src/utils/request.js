/**
 * 全局 Axios 实例：所有 src/api 下的请求共用本实例。
 * - baseURL：开发为 /api（走 vue.config 代理）；Electron 生产包优先读 exe 同目录 app-config.json。
 * - 响应头中的 authorization：后端可下发新 JWT，此处写入 Cookie 与 Vuex，支撑需求 5.2「考试期间令牌刷新」。
 */
import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken, setToken } from '@/utils/auth'
import router from '@/router'
import { getApiBaseUrl, getBackendHint, getConfigPath } from '@/utils/runtimeConfig'

// 创建带统一超时、Cookie、baseURL 的 Axios 实例（各业务 API 均 import 本实例）
const service = axios.create({
  baseURL: getApiBaseUrl(), // 开发 /api；Electron 生产包可由 app-config.json 覆盖
  withCredentials: true, // 跨域时携带 Cookie（与后端 Session/Redis 会话配合）
  timeout: 30000, // 请求超时毫秒数
  crossDomain: true
})

/** 在 main.js 中 initRuntimeConfig 之后调用，使 Electron 配置文件生效 */
export function configureRequestBaseUrl() {
  service.defaults.baseURL = getApiBaseUrl()
}

/** 登录/注册/验证码等匿名接口不应带旧 JWT，否则过滤器与会话状态可能异常（Electron 下更明显） */
function shouldSkipAuthHeader(url) {
  const u = (url || '').replace(/^\//, '')
  return (
    /auths\/login\b/.test(u) ||
    /auths\/register\b/.test(u) ||
    /auths\/verifyCode\b/.test(u) ||
    /auths\/captcha/.test(u)
  )
}

// 请求拦截：自动带上登录后保存在 Cookie 里的 JWT
service.interceptors.request.use(
  config => {
    if (store.getters.token && !shouldSkipAuthHeader(config.url)) {
      // 与后端约定：Authorization 携带 JWT；存 Cookie/Storage 为纯 JWT，此处统一加 Bearer
      const raw = getToken()
      if (raw) {
        config.headers['Authorization'] = raw.toLowerCase().startsWith('bearer ')
          ? raw
          : `Bearer ${raw}`
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截：统一处理业务 code、HTTP 状态码与 Token 续签
service.interceptors.response.use(
  response => {
    const res = response.data
    const newToken =
      response.headers['authorization'] ||
      response.headers['Authorization']
    if (newToken) {
      setToken(newToken)
      // setToken 已归一化为纯 JWT；Vuex 与 Cookie/localStorage 保持一致
      store.commit('SET_TOKEN', getToken())
    }

    if (res.code !== 1) {
      Message({
        message: res.msg || '错误',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.msg || '错误'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error)
    if (error.response) {
      const data = error.response.data
      const backendMsg =
        data && typeof data === 'object' && (data.msg || data.message)
          ? (data.msg || data.message)
          : null

      switch (error.response.status) {
        case 401:
          // 清除token
          store.dispatch('user/resetToken')
          // 跳转登录页
          router.replace({
            path: '/login',
            query: { redirect: router.currentRoute.fullPath }
          })
          Message({
            message: '登录已过期，请重新登录',
            type: 'error',
            duration: 5 * 1000
          })
          break
        case 403:
          // 403 多半来自后端鉴权/权限（token 缺失、角色不匹配、验证码接口被拦截等）
          // 这里把关键信息打到控制台，方便定位是哪一个接口触发的
          console.warn('[HTTP 403]', {
            url: (error.config && (error.config.baseURL || '') + (error.config.url || '')) || '',
            method: error.config && error.config.method,
            backendMsg
          })
          Message({
            message: backendMsg || '没有权限访问该资源（403）',
            type: 'error',
            duration: 5 * 1000
          })
          break
        case 404:
          Message({
            message: '请求的资源不存在',
            type: 'error',
            duration: 5 * 1000
          })
          break
        default:
          Message({
            message: backendMsg || `请求失败（HTTP ${error.response.status}）`,
            type: 'error',
            duration: 5 * 1000
          })
      }
    } else {
      // 通常是：后端没启动 / 端口不通 / 代理失败 / 网络断开
      const cfgHint = getConfigPath()
        ? `当前配置：${getConfigPath()}`
        : '未找到 app-config.json（portable 单 exe 请放在 exe 同目录）'
      Message({
        message: `连接后端失败：请确认后端已启动（${getBackendHint()}）。${cfgHint}，改完后刷新页面`,
        type: 'error',
        duration: 6 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
