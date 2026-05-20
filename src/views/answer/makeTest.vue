<template>

  <el-container style="height: 700px; border: 1px solid #eee">

    <div class="left">

      <div class="fk">

        <div class="sj">

          <el-divider />

          <p>

            共 <span style="color: #1890ff"> {{ waitQuList.length }} </span> 题, 共

            <span style="color: #1890ff">{{ gradingTotalScore }}</span>

            分

          </p>

          <el-row>

            <el-tag

              v-for="(item, index) in waitQuList"

              :key="'tag-' + index"

              :type="index === quIndex ? 'success' : ''"

              class="type_tag"

              @click="handleTag(index)"
            >

              {{ index + 1 }}

            </el-tag>

          </el-row>

          <el-button
            v-if="waitQuList.length"
            type="warning"
            class="ann"
            :loading="aiScoringLoading"
            @click="runAiScore"
          >AI 阅卷</el-button>
          <el-button
            v-if="waitQuList.length"
            type="success"
            class="ann"
            @click="subCorrect"
          >提交批改</el-button>
          <el-button
            v-else
            type="primary"
            class="ann"
            @click="backToAnswerList"
          >返回阅卷列表</el-button>

        </div>

      </div>

    </div>

    <el-container>

      <el-main class="right">

        <el-col>

          <el-card class="qu_list">

            <div v-if="!waitQuList.length" style="padding: 24px; color: #909399; text-align: center">

              <p>本份试卷均为客观题，系统已自动判分，无需人工阅卷。</p>
              <p v-if="objectiveOnlyHint" style="margin-top: 8px; font-size: 13px">已同步至成绩分析，可直接在「成绩分析」中查看统计。</p>

            </div>

            <div v-else>

              <div

                v-for="(item, index) in waitQuList"

                :key="'grading-' + (item.quId || index)"

                :class="'index' + index"
              >

                <el-row :gutter="24">

                  <el-col :span="20" style="text-align: left">

                    <div class="qu_content">

                      <span>{{ index + 1 }}.</span>

                      <el-tag v-if="item.quType === 5" size="mini" type="info" style="margin-left: 8px">复合题</el-tag>

                    </div>

                    <!-- 复合题：共用材料 + 各小题 -->

                    <template v-if="item.quType === 5">

                      <compound-stem-block

                        :stem-content="compoundStemHtml(item)"

                        :stem-image="item.quImg"
                      />

                      <div

                        v-for="(sub, sidx) in item.subItemList || []"

                        :key="'sub-' + sidx"

                        class="compound-sub-block"
                      >

                        <div v-if="sub.content" style="margin-bottom: 8px">

                          <span style="font-weight: 600">({{ sidx + 1 }})</span>

                          <rich-html-content :html="sub.content" />

                        </div>

                        <div v-if="sub.quType === 4" class="content">

                          <div style="font-size: 13px; color: #606266; margin-bottom: 6px">考生作答</div>

                          <template v-if="parseSaqStudentAnswer(sub).length">

                            <div

                              v-for="(txt, bidx) in parseSaqStudentAnswer(sub)"

                              :key="'ans-' + sidx + '-' + bidx"

                              style="margin-bottom: 6px"
                            >

                              <span v-if="parseSaqStudentAnswer(sub).length > 1">空{{ bidx + 1 }}：</span>

                              <rich-html-content v-if="txt" :html="txt" />

                              <span v-else style="color: #c0c4cc">（未作答）</span>

                            </div>

                          </template>

                          <span v-else style="color: #c0c4cc">（未作答）</span>

                        </div>

                        <div v-else-if="sub.studentAnswer != null && sub.studentAnswer !== ''" class="content" style="min-height: auto">

                          客观题作答：{{ formatObjectiveAnswer(sub) }}

                        </div>

                      </div>

                    </template>

                    <!-- 普通简答题 -->

                    <template v-else>

                      <rich-html-content

                        v-if="questionStemDisplay(item)"

                        :html="questionStemDisplay(item)"

                        style="margin: 8px 0"
                      />

                      <div class="content">

                        <rich-html-content v-if="item.answer" :html="item.answer" />

                        <span v-else style="color: #c0c4cc">（未作答）</span>

                      </div>

                    </template>

                    <div class="qu_analysis">

                      <el-card>

                        <div class="score-row">

                          <span class="score-label">确认分数</span>

                          <el-input

                            v-model="item.correctScore"

                            type="number"

                            class="score-input"
                          />

                          <el-tag
                            v-if="hasAiGrade(item)"
                            type="warning"
                            size="small"
                            effect="plain"
                          >AI阅卷 {{ item.aiScore }} 分</el-tag>

                          <span

                            v-if="item.correctScore < 0 ||

                              item.correctScore > item.totalScore "

                            class="score-warn"
                          >

                            评分只能在 0-{{ item.totalScore }}之间

                          </span>

                        </div>

                        <div v-if="hasAiGrade(item)" class="ai-grade-box">

                          <el-tag type="info" size="mini">AI阅卷说明</el-tag>

                          <p class="ai-grade-reason">{{ item.aiReason }}</p>

                        </div>

                        <div style="margin-top: 18px">

                          <span>参考答案:</span>

                          <br>

                          <template v-if="item.quType === 5 && item.subItemList && item.subItemList.length">

                            <div

                              v-for="(sub, sidx) in saqSubItemsForRef(item.subItemList)"

                              :key="'ref-' + sidx"

                              style="margin-top: 8px"
                            >

                              <span style="font-weight: 600">({{ sub.sort || sidx + 1 }})</span>

                              <rich-html-content v-if="sub.content" :html="sub.content" style="display: inline-block; margin-left: 4px" />

                              <div v-for="(opt, oidx) in refSaqOptions(sub)" :key="'ref-opt-' + oidx" style="margin-left: 16px; margin-top: 4px">

                                空{{ oidx + 1 }}：<rich-html-content :html="opt.content || ''" />

                              </div>

                            </div>

                          </template>

                          <rich-html-content v-else-if="item.refAnswer" :html="item.refAnswer" />

                          <span v-else>—</span>

                        </div>

                      </el-card>

                    </div>

                  </el-col>

                  <el-col :span="4">

                    <el-row class="qu_assign_score">

                      本题

                      <el-input-number

                        :controls="false"

                        :min="0"

                        :precision="2"

                        disabled

                        :value="item.totalScore"

                        class="qu_assign_score_content"
                      />

                      分

                    </el-row>

                  </el-col>

                </el-row>

              </div>

            </div>

            <el-divider />

          </el-card>

        </el-col>

      </el-main>

    </el-container>

  </el-container>

</template>

<script>

import { answerDetail, correct, triggerAiScore } from '@/api/answer'

import CompoundStemBlock from '@/components/CompoundStemBlock'

import RichHtmlContent from '@/components/RichHtmlContent'

import { questionStemDisplayHtml } from '@/utils/questionStemHtml'

export default {

  name: 'ExamProcess',

  components: { CompoundStemBlock, RichHtmlContent },

  data() {
    return {

      quIndex: -1,

      info: {},

      waitQuList: [],

      objectiveOnlyHint: false,

      scoreData: null,

      aiScoringLoading: false

    }
  },

  computed: {

    gradingTotalScore() {
      if (!this.waitQuList || !this.waitQuList.length) {
        return 0
      }

      return this.waitQuList.reduce((sum, q) => sum + (Number(q.totalScore) || 0), 0)
    }

  },

  created() {
    this.info = JSON.parse(sessionStorage.getItem('answer_info'))

    this.getUserAnswerDetail()
  },

  methods: {

    questionStemDisplay(row) {
      return questionStemDisplayHtml({ content: row.quTitle, image: row.quImg })
    },

    compoundStemHtml(item) {
      return questionStemDisplayHtml({ content: item.quTitle, image: item.quImg })
    },

    parseSaqStudentAnswer(sub) {
      if (!sub) return []

      const raw = sub.studentFill != null ? sub.studentFill : sub.studentAnswer

      if (raw == null || raw === '') return []

      const s = String(raw).trim()

      if (s.startsWith('[')) {
        try {
          const arr = JSON.parse(s)

          if (Array.isArray(arr)) return arr.map((x) => (x == null ? '' : String(x)))
        } catch (e) { /* ignore */ }
      }

      return [s]
    },

    formatObjectiveAnswer(sub) {
      if (!sub || sub.studentAnswer == null || sub.studentAnswer === '') return '未作答'

      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

      try {
        const parsed = JSON.parse(sub.studentAnswer)

        if (Array.isArray(parsed)) {
          return parsed.map((i) => letters[i] || i).join('、')
        }
      } catch (e) { /* single index */ }

      const idx = parseInt(sub.studentAnswer, 10)

      return Number.isNaN(idx) ? sub.studentAnswer : (letters[idx] || sub.studentAnswer)
    },

    saqSubItemsForRef(subItemList) {
      return (subItemList || []).filter((s) => s && s.quType === 4)
    },

    refSaqOptions(sub) {
      return sub.options || []
    },

    handleTag(index) {
      this.quIndex = index

      const page = document.querySelector('.index' + index)

      if (page) page.scrollIntoView()
    },

    async getUserAnswerDetail() {
      const params = { userId: this.info.userId, examId: this.info.examId }

      const res = await answerDetail(params)

      this.waitQuList = (res.data || []).map((row) => ({
        ...row,
        correctScore: row.aiScore != null ? row.aiScore : ''
      }))
      this.objectiveOnlyHint = !this.waitQuList.length
    },

    hasAiGrade(item) {
      return item && item.aiScore != null && item.aiScore !== ''
    },

    async runAiScore() {
      if (!this.info || !this.info.examId) {
        return
      }
      this.aiScoringLoading = true
      try {
        const res = await triggerAiScore({
          examId: this.info.examId,
          userId: this.info.userId
        })
        await this.getUserAnswerDetail()
        const aiCount = (this.waitQuList || []).filter((q) => this.hasAiGrade(q)).length
        const total = (this.waitQuList || []).length
        if (aiCount > 0) {
          const extra = aiCount < total ? `（${aiCount}/${total} 题，未成功的题请稍后重试）` : ''
          this.$message.success((res.msg || `AI 阅卷完成，已为 ${aiCount} 题填入建议分数`) + extra)
        } else {
          this.$message.warning(res.msg || '阅卷已完成，但未生成 AI 分数，请检查考生是否作答')
        }
      } catch (e) {
        // 错误文案由 request 拦截器统一提示
      } finally {
        this.aiScoringLoading = false
      }
    },

    backToAnswerList() {
      this.$router.push({ name: 'answer-show' })
    },

    subCorrect() {
      if (!this.waitQuList.length) {
        return
      }

      const list = []

      for (let i = 0; i < this.waitQuList.length; i++) {
        const element = this.waitQuList[i]

        const score = element.correctScore

        if (score === null || score === undefined || score === '') {
          this.$message({

            message: `请先给第${i + 1}题评分`,

            type: 'error'

          })

          return
        }

        const numScore = Number(score)

        const maxScore = Number(element.totalScore) || 0

        if (Number.isNaN(numScore) || numScore < 0 || numScore > maxScore) {
          this.$message({

            message: `第${i + 1}题的评分只能在0-${maxScore}之间`,

            type: 'error'

          })

          return
        }

        list.push({

          userId: element.userId,

          examId: element.examId,

          questionId: element.quId,

          score: numScore

        })
      }

      correct(list).then((res) => {
        if (res.code) {
          this.$notify({

            title: '成功',

            message: `${res.msg}`,

            type: 'success',

            duration: 2000

          })

          this.$router.push({ name: 'answer-show' })
        } else {
          this.$notify({

            title: '失败',

            message: `${res.msg}`,

            type: 'error',

            duration: 2000

          })
        }
      })
    }

  }

}

</script>

<style scoped lang="scss">

.content {

  width: 97%;

  min-height: 60px;

  border: 1px solid #0a84ff;

  margin-top: 8px;

  margin-left: 10px;

  padding: 10px;

  font-weight: 200;

}

.compound-sub-block {

  margin: 12px 0;

  padding: 12px;

  background: #fafafa;

  border-radius: 4px;

  border: 1px solid #ebeef5;

}

.ann {

  width: 130px;

  margin-top: 25px;

  margin-left: 15px;

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

.left {

  width: 17%;

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

.qu_list {

  height: 100%;

  width: 100%;

  overflow: auto;

  page-break-after: always;

  .qu_content {

    padding-left: 10px;

    margin-bottom: 8px;

  }

  .qu_analysis {

    padding: 10px;

  }

  .qu_assign_score {

    background: #f5f5f5;

    height: 100px;

    padding-top: 35px;

    .qu_assign_score_content {

      width: 80px;

    }

  }

}

.score-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.score-label {
  color: #e6a23c;
  font-weight: 600;
}

.score-input {
  width: 100px;
}

.score-warn {
  color: #f56c6c;
  font-size: 13px;
}

.ai-grade-box {
  margin-top: 12px;
  padding: 10px 12px;
  background: #f4f4f5;
  border-radius: 4px;
  border-left: 3px solid #909399;
}

.ai-grade-reason {
  margin: 8px 0 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}

</style>

