<template>
  <div class="app-container">
    <!-- form -->
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="试题名称">
        <el-input v-model="searchName" placeholder="输入试题名称" />
      </el-form-item>
      <el-form-item label="所属题库">
        <repo-select
          v-model="selectedRepoSingleSearch"
          @change="handleRepoChangeSingle"
        />
      </el-form-item>
      <el-form-item label="题目类型">
        <el-select v-model="selValue" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchQu">查询</el-button>
      </el-form-item>
    </el-form>
    <el-form :inline="true">
      <el-form-item v-if="singleChoiceQuestions" label="单选分数">
        <el-input
          v-model="questionList.radioScore"
          placeholder="输入试题名称"
          @change="scoreFun"
        />
      </el-form-item>
      <el-form-item v-if="multipleChoiceQuestions" label="多选分数">
        <el-input
          v-model="questionList.multiScore"
          placeholder="输入试题名称"
          @change="scoreFun"
        />
      </el-form-item>
      <el-form-item v-if="trueOrFalseQuestions" label="判断分数">
        <el-input
          v-model="questionList.judgeScore"
          placeholder="输入试题名称"
          @change="scoreFun"
        />
      </el-form-item>
      <el-form-item v-if="shortAnswerQuestions" label="简答分数">
        <el-input v-model="questionList.saqScore" placeholder="输入试题名称" @change="scoreFun" />
      </el-form-item>
      <el-form-item v-if="compoundQuestions" label="复合题分数">
        <el-input v-model="questionList.compoundScore" placeholder="输入默认分值" @change="scoreFun" />
      </el-form-item>
    </el-form>
    <!-- table -->

    <el-table
      ref="multipleTable"
      :data="data.records"
      border
      fit
      highlight-current-row
      :header-cell-style="{
        background: '#f2f3f4',
        color: '#555',
        'font-weight': 'bold',
        'line-height': '32px',
      }"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        align="center"
        type="selection"
        width="55"
        :reserve-selection="true"
      />
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column label="题干" align="left" min-width="220" show-overflow-tooltip>
        <template slot-scope="scope">{{ questionStemListLabel(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="题目类型" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.quType == 1">单选题</span>
          <span v-else-if="scope.row.quType == 2">多选题</span>
          <span v-else-if="scope.row.quType == 3">判断题</span>
          <span v-else-if="scope.row.quType == 4">简答题</span>
          <span v-else-if="scope.row.quType == 5">复合题</span>
        </template>
      </el-table-column>
      <el-table-column prop="repoTitle" label="所属题库" align="center" />
      <el-table-column prop="createTime" label="创建时间" align="center" />
      <el-table-column label="操作" align="center" width="100">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="openDetailDialog(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 已选题目：可逐题改分 -->
    <el-card v-if="selectedRows.length" class="selected-qu-panel" shadow="never">
      <div slot="header" class="selected-qu-header">
        <span>已选题目（{{ selectedRows.length }}）</span>
        <span class="selected-qu-tip">点击「设置分值」可单独修改该题分数；修改上方题型默认分时会同步未单独改过的题目</span>
      </div>
      <el-table
        :data="orderedSelectedRows"
        border
        size="small"
        max-height="320"
      >
        <el-table-column label="序号" align="center" width="60">
          <template slot-scope="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column label="题干" align="left" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">{{ questionStemListLabel(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="题型" align="center" width="90">
          <template slot-scope="scope">{{ quTypeLabel(scope.row.quType) }}</template>
        </el-table-column>
        <el-table-column label="分值" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.assignScore }}</span>
            <el-tag v-if="scope.row.scoreCustomized" size="mini" type="warning" style="margin-left: 4px">已改</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="110">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="openScoreDialog(scope.row)">设置分值</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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
          />
          <div v-if="detailQuestion.quType !== 5 && questionStemDisplay(detailQuestion)" style="margin-bottom: 14px">
            <rich-html-content :html="questionStemDisplay(detailQuestion)" />
          </div>
          <template v-if="detailQuestion.quType === 5 && detailQuestion.subItems && detailQuestion.subItems.length">
            <div
              v-for="(sub, sidx) in detailQuestion.subItems"
              :key="'detail-sub-' + sidx"
              class="detail-sub-item"
            >
              <div style="font-weight: 600; margin-bottom: 6px">
                小题 {{ sidx + 1 }} · {{ quTypeLabel(sub.quType) }}
              </div>
              <rich-html-content v-if="sub.content" :html="sub.content" />
              <ul v-if="sub.options && sub.options.length && sub.quType !== 4" class="detail-option-list">
                <li v-for="(opt, oidx) in sub.options" :key="'dopt-' + oidx">
                  {{ String.fromCharCode(65 + oidx) }}. {{ opt.content }}
                  <el-tag v-if="opt.isRight" size="mini" type="success" style="margin-left: 6px">答案</el-tag>
                </li>
              </ul>
              <div v-if="sub.quType === 4 && sub.options && sub.options.length">
                <div
                  v-for="(opt, oidx) in sub.options"
                  :key="'dblank-' + oidx"
                  style="margin-top: 8px"
                >
                  <span style="font-size: 12px; color: #909399">第 {{ oidx + 1 }} 空参考答案</span>
                  <rich-html-content :html="opt.content || ''" />
                </div>
              </div>
            </div>
          </template>
          <ul v-else-if="detailQuestion.options && detailQuestion.options.length" class="detail-option-list">
            <li v-for="(opt, oidx) in detailQuestion.options" :key="'opt-' + oidx">
              {{ String.fromCharCode(65 + oidx) }}. {{ opt.content }}
              <el-tag v-if="opt.isRight" size="mini" type="success" style="margin-left: 6px">答案</el-tag>
            </li>
          </ul>
          <p v-if="detailQuestion.analysis" style="margin-top: 16px; color: #606266">
            <strong>解析：</strong>{{ detailQuestion.analysis }}
          </p>
        </template>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="设置题目分值"
      :visible.sync="scoreDialogVisible"
      width="420px"
      append-to-body
      @closed="scoreEditRow = null"
    >
      <div v-if="scoreEditRow" class="score-dialog-body">
        <p class="score-dialog-stem">{{ questionStemListLabel(scoreEditRow) }}</p>
        <el-form label-width="80px">
          <el-form-item label="题型">
            <span>{{ quTypeLabel(scoreEditRow.quType) }}</span>
          </el-form-item>
          <el-form-item label="本题分值">
            <el-input-number
              v-model="scoreEditValue"
              :min="1"
              :max="999"
              :controls="true"
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

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="data.current"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="data.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="data.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { quPaging, quDetail } from '@/api/question'
import RepoSelect from '@/components/RepoSelect'
import CompoundStemBlock from '@/components/CompoundStemBlock'
import RichHtmlContent from '@/components/RichHtmlContent'
import { questionStemPlainSummary, questionStemDisplayHtml } from '@/utils/questionStemHtml'

export default {
  components: { RepoSelect, CompoundStemBlock, RichHtmlContent },
  data() {
    return {
      singleChoiceQuestions: false,
      multipleChoiceQuestions: false,
      trueOrFalseQuestions: false,
      shortAnswerQuestions: false,
      compoundQuestions: false,

      options: [
        {
          value: null,
          label: '全部类型'
        },
        {
          value: 1,
          label: '单选题'
        },
        {
          value: 2,
          label: '多选题'
        },
        {
          value: 3,
          label: '判断题'
        },
        {
          value: 4,
          label: '简答题'
        },
        {
          value: 5,
          label: '复合题'
        }
      ],
      length: '',
      fileList: [],
      selValue: '',
      searchName: '',
      pageNum: 1,
      pageSize: 10,
      data: {},
      fileDialogVisible: false,

      selectedRepoSingle: '',
      selectedRepoSingleSearch: '',
      input: '',
      input1: '',
      formInline: {
        user: '',
        region: ''
      },
      // 题库
      questionList: {
        radioCount: 0,
        radioScore: 0,
        multiCount: 0,
        multiScore: 0,
        judgeCount: 0,
        judgeScore: 0,
        saqCount: 0,
        saqScore: 0,
        compoundCount: 0,
        compoundScore: 0
      },
      cancle() {},
      dialogTableVisible: false,
      dialogFormVisible: false,
      hasFiles: null,
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      selectedRows: [], // 存储所有选中的行数据
      isSyncingSelection: false,
      scoreDialogVisible: false,
      scoreEditRow: null,
      scoreEditValue: 1,
      detailDialogVisible: false,
      detailLoading: false,
      detailQuestion: null,
      formLabelWidth: '110px'
    }
  },
  computed: {
    selectedIds() {
      return this.selectedRows.map((item) => item.id)
    },
    orderedSelectedRows() {
      return this.orderSelectedRowsByGroup(this.selectedRows)
    }
  },
  created() {
    this.getQuPage()
  },
  methods: {
    orderSelectedRowsByGroup(rows = []) {
      return [...(Array.isArray(rows) ? rows : [])].sort((a, b) => Number(a.id) - Number(b.id))
    },
    updateQuestionListBySelectedRows() {
      this.questionList.radioCount = 0
      this.questionList.multiCount = 0
      this.questionList.judgeCount = 0
      this.questionList.saqCount = 0
      this.questionList.compoundCount = 0

      this.singleChoiceQuestions = false
      this.multipleChoiceQuestions = false
      this.trueOrFalseQuestions = false
      this.shortAnswerQuestions = false
      this.compoundQuestions = false

      this.selectedRows.forEach((item) => {
        if (item.quType === 1) {
          this.questionList.radioCount += 1
          this.singleChoiceQuestions = true
        }
        if (item.quType === 2) {
          this.questionList.multiCount += 1
          this.multipleChoiceQuestions = true
        }
        if (item.quType === 3) {
          this.questionList.judgeCount += 1
          this.trueOrFalseQuestions = true
        }
        if (item.quType === 4) {
          this.questionList.saqCount += 1
          this.shortAnswerQuestions = true
        }
        if (item.quType === 5) {
          this.questionList.compoundCount += 1
          this.compoundQuestions = true
        }
      })

      if (this.questionList.radioCount === 0) this.questionList.radioScore = 0
      if (this.questionList.multiCount === 0) this.questionList.multiScore = 0
      if (this.questionList.judgeCount === 0) this.questionList.judgeScore = 0
      if (this.questionList.saqCount === 0) this.questionList.saqScore = 0
      if (this.questionList.compoundCount === 0) this.questionList.compoundScore = 0
    },
    quTypeLabel(quType) {
      const map = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '简答题', 5: '复合题' }
      return map[quType] || '未知'
    },
    defaultScoreByType(quType) {
      if (quType === 1) return Number(this.questionList.radioScore) || 0
      if (quType === 2) return Number(this.questionList.multiScore) || 0
      if (quType === 3) return Number(this.questionList.judgeScore) || 0
      if (quType === 4) return Number(this.questionList.saqScore) || 0
      if (quType === 5) return Number(this.questionList.compoundScore) || 0
      return 0
    },
    ensureRowScore(row) {
      if (row.assignScore == null || row.assignScore === '') {
        this.$set(row, 'assignScore', this.defaultScoreByType(row.quType))
      }
      if (row.scoreCustomized == null) {
        this.$set(row, 'scoreCustomized', false)
      }
    },
    applyTypeDefaultsToRows() {
      this.selectedRows.forEach((row) => {
        if (!row.scoreCustomized) {
          this.$set(row, 'assignScore', this.defaultScoreByType(row.quType))
        }
      })
    },
    openScoreDialog(row) {
      this.ensureRowScore(row)
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
      this.$set(this.scoreEditRow, 'assignScore', val)
      this.$set(this.scoreEditRow, 'scoreCustomized', true)
      this.scoreDialogVisible = false
      this.emitSelectedChange()
    },
    emitSelectedChange() {
      const orderedRows = this.orderSelectedRowsByGroup(this.selectedRows)
      orderedRows.forEach((row) => this.ensureRowScore(row))
      this.selectedRows = orderedRows
      const data = {
        selectedRows: orderedRows,
        questionList: this.questionList
      }
      this.$emit('selected-change', data)
    },
    questionStemListLabel(row) {
      return questionStemPlainSummary(row)
    },
    questionStemDisplay(row) {
      return questionStemDisplayHtml(row)
    },
    async openDetailDialog(row) {
      if (!row || !row.id) return
      this.detailDialogVisible = true
      this.detailLoading = true
      this.detailQuestion = null
      try {
        const res = await quDetail(row.id)
        if (res.code) {
          const data = res.data || {}
          if (data.options) {
            data.options.forEach((o) => { o.isRight = !!o.isRight })
          }
          if (data.subItems) {
            data.subItems.forEach((sub) => {
              if (sub.options) sub.options.forEach((o) => { o.isRight = !!o.isRight })
            })
          }
          this.detailQuestion = data
        } else {
          this.$message.error(res.msg || '加载题目详情失败')
          this.detailDialogVisible = false
        }
      } catch (e) {
        this.$message.error('加载题目详情失败')
        this.detailDialogVisible = false
      } finally {
        this.detailLoading = false
      }
    },
    handleRepoChangeSingle(repo) {
      console.log('单选题库变化:', repo)
    },
    updateRow(row) {
      localStorage.setItem('quId', row.id)
      this.$router.push({ name: 'questions-add' })
    },

    handleFileChange(file, fileList) {
      this.fileList = fileList
    },

    handleRemove(file, fileList) {
      if (fileList.length === 0) {
        this.hasFiles = false
      }
    },

    async getQuPage(
      pageNum,
      pageSize,
      content = null,
      repoId = null,
      type = null
    ) {
      const params = {
        pageNum: pageNum,
        pageSize: pageSize,
        content: content,
        repoId: repoId,
        type: type
      }
      const res = await quPaging(params)
      this.data = res.data

      // 数据加载完成后，设置选中状态
      this.$nextTick(() => {
        this.data.records.forEach((row) => {
          if (this.selectedIds.includes(row.id)) {
            this.$refs.multipleTable.toggleRowSelection(row, true)
          }
        })
      })
    },

    searchQu() {
      this.pageNum = 1 // 搜索时重置页码
      this.getQuPage(
        this.pageNum,
        this.pageSize,
        this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue
      )
    },

    screenInfo(row, index, done) {
      this.$router.push({ name: 'questions-add', query: { zhi: row }})
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.getQuPage(this.pageNum,
        val,
        this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue)
    },

    handleCurrentChange(val) {
      this.pageNum = val
      this.getQuPage(
        val,
        this.pageSize,
        this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue)
    },
    scoreFun() {
      this.updateQuestionListBySelectedRows()
      this.applyTypeDefaultsToRows()
      this.emitSelectedChange()
    },
    handleSelectionChange(val) {
      if (this.isSyncingSelection) return

      // 合并新旧选中项，去重
      const newSelected = [...this.selectedRows]
      // 添加新选中的项
      val.forEach((item) => {
        if (!this.selectedIds.includes(item.id)) {
          const row = { ...item }
          this.$set(row, 'assignScore', this.defaultScoreByType(row.quType))
          this.$set(row, 'scoreCustomized', false)
          newSelected.push(row)
        }
      })

      // 移除取消选中的项
      const currentPageIds = this.data.records.map((item) => item.id)
      this.selectedRows = newSelected.filter((item) => {
        // 如果当前行在当前页且未被选中，则移除
        if (
          currentPageIds.includes(item.id) &&
          !val.some((v) => v.id === item.id)
        ) {
          return false
        }
        return true
      })

      this.updateQuestionListBySelectedRows()
      this.emitSelectedChange()
    },

    // 清空所有选中
    clearSelection() {
      this.selectedRows = [] // 清空内部存储
      this.$refs.multipleTable.clearSelection() // 清空表格UI的选中状态
    }
  }
}
</script>

<style scoped>
.selected-qu-panel {
  margin-top: 16px;
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
.detail-sub-item {
  margin: 12px 0;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}
.detail-option-list {
  margin: 8px 0 0;
  padding-left: 20px;
  line-height: 1.8;
}
</style>
