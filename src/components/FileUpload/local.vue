<template>
  <div class="content">
    <el-upload
      :action="server"
      :accept="accept"
      :before-remove="beforeRemove"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-exceed="handleExceed"
      :drag="listType !='picture'"
      :limit="limit"
      :headers="header"
      :file-list="fileList"
      :list-type="listType"
      :multiple="limit > 1"
    >

      <el-button v-if="listType==='picture'" size="small" type="primary">点击上传</el-button>

      <i v-if="listType !='picture'" class="el-icon-upload" />
      <div v-if="listType !='picture'" class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
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
