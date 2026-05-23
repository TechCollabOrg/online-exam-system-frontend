<template>
  <div class="app-container">
    <div class="left">
      <el-card class="box-card">
        <span>在线时长（近 15 天，按分钟统计）</span>
        <div ref="charts" class="chart-div" />
      </el-card>
    </div>
    <div class="right">
      <el-card class="box-card">
        <span>最新公告</span>
        <div style="overflow: auto">
          <el-collapse accordion>
            <!-- eslint-disable-next-line vue/no-template-shadow -->
            <div v-for="(item, index) in noticePage.records" :key="index">
              <el-collapse-item
                v-if="item != null"
                :title="item.title"
                :name="index"
              >
                <div v-html="item.content" />
                <div class="noticeContent">
                  <div>{{ item.realName }}</div>
                  <div>{{ item.createTime }}</div>
                </div>
              </el-collapse-item>
            </div>
            <el-collapse-item
              v-if="noticePage.records.length === 0"
              title="暂无公告"
              name="default"
            >
              <div>目前没有最新公告，请稍后再查看。</div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { noticeGetNew } from '@/api/notice'
import { getDaily } from '@/api/stat'
import echarts from 'echarts'

export default {
  data() {
    return {
      load: '',
      activeNames: '',
      pageNum: 1,
      pageSize: 10,
      noticePage: { records: [] },
      dateArray: [],
      formattedData: [],
      /** 按日期保存后端返回的秒数，tooltip 必须按秒换算，避免与图表分钟值混淆 */
      rawSecondsByDate: {},
      option: {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          data: []
        },
        yAxis: {
          name: '分钟',
          minInterval: 1
        },
        series: [
          {
            name: '在线时长',
            type: 'bar',
            data: []
          }
        ]
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      myChart: null // 用于存储 ECharts 实例
    }
  },
  created() {
    this.getDailyFun()
    this.getNotice(this.pageNum, this.pageSize)
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.myChart) {
      this.myChart.dispose() // 销毁图表实例，避免内存泄漏
    }
  },
  methods: {
    localDateStr(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    /** 后端 totalSeconds 为秒，格式化为可读时长 */
    formatDurationFromSeconds(seconds) {
      const total = Math.max(0, Math.floor(Number(seconds) || 0))
      if (total < 60) return '不足 1 分钟'
      const minutes = Math.floor(total / 60)
      if (minutes < 60) return `${minutes} 分钟`
      const hours = Math.floor(minutes / 60)
      const restMin = minutes % 60
      return restMin > 0 ? `${hours} 小时 ${restMin} 分钟` : `${hours} 小时`
    },
    // 获取每日在线时长（后端单位为秒）
    getDailyFun() {
      getDaily().then((res) => {
        if (res.code === 1) {
          this.dateArray = []
          const currentDate = new Date()
          for (let i = 14; i >= 0; i--) {
            const date = new Date(currentDate)
            date.setDate(currentDate.getDate() - i)
            this.dateArray.push(this.localDateStr(date))
          }

          const maxDaySeconds = 24 * 60 * 60
          const dataMap = (res.data || []).reduce((acc, item) => {
            const key = typeof item.loginDate === 'string'
              ? item.loginDate
              : this.localDateStr(new Date(item.loginDate))
            const sec = Math.min(maxDaySeconds, Number(item.totalSeconds) || 0)
            acc[key] = sec
            return acc
          }, {})
          this.rawSecondsByDate = dataMap

          const maxDayMinutes = 24 * 60
          this.formattedData = this.dateArray.map((date) => {
            const secondsOnDate = dataMap[date] || 0
            const minutes = secondsOnDate / 60
            return Math.min(maxDayMinutes, Math.round(minutes * 10) / 10)
          })

          this.option.xAxis.data = this.dateArray
          this.option.series[0].data = this.formattedData
          this.$nextTick(() => {
            this.initCharts()
          })
        }
      })
    },
    // 分页查询
    async getNotice(pageNum, pageSize) {
      const params = { pageNum: pageNum, pageSize: pageSize }
      const res = await noticeGetNew(params)
      if (res && res.data) {
        this.noticePage = res.data
      } else {
        // 如果请求失败或没有数据，使用默认值
        this.noticePage = { records: [] }
      }
      // this.transformData(res);
    },
    initCharts() {
      const formatDurationFromSeconds = this.formatDurationFromSeconds
      const rawSecondsByDate = this.rawSecondsByDate
      const chartOption = {
        ...this.option,
        yAxis: {
          ...this.option.yAxis,
          max: 24 * 60
        },
        tooltip: {
          trigger: 'axis',
          formatter(params) {
            const p = params && params[0]
            if (!p) return ''
            const seconds = rawSecondsByDate[p.name] != null ? rawSecondsByDate[p.name] : 0
            return `${p.name}<br/>${p.seriesName}：${formatDurationFromSeconds(seconds)}`
          }
        }
      }
      if (!this.myChart) {
        this.myChart = echarts.init(this.$refs.charts)
      }
      this.myChart.setOption(chartOption)
    },
    resizeChart() {
      if (this.myChart) {
        this.myChart.resize()
      }
    },
    handleNodeClick(data) {
      //  (data);
    }
  }
}
</script>
<style scoped>
/* 最外层容器 */
.app-container {
  height: calc(100vh - 111px);
  display: flex;
  transform: translateY(-20px);
  justify-content: space-evenly;
  align-items: center;
}
.right,
.left {
  width: 45%;
  height: 68%;
}
.box-card {
  width: 100%;
  height: 100%;
  /* 登录时长图表 */
 .chart-div {
    height: 50vh;
    width: 100%;
  }
}
.noticeContent {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 20px;
}
</style>
