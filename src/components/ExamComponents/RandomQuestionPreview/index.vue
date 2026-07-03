<template>
  <div class="random-preview-wrap">
    <el-card shadow="never" class="selected-qu-panel">
      <div slot="header" class="selected-qu-header">
        <span>随机抽取结果（{{ rows.length }} 题，共 {{ totalScore }} 分）</span>
        <span class="selected-qu-tip">可移除、改分或从题库补充；确认后再点页面底部「保存」</span>
      </div>
      <el-table :data="rows" border size="small" max-height="360">
        <el-table-column label="序号" align="center" width="60">
          <template slot-scope="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column label="题干" align="left" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">{{ questionStemListLabel(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="题型" align="center" width="90">
          <template slot-scope="scope">{{ quTypeLabel(scope.row.quType) }}</template>
        </el-table-column>
        <el-table-column prop="repoTitle" label="题库" align="center" width="120" show-overflow-tooltip />
        <el-table-column label="分值" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.assignScore }}</span>
            <el-tag v-if="scope.row.scoreCustomized" size="mini" type="warning" style="margin-left: 4px">已改</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="openDetailDialog(scope.row)">查看详情</el-button>
            <el-button type="text" size="small" @click="openScoreDialog(scope.row)">设置分值</el-button>
            <el-button type="text" size="small" style="color: #f56c6c" @click="removeRow(scope.$index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 12px">
        <el-button size="small" type="primary" plain icon="el-icon-plus" @click="addDialogVisible = true">
          从题库添加
        </el-button>
      </div>
    </el-card>

    <el-dialog title="从题库添加题目" :visible.sync="addDialogVisible" width="900px" append-to-body @open="onAddDialogOpen">
      <el-form :inline="true" size="small">
        <el-form-item label="题干关键词">
          <el-input v-model="addSearchName" placeholder="输入关键词" clearable />
        </el-form-item>
        <el-form-item label="题型">
          <el-select v-model="addSelType" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchAddQu">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table
        ref="addTable"
        :data="addPageData.records || []"
        border
        size="small"
        max-height="320"
        @selection-change="handleAddSelectionChange"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column label="题干" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">{{ questionStemListLabel(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="题型" width="90" align="center">
          <template slot-scope="scope">{{ quTypeLabel(scope.row.quType) }}</template>
        </el-table-column>
        <el-table-column prop="repoTitle" label="题库" width="120" align="center" show-overflow-tooltip />
      </el-table>
      <el-pagination
        v-if="addPageData.total"
        style="margin-top: 12px; text-align: right"
        small
        layout="total, prev, pager, next"
        :current-page="addPageNum"
        :page-size="addPageSize"
        :total="addPageData.total"
        @current-change="handleAddPageChange"
      />
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddQuestions">加入试卷</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="题目详情"
      :visible.sync="detailDialogVisible"
      width="720px"
      append-to-body
      @closed="detailLoading = false; detailQuestion = null"
    >
      <div v-loading="detailLoading" style="min-height: 120px">
        <template v-if="detailQuestion">
          <p style="margin: 0 0 12px">
            <el-tag size="small">{{ quTypeLabel(detailQuestion.quType) }}</el-tag>
            <span v-if="detailQuestion.repoTitle" style="margin-left: 8px; color: #909399; font-size: 13px">
              {{ detailQuestion.repoTitle }}
            </span>
          </p>
          <compound-stem-block
            v-if="detailQuestion.quType === 5"
            :stem-content="questionStemDisplay(detailQuestion)"
            :stem-image="detailQuestion.image"
            :stem-audio="detailQuestion.audio"
          />
          <div v-if="detailQuestion.quType !== 5 && questionStemDisplay(detailQuestion)" style="margin-bottom: 14px">
            <rich-html-content :html="questionStemDisplay(detailQuestion)" />
            <question-audio-player :audio="detailQuestion.audio" />
          </div>
          <div v-if="detailQuestion.quType === 5 && detailQuestion.subItems && detailQuestion.subItems.length">
            <div
              v-for="(sub, sidx) in detailQuestion.subItems"
              :key="'dsub-' + sidx"
              style="margin: 12px 0; padding-bottom: 10px; border-bottom: 1px dashed #ebeef5"
            >
              <div v-if="sub.content" style="margin-bottom: 6px">
                <span style="font-weight: 600">({{ sidx + 1 }})</span>
                <rich-html-content :html="sub.content" />
              </div>
              <div v-if="sub.quType === 1 || sub.quType === 2 || sub.quType === 3">
                <div
                  v-for="(opt, oidx) in sub.options || []"
                  :key="'dopt-' + sidx + '-' + oidx"
                  style="margin: 4px 0; color: #606266"
                >
                  {{ String.fromCharCode(65 + oidx) }}. {{ opt.content }}
                  <el-tag v-if="opt.isRight === 1 || opt.isRight === true" size="mini" type="success" style="margin-left: 6px">答案</el-tag>
                </div>
              </div>
              <div v-else-if="sub.quType === 4">
                <div
                  v-for="(opt, oidx) in sub.options || []"
                  :key="'dblank-' + sidx + '-' + oidx"
                  style="margin-top: 6px; color: #606266"
                >
                  空{{ oidx + 1 }}：<rich-html-content :html="opt.content || ''" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <el-dialog title="设置题目分值" :visible.sync="scoreDialogVisible" width="420px" append-to-body @closed="scoreEditRow = null">
      <div v-if="scoreEditRow" class="score-dialog-body">
        <p class="score-dialog-stem">{{ questionStemListLabel(scoreEditRow) }}</p>
        <el-form label-width="80px">
          <el-form-item label="题型">
            <span>{{ quTypeLabel(scoreEditRow.quType) }}</span>
          </el-form-item>
          <el-form-item label="本题分值">
            <el-input-number
              v-model="scoreEditValue"
              :min="0.01"
              :max="999"
              :precision="2"
              :step="0.1"
              style="width: 160px"
            />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer">
        <el-button @click="scoreDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmScoreDialog">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { quPaging, quDetail } from '@/api/question'
import CompoundStemBlock from '@/components/CompoundStemBlock'
import RichHtmlContent from '@/components/RichHtmlContent'
import QuestionAudioPlayer from '@/components/QuestionAudioPlayer'
import { questionStemPlainSummary, questionStemDisplayHtml } from '@/utils/questionStemHtml'

export default {
  name: 'RandomQuestionPreview',
  components: { CompoundStemBlock, RichHtmlContent, QuestionAudioPlayer },
  props: {
    rows: {
      type: Array,
      default: () => []
    },
    scoreConfig: {
      type: Object,
      default: () => ({
        radioScore: 0,
        multiScore: 0,
        judgeScore: 0,
        saqScore: 0,
        compoundScore: 0
      })
    },
    repoIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      typeOptions: [
        { value: null, label: '全部' },
        { value: 1, label: '单选题' },
        { value: 2, label: '多选题' },
        { value: 3, label: '判断题' },
        { value: 4, label: '简答题' },
        { value: 5, label: '复合题' }
      ],
      addDialogVisible: false,
      addSearchName: '',
      addSelType: null,
      addPageNum: 1,
      addPageSize: 10,
      addPageData: {},
      addPendingSelection: [],
      scoreDialogVisible: false,
      scoreEditRow: null,
      scoreEditValue: 1,
      detailDialogVisible: false,
      detailLoading: false,
      detailQuestion: null
    }
  },
  computed: {
    totalScore() {
      return (this.rows || []).reduce((sum, row) => {
        const s = Number(row.assignScore)
        return sum + (Number.isFinite(s) && s > 0 ? s : 0)
      }, 0)
    }
  },
  methods: {
    quTypeLabel(quType) {
      const map = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '简答题', 5: '复合题' }
      return map[quType] || '未知'
    },
    defaultScoreByType(quType) {
      const cfg = this.scoreConfig || {}
      if (quType === 1) return Number(cfg.radioScore) || 0
      if (quType === 2) return Number(cfg.multiScore) || 0
      if (quType === 3) return Number(cfg.judgeScore) || 0
      if (quType === 4) return Number(cfg.saqScore) || 0
      if (quType === 5) return Number(cfg.compoundScore) || 0
      return 0
    },
    questionStemListLabel(row) {
      return questionStemPlainSummary(row)
    },
    questionStemDisplay(row) {
      return questionStemDisplayHtml(row)
    },
    emitRows(nextRows) {
      this.$emit('update:rows', nextRows)
      this.$emit('change', nextRows)
    },
    removeRow(index) {
      const next = [...this.rows]
      next.splice(index, 1)
      this.emitRows(next)
    },
    openScoreDialog(row) {
      this.scoreEditRow = row
      this.scoreEditValue = Number(row.assignScore) || this.defaultScoreByType(row.quType) || 1
      this.scoreDialogVisible = true
    },
    confirmScoreDialog() {
      if (!this.scoreEditRow) return
      const val = Number(this.scoreEditValue)
      if (!Number.isFinite(val) || val <= 0) {
        this.$message.warning('分值必须大于 0')
        return
      }
      const next = this.rows.map((r) => {
        if (r.id === this.scoreEditRow.id) {
          return { ...r, assignScore: val, scoreCustomized: true }
        }
        return r
      })
      this.emitRows(next)
      this.scoreDialogVisible = false
    },
    async openDetailDialog(row) {
      if (!row || !row.id) return
      this.detailDialogVisible = true
      this.detailLoading = true
      this.detailQuestion = null
      try {
        const res = await quDetail(row.id)
        if (res.code) {
          this.detailQuestion = res.data || {}
        } else {
          this.$message.error(res.msg || '加载失败')
          this.detailDialogVisible = false
        }
      } catch (e) {
        this.$message.error('加载题目详情失败')
        this.detailDialogVisible = false
      } finally {
        this.detailLoading = false
      }
    },
    onAddDialogOpen() {
      this.addPageNum = 1
      this.addPendingSelection = []
      this.loadAddPage()
    },
    async loadAddPage() {
      const params = {
        pageNum: this.addPageNum,
        pageSize: this.addPageSize,
        content: this.addSearchName || undefined,
        type: this.addSelType || undefined
      }
      const ids = (this.repoIds || [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0)
      if (ids.length === 1) {
        params.repoId = ids[0]
      } else if (ids.length > 1) {
        params.repoIds = ids.join(',')
      }
      try {
        const res = await quPaging(params)
        this.addPageData = res.data || { records: [], total: 0 }
      } catch (e) {
        this.addPageData = { records: [], total: 0 }
      }
    },
    searchAddQu() {
      this.addPageNum = 1
      this.loadAddPage()
    },
    handleAddPageChange(page) {
      this.addPageNum = page
      this.loadAddPage()
    },
    handleAddSelectionChange(val) {
      this.addPendingSelection = val || []
    },
    confirmAddQuestions() {
      if (!this.addPendingSelection.length) {
        this.$message.warning('请先勾选要添加的题目')
        return
      }
      const existIds = new Set(this.rows.map((r) => r.id))
      const toAdd = []
      for (const item of this.addPendingSelection) {
        if (existIds.has(item.id)) continue
        toAdd.push({
          ...item,
          assignScore: this.defaultScoreByType(item.quType) || 1,
          scoreCustomized: false
        })
        existIds.add(item.id)
      }
      if (!toAdd.length) {
        this.$message.warning('所选题目已在试卷中')
        return
      }
      this.emitRows([...this.rows, ...toAdd])
      this.addDialogVisible = false
      this.$message.success(`已添加 ${toAdd.length} 题`)
    }
  }
}
</script>

<style scoped>
.random-preview-wrap {
  margin-top: 16px;
}
.selected-qu-panel {
  border: 1px solid #ebeef5;
}
.selected-qu-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.selected-qu-tip {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}
.score-dialog-stem {
  margin: 0 0 12px;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  max-height: 120px;
  overflow: auto;
}
</style>
