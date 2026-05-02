import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon'

Vue.component('svg-icon', SvgIcon)

const req = require.context('./svg', false, /\.svg$/)

/**
 * 批量注册 svg 目录下图标为 webpack context。
 * @param {__WebpackModuleApi.RequireContext} requireContext
 */
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
