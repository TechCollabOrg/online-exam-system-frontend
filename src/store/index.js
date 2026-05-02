import Vue from 'vue'
import Vuex from 'vuex'
// eslint-disable-next-line no-unused-vars
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import menu from './modules/menu'
import { trackPresence } from '@/api/user'
Vue.use(Vuex)

/**
 * 根 Store：挂载业务模块，并提供登录心跳定时任务占位逻辑。
 */
const store = new Vuex.Store({
  state: {
    isUserLoggedIn: false,
    heartbeatIntervalId: null
  },
  mutations: {
    /**
     * 设置登录态；为 true 时启动定时心跳（每 5 分钟）。
     * @param {boolean} value
     */
    setUserLoggedIn(state, value) {
      state.isUserLoggedIn = value
      if (value && !state.heartbeatIntervalId) {
        this.dispatch('sendHeartbeat')
        state.heartbeatIntervalId = setInterval(() => {
          this.dispatch('sendHeartbeat')
        }, 300000)
      } else if (!value && state.heartbeatIntervalId) {
        clearInterval(state.heartbeatIntervalId)
        state.heartbeatIntervalId = null
      }
    }
  },

  actions: {
    /** 调用后端 track-presence 接口保持会话统计 */
    sendHeartbeat({ commit, state }) {
      trackPresence({ userId: state.userId }).then(response => {
      })
        .catch(error => {
          console.error('心跳发送失败:', error)
        })
    },
    /** 演示用登录：仅切换本地登录标记 */
    loginUser({ commit }, userData) {
      commit('setUserLoggedIn', true)
    },
    logoutUser({ commit }) {
      commit('setUserLoggedIn', false)
    }
  },
  getters: {
    isLoggedIn: state => state.isUserLoggedIn
  },
  modules: {
    app,
    settings,
    user,
    menu
  },

  // eslint-disable-next-line no-dupe-keys
  getters
})

export default store
