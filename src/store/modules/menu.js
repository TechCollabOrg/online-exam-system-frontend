import router from '@/router'

/**
 * 多页签导航：记录已打开路由、高亮与 sessionStorage 同步，供顶栏标签关闭/切换。
 */

/** 多页签导航状态，持久化在 sessionStorage(TAGS) */
const state = {
  tags: JSON.parse(sessionStorage.getItem('TAGS')) || []
}

const losePath = ['/404']

const mutations = {
  /**
   * 新增或激活路由标签；已存在则仅切换 checked。
   * @param {{ path: string, title?: string, checked?: boolean }} tag
   */
  ADD_TAG: (state, tag) => {
    const pathList = state.tags.map(item => item.path)
    if (!losePath.includes(tag.path)) {
      if (pathList.includes(tag.path)) {
        state.tags.forEach(item => {
          if (item.path === tag.path) {
            item.checked = true
          } else {
            item.checked = false
          }
        })
      } else {
        state?.tags?.forEach(item => {
          item.checked = false
        })
        tag = {
          ...tag,
          checked: true
        }
        state.tags.push(tag)
      }
      sessionStorage.setItem('TAGS', JSON.stringify(state.tags))
    }
  },
  /**
   * 关闭指定标题的标签；若当前路由与被关一致则回退到最后一个标签路由。
   * @param {{ title: string, path: string }} tag
   */
  REMOVE_TAG(state, tag) {
    (state.tags)
    if (state.tags && state.tags.length === 1) {
      return
    }
    state.tags.map((item, index) => {
      if (item.title === tag.title) {
        state.tags.splice(index, 1)
        if (router.history.current.fullPath === tag.path) {
          router.push(state.tags[state.tags.length - 1].path)
        }
      }
    })
    sessionStorage.setItem('TAGS', JSON.stringify(state.tags))
  },
  /** 清空所有页签状态 */
  CLOSE_SIDEBAR: (state) => {
    state.tags = []
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
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
