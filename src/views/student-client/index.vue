<template>
  <div class="student-client-page">
    <div class="student-client-page__card">
      <el-button type="text" icon="el-icon-arrow-left" class="back-btn" @click="goBack">
        返回
      </el-button>
      <h1 class="page-title">{{ manifest.title || '学生端桌面客户端' }}</h1>
      <p class="page-lead">
        请分别点击下面两个按钮下载（浏览器一次只能可靠保存一个文件）。下载后把
        <strong>exe</strong> 与 <strong>app-config.json</strong> 放在同一文件夹。
        题图走 MinIO 时请在配置中填写可访问的 <code>minioBaseUrl</code>。
      </p>

      <el-steps :active="4" direction="vertical" class="steps">
        <el-step title="分别下载两个文件" description="先下安装包，再下配置文件（各点一次对应按钮）" />
        <el-step title="放在同一文件夹" description="例如 D:\ExamClient\" />
        <el-step title="编辑 app-config.json" description="apiBaseUrl、wsUrl、minioBaseUrl（若用 MinIO）" />
        <el-step title="启动后端后运行 exe" description="先能打开后端接口文档页，再双击学生端" />
      </el-steps>

      <div class="config-sample">
        <div class="config-sample__title">app-config.json 示例</div>
        <pre>{{ configSample }}</pre>
      </div>

      <div class="actions">
        <el-button
          v-for="item in downloadItems"
          :key="item.id"
          :type="item.buttonType || 'default'"
          :plain="item.buttonType !== 'primary'"
          :loading="downloadingId === item.id"
          :disabled="!availability[item.id]"
          @click="handleDownloadOne(item)"
        >
          <i class="el-icon-download" />
          {{ item.label }}
        </el-button>
      </div>
      <p v-if="!exeReady" class="warn">
        安装包未部署：管理员需执行 <code>npm run electron:dist</code> 与 <code>npm run build:prod</code>。
      </p>
    </div>
  </div>
</template>

<script>
import { downloadPublicAsset } from '@/utils/staticDownload'
import {
  DEFAULT_CLIENT_FILES,
  loadStudentClientManifest,
  probeStudentClientFiles
} from '@/utils/studentClientFiles'
const CONFIG_SAMPLE = `{
  "apiBaseUrl": "http://127.0.0.1:8080/api",
  "wsUrl": "ws://127.0.0.1:8080/websocket",
  "minioBaseUrl": "http://127.0.0.1:9000"
}`

export default {
  name: 'StudentClientGuide',
  data() {
    return {
      manifest: { title: '学生端桌面客户端', files: [] },
      availability: {},
      downloadingId: null,
      configSample: CONFIG_SAMPLE
    }
  },
  computed: {
    downloadItems() {
      return this.manifest.files && this.manifest.files.length
        ? this.manifest.files
        : DEFAULT_CLIENT_FILES
    },
    exeReady() {
      return Boolean(this.availability['client-exe'])
    }
  },
  async created() {
    this.manifest = await loadStudentClientManifest()
    this.availability = await probeStudentClientFiles(this.manifest.files)
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/login')
      }
    },
    async handleDownloadOne(item) {
      if (!this.availability[item.id]) {
        this.$message.warning(item.id === 'client-exe' ? '安装包尚未部署' : '配置文件不可用')
        return
      }
      this.downloadingId = item.id
      try {
        await downloadPublicAsset({
          path: item.path,
          fileName: item.fileName || item.label
        })
        this.$message.success(`已开始下载：${item.fileName || item.label}`)
      } catch (e) {
        console.error(e)
        this.$message.error(`下载失败：${item.label}`)
      } finally {
        this.downloadingId = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.student-client-page {
  min-height: 100vh;
  padding: 32px 16px 48px;
  box-sizing: border-box;
  background: linear-gradient(165deg, #dbeafe 0%, #eff6ff 40%, #f8fafc 100%);
}

.student-client-page__card {
  position: relative;
  max-width: 720px;
  margin: 0 auto;
  padding: 28px 32px 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.1);
}

.back-btn {
  margin: -8px 0 8px -8px;
  color: #64748b;
}

.page-title {
  margin: 0 0 12px;
  font-size: 22px;
  color: #0f172a;
}

.page-lead {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;

  code {
    font-size: 12px;
    background: #f1f5f9;
    padding: 1px 6px;
    border-radius: 4px;
  }
}

.steps {
  margin-bottom: 20px;
}

.config-sample {
  margin-bottom: 20px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 8px;
  }

  pre {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: #0f172a;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.warn {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #b45309;
}

.warn code {
  font-size: 11px;
  background: #fff7ed;
  padding: 0 4px;
  border-radius: 3px;
}
</style>
