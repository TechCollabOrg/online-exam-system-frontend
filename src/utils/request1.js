import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import { Loading } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

/**
 * 备用 axios 实例：业务码约定与 {@link ./request.js} 不同（此处 0 表示成功），用于上传/下载等场景。
 */
const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 60000
})

/** 请求拦截：附带 token 请求头（字段名为 token） */
instance.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['token'] = getToken()
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截：二进制直接返回；JSON 时 code!=0 提示错误，登录超时码触发重新登录。
 */
instance.interceptors.response.use(
  response => {
    const res = response.data

    if (res.type === 'application/octet-stream') {
      return response
    }

    if (res.type === 'application/vnd.ms-excel') {
      return response
    }

    if (res.code != 0) {
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      if (res.code === 10010002) {
        MessageBox.confirm('登录超时，请重新登录！', '登录提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

/**
 * multipart 上传文件，带全局 Loading。
 * @param {string} url 接口路径
 * @param {File|Blob} file 文件对象
 * @param {Record<string, string>} [data] 额外表单项
 * @returns {Promise}
 */
export function upload(url, file, data) {
  const formData = new FormData()
  formData.append('file', file)

  if (data) {
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key])
    })
  }

  return new Promise((resolve, reject) => {
    const loading = Loading.service({
      text: '正在上传数据...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    instance.request({
      url: url,
      method: 'post',
      data: formData,
      timeout: 1200000
    }).then(response => {
      loading.close()
      resolve(response)
    }).catch(err => {
      loading.close()
      reject(err)
    })
  })
}

/**
 * POST 下载 Excel（blob），触发浏览器保存。
 * @param {string} url 接口路径
 * @param {object} data 请求体
 * @param {string} fileName 保存文件名
 * @returns {Promise<void>}
 */
export function download(url, data, fileName) {
  return new Promise((resolve, reject) => {
    const loading = Loading.service({
      text: '正在下载数据...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    instance.request({
      url: url,
      method: 'post',
      data: data,
      timeout: 1200000,
      responseType: 'blob'
    }).then(res => {
      loading.close()

      const blob = new Blob([res.data], {
        type: 'application/vnd.ms-excel'
      })

      let link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', fileName)
      link.click()
      link = null
      Message.success('导出成功!')
    }).catch(err => {
      loading.close()
      reject(err)
    })
  })
}

/**
 * POST JSON，返回 Promise（resolve 为拦截器处理后的 data）。
 * @param {string} url 路径
 * @param {object} [data={}] 请求体
 * @returns {Promise}
 */
export function post(url, data = {}) {
  return new Promise((resolve, reject) => {
    instance.post(url, data)
      .then(response => {
        resolve(response)
      }, err => {
        reject(err)
      })
  })
}
