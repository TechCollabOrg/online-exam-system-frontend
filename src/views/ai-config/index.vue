<template>
  <div class="app-container ai-config-page">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span class="page-title">API 连接配置</span>
        <span class="sub">先配置「默认连接」；各 AI 功能可沿用默认，也可单独指定 API 与模型。</span>
      </div>

      <el-tabs v-model="activeTab" type="border-card" class="config-tabs">
        <el-tab-pane label="默认连接" name="default">
          <p class="tab-hint">所有功能的兜底配置；未单独设置的功能均使用此处。</p>
          <el-form ref="defaultFormRef" :model="defaultForm" :rules="defaultRules" label-width="120px" class="config-form">
            <el-form-item label="基础 URL" prop="baseUrl">
              <el-input v-model="defaultForm.baseUrl" placeholder="例如 https://api.siliconflow.cn/v1" clearable />
            </el-form-item>
            <el-form-item label="API 密钥" prop="apiKey">
              <el-input
                v-model="defaultForm.apiKey"
                type="password"
                show-password
                :placeholder="defaultApiKeySet ? '已保存，留空不修改' : '请输入 API Key'"
                clearable
              />
            </el-form-item>
            <el-form-item label="模型" prop="modelName">
              <el-row :gutter="8" type="flex">
                <el-col :span="16">
                  <el-select
                    v-model="defaultForm.modelName"
                    filterable
                    allow-create
                    default-first-option
                    placeholder="测试连接后选择"
                    style="width: 100%"
                    :loading="modelsLoading"
                  >
                    <el-option v-for="m in modelOptions" :key="m" :label="m" :value="m" />
                  </el-select>
                </el-col>
                <el-col :span="8">
                  <el-button :loading="modelsLoading" @click="loadDefaultModels">拉取模型</el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="启用">
              <el-switch v-model="defaultForm.enabled" active-text="启用" inactive-text="停用" />
            </el-form-item>
            <el-form-item label="连接状态">
              <span :class="['status-dot', connectionStatus]" />
              <span>{{ connectionStatusText }}</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" plain :loading="testing" @click="testDefaultConnection">测试连接</el-button>
              <el-button type="primary" :loading="saving" @click="saveDefault">保存默认配置</el-button>
            </el-form-item>
            <el-divider content-position="left">测试对话</el-divider>
            <el-form-item label="测试内容">
              <el-input v-model="testMessage" type="textarea" :rows="2" maxlength="500" />
            </el-form-item>
            <el-form-item>
              <el-button :loading="chatTesting" :disabled="!defaultForm.enabled" @click="testDefaultChat">发送</el-button>
            </el-form-item>
            <el-form-item v-if="testReply" label="回复">
              <div class="test-reply">{{ testReply }}</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane
          v-for="f in features"
          :key="f.featureCode"
          :label="f.featureLabel"
          :name="f.featureCode"
        >
          <p class="tab-hint">{{ f.featureHint }}</p>
          <ai-feature-config-panel :feature="f" @saved="loadOverview" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import {
  getAiConfigOverview,
  saveAiConfig,
  testAiConnection,
  fetchAiModels,
  testAiChat
} from '@/api/aiConfig'
import AiFeatureConfigPanel from '@/components/AiFeatureConfigPanel'

export default {
  name: 'AiApiConfig',
  components: { AiFeatureConfigPanel },
  data() {
    return {
      activeTab: 'default',
      features: [],
      defaultForm: {
        baseUrl: '',
        apiKey: '',
        modelName: '',
        enabled: false
      },
      defaultApiKeySet: false,
      modelOptions: [],
      modelsLoading: false,
      testing: false,
      saving: false,
      chatTesting: false,
      connectionStatus: 'unknown',
      testMessage: '你好，请回复「连接正常」。',
      testReply: '',
      defaultRules: {
        baseUrl: [{ required: true, message: '请填写基础 URL', trigger: 'blur' }],
        modelName: [{ required: true, message: '请选择模型', trigger: 'change' }]
      }
    }
  },
  computed: {
    connectionStatusText() {
      if (this.connectionStatus === 'valid') return '连接正常'
      if (this.connectionStatus === 'invalid') return '连接失败'
      return '未测试'
    }
  },
  created() {
    this.loadOverview()
  },
  methods: {
    defaultProbe() {
      return {
        baseUrl: (this.defaultForm.baseUrl || '').trim(),
        apiKey: (this.defaultForm.apiKey || '').trim() || undefined
      }
    },
    async loadOverview() {
      const res = await getAiConfigOverview()
      const d = res.data || {}
      const def = d.defaultConfig || {}
      this.defaultForm.baseUrl = def.baseUrl || ''
      this.defaultForm.modelName = def.modelName || ''
      this.defaultForm.enabled = !!def.enabled
      this.defaultForm.apiKey = ''
      this.defaultApiKeySet = !!def.apiKeySet
      this.features = d.features || []
      if (def.lastTestOk === true) this.connectionStatus = 'valid'
      else if (def.lastTestOk === false) this.connectionStatus = 'invalid'
      if (this.defaultForm.modelName) {
        this.modelOptions = [this.defaultForm.modelName]
      }
    },
    async loadDefaultModels() {
      if (!(this.defaultForm.baseUrl || '').trim()) {
        this.$message.warning('请先填写基础 URL')
        return
      }
      this.modelsLoading = true
      try {
        const res = await fetchAiModels(this.defaultProbe())
        this.modelOptions = res.data || []
      } finally {
        this.modelsLoading = false
      }
    },
    async testDefaultConnection() {
      this.testing = true
      try {
        const res = await testAiConnection(this.defaultProbe())
        const d = res.data || {}
        this.connectionStatus = d.valid ? 'valid' : 'invalid'
        if (d.valid) {
          this.modelOptions = d.models || []
          this.$message.success('连接成功')
        } else {
          this.$message.error(d.message || '连接失败')
        }
      } catch (e) {
        this.connectionStatus = 'invalid'
      } finally {
        this.testing = false
      }
    },
    saveDefault() {
      this.$refs.defaultFormRef.validate(async valid => {
        if (!valid) return
        if (!this.defaultApiKeySet && !(this.defaultForm.apiKey || '').trim()) {
          this.$message.warning('首次保存请填写 API 密钥')
          return
        }
        this.saving = true
        try {
          await saveAiConfig({
            baseUrl: this.defaultForm.baseUrl.trim(),
            apiKey: (this.defaultForm.apiKey || '').trim(),
            modelName: this.defaultForm.modelName.trim(),
            enabled: this.defaultForm.enabled
          })
          this.$message.success('默认配置已保存')
          await this.loadOverview()
        } finally {
          this.saving = false
        }
      })
    },
    async testDefaultChat() {
      this.chatTesting = true
      this.testReply = ''
      try {
        const res = await testAiChat({ message: (this.testMessage || '').trim() })
        this.testReply = res.data || ''
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
.config-tabs {
  border: none;
  box-shadow: none;
}
.tab-hint {
  color: #909399;
  font-size: 13px;
  margin: 0 0 16px;
}
.config-form {
  max-width: 720px;
}
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
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
.test-reply {
  white-space: pre-wrap;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
}
</style>
