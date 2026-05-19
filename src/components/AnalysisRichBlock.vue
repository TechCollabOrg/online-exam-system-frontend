<template>
  <div
    v-if="hasContent"
    :class="['analysis-rich-block', variant === 'option' ? 'analysis-rich-block--option' : 'analysis-rich-block--question']"
  >
    <div v-if="label" class="analysis-rich-block__label">{{ label }}</div>
    <rich-html-content :html="html" :block-images="true" />
  </div>
</template>

<script>
import RichHtmlContent from '@/components/RichHtmlContent'

export default {
  name: 'AnalysisRichBlock',
  components: { RichHtmlContent },
  props: {
    html: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    /** question | option */
    variant: {
      type: String,
      default: 'question'
    }
  },
  computed: {
    hasContent() {
      const raw = this.html
      return raw != null && String(raw).trim() !== ''
    }
  }
}
</script>

<style scoped>
.analysis-rich-block {
  display: block;
  width: 100%;
  color: #606266;
  font-size: 13px;
  line-height: 1.55;
  word-break: break-word;
}
.analysis-rich-block--option {
  margin-top: 10px;
  padding-top: 10px;
  clear: both;
  border-top: 1px dashed #e4e7ed;
}
.analysis-rich-block--question {
  margin-top: 8px;
}
.analysis-rich-block__label {
  display: block;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}
</style>
