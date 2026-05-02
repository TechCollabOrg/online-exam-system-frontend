import Cookies from 'js-cookie'

/**
 * 布局壳层状态：侧栏展开/折叠（Cookie 记忆）、当前设备类型（桌面/移动）。
 */

/** 侧边栏开合与终端类型（桌面/移动） */
const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop'
}

const mutations = {
  /** 切换侧边栏展开，并写入 Cookie */
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  /** 强制收起侧栏（如移动端进入） */
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  /** @param {'desktop'|'mobile'} device */
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  /** @param {{ withoutAnimation: boolean }} payload */
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
