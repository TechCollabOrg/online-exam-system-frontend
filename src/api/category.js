import request from '@/utils/request'

/**
 * 题库分类 API：树、一级分类、子节点及分类 CRUD。
 */

/**
 * 获取一级题目分类列表。
 * @returns {Promise}
 */
export function getFirstLevelCategories() {
  return request({
    url: '/category/first-level',
    method: 'get'
  })
}

/**
 * 获取指定父分类下的子分类。
 * @param {string|number} parentId 父分类 id
 * @returns {Promise}
 */
export function getChildCategories(parentId) {
  return request({
    url: `/category/children/${parentId}`,
    method: 'get'
  })
}

/**
 * 获取完整分类树。
 * @returns {Promise}
 */
export function getCategoryTree() {
  return request({
    url: '/category/tree',
    method: 'get'
  })
}

/**
 * 新增分类。
 * @param {object} data 分类信息
 * @returns {Promise}
 */
export function addCategory(data) {
  return request({
    url: '/category',
    method: 'post',
    data
  })
}

/**
 * 更新分类。
 * @param {string|number} id 分类 id
 * @param {object} data 分类信息
 * @returns {Promise}
 */
export function updateCategory(id, data) {
  return request({
    url: `/category/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除分类。
 * @param {string|number} id 分类 id
 * @returns {Promise}
 */
export function deleteCategory(id) {
  return request({
    url: `/category/${id}`,
    method: 'delete'
  })
}
