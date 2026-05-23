<template>
  <div class="app-container">
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item label="身份">
        <el-select v-model="searchForm.roleId" clearable placeholder="全部">
          <el-option label="教师" :value="2" />
          <el-option label="管理员" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" clearable placeholder="全部">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button type="success" @click="dialogVisible = true">生成邀请码</el-button>
      </el-form-item>
    </el-form>

    <el-table
      :data="tableData.records"
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
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="邀请码" prop="code" align="center" min-width="120" />
      <el-table-column label="身份" prop="roleName" align="center" width="100" />
      <el-table-column label="已用/上限" align="center" width="110">
        <template slot-scope="{ row }">
          {{ row.usedCount }} / {{ row.maxUses }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="90">
        <template slot-scope="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" prop="expireTime" align="center" min-width="160">
        <template slot-scope="{ row }">
          {{ row.expireTime || '永不过期' }}
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center" show-overflow-tooltip />
      <el-table-column label="创建人" prop="creatorName" align="center" width="100" />
      <el-table-column label="创建时间" prop="createTime" align="center" min-width="160" />
      <el-table-column label="操作" align="center" width="160">
        <template slot-scope="{ row }">
          <el-button
            v-if="row.status === 1"
            type="text"
            size="small"
            @click="copyCode(row.code)"
          >复制</el-button>
          <el-button
            v-if="row.status === 1"
            type="text"
            size="small"
            style="color: #e6a23c"
            @click="handleDisable(row)"
          >禁用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 16px"
      background
      layout="total, prev, pager, next"
      :total="tableData.total"
      :page-size="pageSize"
      :current-page.sync="pageNum"
      @current-change="loadData"
    />

    <div style="margin-top: 12px">
      <el-button type="danger" :disabled="!selectedIds.length" @click="handleDelete">批量删除</el-button>
    </div>

    <el-dialog title="生成邀请码" :visible.sync="dialogVisible" width="480px" @close="resetForm">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="身份" prop="roleId">
          <el-select v-model="createForm.roleId" placeholder="请选择">
            <el-option label="教师" :value="2" />
            <el-option label="管理员" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="可用次数" prop="maxUses">
          <el-input-number v-model="createForm.maxUses" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="createForm.expireTime"
            type="datetime"
            placeholder="不选则永不过期"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="2" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">生成</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  createInviteCode,
  inviteCodePaging,
  disableInviteCode,
  deleteInviteCodes
} from '@/api/inviteCode'

export default {
  name: 'InviteCodeManage',
  data() {
    return {
      searchForm: { roleId: null, status: null },
      tableData: { records: [], total: 0 },
      pageNum: 1,
      pageSize: 10,
      selectedIds: [],
      dialogVisible: false,
      creating: false,
      createForm: {
        roleId: 2,
        maxUses: 1,
        expireTime: null,
        remark: ''
      },
      createRules: {
        roleId: [{ required: true, message: '请选择身份', trigger: 'change' }],
        maxUses: [{ required: true, message: '请设置可用次数', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      inviteCodePaging({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        roleId: this.searchForm.roleId,
        status: this.searchForm.status
      }).then(res => {
        if (res.code === 1 && res.data) {
          this.tableData = res.data
        }
      })
    },
    handleSelectionChange(rows) {
      this.selectedIds = rows.map(r => r.id)
    },
    resetForm() {
      this.createForm = { roleId: 2, maxUses: 1, expireTime: null, remark: '' }
      if (this.$refs.createFormRef) {
        this.$refs.createFormRef.resetFields()
      }
    },
    submitCreate() {
      this.$refs.createFormRef.validate(valid => {
        if (!valid) return
        this.creating = true
        createInviteCode(this.createForm)
          .then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg || '生成成功')
              this.dialogVisible = false
              this.loadData()
            } else {
              this.$message.error(res.msg || '生成失败')
            }
          })
          .finally(() => {
            this.creating = false
          })
      })
    },
    copyCode(code) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
          this.$message.success('已复制邀请码')
        }).catch(() => {
          this.$message.info('邀请码：' + code)
        })
      } else {
        this.$message.info('邀请码：' + code)
      }
    },
    handleDisable(row) {
      this.$confirm('禁用后该码将无法用于新用户注册，是否继续？', '提示', { type: 'warning' })
        .then(() => disableInviteCode(row.id))
        .then(res => {
          if (res.code === 1) {
            this.$message.success('已禁用')
            this.loadData()
          }
        })
        .catch(() => {})
    },
    handleDelete() {
      this.$confirm('确定删除选中的邀请码？', '提示', { type: 'warning' })
        .then(() => deleteInviteCodes(this.selectedIds.join(',')))
        .then(res => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.loadData()
          }
        })
        .catch(() => {})
    }
  }
}
</script>
