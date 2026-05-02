
/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * 判断是否为外部链接（http(s)/mailto/tel）。
 * @param {string} path 路由或 URL 片段
 * @returns {boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 校验用户名非空（模板项目占位逻辑，可按业务替换）。
 * @param {string} str 输入串
 * @returns {boolean}
 */
export function validUsername(str) {
  return str.trim().length > 0
}
