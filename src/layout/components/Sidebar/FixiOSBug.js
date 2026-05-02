/**
 * 修复 iOS 下 SubMenu mouseleave 误触发的 mixin。
 * @see https://github.com/PanJiaChen/vue-element-admin/issues/1135
 */
export default {
  computed: {
    device() {
      return this.$store.state.app.device
    }
  },
  mounted() {
    this.fixBugIniOS()
  },
  methods: {
    /** 改写 el-submenu 的 handleMouseleave，移动端直接短路 */
    fixBugIniOS() {
      const $subMenu = this.$refs.subMenu
      if ($subMenu) {
        const handleMouseleave = $subMenu.handleMouseleave
        $subMenu.handleMouseleave = (e) => {
          if (this.device === 'mobile') {
            return
          }
          handleMouseleave(e)
        }
      }
    }
  }
}
