<template>
  <div class="student-client-page">
    <div class="student-client-page__card">
      <el-button type="text" icon="el-icon-arrow-left" class="back-btn" @click="goBack">
        返回
      </el-button>
      <h1 class="page-title">{{ manifest.title || '学生端桌面客户端' }}</h1>
      <p class="page-lead">
        任选一种方式下载。压缩包解压即可；单独下载时请把 <strong>exe</strong> 与
        <strong>app-config.json</strong> 放在同一文件夹。题图走 MinIO 时在配置中填写
        <code>minioBaseUrl</code>。
      </p>

      <el-steps :active="4" direction="vertical" class="steps">
        <el-step title="下载" description="压缩包一次下齐，或分别下载安装包与配置文件" />
        <el-step title="放在同一文件夹" description="压缩包需解压；松散文件直接同级存放" />
        <el-step title="编辑 app-config.json" description="apiBaseUrl、wsUrl、minioBaseUrl（若用 MinIO）" />
        <el-step title="启动后端后运行 exe" description="先能打开后端接口文档页，再双击学生端" />
      </el-steps>

      <div class="download-section">
        <div class="download-section__title">方式一：压缩包</div>
        <p class="download-section__hint">推荐。内含安装包与配置文件，解压后 exe 与 json 已在同一目录。</p>
        <el-button
          type="primary"
          :loading="downloadingId === bundleItem.id"
          :disabled="!availability[bundleItem.id]"
          @click="handleDownloadOne(bundleItem)"
        >
          <i class="el-icon-download" />
          {{ bundleItem.label }}
        </el-button>
      </div>

      <div class="download-section">
        <div class="download-section__title">方式二：单独下载</div>
        <p class="download-section__hint">浏览器一次只保存一个文件时，请各点一次下面按钮。</p>
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
      </div>

      <div class="config-sample">
        <div class="config-sample__title">app-config.json 示例</div>
        <pre>{{ configSample }}</pre>
      </div>

      <p v-if="!exeReady && !zipReady" class="warn">
        安装包未部署：管理员需执行 <code>npm run electron:dist</code> 与 <code>npm run build:prod</code>。
      </p>
    </div>
  </div>
</template>

<script>
import { downloadPublicAsset } from '@/utils/staticDownload'
import {
  DEFAULT_CLIENT_BUNDLE,
  DEFAULT_CLIENT_FILES,
  loadStudentClientManifest,
  probeStudentClientDownloads
} from '@/utils/studentClientFiles'

const CONFIG_SAMPLE = `{
  "apiBaseUrl": "http://10.8.174.165:8080/api",
  "wsUrl": "ws://10.8.174.165:8080/websocket",
  "minioBaseUrl": "http://10.8.174.165:9000"
}`

export default {
  name: 'StudentClientGuide',
  data() {
    return {
      manifest: { title: '学生端桌面客户端', bundle: DEFAULT_CLIENT_BUNDLE, files: [] },
      availability: {},
      downloadingId: null,
      configSample: CONFIG_SAMPLE
    }
  },
  computed: {
    bundleItem() {
      return this.manifest.bundle || DEFAULT_CLIENT_BUNDLE
    },
    downloadItems() {
      return this.manifest.files && this.manifest.files.length
        ? this.manifest.files
        : DEFAULT_CLIENT_FILES
    },
    exeReady() {
      return Boolean(this.availability['client-exe'])
    },
    zipReady() {
      return Boolean(this.availability['client-zip'])
    }
  },
  async created() {
    this.manifest = await loadStudentClientManifest()
    this.availability = await probeStudentClientDownloads(this.manifest)
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
      if (!item || !this.availability[item.id]) {
        const tip =
          item && item.id === 'client-zip'
            ? '压缩包尚未部署'
            : item && item.id === 'client-exe'
              ? '安装包尚未部署'
              : '文件不可用'
        this.$message.warning(tip)
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
  margin-bottom: 24px;
}

.download-section {
  margin-bottom: 20px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 6px;
  }

  &__hint {
    margin: 0 0 12px;
    font-size: 13px;
    line-height: 1.5;
    color: #64748b;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.config-sample {
  margin-bottom: 8px;
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
