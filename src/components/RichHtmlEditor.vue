<template>
  <div class="rich-html-editor" :style="{ '--qe-min-h': minEditorHeight }">
    <quill-editor
      :value="value"
      :options="editorOption"
      @input="onInput"
      @ready="onReady"
    />
    <p class="rich-html-editor__tip">
      支持分段、标题、加粗与列表；点击工具栏「图片」可多次上传并插入到当前光标处（与选项附图不同，此为解析内嵌图）。
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
    }
  },
  data() {
    return {
      editorOption: {
        theme: 'snow',
        placeholder: '选填：该选项解析（可分段、可插入多张图片）',
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
    onReady(quill) {
      const toolbar = quill.getModule('toolbar')
      toolbar.addHandler('image', () => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/jpeg,image/jpg,image/png,image/webp')
        input.onchange = () => {
          const file = input.files && input.files[0]
          if (!file) return
          this.uploadAndInsert(quill, file)
        }
        input.click()
      })
    },
    async uploadAndInsert(quill, file) {
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
