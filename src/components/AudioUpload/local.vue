<template>
  <div
    class="content audio-upload-dropzone"
    tabindex="0"
  >
    <el-upload
      ref="upload"
      :action="server"
      :accept="accept"
      :before-remove="beforeRemove"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-change="handleChange"
      :on-error="handleError"
      :on-exceed="handleExceed"
      drag
      :limit="limit"
      :headers="header"
      :file-list="fileList"
      list-type="text"
      :multiple="limit > 1"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将音频拖到此处，或<em>点击选择</em>
      </div>
      <div v-if="tips" slot="tip" class="el-upload__tip">{{ tips }}</div>
      <div v-else slot="tip" class="el-upload__tip">支持 MP3、WAV、M4A、OGG、AAC，单文件不超过 50MB</div>
    </el-upload>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { joinImageUrls, parseImageUrls } from '@/utils/imageUrls'
import { getApiBaseUrl } from '@/utils/runtimeConfig'

export default {
  name: 'AudioUploadLocal',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: String,
    accept: {
      type: String,
      default: '.mp3,.wav,.m4a,.ogg,.aac,.webm'
    },
    // eslint-disable-next-line vue/require-default-prop
    tips: String,
    limit: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      fileList: [],
      header: {}
    }
  },
  computed: {
    server() {
      const base = (getApiBaseUrl() || '/api').replace(/\/$/, '')
      return `${base}/questions/uploadAudio`
    }
  },
  watch: {
    value: {
      handler() {
        this.fillValue()
      }
    }
  },
  created() {
    this.fillValue()
    this.header = this.buildAuthHeader()
  },
  methods: {
    buildAuthHeader() {
      const raw = getToken()
      if (!raw) return {}
      const token = raw.toLowerCase().startsWith('bearer ') ? raw : `Bearer ${raw}`
      return { Authorization: token }
    },
    extractUrlsFromList(fileList) {
      return (fileList || [])
        .map(f => {
          if (f.url && typeof f.url === 'string' && !f.url.startsWith('blob:')) return f.url
          if (f.response && f.response.code === 1 && f.response.data) return f.response.data
          return null
        })
        .filter(Boolean)
    },
    syncFileListFromUrls(urls) {
      this.fileList = urls.map((url, i) => ({
        name: `音频${i + 1}`,
        url,
        status: 'success'
      }))
    },
    fillValue() {
      const urls = parseImageUrls(this.value)
      this.syncFileListFromUrls(urls)
    },
    handleExceed() {
      this.$message.warning(`最多上传 ${this.limit} 个音频`)
    },
    beforeRemove() {
      return this.$confirm('确定移除该音频吗？')
    },
    beforeUpload(file) {
      if (!this.isAcceptedFile(file)) {
        this.$message.warning('仅支持 MP3、WAV、M4A、OGG、AAC 等常见音频格式')
        return false
      }
      if (file.size > 50 * 1024 * 1024) {
        this.$message.warning('单文件不超过 50MB')
        return false
      }
      return true
    },
    isAcceptedFile(file) {
      if (!file) return false
      const accept = (this.accept || '').toLowerCase()
      if (!accept || accept === '*') return true
      const ext = '.' + (file.name || '').split('.').pop().toLowerCase()
      const allowed = accept.split(',').map(s => s.trim().toLowerCase())
      if (allowed.some(a => a === ext || a === file.type)) return true
      if (file.type && /^audio\//.test(file.type)) {
        return true
      }
      return false
    },
    handleChange(file, fileList) {
      if (file && (file.status === 'uploading' || file.status === 'ready')) {
        this.fileList = fileList.slice()
      }
    },
    handleRemove(file, fileList) {
      const urls = this.extractUrlsFromList(fileList)
      this.syncFileListFromUrls(urls)
      this.$emit('input', joinImageUrls(urls))
    },
    handleSuccess(response, file, fileList) {
      if (response && response.code === 1) {
        const urls = this.extractUrlsFromList(fileList)
        this.syncFileListFromUrls(urls)
        this.$emit('input', joinImageUrls(urls))
        this.$message({
          type: 'success',
          message: response.msg || '上传成功'
        })
        return
      }
      this.$message({
        type: 'error',
        message: (response && response.msg) || '上传失败'
      })
    },
    handleError() {
      this.$message.error('音频上传失败，请检查登录状态与后端服务')
    }
  }
}
</script>

<style scoped>
.audio-upload-dropzone:focus {
  outline: none;
}
.audio-upload-dropzone:focus >>> .el-upload-dragger {
  border-color: #409eff;
}
</style>
