<template>
  <div class="app-container">
    <!-- form -->

    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="试题名称">
        <el-input v-model="searchName" placeholder="输入试题名称" />
      </el-form-item>
      <el-form-item label="所目题库">
        <repo-select
          v-model="selectedRepoSingleSearch"
          @change="handleRepoChangeSingle"
        />
      </el-form-item>
      <el-form-item label="题库类型">
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
      <el-form-item>
        <el-button type="primary" @click="screenInfo()">新增</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fileDialogVisible = true">导入</el-button>
      </el-form-item>
    </el-form>

    <!-- 文件上传 -->
    <el-dialog
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
      title="上传文件"
      :visible.sync="fileDialogVisible"
    >
      <!-- v-model="scope.row.repoId" -->
      <!-- @change="repoChange($event, scope.row)" -->
      请选择题库：
      <repo-select
        v-model="selectedRepoSingle"
        style="margin-bottom: 10px"
        @change="handleRepoChangeSingle"
      />
      <el-upload
        class="upload-demo"
        drag
        action="xxxxxx"
        multiple
        :limit="1"
        accept=".xlsx, .xls"
        :auto-upload="false"
        :on-remove="handleRemove"
        :on-change="handleFileChange"
        :file-list="fileList"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件，且不超过500kb</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fileDialogVisible = false">取 消</el-button>
        <el-button type="success" plain @click="startDownload">下载模板</el-button>
        <el-button type="primary" @click="importQu">确 定</el-button>
      </div>
    </el-dialog>
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
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="76" align="center" />
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
      <el-table-column align="center" label="操作">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            style="font-size: 14px"
            @click="updateRow(row)"
          >编辑</el-button>
          <el-button
            type="text"
            size="small"
            style="color: red; font-size: 14px"
            @click="delQu(row)"
          >删除</el-button>
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
    <!--编辑弹窗-->

    <!-- <el-dialog title="编辑" :visible.sync="dialogFormVisible">
      <el-row>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="题干" :label-width="formLabelWidth">
              <el-input v-model="form.content" autocomplete="off"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="所属题库" :label-width="formLabelWidth">
              <el-input v-model="form.repoTitle" autocomplete="off"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateQu">确 定</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import { quPaging, quDel, quUpdate, importQue } from '@/api/question'
import RepoSelect from '@/components/RepoSelect'
import { questionStemPlainSummary } from '@/utils/questionStemHtml'

export default {
  components: { RepoSelect },
  data() {
    return {
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
      formLabelWidth: '110px'
    }
  },
  computed: {
    // tables() {
    //   //在你的数据表格中定义tabels
    //   const input = this.input;
    //   const input1 = this.input1;
    //   if (input) {
    //     //  ("input输入的搜索内容：" + this.input)
    //     return this.tableData.filter((data) => {
    //        ("object:" + Object.keys(data));
    //       return Object.keys(data).some((key) => {
    //         return String(data[key]).toLowerCase().indexOf(input) > -1;
    //       });
    //     });
    //   }
    //   if (input1) {
    //     //  ("input输入的搜索内容：" + this.input)
    //     return this.tableData.filter((data) => {
    //        ("object:" + Object.keys(data));
    //       return Object.keys(data).some((key) => {
    //         return String(data[key]).toLowerCase().indexOf(input1) > -1;
    //       });
    //     });
    //   }
    //   return this.tableData;
    // },
  },
  created() {
    this.getQuPage()
  },
  methods: {
    questionStemListLabel(row) {
      return questionStemPlainSummary(row)
    },
    handleRepoChangeSingle(repo) {
      ('单选题库变化:', repo)
      // 这里可以进一步处理repo对象，比如更新UI或发送网络请求等
    },
    updateRow(row) {
      localStorage.setItem('quId', row.id)
      this.$router.push({ name: 'questions-add' })
    },
    importQu() {
      if (this.fileList && this.fileList.length > 0 && this.selectedRepoSingle !== '') {
        const formData = new FormData() // 创建FormData对象
        formData.append('file', this.fileList[0].raw) // 添加文件到formData
        importQue(this.selectedRepoSingle, formData)
          .then((response) => {
            if (response.code) {
              this.$message.success('导入成功！')
              this.getQuPage(this.pageNum, this.pageSize)
              this.fileDialogVisible = false // 关闭对话框
              // 可以在这里处理成功后的逻辑，如刷新数据等
              // 清空题库选择和文件列表
              this.selectedRepoSingle = ''
              this.fileList = []
            } else {
              this.$message({
                type: 'error',
                message: response.msg
              })
              // 只清空文件列表
              this.fileList = []
            }
          })
          .catch((error) => {
            // 全局 request 拦截器已对 code!=1 弹过明细；此处避免再刷一条「上传失败」
            console.error('导入试题请求失败：', error)
          })
      } else {
        this.$message.warning('请选择文件后再上传！')
      }
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList // 收集文件信息
    },
    // 移除文件处理方法
    handleRemove(file, fileList) {
      if (fileList.length === 0) {
        this.hasFiles = false
      }
    },
    // 分页查询
    async getQuPage(pageNum, pageSize, content = null, repoId = null, type = null) {
      const params = {
        pageNum: pageNum,
        pageSize: pageSize,
        content: content,
        repoId: repoId,
        type: type
      }
      const res = await quPaging(params)
      this.data = res.data
    },
    // 编辑题库
    updateQu() {
      quUpdate(this.form.id, { title: this.form.title })
        .then((res) => {
          if (res.code) {
            this.getQuPage(
              this.pageNum,
              this.pageSize,
              this.searchName,
              this.selectedRepoSingleSearch,
              this.selValue
            )
            this.dialogFormVisible = false
            this.$message({
              type: 'success',
              message: '编辑成功!'
            })
          } else {
            this.$message({
              type: 'info',
              message: res.msg
            })
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消编辑'
          })
        })
    },
    // 删除试题
    delQu(row) {
      this.$confirm('此操作将永久删除该试题, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          quDel(row.id).then((res) => {
            if (res.code) {
              this.getQuPage(
                this.pageNum,
                this.pageSize,
                this.searchName,
                this.selectedRepoSingleSearch,
                this.selValue
              )
              // this.tableData.splice(index, 1)
              // this.getQuPage(1);
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            } else {
              this.$message({
                type: 'info',
                message: res.msg
              })
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    searchQu() {
      this.getQuPage(
        this.pageNum,
        this.pageSize,
        this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue
      )
    },

    screenInfo(row, index, done) {
      localStorage.removeItem('quId')
      this.$router.push({ name: 'questions-add', query: { zhi: row }})
    },

    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getQuPage(this.pageNum, val, this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getQuPage(val, this.pageSize, this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue)
    },
    /**
     * 下载导入模板：public/template 下的文件。
     * publicPath 为 ./ 时，写死的 ./template/... 会相对「当前路由」拼错；这里用 URL 规范解析。
     * 再用 fetch + Blob 触发保存，避免部分浏览器对 xlsx 只预览、或忽略 download 属性。
     */
    async startDownload() {
      const fileName = '导入试题模板.xlsx'
      const href = new URL('template/ImportQuestionTemplate.xlsx', window.location.href).href
      try {
        const res = await fetch(href, { method: 'GET', credentials: 'same-origin' })
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.rel = 'noopener'
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        this.$message.success(
          '已开始下载。未看到文件时，按 Ctrl+J 可打开下载记录，或在系统「下载」文件夹中查找。'
        )
      } catch (e) {
        console.error('下载模板失败', e)
        this.$message.error(
          '模板下载失败。请确认使用 npm run dev 启动前端，且不要删掉 public/template/ImportQuestionTemplate.xlsx；部署后勿改静态资源路径。'
        )
      }
    }
  }
}
</script>

<style></style>
