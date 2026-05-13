<template>
  <div class="app-container">
    <el-card shadow="never" class="outer-card">
      <p class="intro">
        按「学科」维度展示您在班级中的名次变化（曲线）。学科名称由试卷标题中分隔符前的文字自动归类，例如「数学-第一次月考」「数学-期中」归为「数学」。
      </p>
      <div class="chart-shell">
        <div ref="lineChart" v-loading="loading" class="chart" />
      </div>
      <div v-if="!loading && !seriesKeys.length" class="empty">暂无排名数据（需已交卷且成绩已出，并已加入班级）。</div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import { studentRankTrend } from '@/api/score'

const PALETTE = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#9b59b6', '#13c2c2', '#fa8c16', '#722ed1']

function hexToRgba(hex, alpha) {
  const h = (hex || '').replace('#', '')
  if (h.length !== 6) return `rgba(64, 158, 255, ${alpha})`
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default {
  name: 'ExamRankTrend',
  data() {
    return {
      loading: false,
      chart: null,
      seriesKeys: [],
      resizeHandler: null
    }
  },
  mounted() {
    this.resizeHandler = () => {
      if (this.chart) this.chart.resize()
    }
    window.addEventListener('resize', this.resizeHandler)
    this.load()
  },
  beforeDestroy() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
    }
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    groupBySubject(rows) {
      const map = {}
      rows.forEach((r) => {
        const key = r.subjectLabel || r.examTitle || '其它'
        if (!map[key]) map[key] = []
        map[key].push(r)
      })
      Object.keys(map).forEach((k) => {
        map[k].sort((a, b) => {
          const ta = a.examTime ? new Date(a.examTime).getTime() : 0
          const tb = b.examTime ? new Date(b.examTime).getTime() : 0
          return ta - tb
        })
      })
      return map
    },
    maxRankInData(grouped, subjects) {
      let max = 1
      subjects.forEach((name) => {
        (grouped[name] || []).forEach((r) => {
          const rk = r.rankInClass
          if (rk != null && rk > max) max = rk
        })
      })
      return max
    },
    buildOption(grouped) {
      const subjects = Object.keys(grouped).sort()
      this.seriesKeys = subjects
      const fmtTime = (ts) => {
        if (ts == null || Number.isNaN(Number(ts))) return ''
        const d = new Date(Number(ts))
        if (Number.isNaN(d.getTime())) return ''
        const m = d.getMonth() + 1
        const day = d.getDate()
        const h = d.getHours()
        const mi = d.getMinutes()
        return `${m}-${String(day).padStart(2, '0')} ${h}:${mi < 10 ? '0' : ''}${mi}`
      }

      const rankMax = this.maxRankInData(grouped, subjects)
      const yMax = Math.max(rankMax + 1, 2)

      const series = subjects.map((name, idx) => {
        const color = PALETTE[idx % PALETTE.length]
        return {
          name,
          type: 'line',
          smooth: 0.35,
          symbol: 'circle',
          symbolSize: 9,
          showSymbol: true,
          sampling: 'average',
          lineStyle: {
            width: 3,
            color,
            cap: 'round',
            join: 'round',
            shadowColor: hexToRgba(color, 0.35),
            shadowBlur: 10,
            shadowOffsetY: 4
          },
          itemStyle: {
            color,
            borderColor: '#fff',
            borderWidth: 2
          },
          emphasis: {
            itemStyle: {
              borderWidth: 3,
              shadowBlur: 14,
              shadowColor: hexToRgba(color, 0.45)
            },
            lineStyle: { width: 4 }
          },
          label: {
            show: true,
            position: 'top',
            distance: 6,
            fontSize: 11,
            color: '#606266',
            formatter(p) {
              const d = p.data || {}
              const s = d.score != null ? d.score : '-'
              const g = d.grossScore != null ? d.grossScore : '-'
              return `${s}/${g}`
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: hexToRgba(color, 0.22) },
              { offset: 0.65, color: hexToRgba(color, 0.06) },
              { offset: 1, color: hexToRgba(color, 0.01) }
            ])
          },
          connectNulls: true,
          data: grouped[name].map((r) => ({
            value: [
              r.examTime ? new Date(r.examTime).getTime() : null,
              r.rankInClass
            ],
            examTitle: r.examTitle,
            score: r.userScore,
            grossScore: r.grossScore,
            attend: r.classAttendCount
          }))
        }
      })

      const legendBottom = subjects.length > 1 ? 56 : 40
      // 底部：图例 + X 轴时间文字与 Y 轴名称错开，避免左下角「班级名次」与时间重合
      const gridBottom = legendBottom + 28

      return {
        color: PALETTE,
        animationDuration: 900,
        animationEasing: 'cubicOut',
        title: {
          text: '班级名次变化',
          left: 'center',
          top: 10,
          textStyle: {
            fontSize: 16,
            fontWeight: 600,
            color: '#303133'
          },
          subtext: '名次越小越好 · 鼠标悬停查看详情',
          subtextStyle: { color: '#909399', fontSize: 12 },
          itemGap: 8
        },
        tooltip: {
          trigger: 'item',
          confine: true,
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderColor: '#ebeef5',
          borderWidth: 1,
          padding: [12, 14],
          textStyle: { color: '#303133', fontSize: 13 },
          extraCssText: 'box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-radius: 10px;',
          formatter(params) {
            const raw = params.data || {}
            const v = raw.value || params.value
            const ts = Array.isArray(v) ? v[0] : null
            const rank = Array.isArray(v) ? v[1] : raw.rankInClass
            const title = raw.examTitle ? `<span style="color:#606266">试卷</span> ${raw.examTitle}<br/>` : ''
            const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${params.color};margin-right:6px;vertical-align:1px"></span>`
            return (
              `${title}` +
              `<span style="color:#909399">时间</span> ${fmtTime(ts)}<br/>` +
              `${dot}<span style="font-weight:600">${params.seriesName}</span><br/>` +
              `<span style="color:#909399">名次</span> <b style="color:#409EFF;font-size:15px">第 ${rank} 名</b> / ${raw.attend != null ? raw.attend : '?'} 人<br/>` +
              `<span style="color:#909399">得分</span> ${raw.score != null ? raw.score : '-'} / 总分 ${raw.grossScore != null ? raw.grossScore : '-'}`
            )
          }
        },
        legend: {
          type: 'scroll',
          bottom: 6,
          left: 'center',
          itemGap: 18,
          itemWidth: 14,
          itemHeight: 10,
          icon: 'roundRect',
          textStyle: { color: '#606266', fontSize: 12 }
        },
        toolbox: {
          right: 12,
          top: 8,
          feature: {
            saveAsImage: {
              title: '保存为图片',
              name: '班级排名趋势',
              pixelRatio: 2,
              backgroundColor: '#fff'
            },
            restore: { title: '还原' }
          },
          iconStyle: { borderColor: '#909399' }
        },
        grid: {
          left: 72,
          right: 28,
          top: 88,
          bottom: gridBottom,
          containLabel: false
        },
        xAxis: {
          type: 'time',
          boundaryGap: false,
          axisLine: { lineStyle: { color: '#dcdfe6' }},
          axisTick: { show: false },
          axisLabel: {
            color: '#909399',
            fontSize: 11,
            margin: 14,
            hideOverlap: true,
            formatter(val) {
              return fmtTime(val)
            }
          },
          splitLine: {
            show: true,
            lineStyle: { color: '#f0f2f5', type: 'dashed' }
          }
        },
        yAxis: {
          type: 'value',
          inverse: true,
          name: '班级名次',
          nameLocation: 'middle',
          nameGap: 52,
          nameRotate: 90,
          nameTextStyle: { color: '#909399', fontSize: 12 },
          min: 1,
          max: yMax,
          minInterval: 1,
          splitNumber: Math.min(8, Math.max(3, yMax - 1)),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#909399',
            fontSize: 11,
            margin: 6,
            formatter: (v) => (Number.isInteger(v) ? v : '')
          },
          splitLine: {
            show: true,
            lineStyle: { color: '#f0f2f5', type: 'dashed' }
          }
        },
        series
      }
    },
    async load() {
      this.loading = true
      try {
        const res = await studentRankTrend()
        const rows = (res && res.data) ? res.data : []
        const grouped = this.groupBySubject(rows)
        this.$nextTick(() => {
          const el = this.$refs.lineChart
          if (!el) return
          if (!this.chart) {
            this.chart = echarts.init(el, null, { renderer: 'canvas' })
          }
          if (!rows.length) {
            this.chart.clear()
            this.seriesKeys = []
            return
          }
          this.chart.setOption(this.buildOption(grouped), true)
        })
      } catch (e) {
        this.seriesKeys = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.outer-card {
  border-radius: 12px;
}
.intro {
  color: #606266;
  font-size: 13px;
  line-height: 1.65;
  margin: 0 0 16px;
  padding: 0 4px;
}
.chart-shell {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #fafbfc 100%);
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 12px 8px 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.chart {
  width: 100%;
  height: 480px;
}
.empty {
  text-align: center;
  color: #909399;
  padding: 28px 0 8px;
  font-size: 13px;
}
</style>
