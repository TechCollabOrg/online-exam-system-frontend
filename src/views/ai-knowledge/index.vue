<template>
  <div class="app-container ai-knowledge-page">
    <el-card shadow="never">
      <div slot="header" class="header-row">
        <div>
          <span class="page-title">AI 知识库</span>
          <span class="sub">供「AI 助手」检索；支持 Markdown，勿写入题库、答案、成绩等敏感内容。</span>
        </div>
        <div class="header-actions">
          <el-button size="small" @click="handleImport">导入内置文档</el-button>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openEditor()">新增文档</el-button>
        </div>
      </div>

      <el-input
        v-model="keyword"
        placeholder="搜索标题或正文"
        clearable
        prefix-icon="el-icon-search"
        class="search-input"
        @keyup.enter.native="loadList"
        @clear="loadList"
      />

      <el-table v-loading="loading" :data="list" border stripe style="width: 100%; margin-top: 12px">
        <el-table-column prop="sortOrder" label="排序" width="72" align="center" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="88" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="mini">
              {{ row.enabled ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="168" />
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" @click="openEditor(row)">编辑</el-button>
            <el-button type="text" size="small" style="color: #f56c6c" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="editorTitle"
      :visible.sync="dialogVisible"
      width="720px"
      top="6vh"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="本地文件">
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept=".md,.markdown,.txt"
            :on-change="handleLocalFile"
          >
            <el-button size="small" icon="el-icon-upload2">选择文件导入</el-button>
          </el-upload>
          <span class="hint">支持 .md / .txt，UTF-8 编码，单文件不超过 2MB</span>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
          <span class="hint">数字越小越优先参与检索</span>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="14"
            placeholder="支持 Markdown，建议用 ## 分段便于检索"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listAiKnowledge,
  addAiKnowledge,
  updateAiKnowledge,
  deleteAiKnowledge,
  importBuiltinKnowledge
} from '@/api/aiKnowledge'

export default {
  name: 'AiKnowledgeManage',
  data() {
    return {
      keyword: '',
      list: [],
      loading: false,
      dialogVisible: false,
      editingId: null,
      saving: false,
      form: {
        title: '',
        content: '',
        enabled: true,
        sortOrder: 0
      },
      rules: {
        title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
        content: [{ required: true, message: '请填写正文', trigger: 'blur' }]
      }
    }
  },
  computed: {
    editorTitle() {
      return this.editingId ? '编辑知识库文档' : '新增知识库文档'
    }
  },
  created() {
    this.loadList()
  },
  methods: {
    async loadList() {
      this.loading = true
      try {
        const res = await listAiKnowledge({
          keyword: (this.keyword || '').trim() || undefined
        })
        this.list = res.data || []
      } finally {
        this.loading = false
      }
    },
    openEditor(row) {
      if (row && row.id) {
        this.editingId = row.id
        this.form = {
          title: row.title,
          content: row.content,
          enabled: row.enabled !== false,
          sortOrder: row.sortOrder != null ? row.sortOrder : 0
        }
      } else {
        this.editingId = null
        this.form = {
          title: '',
          content: '',
          enabled: true,
          sortOrder: 0
        }
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      })
    },
    resetForm() {
      this.editingId = null
    },
    handleLocalFile(file) {
      const raw = file.raw
      if (!raw) return
      const name = raw.name || ''
      const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : ''
      if (!['md', 'markdown', 'txt'].includes(ext)) {
        this.$message.warning('仅支持 .md、.markdown、.txt 文件')
        return
      }
      if (raw.size > 2 * 1024 * 1024) {
        this.$message.warning('单文件不超过 2MB')
        return
      }
      const reader = new FileReader()
      reader.onload = e => {
        const text = (e.target && e.target.result) || ''
        if (!String(text).trim()) {
          this.$message.warning('文件内容为空')
          return
        }
        const apply = () => {
          if (!this.form.title.trim()) {
            this.form.title = name.replace(/\.(md|markdown|txt)$/i, '')
          }
          this.form.content = text
          this.$message.success('已载入：' + name)
          this.$nextTick(() => {
            if (this.$refs.formRef) {
              this.$refs.formRef.clearValidate(['title', 'content'])
            }
          })
        }
        if (this.form.content && this.form.content.trim()) {
          this.$confirm('导入将覆盖当前正文，是否继续？', '提示', { type: 'warning' })
            .then(apply)
            .catch(() => {})
        } else {
          apply()
        }
      }
      reader.onerror = () => this.$message.error('读取文件失败，请确认文件为 UTF-8 编码')
      reader.readAsText(raw, 'UTF-8')
    },
    handleSave() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.saving = true
        const payload = {
          title: this.form.title.trim(),
          content: this.form.content,
          enabled: this.form.enabled,
          sortOrder: this.form.sortOrder
        }
        try {
          if (this.editingId) {
            await updateAiKnowledge(this.editingId, payload)
            this.$message.success('保存成功')
          } else {
            await addAiKnowledge(payload)
            this.$message.success('添加成功')
          }
          this.dialogVisible = false
          await this.loadList()
        } finally {
          this.saving = false
        }
      })
    },
    handleDelete(row) {
      this.$confirm(`确定删除「${row.title}」？`, '提示', { type: 'warning' })
        .then(async() => {
          await deleteAiKnowledge(row.id)
          this.$message.success('已删除')
          await this.loadList()
        })
        .catch(() => {})
    },
    async handleImport() {
      try {
        const res = await importBuiltinKnowledge()
        this.$message.success(res.msg || '导入完成')
        await this.loadList()
      } catch (e) {
        // 拦截器已提示
      }
    }
  }
}
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}
.page-title {
  font-weight: 600;
  font-size: 16px;
}
.sub {
  display: block;
  margin-top: 6px;
  color: #909399;
  font-size: 13px;
  max-width: 520px;
}
.header-actions {
  flex-shrink: 0;
}
.search-input {
  max-width: 320px;
}
.hint {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
