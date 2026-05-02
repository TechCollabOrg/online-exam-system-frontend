/**
 * 全局默认布局配置（标题与 Element 布局开关）。
 */
module.exports = {

  title: process.env.VUE_APP_TITLE || '校园在线考试系统',

  /**
   * @type {boolean}
   * @description 是否显示布局设置面板
   */
  showSettings: false,

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: false,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: false
}
