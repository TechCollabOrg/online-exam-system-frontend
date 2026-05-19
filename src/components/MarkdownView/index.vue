<template>
  <div class="markdown-view" v-html="safeHtml" />
</template>

<script>
import marked from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  breaks: true,
  gfm: true
})

export default {
  name: 'MarkdownView',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  computed: {
    safeHtml() {
      const raw = this.content || ''
      if (!raw.trim()) {
        return ''
      }
      const html = marked.parse(raw)
      return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
    }
  }
}
</script>

<style scoped>
.markdown-view {
  line-height: 1.65;
  word-break: break-word;
  font-size: 14px;
  color: #303133;
}
.markdown-view >>> h1,
.markdown-view >>> h2,
.markdown-view >>> h3 {
  margin: 12px 0 8px;
  font-weight: 600;
}
.markdown-view >>> p {
  margin: 6px 0;
}
.markdown-view >>> ul,
.markdown-view >>> ol {
  margin: 6px 0 6px 20px;
  padding: 0;
}
.markdown-view >>> code {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}
.markdown-view >>> pre {
  background: #f5f7fa;
  padding: 10px 12px;
  border-radius: 6px;
  overflow-x: auto;
}
.markdown-view >>> pre code {
  background: none;
  padding: 0;
}
.markdown-view >>> blockquote {
  margin: 8px 0;
  padding-left: 12px;
  border-left: 3px solid #dcdfe6;
  color: #606266;
}
</style>
