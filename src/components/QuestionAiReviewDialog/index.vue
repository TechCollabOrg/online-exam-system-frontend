<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visibleProxy"
    width="560px"
    top="10vh"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="!loading"
    custom-class="question-ai-review-dialog"
    @open="onOpen"
    @closed="onClosed"
  >
    <el-alert
      v-if="!configured"
      type="warning"
      :closable="false"
      show-icon
      title="AI 尚未由管理员配置或未启用，暂时无法使用。"
      style="margin-bottom: 12px"
    />
    <div v-loading="loading" class="review-body">
      <p v-if="!loading && !analysis && configured" class="hint">正在向 AI 请求解析…</p>
      <markdown-view v-if="analysis" :content="analysis" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visibleProxy = false">关闭</el-button>
      <el-button
        type="primary"
        :loading="loading"
        :disabled="!configured"
        @click="fetchAnalysis"
      >重新解析</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { questionAiReview } from '@/api/ai'
import { getAiConfigStatus } from '@/api/aiConfig'
import MarkdownView from '@/components/MarkdownView'

export default {
  name: 'QuestionAiReviewDialog',
  components: { MarkdownView },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    examId: {
      type: [String, Number],
      default: ''
    },
    quId: {
      type: [String, Number],
      default: null
    },
    userId: {
      type: [String, Number],
      default: null
    },
    questionNo: {
      type: [String, Number],
      default: ''
    },
    subIndex: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      analysis: '',
      configured: true
    }
  },
  computed: {
    visibleProxy: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    dialogTitle() {
      const base = this.questionNo ? `AI 解析 · 第 ${this.questionNo} 题` : 'AI 题目解析'
      if (this.subIndex != null && this.subIndex >= 0) {
        return `${base}（小题 ${this.subIndex + 1}）`
      }
      return base
    }
  },
  methods: {
    onOpen() {
      this.analysis = ''
      getAiConfigStatus().then((res) => {
        const d = res.data || {}
        this.configured = d.configured !== false
        if (this.configured) {
          this.fetchAnalysis()
        }
      }).catch(() => {
        this.configured = false
      })
    },
    onClosed() {
      this.loading = false
      this.analysis = ''
    },
    async fetchAnalysis() {
      if (!this.examId || !this.quId) {
        return
      }
      this.loading = true
      try {
        const payload = {
          examId: Number(this.examId),
          quId: Number(this.quId)
        }
        if (this.userId != null && this.userId !== '') {
          payload.userId = Number(this.userId)
        }
        if (this.subIndex != null && this.subIndex >= 0) {
          payload.subIndex = this.subIndex
        }
        const res = await questionAiReview(payload)
        this.analysis = (res.data && res.data.analysis) ? res.data.analysis : ''
        if (!this.analysis) {
          this.$message.warning(res.msg || '未返回解析内容')
        }
      } catch (e) {
        this.analysis = ''
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.review-body {
  min-height: 120px;
  max-height: 55vh;
  overflow-y: auto;
}
.hint {
  color: #909399;
  font-size: 13px;
  margin: 0;
}
</style>
