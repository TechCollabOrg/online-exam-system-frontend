
<template>
  <div :class="{ 'has-logo': showLogo }">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="(route, index) in routes"
          :key="index"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

/**
 * 侧栏容器：按角色过滤路由 meta.visible，渲染菜单树。
 */
export default {
  components: { SidebarItem, Logo },

  computed: {
    ...mapGetters(['sidebar']),
    /** 根据当前角色为各路由打上 meta.visible，返回完整路由表 */
    routes() {
      const menuList = this.$router.options.routes

      const roleKey = localStorage.getItem('roles')

      menuList.forEach((element) => {
        if (element.meta && element.meta.roles) {
          let isVisible = false
          element.meta.roles.forEach((role) => {
            if (role.startsWith(roleKey)) {
              isVisible = true
              // 一旦找到匹配项，可以提前结束循环，无需继续检查其他项
              return
            }
          })
          element.meta.visible = isVisible
        }
      })
      return menuList
    },
    /** 当前应高亮的菜单 path（支持 meta.activeMenu） */
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    /** 是否在侧栏顶部展示 Logo */
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    /** SCSS 菜单变量注入模板 */
    variables() {
      return variables
    },
    /** 侧栏是否折叠（与 vuex app.sidebar.opened 相反） */
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>
