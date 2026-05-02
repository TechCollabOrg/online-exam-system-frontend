<template>
  <div class="app-container">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="真实姓名">
        <el-input v-model="realName" placeholder="真实姓名" />
      </el-form-item>
      <!-- <el-form-item label="所属班级">
        <el-input v-model="input1" placeholder="所属班级"></el-input>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button type="primary" @click="getExportScores">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- table -->
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
      <el-table-column fixed label="序号" align="center" width="80">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
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
            >查看详情</el-button
          >
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
import { scorePaging, exportScores } from '@/api/score'
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
      data: {},
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

      formLabelWidth: '120px'
    }
  },
  computed: {
    tables() {
      // 在你的数据表格中定义tabels
      const input = this.input
      const input1 = this.input1
      if (input) {
        //  ("input输入的搜索内容：" + this.input)
        return this.tableData.filter((data) => {
          //  ("object:" + Object.keys(data));
          return Object.keys(data).some((key) => {
            return String(data[key]).toLowerCase().indexOf(input) > -1
          })
        })
      }
      if (input1) {
        return this.tableData.filter((data) => {
          //  ("object:" + Object.keys(data));
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
    this.getScorePage()
  },
  beforeDestroy() {
    localStorage.removeItem('examId')
    localStorage.removeItem('gradeId')
  },
  methods: {
    /**

     * 表格「编辑」操作：打开对话框或跳转编辑页并回填当前行数据（题库/题目/公告等多页复用）。

     */
    updateRow(row) {
        row.type= 1;
        console.log(row)
        localStorage.setItem('record_exam_examId', row.examId)
        this.$router.push({ name: 'exam-record-detail', query: { data: row }})
      },
    // 分页查询
    /**

     * 分页查询成绩列表，按考试/班级筛选绑定 score 模块表格。

     */
    async getScorePage() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        examId: this.examId,
        gradeId: this.gradeId,
        realName: this.realName
      }
      const res = await scorePaging(params)
      this.data = res.data
    },
    /**

     * 调用 exportScores 下载 Excel 文件流，处理 blob 保存文件名。

     */
    getExportScores() {
      exportScores(this.examId, this.gradeId).then(res => {
        (res) // 控制台输出：Blob {size: 30208, type: 'application/x-msdownload'}
        var debug = res
        if (debug) {
          var elink = document.createElement('a')
          var filename = 'downloaded-file.xlsx'
          if (this.gradeName) {
            filename = this.gradeName + '-' + this.examTitle + '.xlsx'
          }
          elink.download = filename
          elink.style.display = 'none'
          // var blob = new Blob([debug], { type: 'application/x-msdownload' })(blob)
          // const filename = decodeURIComponent(res.headers['Content-Disposition'])
          //  (filename)
          elink.href = URL.createObjectURL(res)
          document.body.appendChild(elink)
          elink.click()
          document.body.removeChild(elink)
        } else {
          this.$message.error('导出异常请联系管理员')
        }
      }).catch(err => {
        (err)
      })
    },

    /**


     * 查询表单提交：同步筛选条件到 query 对象并请求第一页数据。


     */
    onSubmit() {
      this.getScorePage()
      //  ("submit!");
    },
    /**

     * Element Table 分页：同步修改 pageSize，重置或保持当前页并重新拉取列表数据。

     */
    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getScorePage(this.pageNum, val)
    },
    /**

     * Element Table 分页：同步当前页码 pageNum，触发列表接口刷新表格数据。

     */
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getScorePage(val, this.pageSize)
    },

    /**


     * 表格/卡片行点击：根据行数据跳转详情、打开编辑弹窗、触发导出或路由 push（各页 @click 传参不同）。


     */
    handleClick(row) {
    }
  }
}
</script>
<style></style>
