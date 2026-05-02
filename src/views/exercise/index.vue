
<template>
  <div class="app-container">
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item label="题库名称：">
        <el-input v-model="repoTitle" />
      </el-form-item>
      <el-form-item label="题库分类：">
        <el-select v-model="categoryId" placeholder="请选择分类" clearable>
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="queryRepo()">查询</el-button>
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
      <el-table-column prop="repoTitle" label="题库标题" align="center" />
      <el-table-column prop="categoryName" label="题库分类" align="center">
        <template slot-scope="{ row }">
          <span v-if="row.parentCategoryName">{{ row.parentCategoryName }} / </span>
          <span>{{ row.categoryName || '未分类' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalCount" label="试题总数" align="center" />

      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="success"
            plain
            :disabled="row.totalCount == 0"
            size="small"
            @click="screenInfo(row.id, row.repoTitle)"
          >开始刷题</el-button>
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
import { exercisePaging } from '@/api/exercise'
import { getCategoryTree } from '@/api/category'

export default {
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      data: {},
      repoTitle: '',
      categoryId: '',
      categoryOptions: [],
      dialogTableVisible: false,
      dialogFormVisible: false,
      formLabelWidth: '120px'
    }
  },

  created() {
    this.getExercisePage()
    this.fetchCategories()
  },
  methods: {
    /**

     * 根据筛选条件请求练习/题库列表分页接口，用于学生端题库入口表格。

     */
    queryRepo() {
      this.getExercisePage(this.pageNum, this.pageSize, this.repoTitle, this.categoryId)
    },
    // 分页查询
    /**

     * 按分页与筛选参数调用练习记录分页 API，刷新 exercise 列表数据。

     */
    async getExercisePage(pageNum, pageSize, title = null, categoryId = null) {
      const params = { 
        pageNum: pageNum, 
        pageSize: pageSize, 
        title: title,
        categoryId: categoryId
      }
      const res = await exercisePaging(params)
      this.data = res.data
    },
    // 获取分类列表
    /**

     * 请求题目分类树接口，为题库/练习筛选下拉提供数据源。

     */
    async fetchCategories() {
      try {
        const res = await getCategoryTree()
        if (res.code) {
          this.categoryOptions = this.flattenCategoryTree(res.data)
        } else {
          this.$message.error(res.msg || '获取分类数据失败')
        }
      } catch (error) {
        console.error('获取分类失败:', error)
        this.$message.error('获取分类数据失败')
      }
    },
    // 将分类树扁平化为列表
    /**

     * 将后端返回的树形分类递归打平为一维数组，便于 el-option 或过滤使用。

     */
    flattenCategoryTree(tree, result = []) {
      if (!tree || !tree.length) return result

      tree.forEach(node => {
        result.push({
          id: node.id,
          name: node.name
        })
        if (node.children && node.children.length > 0) {
          this.flattenCategoryTree(node.children, result)
        }
      })
      return result
    },
    /**

     * 根据表格列配置的 prop 与格式化器，生成导出或预览用的展示文案映射。

     */
    screenInfo(id, repoTitle) {
      this.$router.push({ name: 'start-exercise', query: { repoId: id, repoTitle: repoTitle }})
    },
    /**

     * Element Table 分页：同步修改 pageSize，重置或保持当前页并重新拉取列表数据。

     */
    handleSizeChange(val) {
      this.pageSize = val
      this.getExercisePage(this.pageNum, val, this.repoTitle, this.categoryId)
    },
    /**

     * Element Table 分页：同步当前页码 pageNum，触发列表接口刷新表格数据。

     */
    handleCurrentChange(val) {
      this.pageNum = val
      this.getExercisePage(val, this.pageSize, this.repoTitle, this.categoryId)
    },
    /**

     * 表格/卡片行点击：根据行数据跳转详情、打开编辑弹窗、触发导出或路由 push（各页 @click 传参不同）。

     */
    handleClick(row) {
      console.log(row)
    }
  }
}
</script>

<style>
.pagination-container {
  margin-top: 20px;
  text-align: center;
}
</style>
