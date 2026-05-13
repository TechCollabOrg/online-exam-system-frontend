<template>
  <div
    v-if="sanitized"
    class="rich-html-content"
    v-html="sanitized"
  />
</template>

<script>
import { sanitizeRichHtml } from '@/utils/richHtml'

export default {
  name: 'RichHtmlContent',
  props: {
    html: {
      type: String,
      default: ''
    }
  },
  computed: {
    sanitized() {
      const raw = this.html
      if (raw == null || String(raw).trim() === '') return ''
      return sanitizeRichHtml(raw)
    }
  }
}
</script>

<style scoped>
.rich-html-content {
  line-height: 1.55;
  word-break: break-word;
}
.rich-html-content >>> p {
  margin: 0.35em 0;
}
.rich-html-content >>> img {
  max-width: 100%;
  height: auto;
  vertical-align: middle;
  display: inline-block;
  margin: 4px 0;
}
.rich-html-content >>> a {
  color: #409eff;
}
.rich-html-content >>> ul,
.rich-html-content >>> ol {
  margin: 0.35em 0;
  padding-left: 1.4em;
}
</style>
