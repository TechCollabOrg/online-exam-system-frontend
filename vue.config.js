/**
 * Vue CLI 构建与开发服务器配置。
 * - devServer.proxy：开发时将前端的 /api 代理到后端 application-dev.yml 中的端口（默认 8080），避免浏览器跨域。
 * - publicPath: './：生产包可被 Electron file:// 打开（资源相对路径）。
 * 需求文档 7.2：教师/管理员使用浏览器访问本前端；学生端桌面见 npm run electron:dist。
 */
// 'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = process.env.VUE_APP_TITLE || defaultSettings.title || '校园在线考试系统' // 注入到 index.html 的标题

// 开发服务端口；若改为 80 在部分系统需管理员权限。也可启动时指定：set port=9528 && npm run dev
const port = process.env.port || process.env.npm_config_port || 9527

// 完整配置项说明见 https://cli.vuejs.org/config/
module.exports = {

  /**
   * 静态资源公共路径：部署在子路径（如 GitHub Pages 的 /bar/）时改为 '/bar/'。
   * Electron 使用 file:// 打开本地包，此处用相对路径 './'。
   */
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    // disableHostCheck: true,
    host: '0.0.0.0',
    port: port,
    // 开发启动默认打开登录页（无令牌或会话已失效时会停在此；已勾选记住我且仍有效会先被守卫送进首页）
    open: false,
    overlay: {
      warnings: false,
      errors: true
    },
    // 前端跨域
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        /**
         * 局域网同学访问时，后端若下发了 `Domain=127.0.0.1` 之类的 Cookie，
         * 浏览器会直接丢弃（因为当前域名是 10.x/192.168.x）。
         * 这里把 Domain 去掉，让 Cookie 变成“当前访问域名”的 Cookie，从而保证验证码/会话不丢。
         */
        cookieDomainRewrite: '',
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
    // before: require('./mock/mock-server.js')
  },
  configureWebpack: {
    // 将应用标题写入 webpack name，供 index.html 等引用
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    // 预加载关键资源，加速首屏（排除 sourcemap、热更新与 runtime 片段）
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // 路由较多时关闭 prefetch，减少无意义预请求
    config.plugins.delete('prefetch')

    // 将 src/icons 下 svg 打成雪碧图，供 svg-icon 组件按 symbolId 引用
    config.module.rule('svg').exclude.add(resolve('src/icons')).end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    config.when(process.env.NODE_ENV  != 'development', (config) => {
      config
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [
          {
            // 与 optimization.runtimeChunk 名称一致，内联 runtime 减小请求数
            inline: /runtime\..*\.js$/
          }
        ])
        .end()
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial' // 入口依赖的第三方库
          },
          elementUI: {
            name: 'chunk-elementUI', // Element UI 单独分包
            priority: 20, // 需大于 libs，否则会被打进 libs
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // 兼容 cnpm 目录
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'),
            minChunks: 3, // 至少被 3 处引用才抽出公共组件
            priority: 5,
            reuseExistingChunk: true
          }
        }
      })
      // 抽取 runtime chunk，见 webpack optimization.runtimeChunk 文档
      config.optimization.runtimeChunk('single')
    })
  }
}
