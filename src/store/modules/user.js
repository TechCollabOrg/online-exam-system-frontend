/**
 * 用户登录态 Vuex 模块：Token、昵称头像、登录/注销/拉取信息；与 Cookie、WebSocket 连接联动。
 */
import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken,setUserId,removeUserId,setRole,removeRole,setGradeId } from '@/utils/auth'

import { resetRouter } from '@/router'
import { parseJwt } from '@/utils/jwtUtils'
import { connectWebSocket, disconnectWebSocket } from '@/utils/websocket'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()
// const decode = () => {
//   const token = getToken()
//   const user = parseJwt(token)
// }

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // 用户登录：写 Token、解析 JWT 中的角色并写入本地存储，再建立 WebSocket
  login({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      login(userInfo).then(response => {
        const { data } = response
        if (response.code === 1) {
          const info = parseJwt(data)
          const user = JSON.parse(info.userInfo)
          const roleId = JSON.parse(info.userInfo).roleId
          setUserId(user.id)
          if (roleId === 1) {
            window.localStorage.setItem('roles', 'student')
            setRole('student')
            setGradeId(user.gradeId)
          } else if (roleId === 2) {
            window.localStorage.setItem('roles', 'teacher')
            setRole('teacher')
          } else if (roleId === 3) {
            window.localStorage.setItem('roles', 'admin')
            setRole('admin')

          }
          // 建立websocket连接
          connectWebSocket()
          commit('SET_TOKEN', data)
          // STU-01：记住我 → Cookie 带过期天数；否则为会话级 Cookie
          const remember = !!userInfo.rememberMe
          setToken(data, remember ? { expiresDays: 7 } : {})
          resolve()
        } else {
          reject(response)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 拉取当前用户展示信息（昵称、头像等）
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('校验失败，请重新登录')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 清除本地 Token 与内存中的用户状态（不请求后端）
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken()
      commit('RESET_STATE')
      localStorage.removeItem('roles')
      resolve()
    })
  },

  // 用户注销：请求后端登出，清理 Cookie、本地存储并断开 WebSocket
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken()
        resetRouter()
        commit('RESET_STATE')
        try {
          sessionStorage.clear()
        } catch (e) { /* ignore */ }
        removeUserId()
        removeRole()
        localStorage.removeItem('roles')
        disconnectWebSocket()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

