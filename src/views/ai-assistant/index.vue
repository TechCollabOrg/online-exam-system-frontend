<template>
  <div class="ai-assistant">
    <el-card shadow="never" class="box-card">
      <div slot="header" class="clearfix">
        <span>AI 助手</span>
        <span class="sub">使用管理员配置的 AI 接口；若无法使用请联系管理员在「API 连接配置」中完成设置。</span>
      </div>
      <el-input
        v-model="message"
        type="textarea"
        :rows="6"
        maxlength="8000"
        show-word-limit
        placeholder="输入你的问题…"
      />
      <el-alert
        v-if="!configured"
        type="warning"
        :closable="false"
        show-icon
        title="AI 尚未由管理员配置或未启用，暂时无法使用。"
        style="margin-bottom: 12px"
      />
      <div class="actions">
        <el-button type="primary" :loading="loading" :disabled="!configured" @click="send">发送</el-button>
        <el-button :disabled="loading" @click="clear">清空</el-button>
      </div>
      <el-divider content-position="left">回复</el-divider>
      <div class="reply">{{ reply || '（尚无回复）' }}</div>
    </el-card>
  </div>
</template>

<script>
import { aiChat } from '@/api/ai'
import { getAiConfigStatus } from '@/api/aiConfig'

export default {
  name: 'AiAssistant',
  data() {
    return {
      message: '',
      reply: '',
      loading: false,
      configured: true,
      configModel: ''
    }
  },
  created() {
    getAiConfigStatus().then(res => {
      const d = res.data || {}
      this.configured = d.configured !== false
      this.configModel = d.modelName || ''
    }).catch(() => {})
  },
  methods: {
    clear() {
      this.message = ''
      this.reply = ''
    },
    async send() {
      const text = (this.message || '').trim()
      if (!text) {
        this.$message.warning('请输入内容')
        return
      }
      this.loading = true
      try {
        const res = await aiChat({ message: text })
        this.reply = (res.data && res.data.reply) ? res.data.reply : ''
        if (this.reply) {
          this.$message.success('已收到回复')
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.ai-assistant {
  padding: 16px;
}
.sub {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}
.actions {
  margin-top: 12px;
}
.reply {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  min-height: 80px;
  color: #303133;
}
</style>
