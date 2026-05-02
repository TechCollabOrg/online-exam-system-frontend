import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Vue Admin Template'

/**
 * 拼接浏览器标签标题：页面标题 + 站点名。
 * @param {string} [pageTitle] 当前路由 meta.title
 * @returns {string}
 */
export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
