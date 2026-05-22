/**
 * WebSocket 客户端封装：连接后端监考/公告/讨论推送，带断线重连与待发消息队列。
 * 开发环境默认经 devServer 代理到后端；生产/Electron 使用 VUE_APP_WS_URL。
 */
import { getUserId, getGradeId, getRole } from './auth'
import { getWsUrl } from './runtimeConfig'
import { Notification, Message } from 'element-ui'
import Vue from 'vue'

let socket
let reconnectTimer
const reconnectInterval = 5000
let reconnectCount = 0
const maxReconnectCount = 10
let isManuallyClosed = false
const pendingMessages = []

const EventBus = new Vue()

function resolveSocketBaseUrl() {
  const fromRuntime = getWsUrl()
  if (fromRuntime) {
    return fromRuntime
  }
  if (process.env.VUE_APP_WS_URL) {
    return process.env.VUE_APP_WS_URL.replace(/\/$/, '')
  }
  if (process.env.NODE_ENV === 'development') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/websocket`
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.hostname}:8080/websocket`
}

function flushPendingMessages() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return
  }
  while (pendingMessages.length > 0) {
    socket.send(JSON.stringify(pendingMessages.shift()))
  }
}

const connectWebSocket = () => {
  if (!getUserId()) {
    console.error('用户 ID 未设置，无法连接 WebSocket')
    return
  }
  if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
    return
  }
  isManuallyClosed = false
  const socketUrl = `${resolveSocketBaseUrl()}?userId=${getUserId()}`
  socket = new WebSocket(socketUrl)

  socket.onopen = () => {
    console.log('WebSocket 连接成功')
    reconnectCount = 0
    clearInterval(reconnectTimer)
    reconnectTimer = null
    flushPendingMessages()
  }

  socket.onmessage = (event) => {
    console.log('收到消息:', event.data)
    const res = JSON.parse(event.data)
    if (res.type === 'NOTICE' && getRole() === 'student' && res.data.gradeIds.includes(getGradeId())) {
      Notification({
        title: '通知',
        message: '你有一条新公告请及时查收'
      })
    }
    EventBus.$emit('websocket-message', res)
  }

  socket.onclose = () => {
    console.log('WebSocket 连接关闭')
    if (!isManuallyClosed && reconnectCount < maxReconnectCount) {
      if (reconnectTimer) {
        clearInterval(reconnectTimer)
      }
      const currentInterval = reconnectInterval * Math.pow(2, reconnectCount)
      reconnectTimer = setInterval(connectWebSocket, currentInterval)
      reconnectCount++
    } else {
      clearInterval(reconnectTimer)
      reconnectTimer = null
    }
  }

  socket.onerror = (error) => {
    console.error('WebSocket 发生错误:', error)
  }
}

function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message))
    return true
  }
  pendingMessages.push(message)
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    connectWebSocket()
  }
  if (socket && socket.readyState === WebSocket.CONNECTING) {
    return false
  }
  if (!socket) {
    console.warn('WebSocket 未连接，消息已加入队列并尝试重连')
    return false
  }
  if (socket.readyState === WebSocket.CLOSING) {
    Message({ type: 'warning', message: '实时连接正在关闭，评论已保存，请稍后刷新查看' })
    return false
  }
  return false
}

function disconnectWebSocket() {
  if (socket) {
    isManuallyClosed = true
    clearInterval(reconnectTimer)
    reconnectTimer = null
    pendingMessages.length = 0
    socket.close()
    socket = null
    console.log('主动断开 WebSocket 连接')
  }
}

export {
  connectWebSocket,
  disconnectWebSocket,
  sendMessage,
  EventBus
}
