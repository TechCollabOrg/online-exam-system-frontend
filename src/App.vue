<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'

// 根组件：仅挂载路由视图，具体页面在 src/views
export default {
  name: 'App',
  created() {
    // 刷新页面后恢复学生心跳，避免在线时长统计中断
    if (getToken() && window.localStorage.getItem('roles') === 'student') {
      this.$store.commit('setUserLoggedIn', true)
    }
  }
}
</script>
