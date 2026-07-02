<template>
  <div class="app-container">
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
      <el-table-column
        prop="createTime"
        label="登录时间"
        align="center"
        width="250px"
      />
      <el-table-column prop="place" label="登录地点" align="center">
        <template slot-scope="{ row }">
          {{ formatPlace(row.place) }}
        </template>
      </el-table-column>
      <el-table-column prop="device" label="登录设备" align="center" />
      <el-table-column prop="behavior" label="操作行为" align="center">
        <template slot-scope="{ row }">
          <span :style="{ color: getBehaviorColor(row.behavior) }">{{
            row.behavior
          }}</span>
        </template>
      </el-table-column>
    </el-table>

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
import { getLogPage } from '@/api/log'
export default {
  data() {
    return {
      tableData: [
        { behavior: '设备登录' },
        { behavior: '设备登出' },
        { behavior: '登录失败' }
      ],
      pageNum: 1,
      pageSize: 10,
      data: {}
    }
  },
  created() {
    this.getLogPageFun()
  },
  methods: {
  // 兼容旧数据：将 ip2region 原始串或 Reserved 等无效值格式化为可读地点
    formatPlace(place) {
      if (!place) {
        return '暂无信息'
      }
      const normalized = String(place).trim()
      if (/^reserved/i.test(normalized) || normalized.startsWith('内网IP')) {
        return '本机/内网'
      }
      if (!place.includes('|')) {
        return place
      }
      const segments = []
      place.split('|').forEach((part) => {
        const value = (part || '').trim()
        if (!value || value === '0' || segments.includes(value)) {
          return
        }
        if (value.length === 2 && value === value.toUpperCase() && /^[A-Z]+$/.test(value)) {
          return
        }
        segments.push(value)
      })
      if (segments.length === 0 || (segments.length === 1 && segments[0] === '内网IP')) {
        return '内网IP'
      }
      return segments.join(' ')
    },
    // 获取不同类型的颜色
    getBehaviorColor(behavior) {
      if (behavior === '设备登录') {
        return 'green'
      } else if (behavior === '设备登出') {
        return 'orange'
      } else if (behavior === '登录失败') {
        return 'red'
      }
      return 'black' // 默认颜色
    },
    // 分页查询
    async getLogPageFun(pageNum, pageSize, title = null) {
      const params = { pageNum: pageNum, pageSize: pageSize }
      const res = await getLogPage(params)
      this.data = res.data
    },

    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getLogPageFun(this.pageNum, val)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getLogPageFun(val, this.pageSize)
    }
  }
}
</script>
