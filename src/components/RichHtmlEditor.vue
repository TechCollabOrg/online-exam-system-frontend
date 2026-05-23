<template>
  <div class="rich-html-editor" :style="{ '--qe-min-h': minEditorHeight }">
    <quill-editor
      :value="value"
      :options="editorOption"
      @input="onInput"
      @ready="onReady"
    />
    <p class="rich-html-editor__tip">
      支持分段、标题、加粗与列表；可点击工具栏「图片」、将图片拖入编辑区，或在编辑区内 Ctrl+V 粘贴截图/图片，多次插入到当前光标处（与单独「附图」上传不同，此为正文内嵌图）。
    </p>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'RichHtmlEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    /** Quill 编辑区最小高度，如简答题参考答案可设 280px */
    minEditorHeight: {
      type: String,
      default: '200px'
    },
    /** Quill 占位提示，题干 / 选项解析等场景可分别传入 */
    editorPlaceholder: {
      type: String,
      default: '选填：该选项解析（可分段、可插入多张图片）'
    }
  },
  data() {
    return {
      quill: null
    }
  },
  computed: {
    editorOption() {
      return {
        theme: 'snow',
        placeholder: this.editorPlaceholder,
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['blockquote', 'link', 'image'],
              ['clean']
            ]
          }
        }
      }
    }
  },
  methods: {
    onInput(html) {
      this.$emit('input', html || '')
    },
    /** 保存前强制把编辑器最新 HTML 写回 v-model（避免只插图未同步就校验） */
    flushContent() {
      if (!this.quill) {
        return this.value || ''
      }
      const html = this.quill.root.innerHTML || ''
      this.onInput(html)
      return html
    },
    onReady(quill) {
      this.quill = quill
      const toolbar = quill.getModule('toolbar')
      toolbar.addHandler('image', () => this.pickImageFile(quill))
      this.bindEditorImageDropPaste(quill)
    },
    pickImageFile(quill) {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/jpeg,image/jpg,image/png,image/webp')
      input.setAttribute('multiple', 'multiple')
      input.onchange = () => {
        const files = input.files
        if (!files || !files.length) return
        Array.from(files).forEach(file => {
          if (this.isAcceptedImage(file)) this.uploadAndInsert(quill, file)
        })
      }
      input.click()
    },
    isAcceptedImage(file) {
      if (!file || !file.type) return false
      return /^image\/(jpeg|jpg|png|webp)$/i.test(file.type)
    },
    bindEditorImageDropPaste(quill) {
      const editor = quill.root
      editor.addEventListener('paste', (e) => {
        const files = this.extractImageFilesFromClipboard(e)
        if (!files.length) return
        e.preventDefault()
        this.uploadAndInsertMany(quill, files)
      })
      editor.addEventListener('dragover', (e) => {
        if (this.hasImageInDataTransfer(e.dataTransfer)) {
          e.preventDefault()
        }
      })
      editor.addEventListener('drop', (e) => {
        const files = this.extractImageFilesFromDataTransfer(e.dataTransfer)
        if (!files.length) return
        e.preventDefault()
        e.stopPropagation()
        this.uploadAndInsertMany(quill, files)
      })
    },
    async uploadAndInsertMany(quill, files) {
      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        await this.uploadAndInsert(quill, file)
      }
    },
    extractImageFilesFromClipboard(e) {
      const dt = e.clipboardData
      if (!dt) return []
      const files = []
      if (dt.files && dt.files.length) {
        Array.from(dt.files).forEach(f => {
          if (this.isAcceptedImage(f)) files.push(f)
        })
      }
      if (files.length) return files
      if (!dt.items) return []
      for (let i = 0; i < dt.items.length; i++) {
        const item = dt.items[i]
        if (item.kind === 'file' && item.type && item.type.indexOf('image') === 0) {
          const file = item.getAsFile()
          if (file && this.isAcceptedImage(file)) files.push(file)
        }
      }
      return files
    },
    hasImageInDataTransfer(dt) {
      if (!dt) return false
      if (dt.files && dt.files.length) {
        return Array.from(dt.files).some(f => this.isAcceptedImage(f))
      }
      if (!dt.types) return false
      return Array.from(dt.types).some(t => t === 'Files' || (t && t.indexOf('image/') === 0))
    },
    extractImageFilesFromDataTransfer(dt) {
      if (!dt || !dt.files || !dt.files.length) return []
      return Array.from(dt.files).filter(f => this.isAcceptedImage(f))
    },
    async uploadAndInsert(quill, file) {
      if (!this.isAcceptedImage(file)) {
        this.$message.warning('仅支持 JPG、PNG、WEBP 图片')
        return
      }
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await request({
          url: 'questions/uploadImage',
          method: 'post',
          data: formData,
          timeout: 120000
        })
        if (res.code !== 1 || !res.data) {
          this.$message.error(res.msg || '上传失败')
          return
        }
        const url = res.data
        const range = quill.getSelection(true)
        const index = range ? range.index : quill.getLength()
        quill.insertEmbed(index, 'image', url, 'user')
        quill.setSelection(index + 1)
      } catch (e) {
        this.$message.error((e && e.message) || '图片上传失败')
      }
    }
  }
}
</script>

<style scoped>
.rich-html-editor {
  width: 100%;
}
.rich-html-editor >>> .quill-editor {
  display: block;
}
.rich-html-editor >>> .ql-container {
  min-height: var(--qe-min-h, 200px);
  font-size: 14px;
}
.rich-html-editor >>> .ql-toolbar {
  border-radius: 4px 4px 0 0;
}
.rich-html-editor >>> .ql-container.ql-snow {
  border-radius: 0 0 4px 4px;
}
.rich-html-editor__tip {
  margin: 6px 0 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
</style>
