<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visibleProxy"
    width="640px"
    top="8vh"
    append-to-body
    :close-on-click-modal="!loading"
    @open="onOpen"
    @closed="onClosed"
  >
    <el-alert
      v-if="!configured"
      type="warning"
      :closable="false"
      show-icon
      title="AI 尚未由管理员配置或未启用，暂时无法生成知识树。"
      style="margin-bottom: 12px"
    />
    <div v-loading="loading" class="knowledge-tree-body">
      <div v-if="treeData.generatedAt || treeData.rootName" class="meta">
        <span v-if="treeData.rootName">主题：{{ treeData.rootName }}</span>
        <span v-if="treeData.generatedAt"> · 最近生成：{{ treeData.generatedAt }}</span>
        <span v-if="treeData.totalQuestions"> · 分析题目：{{ treeData.totalQuestions }} 道</span>
      </div>
      <p v-if="!loading && !hasNodes && configured" class="hint">
        尚未生成知识树。点击下方按钮，AI 将根据本题库题目自动归纳知识点层级。
      </p>
      <p v-if="!loading && !hasNodes && !configured" class="hint">
        请先在「API 连接配置」中启用 AI 后再生成知识树。
      </p>
      <el-tree
        v-if="hasNodes"
        :data="displayNodes"
        :props="treeProps"
        default-expand-all
        :expand-on-click-node="false"
        class="knowledge-tree"
      >
        <span slot-scope="{ node, data }" class="tree-node">
          <span>{{ node.label }}</span>
          <el-tag v-if="data.questionCount" size="mini" type="info" style="margin-left: 8px">
            {{ data.questionCount }} 题
          </el-tag>
        </span>
      </el-tree>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visibleProxy = false">关闭</el-button>
      <el-button
        type="primary"
        :loading="loading"
        :disabled="!configured"
        @click="handleGenerate"
      >{{ treeData.generated ? '重新生成' : '生成知识树' }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getRepoKnowledgeTree, generateRepoKnowledgeTree } from '@/api/repo'
import { getAiConfigStatus } from '@/api/aiConfig'

export default {
  name: 'RepoKnowledgeTreeDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    repoId: {
      type: [String, Number],
      default: null
    },
    repoTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      configured: true,
      treeData: {
        rootName: '',
        nodes: [],
        generated: false,
        generatedAt: null,
        totalQuestions: null
      },
      treeProps: {
        children: 'children',
        label: 'label'
      }
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
      const title = this.repoTitle || '题库'
      return `${title} · 知识树`
    },
    hasNodes() {
      return this.displayNodes && this.displayNodes.length > 0
    },
    displayNodes() {
      return this.buildDisplayNodes(this.treeData.nodes || [])
    }
  },
  methods: {
    async onOpen() {
      await this.checkAiConfig()
      await this.fetchTree(false)
    },
    onClosed() {
      this.treeData = {
        rootName: '',
        nodes: [],
        generated: false,
        generatedAt: null,
        totalQuestions: null
      }
    },
    async checkAiConfig() {
      try {
        const res = await getAiConfigStatus()
        this.configured = !!(res && res.code && res.data && res.data.configured)
      } catch (e) {
        this.configured = false
      }
    },
    buildDisplayNodes(nodes) {
      if (!nodes || !nodes.length) {
        return []
      }
      return nodes.map(node => ({
        label: node.name,
        questionCount: node.questionCount || (node.questionIds ? node.questionIds.length : 0),
        children: this.buildDisplayNodes(node.children || [])
      }))
    },
    async fetchTree(showEmptyTip) {
      if (!this.repoId) {
        return
      }
      this.loading = true
      try {
        const res = await getRepoKnowledgeTree(this.repoId)
        if (res && res.code && res.data) {
          this.treeData = {
            rootName: res.data.rootName || '',
            nodes: res.data.nodes || [],
            generated: !!res.data.generated,
            generatedAt: res.data.generatedAt || null,
            totalQuestions: res.data.totalQuestions || null
          }
        } else if (showEmptyTip) {
          this.$message.error((res && res.msg) || '获取知识树失败')
        }
      } catch (e) {
        if (showEmptyTip) {
          this.$message.error('获取知识树失败')
        }
      } finally {
        this.loading = false
      }
    },
    async handleGenerate() {
      if (!this.repoId) {
        return
      }
      const confirmText = this.treeData.generated
        ? '重新生成将覆盖当前知识树，是否继续？'
        : '将根据本题库题目调用 AI 生成知识树，可能需要数十秒，是否继续？'
      try {
        await this.$confirm(confirmText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch (e) {
        return
      }
      this.loading = true
      try {
        const res = await generateRepoKnowledgeTree(this.repoId)
        if (res && res.code && res.data) {
          this.treeData = {
            rootName: res.data.rootName || '',
            nodes: res.data.nodes || [],
            generated: true,
            generatedAt: res.data.generatedAt || null,
            totalQuestions: res.data.totalQuestions || null
          }
          this.$message.success(res.msg || '知识树生成成功')
        } else {
          this.$message.error((res && res.msg) || '知识树生成失败')
        }
      } catch (e) {
        this.$message.error('知识树生成失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.knowledge-tree-body {
  min-height: 200px;
  max-height: 55vh;
  overflow: auto;
}
.meta {
  margin-bottom: 12px;
  color: #909399;
  font-size: 13px;
}
.hint {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
}
.knowledge-tree {
  margin-top: 8px;
}
.tree-node {
  display: inline-flex;
  align-items: center;
}
</style>
