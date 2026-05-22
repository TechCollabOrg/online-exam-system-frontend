<template>
  <div class="ai-chat-page">
    <el-card shadow="never" class="chat-card" :body-style="{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }">
      <div slot="header" class="chat-header">
        <div class="chat-header-main">
          <span class="title">AI 助手</span>
          <el-tag v-if="configModel" size="mini" type="info">{{ configModel }}</el-tag>
        </div>
        <span class="sub">基于系统操作说明知识库答疑；不透露具体试题、答案与成绩数据。</span>
      </div>

      <el-alert
        v-if="!configured"
        type="warning"
        :closable="false"
        show-icon
        title="AI 尚未由管理员配置或未启用，暂时无法使用。"
        class="config-alert"
      />

      <div ref="messageList" class="message-list">
        <div v-if="messages.length === 0" class="empty-hint">
          <p>你好，我是在线考试系统助手。</p>
          <p>可以问我：学生如何参加考试？教师如何阅卷？管理员如何配置 AI？</p>
        </div>
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-row', msg.role === 'user' ? 'is-user' : 'is-assistant']"
        >
          <div class="avatar">
            <i :class="msg.role === 'user' ? 'el-icon-user' : 'el-icon-cpu'" />
          </div>
          <div class="bubble">
            <div class="bubble-role">{{ msg.role === 'user' ? '我' : 'AI 助手' }}</div>
            <div v-if="msg.role === 'user'" class="bubble-text user-text">{{ msg.content }}</div>
            <markdown-view v-else class="bubble-text" :content="msg.content" />
            <div v-if="msg.loading" class="typing">
              <span /><span /><span />
            </div>
          </div>
        </div>
      </div>

      <div class="composer">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="3"
          maxlength="8000"
          show-word-limit
          placeholder="输入问题，Enter 发送，Shift+Enter 换行"
          :disabled="loading || !configured"
          @keydown.native="onKeydown"
        />
        <div class="composer-actions">
          <el-button :disabled="loading || !configured" @click="clearChat">清空对话</el-button>
          <el-button type="primary" :loading="loading" :disabled="!configured" @click="send">发送</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { aiChat } from '@/api/ai'
import { getAiConfigStatus } from '@/api/aiConfig'
import MarkdownView from '@/components/MarkdownView'
import { getUserId } from '@/utils/auth'
import { loadChatMessages, saveChatMessages, clearChatMessages } from '@/utils/pagePersist'

export default {
  name: 'AiAssistant',
  components: { MarkdownView },
  data() {
    return {
      messages: [],
      inputText: '',
      loading: false,
      configured: true,
      configModel: ''
    }
  },
  created() {
    this.messages = loadChatMessages(getUserId())
    this.$nextTick(() => this.scrollToBottom())
    getAiConfigStatus('assistant').then(res => {
      const d = res.data || {}
      this.configured = d.configured !== false
      this.configModel = d.modelName || ''
    }).catch(() => {})
  },
  methods: {
    onKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.send()
      }
    },
    clearChat() {
      this.messages = []
      this.inputText = ''
      clearChatMessages(getUserId())
    },
    persistChat() {
      saveChatMessages(getUserId(), this.messages)
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageList
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    },
    async send() {
      const text = (this.inputText || '').trim()
      if (!text) {
        this.$message.warning('请输入内容')
        return
      }
      this.messages.push({ role: 'user', content: text })
      this.persistChat()
      this.inputText = ''
      this.loading = true
      const assistantMsg = { role: 'assistant', content: '', loading: true }
      this.messages.push(assistantMsg)
      this.scrollToBottom()

      const history = this.messages
        .slice(0, -2)
        .filter(m => !m.loading && m.content)
        .map(m => ({ role: m.role, content: m.content }))

      try {
        const res = await aiChat({ message: text, history })
        const reply = (res.data && res.data.reply) ? res.data.reply : ''
        assistantMsg.content = reply || '（无回复内容）'
        assistantMsg.loading = false
      } catch (e) {
        assistantMsg.content = '请求失败，请稍后重试。'
        assistantMsg.loading = false
      } finally {
        this.loading = false
        this.persistChat()
        this.scrollToBottom()
      }
    }
  }
}
</script>

<style scoped>
.ai-chat-page {
  padding: 16px;
  height: calc(100vh - 84px);
  box-sizing: border-box;
}
.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chat-header-main {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chat-header .title {
  font-weight: 600;
  font-size: 16px;
}
.chat-header .sub {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
.config-alert {
  margin: 0 16px 8px;
}
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: #f7f8fa;
  min-height: 280px;
}
.empty-hint {
  text-align: center;
  color: #909399;
  font-size: 14px;
  line-height: 1.8;
  margin-top: 40px;
}
.message-row {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}
.message-row.is-user {
  flex-direction: row-reverse;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #606266;
  font-size: 18px;
}
.is-user .avatar {
  background: #409eff;
  color: #fff;
}
.is-assistant .avatar {
  background: #67c23a;
  color: #fff;
}
.bubble {
  max-width: 72%;
  margin: 0 12px;
}
.is-user .bubble {
  text-align: right;
}
.bubble-role {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}
.bubble-text {
  display: inline-block;
  text-align: left;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.is-user .user-text {
  background: #409eff;
  color: #fff;
  white-space: pre-wrap;
  word-break: break-word;
}
.composer {
  border-top: 1px solid #ebeef5;
  padding: 12px 16px 16px;
  background: #fff;
}
.composer-actions {
  margin-top: 10px;
  text-align: right;
}
.composer-actions .el-button + .el-button {
  margin-left: 8px;
}
.typing {
  display: flex;
  gap: 4px;
  padding: 8px 0 0 4px;
}
.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #909399;
  animation: blink 1.2s infinite ease-in-out;
}
.typing span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  0%, 80%, 100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}
</style>
