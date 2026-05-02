<template>
  <div class="content">
    <el-upload
      v-model="fileUrl"
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
      default: 1
    }
  },
  data() {
    return {
      server: `api/questions/uploadImage`,
      fileList: [],
      fileUrl: '',
      header: {}
    }
  },

  watch: {
    // 检测查询变化
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

    /**


     * 根据 v-model 初始化 fileList 预览（本地上传组件）：有 URL 时构造单文件列表。


     */
    fillValue() {
      this.fileList = []
      this.fileUrl = this.value
      if (this.fileUrl) {
        this.fileList = [{ name: this.fileUrl, url: this.fileUrl }]
      }
    },

    // 文件超出个数限制时的钩子
    /**

     * 超出 el-upload limit 时提示每次最多上传个数。

     */
    handleExceed() {
      this.$message.warning(`每次只能上传 ${this.limit} 个文件`)
    },
    // 删除文件之前的钩子
    /**

     * 删除前弹出确认框，防止误删已传文件。

     */
    beforeRemove() {
      return this.$confirm(`确定移除文件吗？`)
    },

    // 文件列表移除文件时的钩子
    /**

     * 移除文件后清空 v-model 与 fileList。

     */
    handleRemove() {
      this.$emit('input', '')
      this.fileList = []
    },

    // 文件上传成功时的钩子
    /**

     * 上传成功后根据业务码提示并将返回的图片 URL emit 给父组件。

     */
    handleSuccess(response) {
      if (response.code === 1) {
        this.$message({
          type: 'success',
          message: response.msg
        })
        this.$emit('input', response.data)
        this.fileList = []
        return
      }
    }

  }
}
</script>
