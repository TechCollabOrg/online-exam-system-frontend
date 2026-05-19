<template>
  <div
    class="content file-upload-dropzone"
    tabindex="0"
    @paste="handlePaste"
  >
    <el-upload
      ref="upload"
      :action="server"
      :accept="accept"
      :before-remove="beforeRemove"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-exceed="handleExceed"
      drag
      :limit="limit"
      :headers="header"
      :file-list="fileList"
      :list-type="listType"
      :multiple="limit > 1"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将图片拖到此处，或<em>点击选择</em>；聚焦此区域后也可 Ctrl+V 粘贴
      </div>
      <div v-if="tips" slot="tip" class="el-upload__tip">{{ tips }}</div>
    </el-upload>
  </div>
</template>

<script>

import { getToken } from '@/utils/auth'
import { joinImageUrls, parseImageUrls } from '@/utils/imageUrls'

export default {
  name: 'FileUploadLocal',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: String,
    // eslint-disable-next-line vue/require-default-prop
    accept: String,
    // eslint-disable-next-line vue/require-default-prop
    tips: String,
    // eslint-disable-next-line vue/require-default-prop
    listType: String,
    limit: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      server: `api/questions/uploadImage`,
      fileList: [],
      header: {}
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
    this.header = { Authorization: getToken() }
  },

  methods: {

    fillValue() {
      const urls = parseImageUrls(this.value)
      this.fileList = urls.map((url, i) => ({ name: `图片${i + 1}`, url }))
    },

    handleExceed() {
      this.$message.warning(`最多上传 ${this.limit} 张图片`)
    },

    beforeRemove() {
      return this.$confirm(`确定移除该图片吗？`)
    },

    beforeUpload(file) {
      if (!this.isAcceptedFile(file)) {
        this.$message.warning('仅支持 JPG、JPEG、PNG 图片')
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
      if (file.type && /^image\/(jpeg|png)$/.test(file.type)) {
        return allowed.some(a => a === '.jpg' || a === '.jpeg' || a === '.png' || a.indexOf('image') === 0)
      }
      return false
    },

    handlePaste(e) {
      const files = this.extractImageFilesFromClipboard(e)
      if (!files.length) return
      e.preventDefault()
      this.uploadRawFiles(files)
    },

    extractImageFilesFromClipboard(e) {
      const dt = e.clipboardData
      if (!dt) return []
      const files = []
      if (dt.files && dt.files.length) {
        Array.from(dt.files).forEach(f => {
          if (this.isAcceptedFile(f)) files.push(f)
        })
      }
      if (files.length) return files
      if (!dt.items) return []
      for (let i = 0; i < dt.items.length; i++) {
        const item = dt.items[i]
        if (item.kind === 'file' && item.type && item.type.indexOf('image') === 0) {
          const file = item.getAsFile()
          if (file && this.isAcceptedFile(file)) files.push(file)
        }
      }
      return files
    },

    uploadRawFiles(files) {
      const upload = this.$refs.upload
      if (!upload) return
      const remain = this.limit - this.fileList.length
      if (remain <= 0) {
        this.handleExceed()
        return
      }
      files.slice(0, remain).forEach(file => {
        upload.handleStart(file)
      })
      if (files.length > remain) {
        this.handleExceed()
      }
      upload.submit()
    },

    handleRemove(file, fileList) {
      const urls = fileList
        .map(f => f.url)
        .filter(u => u && typeof u === 'string' && !u.startsWith('blob:'))
      this.$emit('input', joinImageUrls(urls))
    },

    handleSuccess(response, file, fileList) {
      if (response.code === 1) {
        const urls = fileList
          .map(f => {
            if (f.url && typeof f.url === 'string' && !f.url.startsWith('blob:')) return f.url
            if (f.response && f.response.code === 1 && f.response.data) return f.response.data
            return null
          })
          .filter(Boolean)
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
    }

  }
}
</script>

<style scoped>
.file-upload-dropzone:focus {
  outline: none;
}
.file-upload-dropzone:focus >>> .el-upload-dragger {
  border-color: #409eff;
}
</style>
