<template>
  <div
    style="
      width: 100%;
      height: 100%;
      background-color: #f0f2f5;
      padding: 20px 0 0;
    "
  >
    <el-row :gutter="24">
      <el-col :span="24">
        <el-card style="margin-bottom: 10px">
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; justify-content: space-between">
            <span>错题本</span>
            <div style="display: flex; align-items: center; gap: 8px">
              <el-button
                v-show="!isFullscreen"
                size="small"
                @click="enterRebrushFullscreenFromUser"
              >
                进入全屏
              </el-button>
              <el-button
                :loading="loading"
                type="primary"
                icon="el-icon-plus"
                @click="handHandExam()"
              >
                {{ handleText }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-card class="qu-content content-h">
          <compound-stem-block
            v-if="quData.quType === 5"
            :stem-content="questionStemDisplay(quData)"
            :stem-image="quData.image"
          />
          <div v-if="quData.quType === 5">
            <p style="margin: 10px 0 8px; font-weight: 600">
              <span>({{ getQuestionType(quData.quType) }}) {{ index + 1 }}.</span>
            </p>
            <compound-question-display
              v-model="compoundAnswers"
              :sub-items="quData.subItemList || []"
            />
          </div>
          <!-- 题干 -->
          <div v-if="quData.quType !== 5 && questionStemDisplay(quData)" style="margin: 10px 0 14px">
            <p style="margin: 0 0 8px">
              <span>({{ getQuestionType(quData.quType) }}) {{ index + 1 }}.</span>
            </p>
            <rich-html-content :html="questionStemDisplay(quData)" />
          </div>
          <div v-if="quData.quType === 1 || quData.quType === 3">
            <!-- 选项 -->
            <el-radio-group v-model="radioValue">
              <el-radio
                v-for="item in quData.answerList"
                :key="item.id"
                :label="item.id"
              >{{ numberToLetter(item.sort) }}.{{ item.content }}
                <div
                  v-if="parseImageUrls(item.image).length"
                  style="clear: both; display: flex; flex-wrap: wrap; gap: 8px"
                >
                  <el-image
                    v-for="(img, oi) in parseImageUrls(item.image)"
                    :key="'rb-o-' + item.id + '-' + oi"
                    :src="img"
                    :preview-src-list="parseImageUrls(item.image)"
                    fit="contain"
                    style="max-width: 200px"
                  />
                </div>
              </el-radio>
            </el-radio-group>
          </div>
          <div
            v-if="flag == true && (quData.quType === 1 || quData.quType === 3)"
          >
            <!-- <div>
              <span>我的答案:{{ myAnswers }}</span>
            </div> -->
            <div>
              <span>正确答案:
                {{ numberToLetter(parseInt(failQuData.rightAnswers)) }}</span>
            </div>
            <div>
              <span>试题分析: {{ failQuData.analysis }}</span>
            </div>
            <template v-if="failQuData.options && failQuData.options.length">
              <template v-for="o in failQuData.options">
                <div
                  v-if="o.analysis && String(o.analysis).trim()"
                  :key="'rb-an-sj-' + o.id"
                  style="margin-top: 8px; color: #606266"
                >
                  <span>{{ numberToLetter(o.sort) }} 项解析：</span>
                  <rich-html-content :html="o.analysis" />
                </div>
              </template>
            </template>
          </div>
          <div v-if="quData.quType === 2">
            <el-checkbox-group v-model="multiValue">
              <el-checkbox
                v-for="item in quData.answerList"
                :key="item.id"
                :label="item.id"
              >{{ numberToLetter(item.sort) }}.{{ item.content }}
                <div
                  v-if="parseImageUrls(item.image).length"
                  style="clear: both; display: flex; flex-wrap: wrap; gap: 8px"
                >
                  <el-image
                    v-for="(img, oi) in parseImageUrls(item.image)"
                    :key="'rb-o-' + item.id + '-' + oi"
                    :src="img"
                    :preview-src-list="parseImageUrls(item.image)"
                    fit="contain"
                    style="max-width: 200px"
                  />
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <div v-if="flag == true && quData.quType === 2">
            <!-- <div>
              <span>我的答案:{{ myAnswers }}</span>
            </div> -->
            <div>
              <span>正确答案: {{ numberToLetter(failQuData.rightAnswers) }}</span>
            </div>
            <div>
              <span>试题分析: {{ failQuData.analysis }}</span>
            </div>
            <template v-if="failQuData.options && failQuData.options.length">
              <template v-for="o in failQuData.options">
                <div
                  v-if="o.analysis && String(o.analysis).trim()"
                  :key="'rb-an-mul-' + o.id"
                  style="margin-top: 8px; color: #606266"
                >
                  <span>{{ numberToLetter(o.sort) }} 项解析：</span>
                  <rich-html-content :html="o.analysis" />
                </div>
              </template>
            </template>
          </div>

          <div v-if="quData.quType === 4">
            <el-input
              v-model="saqTextarea"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入内容"
            />
            <!-- <el-checkbox-group v-model="multiValue"> -->
            <!-- <el-checkbox
                v-for="item in quData.answerList"
                :key="item.id"
                :label="item.id"
                >{{  numberToLetter(item.sort)  }}.{{ item.content }}
                <div v-if="item.image != null && item.image != ''" style="clear: both">
                  <el-image :src="item.image" style="max-width: 100%" />
                </div>
              </el-checkbox> -->
            <!-- </el-checkbox-group> -->
          </div>
          <div
            v-if="flag == true && quData.quType === 5 && failQuData"
            style="margin-top: 10px"
          >
            <div>
              <span>试题分析: {{ failQuData.analysis }}</span>
            </div>
          </div>
          <div
            v-if="flag == true && quData.quType === 4"
            style="margin-top: 10px"
          >
            <!-- <div>
              <span>我的答案:{{ myAnswers }}</span>
            </div> -->
            <div>
              <span>正确答案: </span>
              <rich-html-content :html="rebrushSaqRefHtml" />
            </div>
            <div>
              <span>试题分析: {{ failQuData.analysis }}</span>
            </div>
          </div>
          <div style="margin-top: 20px">
            <!-- <el-button type="primary" @click="handPrevious()">
              上一题
            </el-button> -->
            <el-button type="warning" icon="el-icon-right" @click="handNext()">
              下一题
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div
      v-show="fullscreenGateVisible"
      class="rebrush-fullscreen-gate"
      @click="enterRebrushFullscreenFromUser"
    >
      <div class="rebrush-fullscreen-gate__panel" @click="enterRebrushFullscreenFromUser">
        <p class="rebrush-fullscreen-gate__title">点击进入全屏错题模式</p>
        <p class="rebrush-fullscreen-gate__desc">浏览器请允许全屏；学生端 .exe 为窗口全屏。</p>
      </div>
    </div>
  </div>
</template>
<script>
import { fullBook, getSingleQu, getUserBookList } from '@/api/userbook'
import imageUrlsMixin from '@/mixins/imageUrlsMixin'
import CompoundStemBlock from '@/components/CompoundStemBlock'
import CompoundQuestionDisplay from '@/components/CompoundQuestionDisplay'
import {
  enterExamDisplayMode,
  exitExamDisplayMode,
  isExamDisplayFullscreen
} from '@/utils/fullscreen'
import RichHtmlContent from '@/components/RichHtmlContent'
import { saqReferenceDisplayHtml } from '@/utils/saqAnswerHtml'
import { questionStemDisplayHtml } from '@/utils/questionStemHtml'
export default {
  components: { RichHtmlContent, CompoundStemBlock, CompoundQuestionDisplay },
  mixins: [imageUrlsMixin],
  data() {
    return {
      repoId: '',
      repoTitle: '',
      routeData: {},
      // 全屏/不全屏
      isFullscreen: false,
      fullscreenGateVisible: false,
      showPrevious: false,
      showNext: true,
      loading: false,
      handleText: '提交',
      pageLoading: false,
      nextText: false,
      userBookList: [],
      index: 0,
      quDataLen: 0,
      examId: '',
      failQuData: {},
      flag: false,
      // 当前题目内容
      quData: {
        answerList: []
      },
      // 试卷信息
      radioValue: '',
      showAnswer: false,
      // 多选选定值
      multiValue: [],
      // 已答ID
      answeredIds: [],
      saqTextarea: '',
      compoundAnswers: {},
      myAnswers: '',
      lastIndex: 0,
      paperData: {
        leftSeconds: 99999,
        radioList: [],
        multiList: [],
        judgeList: []
      }
    }
  },
  computed: {
    rebrushSaqRefHtml() {
      if (!this.failQuData || this.quData.quType !== 4) return ''
      const o = this.failQuData.options && this.failQuData.options[0]
      if (o) return saqReferenceDisplayHtml(o)
      return this.failQuData.rightAnswers || ''
    }
  },
  created() {
    this.routeData = this.$route.query.zhi
    this.examId = localStorage.getItem('userbook_examId')
    this.getUserBookListFun()
    // this.getSingleQuFun()
  },
  mounted() {
    document.addEventListener('fullscreenchange', this.syncRebrushFullscreenState)
    document.addEventListener('webkitfullscreenchange', this.syncRebrushFullscreenState)
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.onNativeFullscreenChange === 'function') {
      this._removeNativeFsListener = window.electronAPI.onNativeFullscreenChange(() => {
        this.syncRebrushFullscreenState()
      })
    }
    this.$nextTick(() => {
      enterExamDisplayMode()
        .then(() => this.syncRebrushFullscreenState())
        .catch(() => this.syncRebrushFullscreenState())
      setTimeout(() => this.syncRebrushFullscreenState(), 80)
      setTimeout(() => this.syncRebrushFullscreenState(), 400)
    })
  },
  beforeDestroy() {
    document.removeEventListener('fullscreenchange', this.syncRebrushFullscreenState)
    document.removeEventListener('webkitfullscreenchange', this.syncRebrushFullscreenState)
    if (typeof this._removeNativeFsListener === 'function') {
      this._removeNativeFsListener()
      this._removeNativeFsListener = null
    }
    exitExamDisplayMode().catch(() => {})
  },

  methods: {
    questionStemDisplay(row) {
      return questionStemDisplayHtml(row || {})
    },
    syncRebrushFullscreenState() {
      isExamDisplayFullscreen().then((fs) => {
        this.isFullscreen = fs
        this.fullscreenGateVisible = !fs
      })
    },
    enterRebrushFullscreenFromUser() {
      enterExamDisplayMode()
        .then(() => this.syncRebrushFullscreenState())
        .catch(() => {
          this.$message({
            type: 'warning',
            message: '无法进入全屏，请检查浏览器权限或按 F11。'
          })
        })
    },
    handHandExam() {
      const that = this
      // 交卷保存答案
      const msg = '确认要提交吗？'
      that
        .$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(async() => {
          // 删除当前标签页
          await exitExamDisplayMode().catch(() => {})
          this.$store.commit('menu/REMOVE_TAG', {
            title: this.$route.meta.title, // 从路由元数据中获取标题
            path: this.$route.path,
            name: this.$route.name // 添加路由名称
          })
          this.$router.push({ name: 'wrong-book' })
        })
        .catch(() => {
          that.$message({
            type: 'info',
            message: '交卷已取消，您可以继续作答！'
          })
        })
    },

    getSingleQuFun(quId) {
      getSingleQu(quId).then((res) => {
        this.quData = res.data || { answerList: [] }
        this.radioValue = ''
        this.multiValue = []
        this.saqTextarea = ''
        this.compoundAnswers = {}
        if (this.quData.quType === 5 && this.quData.subItemList) {
          this.initCompoundAnswerState(this.quData)
        }
      })
    },
    initCompoundAnswerState(vo) {
      this.compoundAnswers = {}
      if (!vo || vo.quType !== 5 || !vo.subItemList) return
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
    getUserBookListFun() {
      getUserBookList(this.examId).then((res) => {
        this.userBookList = res.data
        this.quDataLen = res.data.length
        this.getSingleQuFun(res.data[this.index]['quId'])
        this.lastIndex = this.userBookList.length
      })
    },
    numberToLetter(input) {
      const numberToCharMap = {
        0: 'A',
        1: 'B',
        2: 'C',
        3: 'D',
        4: 'E',
        5: 'F'
      }

      // 辅助函数：将单个数字（字符串或数字类型）转换为字母
      const singleNumberToLetter = (num) =>
        numberToCharMap[parseInt(num, 10)] || ''

      // 辅助函数：处理逗号分隔的数字字符串
      const commaSeparatedNumbersToLetters = (str) => {
        const numbers = str.split(',').map((item) => parseInt(item.trim(), 10))
        return numbers.map((number) => numberToCharMap[number] || '').join(',')
      }

      // 判断输入类型并调用相应函数
      if (/^\d+$/.test(input)) {
        // 单个数字（字符串形式也可以匹配）
        return singleNumberToLetter(input)
      } else if (/^\d+(,\d+)*$/.test(input)) {
        // 包含逗号分隔的数字字符串
        return commaSeparatedNumbersToLetters(input)
      } else {
        return '' // 输入不符合预期，返回空字符串或根据需要处理
      }
    },
    // 获取题目类型
    getQuestionType(type) {
      const typeMap = {
        1: '单选题',
        2: '多选题',
        3: '判断题',
        4: '简答题',
        5: '复合题'
      }
      return typeMap[type] || '未知类型'
    },
    /**
     * 下一题
     */
    handNext() {
      if (!this.flag) {
        this.index = this.index + 1
        this.handSave(this.index)
      } else {
        if (this.index >= this.lastIndex) {
          this.handHandExam()
        }
        this.handSave(this.index)
      }
    },

    /**
     * 上一题
     */
    handPrevious() {
      this.index = this.index - 1
      this.handSave(this.index)
    },
    // 保存答案
    handSave(index) {
      if (index - 1 >= this.lastIndex) {
        this.handHandExam()
      } else {
        let answer
        if (this.quData.quType === 2) {
          // 多选题
          answer = this.multiValue.join(',')
        } else if (this.quData.quType === 1 || this.quData.quType === 3) {
          // 单选题或判断题
          answer = this.radioValue
        } else if (this.quData.quType === 4) {
          answer = this.saqTextarea
        } else if (this.quData.quType === 5) {
          answer = this.buildCompoundAnswerContent()
        }

        const params = {
          examId: this.examId,
          quId: this.userBookList[index - 1]['quId'],
          answer: answer
        }

        // this.myAnswers = params.answer;
        if (!this.flag) {
          fullBook(params).then((res) => {
            if (res.code) {
              this.failQuData = res.data
              if (res.data.correct) {
                this.$message({
                  type: 'success',
                  message: res.msg
                })
              } else {
                this.$message({
                  type: 'error',
                  message: res.msg
                })
              }
            } else {
              this.$message({
                type: 'error',
                message: res.msg
              })
            }
          })
        }

        if (this.flag === true) {
          // 查找详情
          this.fetchQuData(index)
          this.flag = false
        } else {
          this.flag = true
        }
      }
      // });
    },
    // 试卷详情
    fetchQuData(index) {
      this.getSingleQuFun(this.userBookList[index]['quId'])
    }
  }
}
</script>
<style scoped>
page {
  background: #ebecee;
}

.btn_anniu {
  width: 50%;
  padding: 10px 0;
  font-size: 19px;
  font-weight: bold;
  border: 0 solid #fff;
  color: #000;
  outline: none;
  background: #fff;
}

.newStyle {
  border-bottom: 2px solid #f0892e;
  color: #f0892e;
  font-size: 21px;
  font-weight: bold;
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

.rebrush-fullscreen-gate {
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
}

.rebrush-fullscreen-gate__panel {
  max-width: 440px;
  margin: 16px;
  padding: 28px 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  text-align: center;
  cursor: pointer;
}

.rebrush-fullscreen-gate__title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.rebrush-fullscreen-gate__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}
</style>
