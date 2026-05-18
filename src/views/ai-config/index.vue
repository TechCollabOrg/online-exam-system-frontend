<template>
  <div class="app-container ai-config-page">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span class="page-title">API 连接配置</span>
        <span class="sub">OpenAI 兼容接口（硅基流动、自建代理等）。保存并启用后，教师与学生可使用 AI 助手、阅卷与成绩简报等功能。</span>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" class="config-form">
        <el-form-item label="聊天补全来源">
          <el-tag type="info">自定义（兼容 OpenAI）</el-tag>
        </el-form-item>

        <el-form-item label="基础 URL" prop="baseUrl">
          <el-input
            v-model="form.baseUrl"
            placeholder="例如 https://api.siliconflow.cn/v1"
            clearable
          />
          <div class="hint">需包含 /v1；系统会请求 {基础URL}/models 与对话接口。</div>
        </el-form-item>

        <el-form-item label="API 密钥" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            :placeholder="apiKeySet ? '已保存密钥，留空则不修改' : '请输入 API Key'"
            clearable
          />
        </el-form-item>

        <el-form-item label="可用模型">
          <el-row :gutter="12" type="flex" align="middle">
            <el-col :span="14">
              <el-select
                v-model="form.modelName"
                filterable
                allow-create
                default-first-option
                placeholder="先测试连接后从列表选择，或手动输入模型名"
                style="width: 100%"
                :loading="modelsLoading"
              >
                <el-option
                  v-for="m in modelOptions"
                  :key="m"
                  :label="m"
                  :value="m"
                />
              </el-select>
            </el-col>
            <el-col :span="10">
              <el-button :loading="modelsLoading" @click="loadModels">刷新模型列表</el-button>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="启用配置">
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>

        <el-form-item label="连接状态">
          <span v-if="connectionStatus === 'valid'" class="status-dot valid" />
          <span v-else-if="connectionStatus === 'invalid'" class="status-dot invalid" />
          <span v-else class="status-dot unknown" />
          <span class="status-text">{{ connectionStatusText }}</span>
          <span v-if="saved.lastTestTime" class="status-time">（上次测试：{{ saved.lastTestTime }}）</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="testing" @click="handleTestConnection">测试连接</el-button>
          <el-button type="success" :loading="saving" @click="handleSave">保存配置</el-button>
        </el-form-item>

        <el-divider content-position="left">发送测试消息</el-divider>
        <el-form-item label="测试内容">
          <el-input
            v-model="testMessage"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="保存并启用后，可发送一条短消息验证对话"
          />
        </el-form-item>
        <el-form-item>
          <el-button :loading="chatTesting" :disabled="!form.enabled" @click="handleTestChat">发送测试消息</el-button>
        </el-form-item>
        <el-form-item v-if="testReply" label="测试回复">
          <div class="test-reply">{{ testReply }}</div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import {
  getAiConfig,
  saveAiConfig,
  testAiConnection,
  fetchAiModels,
  testAiChat
} from '@/api/aiConfig'

export default {
  name: 'AiApiConfig',
  data() {
    return {
      form: {
        baseUrl: '',
        apiKey: '',
        modelName: '',
        enabled: false
      },
      saved: {
        lastTestOk: null,
        lastTestTime: null
      },
      apiKeySet: false,
      modelOptions: [],
      modelsLoading: false,
      testing: false,
      saving: false,
      chatTesting: false,
      connectionStatus: 'unknown',
      testMessage: '你好，请回复「连接正常」。',
      testReply: '',
      rules: {
        baseUrl: [{ required: true, message: '请填写基础 URL', trigger: 'blur' }],
        modelName: [{ required: true, message: '请选择或填写模型', trigger: 'change' }]
      }
    }
  },
  computed: {
    connectionStatusText() {
      if (this.connectionStatus === 'valid') return 'Valid — 连接正常'
      if (this.connectionStatus === 'invalid') return 'Invalid — 连接失败'
      return '未测试'
    }
  },
  created() {
    this.loadConfig()
  },
  methods: {
    probePayload() {
      return {
        baseUrl: (this.form.baseUrl || '').trim(),
        apiKey: (this.form.apiKey || '').trim() || undefined
      }
    },
    async loadConfig() {
      const res = await getAiConfig()
      const d = res.data || {}
      this.form.baseUrl = d.baseUrl || ''
      this.form.modelName = d.modelName || ''
      this.form.enabled = !!d.enabled
      this.form.apiKey = ''
      this.apiKeySet = !!d.apiKeySet
      this.saved.lastTestTime = d.lastTestTime || ''
      if (d.lastTestOk === true) {
        this.connectionStatus = 'valid'
      } else if (d.lastTestOk === false) {
        this.connectionStatus = 'invalid'
      }
      if (this.form.modelName) {
        this.modelOptions = [this.form.modelName]
      }
    },
    async loadModels() {
      if (!(this.form.baseUrl || '').trim()) {
        this.$message.warning('请先填写基础 URL')
        return
      }
      if (!this.apiKeySet && !(this.form.apiKey || '').trim()) {
        this.$message.warning('请填写 API 密钥')
        return
      }
      this.modelsLoading = true
      try {
        const res = await fetchAiModels(this.probePayload())
        const list = res.data || []
        this.modelOptions = list
        if (list.length === 0) {
          this.$message.warning('未获取到模型，可手动输入模型名')
        } else {
          this.$message.success('已获取 ' + list.length + ' 个模型')
          if (!this.form.modelName && list.length > 0) {
            this.form.modelName = list[0]
          }
        }
      } finally {
        this.modelsLoading = false
      }
    },
    async handleTestConnection() {
      if (!(this.form.baseUrl || '').trim()) {
        this.$message.warning('请填写基础 URL')
        return
      }
      if (!this.apiKeySet && !(this.form.apiKey || '').trim()) {
        this.$message.warning('请填写 API 密钥')
        return
      }
      this.testing = true
      this.testReply = ''
      try {
        const res = await testAiConnection(this.probePayload())
        const d = res.data || {}
        if (d.valid) {
          this.connectionStatus = 'valid'
          this.modelOptions = d.models || []
          if (this.modelOptions.length && !this.form.modelName) {
            this.form.modelName = this.modelOptions[0]
          }
          this.$message.success(d.message || '连接成功')
        } else {
          this.connectionStatus = 'invalid'
          this.$message.error(d.message || '连接失败')
        }
      } catch (e) {
        this.connectionStatus = 'invalid'
      } finally {
        this.testing = false
      }
    },
    handleSave() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        if (!this.apiKeySet && !(this.form.apiKey || '').trim()) {
          this.$message.warning('首次保存请填写 API 密钥')
          return
        }
        this.saving = true
        try {
          await saveAiConfig({
            baseUrl: this.form.baseUrl.trim(),
            apiKey: (this.form.apiKey || '').trim(),
            modelName: this.form.modelName.trim(),
            enabled: this.form.enabled
          })
          this.$message.success('保存成功')
          this.form.apiKey = ''
          await this.loadConfig()
        } finally {
          this.saving = false
        }
      })
    },
    async handleTestChat() {
      const text = (this.testMessage || '').trim()
      if (!text) {
        this.$message.warning('请输入测试内容')
        return
      }
      this.chatTesting = true
      this.testReply = ''
      try {
        const res = await testAiChat({ message: text })
        this.testReply = res.data || ''
        if (this.testReply) {
          this.$message.success('已收到回复')
        }
      } finally {
        this.chatTesting = false
      }
    }
  }
}
</script>

<style scoped>
.ai-config-page .page-title {
  font-weight: 600;
  font-size: 16px;
}
.sub {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}
.config-form {
  max-width: 720px;
}
.hint {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}
.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.status-dot.valid {
  background: #67c23a;
}
.status-dot.invalid {
  background: #f56c6c;
}
.status-dot.unknown {
  background: #dcdfe6;
}
.status-text {
  vertical-align: middle;
}
.status-time {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
.test-reply {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #303133;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  min-height: 48px;
}
</style>
