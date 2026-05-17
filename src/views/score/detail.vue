<template>
  <div class="app-container">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="真实姓名">
        <el-input v-model="realName" placeholder="真实姓名" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit">查询</el-button>
        <el-button type="primary" @click="getExportScores">导出</el-button>
      </el-form-item>
    </el-form>

    <el-card v-loading="loading" shadow="never" class="chart-card">
      <div slot="header" class="clearfix">
        <span>成绩分布（及格线以下 2 档，及格及以上 3 档）</span>
        <span v-if="fullScore > 0" class="sub">满分 {{ fullScore }} 分</span>
        <span v-if="passScore > 0" class="sub pass">及格分 {{ formatIntervalEdge(passScore) }} 分{{ passScoreIsDefault ? '（试卷未设时按满分 60%）' : '（试卷设置）' }}</span>
      </div>
      <el-row :gutter="20">
        <el-col :xs="24" :md="12">
          <div class="pie-heading">
            <div class="pie-title">成绩分段人数</div>
            <div class="pie-sub">A/B/C 为及格及以上，D/E 为不及格（及格分见卡片标题旁）</div>
          </div>
          <div ref="pieChart" class="pie-wrap" />
        </el-col>
        <el-col :xs="24" :md="12">
          <p class="hint">等级：A、B、C 为及格及以上（分数越高档越高），D、E 为不及格。低于及格分按半条及格线均分两段（E、D），及格及以上在剩余分数上三等分（C、B、A）。</p>
          <el-table :data="gradeTableRows" border size="small" max-height="280">
            <el-table-column prop="gradeLabel" label="等级" width="120" align="center" />
            <el-table-column prop="range" label="分数区间" min-width="140" />
            <el-table-column prop="count" label="人数" align="center" width="72" />
            <el-table-column prop="ratio" label="占比" align="center" width="72" />
          </el-table>
        </el-col>
      </el-row>
    </el-card>

    <el-card v-loading="briefingLoading" shadow="never" class="ai-briefing-card">
      <div slot="header" class="clearfix ai-briefing-header">
        <span>AI 成绩分析简报</span>
        <el-button
          type="primary"
          size="small"
          :loading="briefingLoading"
          :disabled="!examId || !gradeId"
          @click="generateAiBriefing"
        >生成简报</el-button>
      </div>
      <p v-if="!briefingText && !briefingLoading" class="briefing-placeholder">
        基于本页成绩分布、及格率与题目正确率，由大模型生成教学分析建议（需已在 env.local 配置硅基流动 LLM）。
      </p>
      <div v-if="briefingText" class="briefing-body">{{ briefingText }}</div>
    </el-card>

    <el-table
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
    >
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column label="排名" align="center" width="80" fixed>
        <template slot-scope="scope">{{ scope.row.rank }}</template>
      </el-table-column>
      <el-table-column prop="title" label="试卷名称" align="center" />
      <el-table-column prop="realName" label="真实姓名" align="center" />
      <el-table-column prop="userScore" label="用户得分" align="center" />
      <el-table-column prop="count" label="切屏次数" align="center" />
      <el-table-column prop="userTime" label="用户用时" align="center" />
      <el-table-column prop="limitTime" label="提交时间" align="center" />

      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            style="font-size: 14px"
            @click="updateRow(row)"
          >查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
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
import echarts from 'echarts'
import { scorePaging, exportScores, scoreAiBriefing } from '@/api/score'
import { getExamDetail } from '@/api/exam'

const BELOW_PASS_BUCKETS = 2
const ABOVE_PASS_BUCKETS = 3
const BUCKET_COUNT = BELOW_PASS_BUCKETS + ABOVE_PASS_BUCKETS

/** 分数从低到高对应 E→D→C→B→A；A/B/C 及格及以上，D/E 不及格 */
const GRADE_BUCKETS = [
  { letter: 'E', tier: '不及格' },
  { letter: 'D', tier: '不及格' },
  { letter: 'C', tier: '及格' },
  { letter: 'B', tier: '良好' },
  { letter: 'A', tier: '优良' }
]

function scoreValue(row) {
  const v = row.userScore
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export default {
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      gradeId: '',
      examId: '',
      realName: '',
      examTitle: '',
      gradeName: '',
      data: {
        records: [],
        current: 1,
        size: 10,
        total: 0
      },
      formInline: {
        user: '',
        region: ''
      },
      input: '',
      input1: '',
      form: {
        name: ''
      },
      diaTitle: '',
      dialogTableVisible: false,
      dialogFormVisible: false,
      formLabelWidth: '120px',
      loading: false,
      fullScore: 0,
      passScore: 0,
      passScoreIsDefault: false,
      rankedAll: [],
      bucketLegendRows: [],
      pieChart: null,
      resizeHandler: null,
      briefingLoading: false,
      briefingText: ''
    }
  },
  computed: {
    gradeTableRows() {
      const r = this.bucketLegendRows
      if (!r || !r.length) return []
      return r.slice().reverse()
    },
    tables() {
      const input = this.input
      const input1 = this.input1
      if (input) {
        return this.tableData.filter((data) => {
          return Object.keys(data).some((key) => {
            return String(data[key]).toLowerCase().indexOf(input) > -1
          })
        })
      }
      if (input1) {
        return this.tableData.filter((data) => {
          return Object.keys(data).some((key) => {
            return String(data[key]).toLowerCase().indexOf(input1) > -1
          })
        })
      }

      return this.tableData
    }
  },
  created() {
    this.examId = localStorage.getItem('examId')
    this.gradeId = localStorage.getItem('gradeId')
    this.examTitle = localStorage.getItem('examTitle')
    this.gradeName = localStorage.getItem('gradeName')
    this.refreshAll()
  },
  mounted() {
    this.resizeHandler = () => {
      if (this.pieChart) this.pieChart.resize()
    }
    window.addEventListener('resize', this.resizeHandler)
  },
  beforeDestroy() {
    localStorage.removeItem('examId')
    localStorage.removeItem('gradeId')
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
    }
    if (this.pieChart) {
      this.pieChart.dispose()
      this.pieChart = null
    }
  },
  methods: {
    updateRow(row) {
      row.type = 1
      localStorage.setItem('record_exam_examId', row.examId)
      this.$router.push({ name: 'exam-record-detail', query: { data: row }})
    },
    async generateAiBriefing() {
      if (!this.examId || !this.gradeId) {
        return
      }
      this.briefingLoading = true
      try {
        const res = await scoreAiBriefing({
          examId: this.examId,
          gradeId: this.gradeId
        })
        if (res.code && res.data && res.data.briefing) {
          this.briefingText = res.data.briefing
          this.$message.success(res.msg || '简报已生成')
        } else {
          this.$message.error(res.msg || '生成失败')
        }
      } catch (e) {
        this.$message.error('AI 简报请求失败，请确认已配置 LLM_API_KEY 并重启后端')
      } finally {
        this.briefingLoading = false
      }
    },
    async fetchAllScoreRows() {
      const pageSize = 200
      let pageNum = 1
      let total = Infinity
      const all = []
      while (all.length < total) {
        const res = await scorePaging({
          pageNum,
          pageSize,
          examId: this.examId,
          gradeId: this.gradeId,
          realName: this.realName || undefined
        })
        const page = res.data || {}
        total = page.total != null ? page.total : 0
        const chunk = page.records || []
        all.push(...chunk)
        if (!chunk.length || chunk.length < pageSize) break
        pageNum += 1
      }
      return all
    },
    /** 试卷未配置及格分时，按满分 60% 作为展示用及格线 */
    resolvePassScore(detail, gross) {
      const raw = Number(detail && detail.passedScore)
      if (Number.isFinite(raw) && raw > 0) {
        return { pass: raw, isDefault: false }
      }
      if (Number.isFinite(gross) && gross > 0) {
        return { pass: Math.round(gross * 0.6), isDefault: true }
      }
      return { pass: 0, isDefault: true }
    },
    /** 将及格线限制在 (0, full]，避免无法划分「及格以上三档」 */
    clampPassForBuckets(pass, full) {
      if (!(full > 0)) return 0
      let p = Number(pass)
      if (!Number.isFinite(p)) p = full * 0.6
      p = Math.min(Math.max(p, 0), full)
      if (p <= 0) p = full * 0.6
      if (p >= full) p = full * 0.6
      return p
    },
    bucketIndexByPass(score, full, pass) {
      const x = Math.min(Math.max(score, 0), full)
      if (x < pass) {
        const mid = pass / 2
        return x < mid ? 0 : 1
      }
      const span = full - pass
      if (!(span > 0)) return BUCKET_COUNT - 1
      const t1 = pass + span / 3
      const t2 = pass + (2 * span) / 3
      if (x < t1) return 2
      if (x < t2) return 3
      return 4
    },
    formatIntervalEdge(v) {
      return Math.round(v * 10) / 10
    },
    buildBuckets(rows, total, passLine) {
      const scores = rows.map(scoreValue).filter((s) => s !== null)
      const T = total > 0 ? total : (scores.length ? Math.max(...scores) : 0)
      const pass = this.clampPassForBuckets(passLine, T)
      const counts = Array(BUCKET_COUNT).fill(0)
      scores.forEach((s) => {
        const bi = T > 0 ? this.bucketIndexByPass(s, T, pass) : 0
        counts[bi]++
      })
      const sum = scores.length || 1
      const span = T > pass ? T - pass : 0
      const t1 = pass + span / 3
      const t2 = pass + (2 * span) / 3
      const mid = pass / 2
      const edges = [
        this.formatIntervalEdge(0),
        this.formatIntervalEdge(mid),
        this.formatIntervalEdge(pass),
        this.formatIntervalEdge(t1),
        this.formatIntervalEdge(t2),
        this.formatIntervalEdge(T)
      ]
      const rangeStrs = [
        `[${edges[0]}, ${edges[1]})`,
        `[${edges[1]}, ${edges[2]})`,
        `[${edges[2]}, ${edges[3]})`,
        `[${edges[3]}, ${edges[4]})`,
        `[${edges[4]}, ${edges[5]}]`
      ]
      this.bucketLegendRows = counts.map((c, i) => {
        const g = GRADE_BUCKETS[i]
        return {
          gradeLabel: `${g.letter} 档（${g.tier}）`,
          range: `${rangeStrs[i]} 分`,
          pieName: `${g.letter} 档`,
          count: c,
          ratio: `${Math.round((c / sum) * 1000) / 10}%`
        }
      })
      return { counts, T: T || 1, pass }
    },
    renderPie(counts) {
      const el = this.$refs.pieChart
      if (!el) return
      if (!this.pieChart) {
        this.pieChart = echarts.init(el)
      }
      const rows = this.bucketLegendRows || []
      // E→A：不及格用暖色，及格及以上用绿色系由浅到深
      const gradeColors = ['#E53935', '#FB8C00', '#A5D6A7', '#43A047', '#1B5E20']
      const data = counts.map((v, i) => {
        const r = rows[i] || {}
        return {
          value: v,
          name: r.pieName || GRADE_BUCKETS[i].letter + ' 档',
          tipTitle: r.gradeLabel || '',
          tipRange: (r.range || '').replace(/\s*分\s*$/, ''),
          itemStyle: { color: gradeColors[i], borderColor: '#fff', borderWidth: 1 },
          label: { show: v > 0, formatter: '{b}\n{c}人', fontSize: 12 },
          labelLine: { show: v > 0, length: 10, length2: 8 }
        }
      })
      this.pieChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: (p) => {
            const d = p.data || {}
            const title = d.tipTitle || p.name
            const rg = d.tipRange ? `分数区间：${d.tipRange} 分<br/>` : ''
            const pct = p.percent != null ? p.percent : 0
            return `${title}<br/>${rg}${p.value} 人（${pct}%）`
          }
        },
        legend: {
          orient: 'horizontal',
          bottom: 6,
          left: 'center',
          icon: 'circle',
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 14,
          textStyle: { fontSize: 12, color: '#606266' },
          data: ['A 档', 'B 档', 'C 档', 'D 档', 'E 档']
        },
        series: [{
          name: '人数',
          type: 'pie',
          radius: ['38%', '58%'],
          center: ['50%', '44%'],
          avoidLabelOverlap: true,
          data
        }]
      }, true)
    },
    sortAndRank(rows) {
      const copy = rows.slice()
      copy.sort((a, b) => {
        const sa = scoreValue(a)
        const sb = scoreValue(b)
        if (sa == null && sb == null) return 0
        if (sa == null) return 1
        if (sb == null) return -1
        if (sb !== sa) return sb - sa
        const ta = a.limitTime || ''
        const tb = b.limitTime || ''
        return String(ta).localeCompare(String(tb))
      })
      for (let i = 0; i < copy.length; i++) {
        if (i === 0) {
          copy[i].rank = 1
          continue
        }
        const cur = scoreValue(copy[i])
        const prevScore = scoreValue(copy[i - 1])
        if (cur != null && prevScore != null && cur === prevScore) {
          copy[i].rank = copy[i - 1].rank
        } else {
          copy[i].rank = i + 1
        }
      }
      return copy
    },
    applyPage() {
      const total = this.rankedAll.length
      const start = (this.pageNum - 1) * this.pageSize
      const records = this.rankedAll.slice(start, start + this.pageSize)
      this.data = {
        records,
        current: this.pageNum,
        size: this.pageSize,
        total
      }
    },
    async refreshAll() {
      this.loading = true
      try {
        const detailRes = await getExamDetail(this.examId)
        const detail = detailRes.data || {}
        let gross = Number(detail.grossScore)
        if (!Number.isFinite(gross) || gross <= 0) gross = 0

        const { pass: resolvedPass, isDefault } = this.resolvePassScore(detail, gross)
        this.passScoreIsDefault = isDefault

        const rows = await this.fetchAllScoreRows()
        const maxScore = rows.length
          ? Math.max(...rows.map(scoreValue).filter((s) => s !== null), 0)
          : 0
        this.fullScore = gross > 0 ? gross : maxScore

        const { counts, pass } = this.buildBuckets(rows, this.fullScore, resolvedPass)
        this.passScore = pass
        this.$nextTick(() => this.renderPie(counts))

        this.rankedAll = this.sortAndRank(rows)
        this.applyPage()
      } catch (e) {
        this.rankedAll = []
        this.passScore = 0
        this.passScoreIsDefault = false
        this.applyPage()
        this.bucketLegendRows = []
        this.$nextTick(() => {
          if (this.$refs.pieChart && this.pieChart) {
            this.pieChart.clear()
          }
        })
      } finally {
        this.loading = false
      }
    },
    getExportScores() {
      exportScores(this.examId, this.gradeId).then(res => {
        var debug = res
        if (debug) {
          var elink = document.createElement('a')
          var filename = 'downloaded-file.xlsx'
          if (this.gradeName) {
            filename = this.gradeName + '-' + this.examTitle + '.xlsx'
          }
          elink.download = filename
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(res)
          document.body.appendChild(elink)
          elink.click()
          document.body.removeChild(elink)
        } else {
          this.$message.error('导出异常请联系管理员')
        }
      }).catch(() => {})
    },

    onSubmit() {
      this.pageNum = 1
      this.refreshAll()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.pageNum = 1
      this.applyPage()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.applyPage()
    },

    handleClick(row) {
    }
  }
}
</script>
<style scoped>
.chart-card {
  margin-bottom: 20px;
}
.ai-briefing-card {
  margin-bottom: 20px;
}
.ai-briefing-header .el-button {
  float: right;
}
.briefing-placeholder {
  color: #909399;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}
.briefing-body {
  white-space: pre-wrap;
  line-height: 1.75;
  color: #303133;
  font-size: 14px;
}
.pie-heading {
  text-align: center;
  margin-bottom: 4px;
}
.pie-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}
.pie-sub {
  font-size: 12px;
  color: #909399;
  line-height: 1.45;
  margin-top: 2px;
}
.pie-wrap {
  width: 100%;
  height: 318px;
}
.sub {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}
.sub.pass {
  color: #e6a23c;
}
.hint {
  color: #606266;
  font-size: 13px;
  margin: 0 0 12px;
}
</style>

