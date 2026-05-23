<template>
  <div class="app-container">
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item label="用户姓名">
        <el-input v-model="realName" placeholder="输入姓名" clearable />
      </el-form-item>
      <el-form-item v-if="activeTab === 'absent'" label="班级">
        <ClassSelect v-model="gradeId" clearable placeholder="全部班级" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchFun">查询</el-button>
      </el-form-item>
    </el-form>

    <el-tabs v-model="activeTab" @tab-click="onTabChange">
      <el-tab-pane label="待批阅" name="pending" />
      <el-tab-pane label="缺考" name="absent" />
    </el-tabs>

    <el-table
      v-if="activeTab === 'pending'"
      :data="pendingData.records"
      border
      fit
      highlight-current-row
      :header-cell-style="tableHeaderStyle"
    >
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="userName" label="姓名" align="center" />
      <el-table-column prop="limitTime" label="提交时间" align="center" />
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="screenInfo(scope.row)">批改试卷</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-table
      v-else
      :data="absentData.records"
      border
      fit
      highlight-current-row
      :header-cell-style="tableHeaderStyle"
    >
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="userName" label="姓名" align="center" />
      <el-table-column prop="gradeName" label="班级" align="center" />
      <el-table-column label="状态" align="center" width="100">
        <template>
          <el-tag type="info" size="small">未参加</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page="pageNum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="activeTab === 'pending' ? pendingData.total : absentData.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import ClassSelect from '@/components/ClassSelect'
import { answerUserPging, answerAbsentPaging } from '@/api/answer'

export default {
  components: { ClassSelect },
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      pendingData: { records: [], total: 0 },
      absentData: { records: [], total: 0 },
      examId: '',
      gradeId: '',
      realName: '',
      activeTab: 'pending',
      tableHeaderStyle: {
        background: '#f2f3f4',
        color: '#555',
        'font-weight': 'bold',
        'line-height': '32px'
      }
    }
  },
  created() {
    this.examId = localStorage.getItem('answer_examId')
    const tab = this.$route.query && this.$route.query.tab
    if (tab === 'absent' || tab === 'pending') {
      this.activeTab = tab
    }
    this.loadPage()
  },
  methods: {
    onTabChange() {
      this.pageNum = 1
      this.loadPage()
    },
    searchFun() {
      this.pageNum = 1
      this.loadPage()
    },
    loadPage() {
      if (!this.examId) {
        this.$message.warning('缺少考试信息，请从阅卷管理重新进入')
        return
      }
      if (this.activeTab === 'pending') {
        this.loadPending()
      } else {
        this.loadAbsent()
      }
    },
    loadPending() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        examId: this.examId,
        realName: this.realName || undefined
      }
      answerUserPging(params).then((res) => {
        this.pendingData = res.data || { records: [], total: 0 }
      })
    },
    loadAbsent() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        examId: this.examId,
        realName: this.realName || undefined
      }
      if (this.gradeId) {
        params.gradeId = this.gradeId
      }
      answerAbsentPaging(params).then((res) => {
        this.absentData = res.data || { records: [], total: 0 }
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadPage()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.loadPage()
    },
    screenInfo(row) {
      sessionStorage.setItem('answer_info', JSON.stringify(row))
      this.$router.push({ name: 'makeTest' })
    }
  }
}
</script>

<style scoped>
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
