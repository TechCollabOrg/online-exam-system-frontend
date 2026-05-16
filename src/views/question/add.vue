<template>
  <div class="app-container">
    <el-form
      ref="postForm"
      :model="postForm"
      :rules="rules"
      label-position="left"
      label-width="150px"
      @submit.native.prevent="submitForm"
    >
      <el-card>
        <el-form-item label="题目类型 " prop="quType">
          <el-select
            v-model="postForm.quType"
            :disabled="quTypeDisabled"
            class="filter-item"
            style="width: 400px"
            @change="handleTypeChange"
          >
            <el-option
              v-for="item in quTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="归属题库" prop="repoId">
          <repo-select v-model="postForm.repoId" :multi="false" style="width: 400px" />
        </el-form-item>

        <el-form-item :label="postForm.quType === 5 ? '共用材料' : '题目内容'" prop="content" style="max-width: 1200px">
          <rich-html-editor
            ref="mainStemEditor"
            :key="'stem-' + (postForm.id || 'new')"
            v-model="postForm.content"
            min-editor-height="260px"
            :editor-placeholder="postForm.quType === 5 ? '请输入共用材料；可插图。下方添加各小题。' : '请输入题干；可分段、标题与列表，多次点击图片插入到文中。'"
          />
          <p v-if="postForm.quType === 5" style="margin: 8px 0 0; font-size: 12px; color: #909399; line-height: 1.5">
            复合题：此处填写整道题的<strong>共用材料</strong>，各小问在下方单独配置（可混合单选/多选/判断/简答，简答支持多空）。
          </p>
        </el-form-item>

        <el-form-item label="试题图片" style="margin-left: 7px">
          <file-upload v-model="postForm.image" accept=".jpg,.jpeg,.png" :limit="500" />
        </el-form-item>

        <el-form-item label="整题解析" prop="oriPrice" style="margin-left: 7px">
          <el-input
            v-model="postForm.analysis"
            type="textarea"
            :rows="8"
            resize="vertical"
            style="width: 1200px"
          />
        </el-form-item>
      </el-card>

      <!-- 复合题：多小题 -->
      <el-card v-if="postForm.quType === 5" style="margin-top: 18px; max-width: 1200px">
        <div slot="header" class="clearfix">
          <span>复合题 · 小题列表</span>
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            plain
            style="float: right"
            @click="addSubItem"
          >添加小题</el-button>
        </div>
        <p style="margin: 0 0 16px; font-size: 12px; color: #909399">
          每道小题可单独设置题型；简答题可点「添加一空」增加多个输入框。
        </p>
        <div
          v-for="(sub, sidx) in postForm.subItems"
          :key="'sub-item-' + sidx"
          class="sub-item-card"
        >
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px">
            <span style="font-weight: 600">小题 {{ sidx + 1 }}</span>
            <el-button
              v-if="postForm.subItems.length > 1"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="removeSubItem(sidx)"
            />
          </div>
          <el-form-item label="小题题型" label-width="100px">
            <el-select v-model="sub.quType" style="width: 200px" @change="v => onSubTypeChange(sub, v)">
              <el-option :value="1" label="单选题" />
              <el-option :value="2" label="多选题" />
              <el-option :value="3" label="判断题" />
              <el-option :value="4" label="简答题" />
            </el-select>
          </el-form-item>
          <el-form-item label="小题题干" label-width="100px">
            <rich-html-editor
              ref="subStemEditors"
              :key="'sub-stem-' + sidx"
              v-model="sub.content"
              min-editor-height="160px"
              editor-placeholder="必填：可输入文字，或在编辑器中插入图片"
            />
          </el-form-item>
          <el-button
            v-if="sub.quType === 4"
            type="primary"
            icon="el-icon-plus"
            size="small"
            plain
            @click="addSubBlank(sub)"
          >添加一空</el-button>
          <el-button
            v-else
            type="primary"
            icon="el-icon-plus"
            size="small"
            plain
            @click="addSubOption(sub)"
          >添加选项</el-button>
          <template v-if="sub.quType === 4">
            <div
              v-for="(opt, oidx) in sub.options"
              :key="'sub-blank-' + sidx + '-' + oidx"
              style="margin: 12px 0; padding-bottom: 12px; border-bottom: 1px solid #ebeef5"
            >
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px">
                <span>第 {{ oidx + 1 }} 空 · 参考答案</span>
                <el-button
                  v-if="sub.options.length > 1"
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  size="mini"
                  @click="removeSubOption(sub, oidx)"
                />
              </div>
              <rich-html-editor v-model="opt.content" min-editor-height="120px" />
            </div>
          </template>
          <el-table v-else :data="sub.options" :border="true" style="margin-top: 12px">
            <el-table-column label="是否答案" width="100" align="center">
              <template v-slot="scope">
                <el-checkbox v-model="scope.row.isRight">答案</el-checkbox>
              </template>
            </el-table-column>
            <el-table-column label="选项内容">
              <template v-slot="scope">
                <el-input v-model="scope.row.content" type="textarea" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template v-slot="scope">
                <el-button type="danger" icon="el-icon-delete" circle @click="removeSubOption(sub, scope.$index)" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <el-card v-if="postForm.quType === 4" style="margin-top: 18px; max-width: 1200px">
        <div slot="header" class="clearfix">
          <span>简答题 · 多空作答</span>
          <span style="float: right; font-size: 12px; color: #909399; font-weight: normal">每空对应学生端一个输入框</span>
        </div>
        <el-button type="primary" icon="el-icon-plus" size="small" plain style="margin-bottom: 12px" @click="handleAdd">添加一空</el-button>
        <div
          v-for="(opt, idx) in saqActiveOptions"
          :key="'saq-blank-' + (opt.id || idx)"
          style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #ebeef5"
        >
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
            <span style="font-weight: 600">第 {{ idx + 1 }} 空 · 参考答案（图文）</span>
            <el-button v-if="saqActiveOptions.length > 1" type="danger" icon="el-icon-delete" circle size="mini" @click="removeItem(opt)" />
          </div>
          <rich-html-editor v-model="opt.content" min-editor-height="200px" />
        </div>
      </el-card>

      <div v-if="postForm.quType != 4 && postForm.quType != 5" class="filter-container" style="margin-top: 25px">
        <el-button class="filter-item" type="primary" icon="el-icon-plus" size="small" plain @click="handleAdd">添加</el-button>
        <el-table :data="postForm.options.filter(option => !option.isDeleted)" :border="true" style="width: 90%">
          <el-table-column label="是否答案" width="120" align="center">
            <template v-slot="scope">
              <el-checkbox v-model="scope.row.isRight">答案</el-checkbox>
            </template>
          </el-table-column>
          <el-table-column v-if="itemImage" label="选项图片" min-width="220px" align="center">
            <template v-slot="scope">
              <file-upload v-model="scope.row.image" accept=".jpg,.jpeg,.png" :limit="500" />
            </template>
          </el-table-column>
          <el-table-column label="答案内容">
            <template v-slot="scope">
              <el-input v-model="scope.row.content" type="textarea" />
            </template>
          </el-table-column>
          <el-table-column label="选项解析（图文）" min-width="520px" align="left">
            <template v-slot="scope">
              <rich-html-editor v-model="scope.row.analysis" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="100px">
            <template v-slot="scope">
              <el-button type="danger" icon="el-icon-delete" circle @click="removeItem(scope.row)" />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div style="margin-top: 20px">
        <el-button type="primary" native-type="submit" :loading="submitting">保存</el-button>
        <el-button type="info" @click="onCancel">返回</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { fetchDetail, quAdd, quDetail, quUpdate } from '@/api/question'
import RepoSelect from '@/components/RepoSelect'
import FileUpload from '@/components/FileUpload'
import RichHtmlEditor from '@/components/RichHtmlEditor'
import { mergeLegacySaqOptionImageIntoContent } from '@/utils/saqAnswerHtml'
import { mergeLegacyQuestionImageIntoContent, questionStemHasMeaningfulContent } from '@/utils/questionStemHtml'

function defaultSubItem(quType = 1) {
  const sub = { content: '', quType, options: [] }
  if (quType === 3) {
    sub.options = [
      { isRight: true, content: '正确', image: '', analysis: '' },
      { isRight: false, content: '错误', image: '', analysis: '' }
    ]
  } else if (quType === 4) {
    sub.options = [{ isRight: true, content: '', image: '', analysis: '' }]
  } else {
    sub.options = [
      { isRight: false, content: '', image: '', analysis: '' },
      { isRight: false, content: '', image: '', analysis: '' },
      { isRight: false, content: '', image: '', analysis: '' },
      { isRight: false, content: '', image: '', analysis: '' }
    ]
  }
  return sub
}

export default {
  name: 'QuDetail',
  components: { FileUpload, RepoSelect, RichHtmlEditor },
  data() {
    return {
      quId: '',
      quTypeDisabled: false,
      submitting: false,
      itemImage: true,
      quTypes: [
        { value: 1, label: '单选题' },
        { value: 2, label: '多选题' },
        { value: 3, label: '判断题' },
        { value: 4, label: '简答题' },
        { value: 5, label: '复合题（共用材料+多小题）' }
      ],
      postForm: {
        repoId: '',
        content: '',
        image: '',
        options: [],
        subItems: []
      },
      rules: {
        content: [{ required: true, message: '题目内容不能为空！' }],
        quType: [{ required: true, message: '题目类型不能为空！' }],
        repoId: [{ required: true, message: '请先选择题库！' }]
      }
    }
  },
  computed: {
    saqActiveOptions() {
      if (!this.postForm || !this.postForm.options) return []
      return this.postForm.options.filter((o) => !o.isDeleted)
    }
  },
  created() {
    const id = this.$route.params.id
    if (typeof id !== 'undefined') {
      this.quTypeDisabled = true
      this.fetchData(id)
    }
    this.quId = localStorage.getItem('quId')
    if (this.quId) {
      this.getQuDetail()
    }
  },
  beforeDestroy() {
    localStorage.removeItem('quId')
    this.postForm = {}
  },
  methods: {
    async getQuDetail() {
      const res = await quDetail(this.quId)
      if (res.code) {
        this.applyLoadedForm(res.data)
      }
    },
    applyLoadedForm(data) {
      if (!data.options) data.options = []
      data.options.forEach(item => {
        item.isRight = !!item.isRight
        if (item.analysis == null) item.analysis = ''
      })
      if (!data.subItems || !data.subItems.length) {
        data.subItems = data.quType === 5 ? [defaultSubItem(1)] : []
      }
      data.subItems.forEach(sub => {
        if (!sub.options) sub.options = []
        sub.options.forEach(opt => { opt.isRight = !!opt.isRight })
      })
      this.postForm = data
      this.normalizeQuestionStemAfterLoad()
      this.normalizeSaqOptionsAfterLoad()
    },
    handleTypeChange(v) {
      this.postForm.options = []
      this.postForm.subItems = []
      if (v === 5) {
        this.postForm.subItems = [defaultSubItem(1)]
        return
      }
      if (v === 3) {
        this.postForm.options.push({ isRight: true, content: '正确', image: '', analysis: '' })
        this.postForm.options.push({ isRight: false, content: '错误', image: '', analysis: '' })
      }
      if (v === 1 || v === 2) {
        for (let i = 0; i < 4; i++) {
          this.postForm.options.push({ isRight: false, content: '', image: '', analysis: '' })
        }
      }
      if (v === 4) {
        this.postForm.options.push({ isRight: true, content: '', image: '', analysis: '' })
      }
    },
    addSubItem() {
      if (!this.postForm.subItems) this.postForm.subItems = []
      const firstType = this.postForm.subItems.length > 0
        ? (this.postForm.subItems[0].quType || 1)
        : 1
      this.postForm.subItems.push(defaultSubItem(firstType))
    },
    removeSubItem(sidx) {
      this.postForm.subItems.splice(sidx, 1)
    },
    onSubTypeChange(sub, v) {
      sub.options = []
      if (v === 3) {
        sub.options = [
          { isRight: true, content: '正确', image: '', analysis: '' },
          { isRight: false, content: '错误', image: '', analysis: '' }
        ]
      } else if (v === 4) {
        sub.options = [{ isRight: true, content: '', image: '', analysis: '' }]
      } else {
        for (let i = 0; i < 4; i++) {
          sub.options.push({ isRight: false, content: '', image: '', analysis: '' })
        }
      }
    },
    addSubOption(sub) {
      sub.options.push({ isRight: false, content: '', image: '', analysis: '' })
    },
    addSubBlank(sub) {
      sub.options.push({ isRight: true, content: '', image: '', analysis: '' })
    },
    removeSubOption(sub, oidx) {
      sub.options.splice(oidx, 1)
    },
    handleAdd() {
      if (this.postForm.quType === 4) {
        this.postForm.options.push({ isRight: true, content: '', image: '', analysis: '' })
        return
      }
      this.postForm.options.push({ isRight: false, content: '', image: '', analysis: '' })
    },
    removeItem(row) {
      const actualIndex = this.postForm.options.indexOf(row)
      if (actualIndex === -1) return
      this.postForm.options[actualIndex].isDeleted = 1
    },
    fetchData(id) {
      fetchDetail(id).then((response) => {
        this.applyLoadedForm(response.data)
      })
    },
    normalizeQuestionStemAfterLoad() {
      if (!this.postForm) return
      if (this.postForm.content == null) this.postForm.content = ''
      mergeLegacyQuestionImageIntoContent(this.postForm)
    },
    normalizeSaqOptionsAfterLoad() {
      if (this.postForm.quType !== 4 || !this.postForm.options) return
      this.postForm.options.forEach((opt) => {
        if (!opt.isDeleted) mergeLegacySaqOptionImageIntoContent(opt)
      })
    },
    warnValidation(message) {
      this.$message.closeAll()
      this.$message.warning(message)
    },
    syncRichEditors() {
      const main = this.$refs.mainStemEditor
      if (main && typeof main.flushContent === 'function') {
        this.postForm.content = main.flushContent()
      }
      const editors = this.$refs.subStemEditors
      const list = Array.isArray(editors) ? editors : (editors ? [editors] : [])
      list.forEach((editor, idx) => {
        if (!editor || typeof editor.flushContent !== 'function') return
        if (!this.postForm.subItems || !this.postForm.subItems[idx]) return
        this.postForm.subItems[idx].content = editor.flushContent()
      })
    },
    validateSubItems() {
      const subs = this.postForm.subItems || []
      if (this.postForm.quType !== 5) return true
      if (!subs.length) {
        this.warnValidation('复合题至少需要一道小题')
        return false
      }
      for (let i = 0; i < subs.length; i++) {
        const sub = subs[i]
        if (!questionStemHasMeaningfulContent(sub.content)) {
          this.warnValidation(`第 ${i + 1} 道小题题干不能为空（可输入文字或在编辑器中插入图片）`)
          return false
        }
        let rightCount = 0
        ;(sub.options || []).forEach(o => { if (o.isRight) rightCount++ })
        if (sub.quType === 1 || sub.quType === 3) {
          if (rightCount !== 1) {
            this.warnValidation(`第 ${i + 1} 道小题：单选/判断只能有一个正确答案`)
            return false
          }
        } else if (sub.quType === 2 && rightCount < 2) {
          this.warnValidation(`第 ${i + 1} 道小题：多选至少两个正确答案`)
          return false
        } else if (sub.quType === 4 && (!sub.options || !sub.options.length)) {
          this.warnValidation(`第 ${i + 1} 道简答小题至少需要一空`)
          return false
        }
      }
      return true
    },
    submitForm() {
      if (this.submitting) return
      this.submitting = true
      this.syncRichEditors()
      if (this.postForm.quType === 5) {
        this.postForm.options = []
      } else {
        this.postForm.subItems = []
      }
      let rightCount = 0
      if (this.postForm.quType !== 5) {
        this.postForm.options.forEach(item => { if (item.isRight) rightCount++ })
      }
      if (this.postForm.quType === 1 && rightCount !== 1) {
        this.warnValidation('单选题答案只能有一个')
        this.submitting = false
        return
      }
      if (this.postForm.quType === 2 && rightCount < 2) {
        this.warnValidation('多选题至少要有两个正确答案！')
        this.submitting = false
        return
      }
      if (this.postForm.quType === 3 && rightCount !== 1) {
        this.warnValidation('判断题只能有一个正确项！')
        this.submitting = false
        return
      }
      if (!this.validateSubItems()) {
        this.submitting = false
        return
      }

      this.$refs.postForm.validate((valid) => {
        if (!valid) {
          this.warnValidation('请先完善试题信息（请检查标红项）')
          this.submitting = false
          return
        }
        if (this.postForm.quType === 4) {
          this.postForm.options.forEach(o => { o.image = '' })
        }
        if (/<img\s/i.test(this.postForm.content || '')) {
          this.postForm.image = ''
        }
        const payload = JSON.parse(JSON.stringify(this.postForm))
        if (payload.quType === 5) {
          payload.subItems.forEach(sub => {
            sub.options.forEach(o => { o.isRight = o.isRight ? 1 : 0 })
          })
        } else {
          payload.options.forEach(o => { o.isRight = o.isRight ? 1 : 0 })
        }
        const done = (res, okMsg) => {
          this.submitting = false
          if (res.code) {
            this.$notify({ title: '成功', message: okMsg, type: 'success', duration: 2000 })
            this.$router.push({ name: 'questions-management' })
          } else {
            this.$notify({ title: '失败', message: res.msg, type: 'error', duration: 2000 })
          }
        }
        const onFail = () => {
          this.submitting = false
        }
        if (this.quId) {
          quUpdate(this.quId, payload).then(res => done(res, res.msg)).catch(onFail)
        } else {
          quAdd(payload).then(res => done(res, '试题保存成功！')).catch(onFail)
        }
      })
    },
    onCancel() {
      this.$router.push({ name: 'questions-management' })
    }
  }
}
</script>

<style scoped>
.sub-item-card {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}
.el-button--primary.is-plain {
  color: #409eff;
  background: #ecf5ff;
  border-color: #b3d8ff;
  margin-bottom: 12px;
}
</style>
