
<template>
  <div>
    <div>
      <com-admin v-if="url == 0" />
      <com-student v-else-if="url == 2" />
    </div>
  </div>
</template>
<script>
import comAdmin from './rolePage/adminAndTeacher.vue'
import comStudent from './rolePage/student.vue'
import { getRole } from '@/utils/jwtUtils'

export default {
  components: {
    comAdmin,
    comStudent
  },
  data() {
    return {
      url: 0
    }
  },
  created() {
    // 以 JWT 中的 roleId 为准，避免 localStorage.roles 与令牌不一致时首页请求 403
    try {
      const roleId = getRole()
      this.url = roleId === 1 ? 2 : 0
      return
    } catch (e) {
      /* 无令牌时回退 localStorage */
    }
    const roles = window.localStorage.getItem('roles')
    switch (roles) {
      case 'admin':
      case 'teacher':
        this.url = 0
        break
      case 'student':
        this.url = 2
        break
      default:
        this.url = 0
    }
  }

}
</script>
<style scoped>

</style>
