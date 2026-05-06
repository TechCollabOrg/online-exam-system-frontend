/**
 * 全局路由进度与页签：在每次切换路由时显示顶部进度条、设置浏览器标题，并向 Vuex 的 menu 模块登记访问过的页签。
 * 说明：登录态白名单校验写在 src/main.js 的另一个 beforeEach 中；本文件侧重 UI 层面的进度与标签页。
 */
import router from './router'
import store from './store'
// import { Message } from 'element-ui'
import NProgress from 'nprogress' // 顶部细条加载进度
import 'nprogress/nprogress.css'
// import { getToken } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // 不显示右侧转圈，只保留顶条

// const whiteList = ['/login'] // 若在此做免登录白名单，与 main.js 守卫需统一策略

router.beforeEach(async(to, from, next) => {
  // 开始显示进度条
  NProgress.start()

  // 拼接浏览器标签标题（来自路由 meta.title 与站点名）
  document.title = getPageTitle(to.meta.title)

  // 下方曾预留「先拉用户信息再 next」的逻辑，当前项目将登录拦截放在 main.js，此处仅维护标签
  // const hasToken = getToken()
  // 必须只调用一次 next()；若对 /login、/ 先 next 再无条件 next，会导致重复解析导航，登录页首屏验证码等请求异常
  if (to.path !== '/login' && to.path !== '/') {
    // 记录到顶部标签栏（多页签导航）
    store.commit('menu/ADD_TAG', {
      path: to.path,
      checked: false,
      title: to.meta.title
    })
  }
  next()

  //   if (hasToken) {
  //     if (to.path === '/login') {
  //       // if is logged in, redirect to the home page
  //       next({ path: '/' })
  //       NProgress.done()
  //     } else {
  //       const hasGetUserInfo = store.getters.name
  //       if (hasGetUserInfo) {
  //         next()
  //       } else {
  //         try {
  //           // get user info
  //           await store.dispatch('user/getInfo')

  //           next()
  //         } catch (error) {
  //           // remove token and go to login page to re-login
  //           await store.dispatch('user/resetToken')
  //           Message.error(error || 'Has Error')
  //           next(`/login?redirect=${to.path}`)
  //           NProgress.done()
  //         }
  //       }
  //     }
  //   } else {
  //     /* has no token*/

  //     if (whiteList.indexOf(to.path)  != -1) {
  //       // in the free login whitelist, go directly
  //       next()
  //     } else {
  //       // other pages that do not have permission to access are redirected to the login page.
  //       next(`/login?redirect=${to.path}`)
  //       NProgress.done()
  //     }
  //   }
})

router.afterEach(() => {
  // 路由切换结束，隐藏进度条
  NProgress.done()
})
