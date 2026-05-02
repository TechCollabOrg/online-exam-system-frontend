
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

/**
 * 仪表盘入口：按本地 roles 切换教师/管理员看板与学生看板。
 */
export default {
  components: {
    comAdmin,
    comStudent
  },
  /** url：0 管理员/教师组件，2 学生组件 */
  data() {
    return {
      url: 0

    }
  },
  /** 根据 localStorage.roles 设置展示分支 */
  created() {
    // this.url = this.$route.query.url;
    const roles = localStorage.getItem('roles')
    switch (roles) {
      case 'admin': {
        this.url = 0
        break
      }
      case 'teacher': {
        this.url = 0
        break
      }
      case 'student': {
        this.url = 2
        break
      }
    }
  }

}
</script>
<style scoped>

</style>
