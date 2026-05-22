<template>
  <div class="feature-panel">
    <el-alert
      v-if="useDefault"
      type="info"
      :closable="false"
      show-icon
      title="当前沿用「默认连接」中的 API，无需重复填写。"
      class="mb-16"
    />

    <el-form ref="formRef" :model="form" :rules="activeRules" label-width="120px" class="panel-form">
      <el-form-item label="连接方式">
        <el-switch
          v-model="form.useDefault"
          active-text="沿用默认"
          inactive-text="单独配置"
        />
      </el-form-item>

      <template v-if="!form.useDefault">
        <el-form-item label="基础 URL" prop="baseUrl">
          <el-input v-model="form.baseUrl" placeholder="例如 https://api.siliconflow.cn/v1" clearable />
        </el-form-item>
        <el-form-item label="API 密钥" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            :placeholder="apiKeySet ? '已保存，留空不修改' : '请输入 API Key'"
            clearable
          />
        </el-form-item>
        <el-form-item label="模型" prop="modelName">
          <el-row :gutter="8" type="flex">
            <el-col :span="16">
              <el-select
                v-model="form.modelName"
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
              <el-button :loading="modelsLoading" @click="loadModels">拉取模型</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item>
          <el-button :loading="testing" @click="testConnection">测试连接</el-button>
        </el-form-item>
      </template>

      <el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </el-form-item>

      <el-divider v-if="!form.useDefault" content-position="left">测试对话</el-divider>
      <template v-if="!form.useDefault">
        <el-form-item label="测试内容">
          <el-input v-model="testMessage" type="textarea" :rows="2" maxlength="200" />
        </el-form-item>
        <el-form-item>
          <el-button :loading="chatTesting" :disabled="!form.enabled" @click="testChat">发送</el-button>
        </el-form-item>
        <el-form-item v-if="testReply" label="回复">
          <div class="test-reply">{{ testReply }}</div>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
import {
  saveAiFeatureConfig,
  testAiConnection,
  fetchAiModels,
  testAiChat
} from '@/api/aiConfig'

export default {
  name: 'AiFeatureConfigPanel',
  props: {
    feature: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form: {
        useDefault: true,
        baseUrl: '',
        apiKey: '',
        modelName: '',
        enabled: false
      },
      apiKeySet: false,
      modelOptions: [],
      modelsLoading: false,
      testing: false,
      saving: false,
      chatTesting: false,
      testMessage: '你好',
      testReply: ''
    }
  },
  computed: {
    useDefault() {
      return this.form.useDefault
    },
    activeRules() {
      if (this.form.useDefault) {
        return {}
      }
      return {
        baseUrl: [{ required: true, message: '请填写基础 URL', trigger: 'blur' }],
        modelName: [{ required: true, message: '请选择模型', trigger: 'change' }]
      }
    }
  },
  watch: {
    feature: {
      immediate: true,
      handler(f) {
        if (!f) return
        this.form.useDefault = f.useDefault !== false
        this.form.baseUrl = f.baseUrl || ''
        this.form.modelName = f.modelName || ''
        this.form.enabled = !!f.enabled
        this.form.apiKey = ''
        this.apiKeySet = !!f.apiKeySet
        this.modelOptions = f.modelName ? [f.modelName] : []
        this.testReply = ''
      }
    }
  },
  methods: {
    probePayload() {
      return {
        baseUrl: (this.form.baseUrl || '').trim(),
        apiKey: (this.form.apiKey || '').trim() || undefined,
        featureCode: this.feature.featureCode
      }
    },
    async loadModels() {
      if (!(this.form.baseUrl || '').trim()) {
        this.$message.warning('请先填写基础 URL')
        return
      }
      this.modelsLoading = true
      try {
        const res = await fetchAiModels(this.probePayload())
        this.modelOptions = res.data || []
      } finally {
        this.modelsLoading = false
      }
    },
    async testConnection() {
      this.testing = true
      try {
        const res = await testAiConnection(this.probePayload())
        const d = res.data || {}
        if (d.valid) {
          this.modelOptions = d.models || []
          this.$message.success('连接成功')
        } else {
          this.$message.error(d.message || '连接失败')
        }
      } finally {
        this.testing = false
      }
    },
    handleSave() {
      if (this.form.useDefault) {
        this.doSave()
        return
      }
      this.$refs.formRef.validate(valid => {
        if (valid) this.doSave()
      })
    },
    async doSave() {
      this.saving = true
      try {
        await saveAiFeatureConfig(this.feature.featureCode, {
          useDefault: this.form.useDefault,
          baseUrl: this.form.useDefault ? undefined : this.form.baseUrl.trim(),
          apiKey: this.form.useDefault ? undefined : (this.form.apiKey || '').trim(),
          modelName: this.form.useDefault ? undefined : this.form.modelName.trim(),
          enabled: this.form.useDefault ? undefined : this.form.enabled
        })
        this.$message.success('保存成功')
        this.$emit('saved')
      } finally {
        this.saving = false
      }
    },
    async testChat() {
      this.chatTesting = true
      this.testReply = ''
      try {
        const res = await testAiChat({
          message: (this.testMessage || '').trim(),
          featureCode: this.feature.featureCode
        })
        this.testReply = res.data || ''
      } finally {
        this.chatTesting = false
      }
    }
  }
}
</script>

<style scoped>
.mb-16 {
  margin-bottom: 16px;
}
.panel-form {
  max-width: 680px;
}
.test-reply {
  white-space: pre-wrap;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 13px;
}
</style>
