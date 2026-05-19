<template>
  <div class="app-container">
    <h3>组卷信息</h3>
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="自己选题" name="first">
        <ChooseQuestion
          ref="questionSelector"
          @selected-change="handleSelectedChange"
        />
      </el-tab-pane>
      <el-tab-pane label="随机抽题" name="second">
        <!-- <el-card style="margin-top: 20px"> -->
        <div style="float: right; font-weight: bold; color: #ff0000">
          试卷总分：{{ postForm.totalScore }}分
        </div>

        <div>
          <el-button class="filter-item" size="small" type="primary" icon="el-icon-plus" @click="handleAdd">
            添加题库
          </el-button>
          <div style="margin-top: 12px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
            <span style="font-size: 13px; color: #606266">统一题型分值：</span>
            <span>单选</span>
            <el-input-number v-model="randomScoreConfig.radioScore" :min="0" :controls="false" style="width: 80px" />
            <span>多选</span>
            <el-input-number v-model="randomScoreConfig.multiScore" :min="0" :controls="false" style="width: 80px" />
            <span>判断</span>
            <el-input-number v-model="randomScoreConfig.judgeScore" :min="0" :controls="false" style="width: 80px" />
            <span>简答</span>
            <el-input-number v-model="randomScoreConfig.saqScore" :min="0" :controls="false" style="width: 80px" />
            <span>复合题</span>
            <el-input-number v-model="randomScoreConfig.compoundScore" :min="0" :controls="false" style="width: 80px" />
          </div>

          <el-table
            :data="repoList"
            :border="false"
            empty-text="请点击上面的`添加题库`进行设置"
            style="width: 100%; margin-top: 15px"
          >
            <el-table-column label="题库" width="200">
              <template v-slot="scope">
                <repo-select
                  v-model="scope.row.repoId"
                  :multi="false"
                  :excludes="excludes.filter((id) => String(id) !== String(scope.row.repoId))"
                  @change="repoChange($event, scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="单选数量" align="center">
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.radioCount"
                  :min="0"
                  v-bind="repoTypeMaxBind(scope.row, 'totalRadio')"
                  :controls="false"
                  style="width: 80px"
                />
                <template v-if="repoTypeMax(scope.row, 'totalRadio') != null">
                  / {{ repoTypeMax(scope.row, 'totalRadio') }}
                </template>
              </template>
            </el-table-column>

            <el-table-column label="多选数量" align="center">
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.multiCount"
                  :min="0"
                  v-bind="repoTypeMaxBind(scope.row, 'totalMulti')"
                  :controls="false"
                  style="width: 80px"
                />
                <template v-if="repoTypeMax(scope.row, 'totalMulti') != null">
                  / {{ repoTypeMax(scope.row, 'totalMulti') }}
                </template>
              </template>
            </el-table-column>

            <el-table-column label="判断题数量" align="center">
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.judgeCount"
                  :min="0"
                  v-bind="repoTypeMaxBind(scope.row, 'totalJudge')"
                  :controls="false"
                  style="width: 80px"
                />
                <template v-if="repoTypeMax(scope.row, 'totalJudge') != null">
                  / {{ repoTypeMax(scope.row, 'totalJudge') }}
                </template>
              </template>
            </el-table-column>

            <el-table-column label="简答题数量" align="center">
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.saqCount"
                  :min="0"
                  v-bind="repoTypeMaxBind(scope.row, 'totalSaq')"
                  :controls="false"
                  style="width: 80px"
                />
                <template v-if="repoTypeMax(scope.row, 'totalSaq') != null">
                  / {{ repoTypeMax(scope.row, 'totalSaq') }}
                </template>
              </template>
            </el-table-column>

            <el-table-column label="复合题数量" align="center">
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.compoundCount"
                  :min="0"
                  v-bind="repoTypeMaxBind(scope.row, 'totalCompound')"
                  :controls="false"
                  style="width: 80px"
                />
                <template v-if="repoTypeMax(scope.row, 'totalCompound') != null">
                  / {{ repoTypeMax(scope.row, 'totalCompound') }}
                </template>
              </template>
            </el-table-column>

            <el-table-column label="删除" align="center" width="80px">
              <template v-slot="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  :disabled="repoList.length <= 1"
                  @click="removeItem(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- </el-card> -->
      </el-tab-pane>
    </el-tabs>

    <h3>考试配置</h3>
    <el-card style="margin-top: 20px">
      <el-form
        ref="postForm"
        :model="postForm"
        :rules="rules"
        label-position="left"
        label-width="120px"
      >
        <el-form-item label="考试名称" prop="title">
          <el-input v-model="postForm.title" />
        </el-form-item>

        <!-- <el-form-item label="考试描述" prop="content">
          <el-input v-model="postForm.content" type="textarea" />
        </el-form-item> -->

        <el-form-item label="总分数" prop="totalScore">
          <el-input-number v-model="postForm.totalScore" disabled />
        </el-form-item>

        <el-form-item label="及格分" prop="passedScore">
          <el-input-number
            v-model="postForm.passedScore"
            :max="postForm.totalScore"
          />
        </el-form-item>

        <el-form-item label="最多切屏次数" prop="maxCount">
          <el-input-number v-model="postForm.maxCount" />
        </el-form-item>
        <el-form-item label="证书" prop="maxCount">
          <CertificateSelect
            v-model="postForm.certificateId"
            is-multiple
            @change="onCertificateChange"
          />
          <!-- <el-input-number v-model="postForm.maxCount"  /> -->
        </el-form-item>
        <el-form-item label="考试时长(分钟)" prop="examDuration">
          <el-input-number v-model="postForm.examDuration" />
        </el-form-item>
        <el-form-item label="考试时间范围" prop="start">
          <el-date-picker
            v-model="postForm.start"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <!--
        <el-form-item label="是否限时">
          <el-checkbox v-model="postForm.timeLimit" />
        </el-form-item> -->

        <!-- <el-form-item
          v-if="postForm.timeLimit"
          label="考试时间"
          prop="examDuration"
        >
          <el-date-picker
            v-model="dateValues"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item> -->
        <h3>权限配置</h3>
        <el-card style="margin-top: 20px">
          <div style="display: flex">
            <div style="margin-left: 10px; width: 100%">
              <el-form-item label="考试班级" prop="classIds">
                <ClassSelect
                  v-model="postForm.classIds"
                  is-multiple
                  @change="onClassChange"
                />
              </el-form-item>
            </div>
          </div>
        </el-card>
      </el-form>
    </el-card>

    <div style="margin-top: 20px">
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </div>
</template>

<script>
// import { fetchDetail } from '@/api/exam'
import RepoSelect from '@/components/RepoSelect'
import ClassSelect from '@/components/ClassSelect'
import CertificateSelect from '@/components/CertificateSelect'
import { saveData } from '@/api/exam'
import ChooseQuestion from '@/components/ExamComponents/ChooseQuestion'
export default {
  name: 'ExamDetail',

  components: {
    RepoSelect,
    ChooseQuestion,
    ClassSelect,
    CertificateSelect
  },
  data() {
    return {
      activeName: 'first',
      input: '',
      treeData: [],
      defaultProps: {
        label: 'deptName'
      },
      filterText: '',
      treeLoading: false,
      // dateValues: [],
      // 题库
      repoList: [
        {
          addQuType: '0',
          queIds: '',
          id: '',
          rowId: 0,
          repoId: null,
          radioCount: 0,
          radioScore: 0,
          multiCount: 0,
          multiScore: 0,
          judgeCount: 0,
          judgeScore: 0,
          saqCount: 0,
          saqScore: 0,
          compoundCount: 0,
          compoundScore: 0,
          totalRadio: null,
          totalMulti: null,
          totalJudge: null,
          totalSaq: null,
          totalCompound: null
        }
      ],
      // 已选择的题库
      excludes: [],
      randomScoreConfig: {
        radioScore: 0,
        multiScore: 0,
        judgeScore: 0,
        saqScore: 0,
        compoundScore: 0
      },
      manualSelectedRows: [],
      postForm: {
        start: [],
        // 总分数
        totalScore: 0,
        // 题库列表
        repoList: [],
        // 开放类型
        openType: 1,
        // 考试班级列表
        departIds: [],
        // 初始化班级列表
        classIds: [],
        certificateId: []
      },
      rules: {
        title: [{ required: true, message: '考试名称不能为空！' }],

        // content: [{ required: true, message: '考试描述不能为空！' }],

        totalScore: [{ required: true, message: '考试分数不能为空！' }],

        passedScore: [{ required: true, message: '及格分不能为空！' }],

        examDuration: [{ required: true, message: '考试时间不能为空！' }],

        start: [{ required: true, message: '考试时间范围不能为空！' }],

        maxCount: [{ required: false, message: '最多切屏次数' }],
        classIds: [
          {
            required: true,
            message: '请选择考试班级！',
            type: 'array',
            min: 1
          }
        ]
      }
    }
  },

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },

    // dateValues: {
    //   handler() {
    //     this.postForm.startTime = this.dateValues[0];
    //     this.postForm.endTime = this.dateValues[1];
    //   },
    // },

    // 题库变换（同步总分、已选题库；题量/分值用 Number 归一，避免 el-input-number 为字符串时加不出分）
    repoList: {
      immediate: true,
      handler(val) {
        this.excludes = []
        const list = Array.isArray(val) ? val : []
        if (this.activeName === 'first') {
          return
        }
        const totalScore = this.calcTotalScore(list)
        for (let i = 0; i < list.length; i++) {
          const item = list[i]
          if (item.repoId !== null && item.repoId !== undefined && String(item.repoId).trim() !== '') {
            this.excludes.push(item.repoId)
          }
        }

        this.postForm.totalScore = totalScore
        this.postForm.repoList = list
        this.$forceUpdate()
      },
      deep: true
    },
    randomScoreConfig: {
      handler() {
        if (this.activeName === 'second') {
          this.postForm.totalScore = this.calcTotalScore(this.repoList)
        }
      },
      deep: true
    }
  },
  methods: {
    calcManualTotalScore(rows = []) {
      let total = 0
      for (const row of rows) {
        const s = Number(row.assignScore)
        if (Number.isFinite(s) && s > 0) {
          total += s
        }
      }
      return total
    },
    calcTotalScore(list) {
      let totalScore = 0
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const rc = Number(item.radioCount)
        const mc = Number(item.multiCount)
        const jc = Number(item.judgeCount)
        const sc = Number(item.saqCount)
        const cc = Number(item.compoundCount)
        const rs = this.activeName === 'second' ? Number(this.randomScoreConfig.radioScore) : Number(item.radioScore)
        const ms = this.activeName === 'second' ? Number(this.randomScoreConfig.multiScore) : Number(item.multiScore)
        const js = this.activeName === 'second' ? Number(this.randomScoreConfig.judgeScore) : Number(item.judgeScore)
        const ss = this.activeName === 'second' ? Number(this.randomScoreConfig.saqScore) : Number(item.saqScore)
        const cs = this.activeName === 'second' ? Number(this.randomScoreConfig.compoundScore) : Number(item.compoundScore)

        if (rc > 0 && rs > 0) totalScore += rc * rs
        if (mc > 0 && ms > 0) totalScore += mc * ms
        if (jc > 0 && js > 0) totalScore += jc * js
        if (sc > 0 && ss > 0) totalScore += sc * ss
        if (cc > 0 && cs > 0) totalScore += cc * cs
      }
      return totalScore
    },
    // 点击tab
    handleClick(tab, event) {
      this.$refs.questionSelector.clearSelection()
      this.repoList = [this.createRepoRow(String(tab.index))]
      console.log(tab, event)
    },
    /** 服务端可能返回 radioNum / radioCount 等，统一成各题型可用题量上限（无则 null，不限制输入也不误 clamp 成 0） */
    readRepoTypeTotals(repo) {
      if (!repo || typeof repo !== 'object') {
        return { totalRadio: null, totalMulti: null, totalJudge: null, totalSaq: null, totalCompound: null }
      }
      const pick = (...keys) => {
        for (const k of keys) {
          if (repo[k] === null || repo[k] === undefined || repo[k] === '') continue
          const n = Number(repo[k])
          if (Number.isFinite(n) && n >= 0) return n
        }
        return null
      }
      return {
        totalRadio: pick('radioNum', 'radioCount', 'totalRadio', 'singleNum', 'singleCount'),
        totalMulti: pick('multiNum', 'multiCount', 'totalMulti'),
        totalJudge: pick('judgeNum', 'judgeCount', 'totalJudge'),
        totalSaq: pick('saqNum', 'saqCount', 'totalSaq', 'shortNum', 'subjectiveNum'),
        totalCompound: pick('compoundNum', 'compoundCount', 'totalCompound')
      }
    },
    repoTypeMax(row, key) {
      const v = row[key]
      if (v === null || v === undefined || v === '') return null
      const n = Number(v)
      return Number.isFinite(n) && n >= 0 ? n : null
    },
    repoTypeMaxBind(row, key) {
      const m = this.repoTypeMax(row, key)
      return m != null ? { max: m } : {}
    },
    clampCountsToTotals(row) {
      const clamp = (countKey, totalKey) => {
        const cap = this.repoTypeMax(row, totalKey)
        if (cap == null) return
        const c = Number(row[countKey])
        if (!Number.isFinite(c)) return
        row[countKey] = Math.min(Math.max(0, c), cap)
      }
      clamp('radioCount', 'totalRadio')
      clamp('multiCount', 'totalMulti')
      clamp('judgeCount', 'totalJudge')
      clamp('saqCount', 'totalSaq')
      clamp('compoundCount', 'totalCompound')
    },
    createRepoRow(addQuType = '0') {
      return {
        addQuType,
        queIds: '',
        id: '',
        rowId: 0,
        repoId: null,
        radioCount: 0,
        radioScore: 0,
        multiCount: 0,
        multiScore: 0,
        judgeCount: 0,
        judgeScore: 0,
        saqCount: 0,
        saqScore: 0,
        compoundCount: 0,
        compoundScore: 0,
        totalRadio: null,
        totalMulti: null,
        totalJudge: null,
        totalSaq: null,
        totalCompound: null
      }
    },
    isRepoIdEmpty(value) {
      return value === null || value === undefined || String(value).trim() === ''
    },
    normalizeRepoId(value) {
      if (value === null || value === undefined || String(value).trim() === '') return null
      const num = Number(value)
      return Number.isInteger(num) && num > 0 ? num : null
    },
    // 子组件选择的ids
    handleSelectedChange(selectedIds) {
      const rows = selectedIds.selectedRows || []
      this.manualSelectedRows = rows
      const ids = rows.map((item) => item.id)

      this.repoList[0].queIds = ids.join(',')
      this.repoList[0].addQuType = '0'
      this.repoList[0].radioCount = selectedIds.questionList.radioCount
      this.repoList[0].radioScore = selectedIds.questionList.radioScore
      this.repoList[0].multiCount = selectedIds.questionList.multiCount
      this.repoList[0].multiScore = selectedIds.questionList.multiScore
      this.repoList[0].judgeCount = selectedIds.questionList.judgeCount
      this.repoList[0].judgeScore = selectedIds.questionList.judgeScore
      this.repoList[0].saqCount = selectedIds.questionList.saqCount
      this.repoList[0].saqScore = selectedIds.questionList.saqScore
      this.repoList[0].compoundCount = selectedIds.questionList.compoundCount
      this.repoList[0].compoundScore = selectedIds.questionList.compoundScore
      this.postForm.totalScore = this.calcManualTotalScore(rows)
      this.selectedQuestionIds = selectedIds
      // 或者执行其他需要的操作
    },
    handleSave() {
      const validateAndSubmit = () => {
        this.$refs.postForm.validate((valid) => {
          if (!valid) {
            this.$notify({
              title: '提示信息',
              message: '请先完善考试配置（请检查标红项）',
              type: 'warning',
              duration: 2500
            })
            return
          }

          if (this.postForm.totalScore === 0) {
            this.$notify({
              title: '提示信息',
              message: '考试规则设置不正确，请确认！',
              type: 'warning',
              duration: 2000
            })
            return
          }

          // 验证班级是否选择
          if (!this.postForm.classIds || this.postForm.classIds.length === 0) {
            this.$notify({
              title: '提示信息',
              message: '请选择考试班级！',
              type: 'warning',
              duration: 2000
            })
            return
          }

          const isRandomMode = this.activeName === 'second'
          const validateRepoList = isRandomMode
            ? this.postForm.repoList
            : this.postForm.repoList.slice(0, 1)

          if (isRandomMode && validateRepoList.length === 0) {
            this.$notify({
              title: '提示信息',
              message: '请至少添加一个题库！',
              type: 'warning',
              duration: 2000
            })
            return
          }

          if (isRandomMode) {
            const totalRadioCount = validateRepoList.reduce((sum, item) => sum + Number(item.radioCount || 0), 0)
            const totalMultiCount = validateRepoList.reduce((sum, item) => sum + Number(item.multiCount || 0), 0)
            const totalJudgeCount = validateRepoList.reduce((sum, item) => sum + Number(item.judgeCount || 0), 0)
            const totalSaqCount = validateRepoList.reduce((sum, item) => sum + Number(item.saqCount || 0), 0)
            const totalCompoundCount = validateRepoList.reduce((sum, item) => sum + Number(item.compoundCount || 0), 0)

            if ((totalRadioCount > 0 && Number(this.randomScoreConfig.radioScore) <= 0) ||
              (totalMultiCount > 0 && Number(this.randomScoreConfig.multiScore) <= 0) ||
              (totalJudgeCount > 0 && Number(this.randomScoreConfig.judgeScore) <= 0) ||
              (totalSaqCount > 0 && Number(this.randomScoreConfig.saqScore) <= 0) ||
              (totalCompoundCount > 0 && Number(this.randomScoreConfig.compoundScore) <= 0)) {
              this.$notify({
                title: '提示信息',
                message: '随机抽题模式下，请设置统一题型分值（有题量的题型分值必须大于 0）！',
                type: 'warning',
                duration: 2500
              })
              return
            }
          }

          for (let i = 0; i < validateRepoList.length; i++) {
            const repo = validateRepoList[i]
            if (isRandomMode && this.isRepoIdEmpty(repo.repoId)) {
              this.$notify({
                title: '提示信息',
                message: '考试题库选择不正确！',
                type: 'warning',
                duration: 2000
              })
              return
            }
            if (isRandomMode && this.normalizeRepoId(repo.repoId) == null) {
              this.$notify({
                title: '提示信息',
                message: '题库第：[' + (i + 1) + ']项题库值异常，请重新选择题库！',
                type: 'warning',
                duration: 2500
              })
              return
            }
            if (
              isRandomMode &&
              Number(repo.radioCount || 0) +
                Number(repo.multiCount || 0) +
                Number(repo.judgeCount || 0) +
                Number(repo.saqCount || 0) +
                Number(repo.compoundCount || 0) ===
                0
            ) {
              this.$notify({
                title: '提示信息',
                message: '题库第：[' + (i + 1) + ']项尚未配置抽题数量！',
                type: 'warning',
                duration: 2000
              })
              return
            }
          }

          if (!isRandomMode) {
            const manualRows = this.manualSelectedRows || []
            if (manualRows.length === 0) {
              this.$notify({
                title: '提示信息',
                message: '请至少选择一道试题！',
                type: 'warning',
                duration: 2000
              })
              return
            }
            const invalidRow = manualRows.find((row) => {
              const s = Number(row.assignScore)
              return !Number.isFinite(s) || s <= 0
            })
            if (invalidRow) {
              this.$notify({
                title: '提示信息',
                message: '请为每道已选题目设置大于 0 的分值（可点「设置分值」单独修改）！',
                type: 'warning',
                duration: 2500
              })
              return
            }
          }

          this.$confirm('确实要提交保存吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.submitForm()
            })
            .catch(() => {})
        })
      }

      // 两种组卷方式都走同一套校验+提交，避免“保存没反应”的隐性分支
      validateAndSubmit()
    },

    handleCheckChange() {
      const that = this
      // 置空
      this.postForm.departIds = []
      const nodes = this.$refs.tree.getCheckedNodes()
      nodes.forEach(function(item) {
        that.postForm.departIds.push(item.id)
      })
    },

    // 添加子项
    handleAdd() {
      this.repoList.push(this.createRepoRow(this.activeName === 'second' ? '1' : '0'))
    },

    removeItem(index) {
      this.repoList.splice(index, 1)
    },
    formatDateToISOString(date) {
      if (!(date instanceof Date)) {
        return null
      }

      // 获取本地时间的各部分（不进行时区转换）
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      // 格式化为本地时间字符串（不含时区信息）
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
      // 输出示例："2025-05-14 09:00:00"（保留用户选择的本地时间）
    },

    submitForm() {
      console.log('postForm', this.postForm)
      // 校验和处理数据
      let cerTemp = ''
      const certIds = this.postForm.certificateId
      if (Array.isArray(certIds) && certIds.length > 0) {
        cerTemp = certIds.join(',')
      }
      this.postForm.repoList = this.repoList
      const isRandomMode = this.activeName === 'second'
      const effectiveRepoList = isRandomMode
        ? this.postForm.repoList.filter((item) => !this.isRepoIdEmpty(item.repoId))
        : this.postForm.repoList.slice(0, 1)
      const normalizedRepoIds = effectiveRepoList
        .map((item) => this.normalizeRepoId(item.repoId))
        .filter((id) => id !== null)
      if (isRandomMode && normalizedRepoIds.length !== effectiveRepoList.length) {
        this.$notify({
          title: '提示信息',
          message: '存在非法题库参数，请重新选择题库后再保存！',
          type: 'warning',
          duration: 2500
        })
        return
      }
      const firstRepo = effectiveRepoList[0] || this.createRepoRow('0')

      const params = {
        title: this.postForm.title,
        // content: this.postForm.content, // 添加考试描述字段
        examDuration: this.postForm.examDuration,
        maxCount: this.postForm.maxCount,
        passedScore: this.postForm.passedScore,
        startTime: this.formatDateToISOString(this.postForm.start[0]),
        endTime: this.formatDateToISOString(this.postForm.start[1]),
        gradeIds: this.postForm.classIds.join(','),
        repoId: isRandomMode
          ? normalizedRepoIds.join(',')
          : this.normalizeRepoId(firstRepo.repoId),
        certificateId: cerTemp,
        addQuype: isRandomMode ? '1' : firstRepo.addQuType,
        quIds: isRandomMode
          ? ''
          : (this.manualSelectedRows || []).map((row) => row.id).join(','),
        quScores: isRandomMode
          ? ''
          : (this.manualSelectedRows || [])
            .map((row) => Number(row.assignScore || 0))
            .join(','),
        radioCount: isRandomMode
          ? effectiveRepoList.map((item) => Number(item.radioCount || 0)).join(',')
          : firstRepo.radioCount,
        radioScore: isRandomMode
          ? effectiveRepoList.map(() => Number(this.randomScoreConfig.radioScore || 0)).join(',')
          : firstRepo.radioScore,
        multiCount: isRandomMode
          ? effectiveRepoList.map((item) => Number(item.multiCount || 0)).join(',')
          : firstRepo.multiCount,
        multiScore: isRandomMode
          ? effectiveRepoList.map(() => Number(this.randomScoreConfig.multiScore || 0)).join(',')
          : firstRepo.multiScore,
        judgeCount: isRandomMode
          ? effectiveRepoList.map((item) => Number(item.judgeCount || 0)).join(',')
          : firstRepo.judgeCount,
        judgeScore: isRandomMode
          ? effectiveRepoList.map(() => Number(this.randomScoreConfig.judgeScore || 0)).join(',')
          : firstRepo.judgeScore,
        saqCount: isRandomMode
          ? effectiveRepoList.map((item) => Number(item.saqCount || 0)).join(',')
          : firstRepo.saqCount,
        saqScore: isRandomMode
          ? effectiveRepoList.map(() => Number(this.randomScoreConfig.saqScore || 0)).join(',')
          : firstRepo.saqScore,
        compoundCount: isRandomMode
          ? effectiveRepoList.map((item) => Number(item.compoundCount || 0)).join(',')
          : firstRepo.compoundCount,
        compoundScore: isRandomMode
          ? effectiveRepoList.map(() => Number(this.randomScoreConfig.compoundScore || 0)).join(',')
          : firstRepo.compoundScore
      }
      saveData(params)
        .then((res) => {
          if (res.code) {
            this.$notify({
              title: '成功',
              message: '考试保存成功！',
              type: 'success',
              duration: 2000
            })

            this.$router.push({ name: 'exam-management' })
          } else {
            this.$notify({
              title: '失败',
              message: res.msg || '保存失败，请稍后重试',
              type: 'error',
              duration: 2000
            })
          }
        })
        .catch((err) => {
          console.error('save exam failed', err)
          this.$notify({
            title: '失败',
            message: (err && err.message) || '保存失败，请检查网络或后端服务',
            type: 'error',
            duration: 2500
          })
        })
    },

    filterNode(value, data) {
      if (!value) return true
      return data.deptName.indexOf(value) !== -1
    },
    onCertificateChange() {
      // 方法实现...
    },
    onClassChange() {},
    repoChange(e, row) {
      if (e !== null && e !== undefined) {
        const repoId = this.normalizeRepoId(e.id)
        if (repoId == null) {
          row.repoId = null
          row.id = ''
          this.$notify({
            title: '提示信息',
            message: '题库选择值无效，请重新选择！',
            type: 'warning',
            duration: 2000
          })
          return
        }
        row.repoId = repoId
        row.id = repoId
        const t = this.readRepoTypeTotals(e)
        row.totalRadio = t.totalRadio
        row.totalMulti = t.totalMulti
        row.totalJudge = t.totalJudge
        row.totalSaq = t.totalSaq
        row.totalCompound = t.totalCompound
        this.clampCountsToTotals(row)
      } else {
        row.repoId = null
        row.id = ''
        row.totalRadio = null
        row.totalMulti = null
        row.totalJudge = null
        row.totalSaq = null
        row.totalCompound = null
        row.radioCount = 0
        row.multiCount = 0
        row.judgeCount = 0
        row.saqCount = 0
        row.compoundCount = 0
      }
    }
  }
}
</script>
