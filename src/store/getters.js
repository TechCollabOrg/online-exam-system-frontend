/** 根级 getters：聚合各 modules 常用字段 */
const getters = {
  /** @returns {object} 侧边栏展开状态 */
  sidebar: state => state.app.sidebar,
  /** @returns {string} desktop | mobile */
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  /** 顶部页签路由列表 */
  tags: state => state.menu.tags
}
export default getters
