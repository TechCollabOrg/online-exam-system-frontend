<template>
  <div class="exam-page-root" style="width: 100%; height: 100%; background-color: #f0f2f5; padding: 20px 0 0">
    <!-- Header区域 -->
    <el-row :gutter="24">
      <el-col :span="24">
        <el-card style="margin-bottom: 10px">
          距离考试结束还有：
          <exam-timer v-model="paperData.leftSeconds" @timeout="doHandler(true)" />
          <div style="float: right; margin-top: -10px; display: flex; align-items: center; gap: 8px">
            <el-button
              v-show="!isFullscreen"
              size="small"
              @click="enterExamFullscreenFromUser"
            >
              进入全屏
            </el-button>
            <el-button
              :loading="loading"
              type="primary"
              icon="el-icon-plus"
              @click="handHandExamPre()"
            >
              {{ handleText }}
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 答题卡区域 -->
      <el-col :span="5" :xs="24" style="margin-bottom: 10px">
        <el-card class="content-h">
          <p class="card-title">答题卡</p>
          <el-row :gutter="24" class="card-line" style="padding-left: 10px">
            <el-tag type="info">未作答</el-tag>
            <el-tag type="success">已作答</el-tag>
            <el-tag type="warning">当前题目</el-tag>
          </el-row>

          <!-- 单选题答题卡 -->
          <question-card-section
            v-if="hasQuestions(paperData.radioList)"
            title="单选题"
            :questions="paperData.radioList"
            :current-item="cardItem"
            @select-question="handSave"
          />

          <!-- 多选题答题卡 -->
          <question-card-section
            v-if="hasQuestions(paperData.multiList)"
            title="多选题"
            :questions="paperData.multiList"
            :current-item="cardItem"
            @select-question="handSave"
          />

          <!-- 判断题答题卡 -->
          <question-card-section
            v-if="hasQuestions(paperData.judgeList)"
            title="判断题"
            :questions="paperData.judgeList"
            :current-item="cardItem"
            @select-question="handSave"
          />

          <!-- 简答题答题卡 -->
          <question-card-section
            v-if="hasQuestions(paperData.saqList)"
            title="简答题"
            :questions="paperData.saqList"
            :current-item="cardItem"
            @select-question="handSave"
          />

          <!-- 复合题答题卡 -->
          <question-card-section
            v-if="hasQuestions(paperData.compoundList)"
            title="复合题"
            :questions="paperData.compoundList"
            :current-item="cardItem"
            @select-question="handSave"
          />
        </el-card>
      </el-col>

      <!-- 单题区域 -->
      <el-col :span="19" :xs="24">
        <el-card class="qu-content content-h">
          <compound-stem-block
            v-if="quData.quType === 5"
            :stem-content="questionStemDisplay(quData)"
            :stem-image="quData.image"
          />
          <!-- 题干（非复合题） -->
          <div v-if="quData.quType !== 5 && questionStemDisplay(quData)" style="margin: 10px 0 14px">
            <div style="font-weight: 600; margin-bottom: 6px">{{ quData.sort + 1 }}.</div>
            <rich-html-content :html="questionStemDisplay(quData)" />
          </div>

          <!-- 单选和判断题选项区域 -->
          <div v-if="quData.quType === 1 || quData.quType === 3">
            <el-radio-group v-model="radioValue">
              <el-radio
                v-for="item in quData.answerList"
                :key="item.id"
                :label="item.id"
              >
                {{ numberToLetter(item.sort) }}.{{ item.content }}
                <div v-if="parseImageUrls(item.image).length" style="clear: both; display: flex; flex-wrap: wrap; gap: 8px">
                  <el-image
                    v-for="(img, oIdx) in parseImageUrls(item.image)"
                    :key="'opt-' + item.id + '-' + oIdx"
                    :src="img"
                    :preview-src-list="parseImageUrls(item.image)"
                    fit="contain"
                    style="max-width: 200px"
                  />
                </div>
              </el-radio>
            </el-radio-group>
          </div>

          <!-- 多选题区域 -->
          <div v-if="quData.quType === 2">
            <el-checkbox-group v-model="multiValue">
              <el-checkbox
                v-for="item in quData.answerList"
                :key="item.id"
                :label="item.id"
              >
                {{ numberToLetter(item.sort) }}.{{ item.content }}
                <div v-if="parseImageUrls(item.image).length" style="clear: both; display: flex; flex-wrap: wrap; gap: 8px">
                  <el-image
                    v-for="(img, oIdx) in parseImageUrls(item.image)"
                    :key="'mopt-' + item.id + '-' + oIdx"
                    :src="img"
                    :preview-src-list="parseImageUrls(item.image)"
                    fit="contain"
                    style="max-width: 200px"
                  />
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <!-- 复合题：共用材料 + 多小题 -->
          <div v-if="quData.quType === 5">
            <div style="font-weight: 600; margin-bottom: 8px">{{ quData.sort + 1 }}.</div>
            <compound-question-display
              v-model="compoundAnswers"
              :sub-items="quData.subItemList || []"
            />
          </div>

          <!-- 简答题区域：单空 或 多空（JSON 数组提交） -->
          <div v-if="quData.quType === 4">
            <template v-if="saqMultiSlot">
              <div
                v-for="(slot, sidx) in saqMultiInputs"
                :key="'saq-slot-' + cardItem.questionId + '-' + sidx"
                style="margin-bottom: 14px"
              >
                <div style="font-size: 13px; color: #606266; margin-bottom: 4px">第 {{ sidx + 1 }} 空</div>
                <el-input
                  v-model="saqMultiInputs[sidx]"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 8 }"
                  :placeholder="'请输入第 ' + (sidx + 1) + ' 空的答案'"
                />
              </div>
            </template>
            <el-input
              v-else
              v-model="saqTextarea"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入内容"
            />
          </div>

          <!-- 提交前汇总对话框 -->
          <exam-summary-dialog
            :visible.sync="examPreVisible"
            :record-data="recordData"
            @close="handleClose"
            @confirm="doHandler"
          />

          <!-- 导航按钮 -->
          <div style="margin-top: 20px">
            <el-button
              v-if="showPrevious"
              type="primary"
              icon="el-icon-back"
              @click="handPrevious()"
            >
              上一题
            </el-button>

            <el-button
              v-if="showNext&&cardItem.sort != allItem.length - 1"
              type="warning"
              icon="el-icon-right"
              @click="handNext()"
            >
              下一题
            </el-button>

            <!-- 添加最后一题的提交按钮 !showNext && -->
            <el-button
              v-if="cardItem.sort === allItem.length - 1"
              type="success"
              icon="el-icon-check"
              @click="submitLastAnswer()"
            >
              提交答案
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 切屏弹窗 -->
    <el-dialog
      title="提示"
      :visible.sync="tipsFlag"
      width="480px"
      class="commonDialog multi clickLight"
      center
      :close-on-click-modal="false"
    >
      {{ examMeg }}
    </el-dialog>

    <!-- 全屏需在用户手势内触发；若准备页自动全屏失败或用户刷新本页，点此补全（.exe 为系统窗口全屏） -->
    <div
      v-show="fullscreenGateVisible"
      class="exam-fullscreen-gate"
      @click="enterExamFullscreenFromUser"
    >
      <div class="exam-fullscreen-gate__panel" @click="enterExamFullscreenFromUser">
        <p class="exam-fullscreen-gate__title">点击进入全屏考试模式</p>
        <p class="exam-fullscreen-gate__desc">浏览器请允许全屏；学生端 .exe 一般会自动窗口全屏。仍失败请用顶部「进入全屏」。</p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  quDetail,
  handExam,
  fillAnswer,
  examCollect,
  examCheat,
  examQuList
} from '@/api/exam'
import { Loading } from 'element-ui'
import ExamTimer from '@/components/ExamTimer'
import QuestionCardSection from './components/QuestionCardSection'
import ExamSummaryDialog from './components/ExamSummaryDialog'
import CompoundStemBlock from '@/components/CompoundStemBlock'
import CompoundQuestionDisplay from '@/components/CompoundQuestionDisplay'
import {
  enterExamDisplayMode,
  exitExamDisplayMode,
  isExamDisplayFullscreen
} from '@/utils/fullscreen'
import imageUrlsMixin from '@/mixins/imageUrlsMixin'
import RichHtmlContent from '@/components/RichHtmlContent'
import { questionStemDisplayHtml } from '@/utils/questionStemHtml'

export default {
  name: 'ExamProcess',
  components: {
    ExamTimer,
    QuestionCardSection,
    ExamSummaryDialog,
    CompoundStemBlock,
    CompoundQuestionDisplay,
    RichHtmlContent
  },
  mixins: [imageUrlsMixin],
  data() {
    return {
      examId: '',
      receivedRow: null,
      // 全屏/不全屏（网页 Fullscreen API 或 Electron 窗口全屏 / kiosk）
      isFullscreen: false,
      fullscreenGateVisible: false,
      showPrevious: false,
      showNext: true,
      loading: false,
      handleText: '交卷',
      saqTextarea: '',
      /** 简答题多空（与题库多条「参考答案」选项对应） */
      saqMultiSlot: false,
      saqMultiInputs: [],
      compoundAnswers: {},
      pageLoading: false,
      // 试卷ID
      paperId: '',
      // 当前答题卡
      cardItem: {},
      allItem: [],
      tipsFlag: false,
      examPreVisible: false,
      // 当前题目内容
      quData: {
        answerList: []
      },
      testData: {},
      pkExam: null,
      examMeg: '',
      // 试卷信息
      paperData: {
        leftSeconds: 99999,
        radioList: [],
        multiList: [],
        judgeList: [],
        saqList: [],
        compoundList: []
      },
      // 单选选定值
      radioValue: '',
      // 多选选定值
      multiValue: [],
      // 已答ID
      answeredIds: [],
      recordData: null,
      //
      submittedAnswers: {},
      handExamPreLoading: false
    }
  },
  created() {
    this.examId = localStorage.getItem('examId')
    this.paperId = this.examId
    this.startExam(this.examId)
    this.fetchData(this.examId)
  },
  mounted() {
    // 焦点离开当前考试窗口（切标签/其它应用/最小化等）视为切屏
    window.addEventListener('blur', this.onExamWindowBlur)
    document.addEventListener('fullscreenchange', this.syncExamFullscreenState)
    document.addEventListener('webkitfullscreenchange', this.syncExamFullscreenState)
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.onNativeFullscreenChange === 'function') {
      this._removeNativeFsListener = window.electronAPI.onNativeFullscreenChange(() => {
        this.syncExamFullscreenState()
      })
    }
    this.$nextTick(() => {
      const body = document.querySelector('body')
      body.style.overflow = 'auto'
      // 进入答题页后再尝试一次（学生端窗口全屏不依赖手势；浏览器拒绝则仍依赖遮罩/按钮）
      enterExamDisplayMode()
        .then(() => this.syncExamFullscreenState())
        .catch(() => this.syncExamFullscreenState())
      this.syncExamFullscreenState()
      // 准备页已 await 全屏后跳转时，部分浏览器全屏状态稍晚才就绪，延迟再同步几次以免误显示「点击全屏」遮罩
      setTimeout(() => this.syncExamFullscreenState(), 80)
      setTimeout(() => this.syncExamFullscreenState(), 400)
    })
  },
  beforeDestroy() {
    window.removeEventListener('blur', this.onExamWindowBlur)
    document.removeEventListener('fullscreenchange', this.syncExamFullscreenState)
    document.removeEventListener('webkitfullscreenchange', this.syncExamFullscreenState)
    if (typeof this._removeNativeFsListener === 'function') {
      this._removeNativeFsListener()
      this._removeNativeFsListener = null
    }
    exitExamDisplayMode().catch(() => {})
    clearInterval(this.countdownTime)
  },
  methods: {
    syncExamFullscreenState() {
      isExamDisplayFullscreen().then((fs) => {
        this.isFullscreen = fs
        this.fullscreenGateVisible = !fs
      })
    },

    enterExamFullscreenFromUser() {
      enterExamDisplayMode()
        .then(() => this.syncExamFullscreenState())
        .catch(() => {
          this.$message({
            type: 'warning',
            message: '无法进入全屏，请检查浏览器权限或尝试按 F11；学生端 .exe 请尝试重启客户端。'
          })
        })
    },

    // 检查问题列表是否存在
    hasQuestions(list) {
      return list && list.length > 0
    },

    questionStemDisplay(row) {
      return questionStemDisplayHtml(row || {})
    },

    // 检查选项是否被选中
    isCheck(myOption, sort) {
      if (!myOption) return false
      const arr = myOption.split(',').map(Number)
      return arr.includes(sort)
    },

    // 处理对话框关闭
    handleClose() {
      this.examPreVisible = false
    },
    // 将0-5转换为A-F
    numberToLetter(input) {
      if (input === null || input === undefined) return ''

      const numberToCharMap = {
        0: 'A',
        1: 'B',
        2: 'C',
        3: 'D',
        4: 'E',
        5: 'F'
      }

      // 处理单个数字
      if (typeof input === 'number' || /^\d+$/.test(input)) {
        return numberToCharMap[parseInt(input, 10)] || ''
      }

      // 处理逗号分隔的数字
      if (/^\d+(,\d+)*$/.test(input)) {
        return input.split(',')
          .map(num => numberToCharMap[parseInt(num.trim(), 10)] || '')
          .join(',')
      }

      return ''
    },

    /** 交卷/预览前仅保存当前题，不切换题目 */
    persistCurrentAnswer() {
      if (!this.cardItem || !this.cardItem.questionId) {
        return Promise.resolve()
      }
      return this.handSave(this.cardItem, null, { skipNavigate: true })
    },

    // 交卷前预览：先保存当前题作答，再拉取汇总（避免答案未落库、汇总弹窗因空项报错）
    async handHandExamPre() {
      if (this.handExamPreLoading || this.loading) return
      this.handExamPreLoading = true
      this.loading = true
      try {
        await this.persistCurrentAnswer()
        const res = await examCollect(this.examId)
        this.recordData = this.allItem
          .map(item => (res.data || []).find(d => d.id === item.questionId))
          .filter(Boolean)
        this.examPreVisible = true
      } catch (e) {
        console.error('交卷预览失败:', e)
      } finally {
        this.loading = false
        this.handExamPreLoading = false
      }
    },
    // 窗口失焦检测（替代 document.visibilitychange）
    onExamWindowBlur() {
      examCheat(this.examId).then((res) => {
        if (res.code) {
          this.examMeg = res.msg
          this.tipsFlag = true
          if (res.data) {
            exitExamDisplayMode().catch(() => {})
            this.$router.push({
              name: 'text-center',
              params: { id: this.paperId }
            })
          }
        }
      })
    },

    // 开始考试
    startExam(examId) {
      examQuList(examId).then((res) => {
        this.paperData = res.data
      })
    },
    /**
     * 统计有多少题没答的
     * @returns {number}
     */
    countNotAnswered() {
      let notAnswered = 0
      const checkList = (list) => {
        if (list) {
          list.forEach(item => {
            if (!item.checkout) {
              notAnswered += 1
            }
          })
        }
      }

      checkList(this.paperData.radioList)
      checkList(this.paperData.multiList)
      checkList(this.paperData.judgeList)
      checkList(this.paperData.saqList)
      checkList(this.paperData.compoundList)

      return notAnswered
    },

    /**
     * 下一题
     */
    handNext() {
      const index = this.cardItem.sort + 1
      if (index < this.allItem.length) {
        this.handSave(this.allItem[index])
      }
    },

    /**
     * 上一题
     */
    handPrevious() {
      const index = this.cardItem.sort - 1
      if (index >= 0) {
        this.handSave(this.allItem[index])
      }
    },
    // 清空Session
    // 使用函数清除以 "exam_" 开头的所有键值对
    clearSessionStorageByPrefix(prefix) {
      Object.keys(sessionStorage)
        .filter(key => key.startsWith(prefix))
        .forEach(key => sessionStorage.removeItem(key))
    },

    // 交卷
    doHandler(isAutomatic = false) {
      const performSubmit = () => {
        this.handleText = isAutomatic ? '时间到，正在自动交卷...' : '正在交卷，请等待...'
        this.loading = true
        // 删除当前标签页
        this.$store.commit('menu/REMOVE_TAG', {
          title: this.$route.meta.title,
          path: this.$route.path,
          name: this.$route.name
        })
        handExam(this.examId).then(() => {
          exitExamDisplayMode().catch(() => {})
          this.$message({
            message: isAutomatic ? '考试时间到，试卷已自动提交！' : '试卷提交成功！',
            type: 'success'
          })
          this.clearSessionStorageByPrefix('exam_')
          this.$router.push({ name: 'text-center', params: { id: this.paperId }})
        }).catch((error) => {
          this.loading = false
          this.handleText = '交卷'
          this.$message({
            type: 'error',
            message: (isAutomatic ? '自动' : '') + '交卷失败，请联系管理员！'
          })
          console.error((isAutomatic ? '自动' : '') + '交卷失败:', error)
        })
      }

      if (isAutomatic) {
        // 如果是自动触发（时间到），直接执行提交
        performSubmit()
      } else {
        // 如果是手动触发（点击按钮或确认预览），显示确认框
        const notAnswered = this.countNotAnswered()
        const msg = notAnswered > 0
          ? `您还有 ${notAnswered} 题未作答，确认要交卷吗?`
          : '确认要交卷吗？'

        this.$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            // 用户在确认框中点击“确定”后执行提交
            performSubmit()
          })
          .catch(() => {
            // 用户点击“取消”
            this.$message({
              type: 'info',
              message: '交卷已取消，您可以继续作答！'
            })
          })
      }
    },

    buildCompoundAnswerContent() {
      return JSON.stringify(this.compoundAnswers || {})
    },
    compoundHasAnyFill() {
      const ans = this.compoundAnswers || {}
      return Object.keys(ans).some(k => {
        const v = ans[k]
        if (Array.isArray(v)) return v.some(s => s != null && String(s).trim() !== '')
        return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)
      })
    },
    initCompoundAnswerState(vo) {
      this.compoundAnswers = {}
      if (!vo || vo.quType !== 5 || !vo.subItemList) return
      const out = {}
      vo.subItemList.forEach((sub, idx) => {
        if (sub.quType === 4) {
          if (sub.studentFill && String(sub.studentFill).trim().startsWith('[')) {
            try { out[String(idx)] = JSON.parse(sub.studentFill) } catch (e) { out[String(idx)] = sub.studentFill || '' }
          } else {
            out[String(idx)] = sub.studentFill || ''
          }
        } else if (sub.quType === 2) {
          if (sub.studentAnswer && String(sub.studentAnswer).trim().startsWith('[')) {
            try { out[String(idx)] = JSON.parse(sub.studentAnswer) } catch (e) { out[String(idx)] = [] }
          } else if (sub.studentAnswer) {
            out[String(idx)] = String(sub.studentAnswer).split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n))
          }
        } else if (sub.studentAnswer !== undefined && sub.studentAnswer !== null && sub.studentAnswer !== '') {
          out[String(idx)] = Number(sub.studentAnswer)
        }
      })
      this.compoundAnswers = out
    },
    buildSaqAnswerContent() {
      if (!this.quData || this.quData.quType !== 4) return ''
      if (this.saqMultiSlot && this.saqMultiInputs && this.saqMultiInputs.length > 1) {
        return JSON.stringify(this.saqMultiInputs.map(s => (s == null ? '' : String(s)).trim()))
      }
      return (this.saqTextarea || '').trim()
    },
    saqHasAnyFill() {
      if (!this.quData || this.quData.quType !== 4) return false
      if (this.saqMultiSlot && this.saqMultiInputs && this.saqMultiInputs.length > 0) {
        return this.saqMultiInputs.some(s => s != null && String(s).trim() !== '')
      }
      return !!(this.saqTextarea && this.saqTextarea.trim())
    },
    initSaqAnswerState(vo) {
      this.saqMultiSlot = false
      this.saqMultiInputs = []
      this.saqTextarea = ''
      if (!vo || vo.quType !== 4 || !vo.answerList) return
      const al = vo.answerList
      if (al.length > 1) {
        this.saqMultiSlot = true
        this.saqMultiInputs = al.map(o => {
          const f = o.studentFill
          return f != null && f !== undefined ? String(f) : ''
        })
      } else if (al.length === 1) {
        const f = al[0].studentFill
        this.saqTextarea = f != null && f !== undefined ? String(f) : ''
      }
    },

    // 保存答案；返回 Promise 便于交卷前 await。options.skipNavigate=true 时不切换/刷新题目（交卷预览用）
    handSave(item, callback, options = {}) {
      const skipNavigate = !!options.skipNavigate
      return new Promise((resolve, reject) => {
        this._handSaveCore(item, callback, skipNavigate, resolve, reject)
      })
    },

    _handSaveCore(item, callback, skipNavigate, resolve, reject) {
      // 更新上一题/下一题按钮状态
      this.showPrevious = item.sort > 0
      this.showNext = item.sort < this.allItem.length - 1

      // 保存当前题目的引用，以便在回调中更新其状态
      const currentItem = this.cardItem

      // 获取题目ID
      const questionId = currentItem.questionId
      // 判断题目类型
      const currentQuType = this.quData.quType

      // 准备答案数据
      let answerContent = ''
      if (currentQuType === 5) {
        answerContent = this.buildCompoundAnswerContent()
      } else if (currentQuType === 4) {
        answerContent = this.buildSaqAnswerContent()
      } else {
        // 单选、多选、判断题答案
        const answers = [] // 使用空数组初始化
        if (currentQuType === 2) { // 多选
          answers.push(...this.multiValue)
        } else if (currentQuType === 1 || currentQuType === 3) { // 单选或判断
          // 确保 radioValue 不是空字符串、null 或 undefined
          if (this.radioValue !== '' && this.radioValue !== null && this.radioValue !== undefined) {
            answers.push(this.radioValue)
          }
        }
        answerContent = answers.join(',')
      }

      const hasAnswer = currentQuType === 5
        ? this.compoundHasAnyFill()
        : (currentQuType === 4 ? this.saqHasAnyFill() : !!answerContent)
      // 获取上次成功保存的答案
      const lastSavedAnswer = this.submittedAnswers[questionId]
      // 决定是否需要调用API保存
      // 条件：1. 有答案内容 且 (上次未保存过 或 当前答案与上次保存的不同)
      //       2. 或者是一个强制保存的回调 (如交卷前预览)
      const shouldCallApi = hasAnswer && (lastSavedAnswer === undefined || answerContent !== lastSavedAnswer)

      // --- 不需要调用 API 的情况 ---
      if (!shouldCallApi) {
        if (!hasAnswer && lastSavedAnswer !== undefined) {
          this.updateQuestionStatus(questionId, 0)
          delete this.submittedAnswers[questionId]
          sessionStorage.removeItem('exam_' + questionId)
        }
        if (callback) callback()
        else if (!skipNavigate) this.fetchQuData(item)
        resolve()
        return
      }

      // --- 需要调用 API 的情况 ---
      console.log(`Question ${questionId}: Answer changed or forced save, calling API.`)
      const params = {
        examId: this.paperId,
        quId: questionId,
        answer: answerContent
      }

      // 对多选题答案进行排序 (如果需要)
      if (currentQuType === 2 && hasAnswer) {
        const sortedAnswers = answerContent.split(',')
          .map(id => parseInt(id))
          .sort((a, b) => {
            const itemA = this.quData.answerList.find(opt => opt.id === a)
            const itemB = this.quData.answerList.find(opt => opt.id === b)
            // 按选项的 sort 字段排序
            return (itemA?.sort ?? 0) - (itemB?.sort ?? 0)
          })
          .join(',')
        params.answer = sortedAnswers
      }
      // 添加 loading 状态提示用户正在保存
      const saveLoading = Loading.service({
        target: this.$el.querySelector('.qu-content'), // 只覆盖题目区域
        text: '正在保存答案...',
        background: 'rgba(255, 255, 255, 0.7)'
      })
      fillAnswer(params).then((res) => {
        saveLoading.close() // 关闭 loading
        if (res.code) { // 保存成功
          console.log(`Question ${questionId}: Save successful.`)
          // 更新已提交答案记录
          this.submittedAnswers[questionId] = answerContent
          // 更新 sessionStorage 标记
          sessionStorage.setItem('exam_' + questionId, '1')
          // 更新答题卡状态
          this.updateQuestionStatus(questionId, 1)

          // 如果是简答题，并且保存成功了，现在可以清空输入框了
          // if (currentQuType === 4) {
          //   this.saqTextarea = '' // 考虑是否真的需要清空，或者保留以便用户修改？暂时不清空，让用户看到自己提交的内容
          // }

          // 执行回调（如果存在）
          if (callback) callback()
          else if (!skipNavigate) this.fetchQuData(item)
          resolve()
        } else {
          console.error(`Question ${questionId}: Save failed (API response error):`, res.msg)
          this.$message({
            message: `答案保存失败: ${res.msg || '未知错误'}`,
            type: 'error',
            duration: 3000
          })
          reject(new Error(res.msg || 'save failed'))
        }
      }).catch((error) => {
        saveLoading.close()
        console.error(`Question ${questionId}: Save failed (Network/request error):`, error)
        this.$message({
          message: '答案保存时发生网络错误，请稍后重试！',
          type: 'error',
          duration: 3000
        })
        reject(error)
      })
    },

    // 更新题目状态
    updateQuestionStatus(questionId, status) {
      // 在所有题型列表中查找并更新状态
      const updateListStatus = (list) => {
        if (list && list.length > 0) {
          const question = list.find(q => q.questionId === questionId)
          if (question) {
            question.checkout = status
          }
        }
      }

      updateListStatus(this.paperData.radioList)
      updateListStatus(this.paperData.multiList)
      updateListStatus(this.paperData.judgeList)
      updateListStatus(this.paperData.saqList)
      updateListStatus(this.paperData.compoundList)
    },

    // 提交最后一题答案
    submitLastAnswer() {
      const currentItem = this.cardItem
      // 获取题目ID
      const questionId = currentItem.questionId
      // 判断题目类型
      const currentQuType = this.quData.quType

      // 准备答案数据
      let answerContent = ''
      if (currentQuType === 5) {
        answerContent = this.buildCompoundAnswerContent()
      } else if (currentQuType === 4) {
        answerContent = this.buildSaqAnswerContent()
      } else {
        // 单选、多选、判断题答案
        const answers = []
        if (currentQuType === 2) {
          answers.push(...this.multiValue)
        } else if (currentQuType === 1 || currentQuType === 3) {
          if (this.radioValue !== '' && this.radioValue !== null && this.radioValue !== undefined) {
            answers.push(this.radioValue)
          }
        }
        // 显式处理空数组情况，避免join出空字符串
        if (answers.length > 0) {
          answerContent = answers.join(',')
        } else {
          answerContent = '' // 确保空答案是空字符串
        }
      }

      // 检查是否有答案
      const hasAnswer = currentQuType === 5
        ? this.compoundHasAnyFill()
        : (currentQuType === 4 ? this.saqHasAnyFill() : !!answerContent)

      if (!hasAnswer) {
        this.$message({
          message: '请先填写答案再提交！',
          type: 'warning'
        })
        return
      }

      const lastSavedAnswer = this.submittedAnswers[questionId]
      const shouldCallApi = hasAnswer && (lastSavedAnswer === undefined || answerContent !== lastSavedAnswer)

      if (!shouldCallApi) {
        this.$message({
          message: '答案未更改，无需重复提交。',
          type: 'info'
        })
        return
      }

      const params = {
        examId: this.paperId,
        quId: questionId,
        answer: answerContent
      }

      if (currentQuType === 2 && hasAnswer) {
        const sortedAnswers = answerContent.split(',')
          .map(id => parseInt(id))
          .sort((a, b) => {
            const itemA = this.quData.answerList.find(opt => opt.id === a)
            const itemB = this.quData.answerList.find(opt => opt.id === b)
            return (itemA?.sort ?? 0) - (itemB?.sort ?? 0)
          })
          .join(',')
        params.answer = sortedAnswers
      }

      const saveLoading = Loading.service({ /* ... loading config ... */ })

      fillAnswer(params).then((res) => {
        saveLoading.close()
        if (res.code) {
          this.submittedAnswers[questionId] = answerContent
          sessionStorage.setItem('exam_' + questionId, '1')
          this.updateQuestionStatus(questionId, 1)
          this.$message({
            message: '最后一题答案提交成功！',
            type: 'success'
          })
          // 用户可以选择交卷了
        } else {
          this.$message({
            message: `最后一题答案提交失败: ${res.msg || '未知错误'}`,
            type: 'error'
          })
        }
      }).catch((error) => {
        saveLoading.close()
        console.error(`Question ${questionId}: Submit last answer failed:`, error)
        this.$message({
          message: '最后一题答案提交时发生网络错误！',
          type: 'error'
        })
      })
    },

    // 试卷详情
    fetchQuData(item) {
      // 打开
      const loading = Loading.service({
        text: '拼命加载中',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      // 获得详情
      this.cardItem = item
      const examId = localStorage.getItem('examId')
      // 查找下个详情
      const params = { examId: examId, questionId: item.questionId }

      // 在请求新数据前，清空上一题的答案状态，避免显示残留
      this.radioValue = ''
      this.multiValue = []
      this.initSaqAnswerState(null)
      this.compoundAnswers = {}

      quDetail(params).then((response) => {
        this.quData = response.data
        this.initSaqAnswerState(response.data)
        this.initCompoundAnswerState(response.data)
        if (response.data.quType === 1 || response.data.quType === 3) {
          // 遍历选项，找到 checkout 为 true 的作为 radioValue
          const checkedOption = response.data.answerList?.find(opt => opt.checkout)
          this.radioValue = checkedOption ? checkedOption.id : ''
        } else if (response.data.quType === 2) {
          // 遍历选项，收集所有 checkout 为 true 的 id 到 multiValue
          this.multiValue = response.data.answerList?.filter(opt => opt.checkout).map(opt => opt.id) || []
        }

        // 更新已保存答案的本地副本 (如果 quDetail 返回了最新的答案)
        // 这一步可能不需要，因为 handSave 已经维护了 this.submittedAnswers
        // 但如果 quDetail 能确保返回最新已保存答案，可以在这里同步一下
        // const latestAnswerFromServer = ... // (需要从 response.data 解析出答案)
        // this.submittedAnswers[item.questionId] = latestAnswerFromServer;

        // 关闭加载提示
        loading.close()
      }).catch((error) => {
        loading.close() // 出错时也要关闭
        console.error(`Failed to fetch question ${item.questionId}:`, error)
        this.$message({
          message: '加载题目详情失败，请重试！',
          type: 'error'
        })
        // 加载题目失败，可能需要一些回退逻辑，比如不允许切换题目？
      })
    },

    // 试卷详情
    fetchData(examId) {
      examQuList(examId).then((response) => {
        // 试卷内容
        this.paperData = response.data
        this.allItem = []

        // 合并所有题目到allItem数组
        this.mergeAllQuestions()

        // 获得第一题内容
        this.setFirstQuestion()

        // 当前选定
        if (this.cardItem && this.cardItem.questionId) {
          this.fetchQuData(this.cardItem)
        }
      })
    },

    // 设置第一个题目
    setFirstQuestion() {
      this.cardItem = this.allItem.length > 0 ? this.allItem[0] : {}
    },

    // 合并所有题目
    mergeAllQuestions() {
      const addQuestionsToAllItems = (questionList) => {
        if (questionList && questionList.length > 0) {
          questionList.forEach(item => this.allItem.push(item))
        }
      }

      addQuestionsToAllItems(this.paperData.radioList)
      addQuestionsToAllItems(this.paperData.multiList)
      addQuestionsToAllItems(this.paperData.judgeList)
      addQuestionsToAllItems(this.paperData.saqList)
      addQuestionsToAllItems(this.paperData.compoundList)

      this.allItem.sort((a, b) => {
        const sortA = Number(a.sort)
        const sortB = Number(b.sort)
        if (Number.isFinite(sortA) && Number.isFinite(sortB) && sortA !== sortB) {
          return sortA - sortB
        }
        const idA = Number(a.questionId || a.id || 0)
        const idB = Number(b.questionId || b.id || 0)
        return idA - idB
      })
    },

    // 处理滚动事件
    handleScroll() {
      // 实现滚动逻辑
    },

    // 获取左侧距离
    getLfetDistance() {
      const body = document.querySelector('body')
      this.flexLeft = (body.offsetWidth - 1200) / 2
    }
  }
}
</script>

<style scoped>
page {
  background: #ebecee;
}

.qu-content div {
  line-height: 30px;
  width: 100%;
}

.el-checkbox-group label,
.el-radio-group label {
  width: 100%;
}

.content-h {
  height: calc(100vh - 110px);
  overflow-y: auto;
}

.card-title {
  background: #eee;
  line-height: 35px;
  text-align: center;
  font-size: 14px;
}
.card-line {
  padding-left: 10px;
  display: flex;
  flex-wrap: wrap;
}
.card-line span {
  cursor: pointer;
  margin: 2px;
}

::v-deep .el-radio,
.el-checkbox {
  padding: 9px 20px 9px 10px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  margin-bottom: 10px;
  width: 100%;
}

.is-checked {
  border: #409eff 1px solid;
}

.el-radio img,
.el-checkbox img {
  max-width: 200px;
  max-height: 200px;
  border: #dcdfe6 1px dotted;
}

::v-deep .el-checkbox__inner {
  display: none;
}

::v-deep .el-radio__inner {
  display: none;
}

::v-deep .el-checkbox__label {
  line-height: 30px;
}

::v-deep .el-radio__label {
  line-height: 30px;
}

/* 考试记录 */
.content {
  width: 97%;
  height: 60px;
  border: 1px solid #0a84ff;
  margin-top: 8px;
  margin-left: 10px;
  padding: 10px;
  font-weight: 200;
}
.sj {
  margin-top: 10px;
  margin-left: 10px;
  line-height: 22px;
}
.fk {
  width: 200px;
  height: 100%;
  box-shadow: 0 0 15px rgb(197, 197, 197);
  margin: auto;
  margin-top: 20px;
  margin-left: 15px;
}
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.left {
  width: 250px;
  height: 100%;
}
.right {
  width: 70%;
  height: 100%;
}
.el-divider--horizontal {
  display: block;
  height: 1px;
  width: 95%;
  margin: 24px 0;
}
.type_tag {
  margin-right: 5px;
  margin-top: 10px;
}

/* // 试题内容样式 */
.qu_list {
  height: 100%;
  width: 100%;
  overflow: auto;
  page-break-after: always;

  .qu_num {
    display: inline-block;
    /* // background: url('~@/assets/images/tkxl/btbj.png') no-repeat 100% 100%; */
    background-size: contain;
    height: 30px;
    width: 30px;
    line-height: 25px;
    color: #fff;
    font-size: 14px;
    text-align: center;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .qu_content {
    padding-left: 10px;
  }

  /* // 选项组 */
  .qu_choose_group {
    width: 100%;

    /* 单个选项 */
    .qu_choose {
      display: block;
      margin: 10px;
      .el-radio__label {
        line-height: 20px;
      }
      /* // 去除前面的radio */
      ::v-deep .el-radio__input .el-radio__inner {
        display: none;
      }

      /* // 单个选项内容样式 */
      .qu_choose_tag {
        display: inline-flex;
        width: 90%;
        /* // 选项标签 */
        .qu_choose_tag_type {
          font-weight: bold;
          /* // color: #0a84ff; */
          width: 10px;
        }
        /* // 选项内容 */
        .qu_choose_tag_content {
          padding: 0 10px 10px 10px;
        }

        .qu_choose_tag_el_image {
          clear: both;
          padding-top: 10px;
        }
      }
      /* // 选项答案 */
      .qu_choose_answer {
        float: right;
      }
    }
  }

  /* // 试题解析 */
  .qu_analysis {
    padding: 10px;

    .qu_analysis_content {
      padding-top: 10px;
    }
  }

  /* // 试题赋分 */
  .qu_assign_score {
    background: #f5f5f5;
    height: 100px;
    padding-top: 35px;

    .qu_assign_score_content {
      width: 80px;
    }
  }
}
.current {
  background: #f5f5f5;
}
.imgC{
  height:150px
}
.qu_choose_tag_img {
          height: auto;
          display: block;
          margin: 10px;
        }

.exam-fullscreen-gate {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1990;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /* 仅中间面板可点；其余区域不拦截，避免挡住顶部「交卷」等按钮 */
  pointer-events: none;
}

.exam-fullscreen-gate__panel {
  max-width: 440px;
  margin: 16px;
  padding: 28px 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  text-align: center;
  cursor: pointer;
  pointer-events: auto;
}

.exam-fullscreen-gate__title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.exam-fullscreen-gate__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}
</style>
