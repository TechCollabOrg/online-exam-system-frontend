import defaultSettings from '@/settings'

/**
 * 与 `@/settings` 同步的主题/布局开关，供顶栏或设置面板修改。
 */

const { showSettings, fixedHeader, sidebarLogo } = defaultSettings

/** 布局相关本地偏好（顶栏固定、侧栏 Logo 等） */
const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo
}

const mutations = {
  /** 更新单项设置（key 必须存在于 state） */
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  /** @param {{ key: string, value: * }} data */
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
