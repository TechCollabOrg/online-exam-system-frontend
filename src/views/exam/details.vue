<template>
  <el-container style="min-height: 100vh; border: 1px solid #eee">
    <el-container>
      <el-main class="right">
        <el-card v-if="examInfo.title" class="exam-summary" shadow="never">
          <div class="exam-summary-title">{{ examInfo.title }}</div>
          <div class="exam-summary-meta">
            <span>考试时长：{{ examInfo.examDuration }} 分钟</span>
            <span>总分：{{ examInfo.grossScore }}</span>
            <span>及格分：{{ examInfo.passedScore }}</span>
          </div>
        </el-card>

        <el-tabs v-model="activeTab" class="exam-detail-tabs">
          <el-tab-pane label="试卷题目" name="questions" />
          <el-tab-pane label="缺考名单" name="absent" />
        </el-tabs>

        <el-col v-show="activeTab === 'questions'">
          <el-card class="qu_list">
            <div>
              <!-- eslint-disable-next-line vue/no-template-shadow -->
              <template v-for="(index,indexx) in data">
                <!-- eslint-disable-next-line vue/require-v-for-key -->
                <div
                  v-if="
                    index.quType === 1 ||
                      index.quType === 2 ||
                      index.quType === 3
                  "
                  :class="'index' + indexx"
                >
                  <el-row :gutter="24">
                    <el-col :span="20" style="text-align: left">
                      <!-- 题目: 序号、类型、题干 -->
                      <compound-stem-block
                        v-if="index.quType === 5"
                        :stem-content="questionStemDisplay(index)"
                        :stem-image="index.image"
                      />
                      <div v-if="index.quType !== 5 && questionStemDisplay(index)" style="margin: 8px 0 12px">
                        <div class="qu_content" style="font-weight: 600; margin-bottom: 6px">{{ indexx + 1 }}、</div>
                        <rich-html-content :html="questionStemDisplay(index)" />
                      </div>

                      <!-- 选项 -->
                      <el-radio-group class="qu_choose_group">
                        <!-- ['A', 'B', 'C', 'D'] -->
                        <el-radio
                          v-for="(item, indexs) in (index.option || [])"
                          :key="indexs"
                          :label="item.content"
                          border
                          class="qu_choose"
                          :class="{
                            imgC: parseImageUrls(item.image).length > 0,
                            isRight:
                              item.isRight,
                            incorrect:
                              index.myOption != null &&
                              isCheck(index.myOption, item.sort) &&
                              !item.isRight,
                          }"
                        >
                          <!-- 选项flex浮动 -->
                          <div class="qu_choose_tag">
                            <div class="qu_choose_tag_type">
                              {{ numberToLetter(indexs) }}、{{ item.content }}.
                            </div>
                            <div
                              v-if="parseImageUrls(item.image).length"
                              style="clear: both; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px"
                            >
                              <el-image
                                v-for="(img, oi) in parseImageUrls(item.image)"
                                :key="'o-' + indexs + '-' + oi"
                                :src="img"
                                :preview-src-list="parseImageUrls(item.image)"
                                fit="contain"
                                class="qu_choose_tag_img"
                                style="max-width: 200px"
                              />
                            </div>
                            <analysis-rich-block
                              :html="item.analysis"
                              label="选项解析："
                              variant="option"
                            />
                          </div>
                        </el-radio>
                      </el-radio-group>

                      <!-- 题目解析 -->
                      <div class="qu_analysis">
                        <el-card>

                          <div style="margin-top: 8px">
                            <span>正确答案：</span>
                            <span>{{ numberToLetter(index.rightOption) }}</span><br>
                          </div>
                          <analysis-rich-block
                            :html="index.analyse"
                            label="试题解析："
                            variant="question"
                          />
                        </el-card>
                      </div>
                    </el-col>
                  </el-row>
                  <el-divider />
                </div>
              </template>
              <!-- eslint-disable-next-line vue/no-template-shadow -->
              <template v-for="(index, idx) in data">
                <!-- eslint-disable-next-line vue/require-v-for-key -->
                <div v-if="index.quType === 4" :class="'index' + idx">
                  <el-row :gutter="24">
                    <el-col :span="20" style="text-align: left">
                      <!-- 题目: 序号、类型、题干 -->
                      <compound-stem-block
                        v-if="index.quType === 5"
                        :stem-content="questionStemDisplay(index)"
                        :stem-image="index.image"
                      />
                      <div v-if="index.quType !== 5 && questionStemDisplay(index)" style="margin: 8px 0 12px">
                        <div class="qu_content" style="font-weight: 600; margin-bottom: 6px">题干</div>
                        <rich-html-content :html="questionStemDisplay(index)" />
                      </div>

                      <!-- 选项 -->
                      <el-radio-group class="qu_choose_group">
                        <el-input
                          v-model="index.myOption"
                          style="margin-top: 10px"
                          type="textarea"
                          :autosize="{ minRows: 2, maxRows: 4 }"
                          placeholder=""
                          :disabled="true"
                        />
                      </el-radio-group>

                      <!-- 题目解析 -->
                      <div class="qu_analysis">
                        <el-card>
                          <div>
                            <!-- <span>考生答案：</span>
                              <span
                                :style="{
                                  color:
                                    isRight === 1
                                      ? 'green'
                                      : isRight === 0
                                      ? 'red'
                                      : 'gray',
                                }"
                                >{{}}</span
                              ><br /> -->
                          </div>
                          <div style="margin-top: 8px">
                            <span>正确答案：</span>
                            <rich-html-content v-if="index.option && index.option[0]" :html="saqRefDisplay(index)" />
                            <span v-else>{{ index.rightOption }}</span>
                            <br>
                          </div>
                          <analysis-rich-block
                            :html="index.analyse"
                            label="试题解析："
                            variant="question"
                          />
                        </el-card>
                      </div>
                    </el-col>
                  </el-row>
                  <el-divider />
                </div>
              </template>
              <!-- 复合题（教师预览试卷） -->
              <template v-for="(item, cidx) in data">
                <div v-if="item.quType === 5" :key="'compound-' + cidx" :class="'index' + cidx">
                  <el-row :gutter="24">
                    <el-col :span="20" style="text-align: left">
                      <div class="qu_content" style="font-weight: 600; margin-bottom: 8px">
                        {{ cidx + 1 }}、
                        <el-tag size="mini" type="info" style="margin-left: 8px">复合题</el-tag>
                      </div>
                      <compound-stem-block
                        :stem-content="questionStemDisplay(item)"
                        :stem-image="item.image"
                      />
                      <div
                        v-for="(sub, sidx) in item.subItemList || []"
                        :key="'sub-' + cidx + '-' + sidx"
                        style="margin: 14px 0; padding-bottom: 12px; border-bottom: 1px dashed #ebeef5"
                      >
                        <div v-if="sub.content" style="margin-bottom: 8px">
                          <span style="font-weight: 600">({{ sidx + 1 }})</span>
                          <rich-html-content :html="sub.content" />
                        </div>
                        <div v-if="sub.quType === 1 || sub.quType === 2 || sub.quType === 3">
                          <el-radio-group class="qu_choose_group" disabled>
                            <el-radio
                              v-for="(opt, oidx) in sub.options || []"
                              :key="'copt-' + sidx + '-' + oidx"
                              :label="opt.content"
                              border
                              class="qu_choose"
                              :class="{ isRight: opt.isRight === 1 || opt.isRight === true }"
                            >
                              <div class="qu_choose_tag">
                                <div class="qu_choose_tag_type">
                                  {{ numberToLetter(oidx) }}、{{ opt.content }}
                                </div>
                              </div>
                            </el-radio>
                          </el-radio-group>
                          <div style="margin-top: 8px; color: #606266">
                            <span>正确答案：</span>
                            <span>{{ formatSubRightAnswer(sub) }}</span>
                          </div>
                        </div>
                        <div v-else-if="sub.quType === 4">
                          <div
                            v-for="(opt, oidx) in sub.options || []"
                            :key="'cref-' + sidx + '-' + oidx"
                            style="margin-top: 8px"
                          >
                            <span>参考答案（空{{ oidx + 1 }}）：</span>
                            <rich-html-content :html="opt.content || ''" />
                          </div>
                        </div>
                      </div>
                      <div class="qu_analysis">
                        <el-card>
                          <analysis-rich-block
                            :html="item.analyse"
                            label="试题解析："
                            variant="question"
                          />
                        </el-card>
                      </div>
                    </el-col>
                  </el-row>
                  <el-divider />
                </div>
              </template>
            </div>
            <el-divider />
          </el-card>
        </el-col>

        <div v-show="activeTab === 'absent'" class="absent-panel">
          <el-form :inline="true" class="demo-form-inline">
            <el-form-item label="姓名">
              <el-input v-model="absentRealName" placeholder="输入姓名" clearable />
            </el-form-item>
            <el-form-item label="班级">
              <ClassSelect v-model="absentGradeId" clearable placeholder="全部班级" style="width: 200px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchAbsent">查询</el-button>
            </el-form-item>
          </el-form>
          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="以下为该考试关联班级中尚未交卷的学生（可按班级筛选）。"
            style="margin-bottom: 12px"
          />
          <el-table
            :data="absentData.records"
            border
            fit
            highlight-current-row
            :header-cell-style="tableHeaderStyle"
          >
            <el-table-column label="序号" align="center" width="80">
              <template slot-scope="scope">{{ (absentPageNum - 1) * absentPageSize + scope.$index + 1 }}</template>
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
              :current-page="absentPageNum"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="absentPageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="absentData.total"
              @size-change="handleAbsentSizeChange"
              @current-change="handleAbsentCurrentChange"
            />
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { details, getExamDetail } from '@/api/exam'
import { answerAbsentPaging } from '@/api/answer'
import imageUrlsMixin from '@/mixins/imageUrlsMixin'
import RichHtmlContent from '@/components/RichHtmlContent'
import AnalysisRichBlock from '@/components/AnalysisRichBlock'
import CompoundStemBlock from '@/components/CompoundStemBlock'
import ClassSelect from '@/components/ClassSelect'
import { saqReferenceDisplayHtml } from '@/utils/saqAnswerHtml'
import { questionStemDisplayHtml } from '@/utils/questionStemHtml'

export default {
  name: 'ExamProcess',
  components: { RichHtmlContent, AnalysisRichBlock, CompoundStemBlock, ClassSelect },
  mixins: [imageUrlsMixin],
  data() {
    return {
      input: '',
      quIndex: -1,
      examId: '',
      data: [],
      examInfo: {},
      activeTab: 'questions',
      userId: null,
      absentPageNum: 1,
      absentPageSize: 10,
      absentData: { records: [], total: 0 },
      absentGradeId: '',
      absentRealName: '',
      tableHeaderStyle: {
        background: '#f2f3f4',
        color: '#555',
        'font-weight': 'bold',
        'line-height': '32px'
      },
      index: {
        quType: 4 // 确保这里有一个值
      }
    }
  },
  watch: {
    '$route'() {
      this.resolveExamIdFromRouteOrStorage()
      this.loadExamInfo()
      this.ExamDetail()
      if (this.activeTab === 'absent') {
        this.loadAbsent()
      }
    },
    activeTab(val) {
      if (val === 'absent') {
        this.loadAbsent()
      }
    }
  },
  created() {
    this.resolveExamIdFromRouteOrStorage()
    this.loadExamInfo()
    this.ExamDetail()
  },
  methods: {
    questionStemDisplay(row) {
      return questionStemDisplayHtml(row || {})
    },
    saqRefDisplay(row) {
      return saqReferenceDisplayHtml(row.option && row.option[0])
    },
    formatSubRightAnswer(sub) {
      if (!sub || !sub.options || !sub.options.length) return '—'
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const rights = sub.options
        .map((opt, oidx) => ((opt.isRight === 1 || opt.isRight === true) ? letters[oidx] || oidx : null))
        .filter(Boolean)
      return rights.length ? rights.join('、') : '—'
    },
    resolveExamIdFromRouteOrStorage() {
      const q = this.$route.query || {}
      const p = this.$route.params || {}
      const fromRoute = q.examId ?? q.id ?? p.examId ?? p.id
      const id =
        fromRoute != null && fromRoute !== ''
          ? String(fromRoute)
          : localStorage.getItem('exam-details-examId')
      this.examId = id || ''
      if (this.examId) {
        localStorage.setItem('exam-details-examId', this.examId)
      }
    },
    isCheck(myOption, sort) {
      if (myOption == null || myOption === '') return false
      const arr = String(myOption).split(',').map(Number)
      return arr.includes(sort)
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
    async loadExamInfo() {
      if (!this.examId) {
        this.examInfo = {}
        return
      }
      try {
        const res = await getExamDetail(this.examId)
        this.examInfo = res.data || {}
      } catch (e) {
        this.examInfo = {}
      }
    },
    searchAbsent() {
      this.absentPageNum = 1
      this.loadAbsent()
    },
    async loadAbsent() {
      if (!this.examId) {
        this.absentData = { records: [], total: 0 }
        return
      }
      const params = {
        pageNum: this.absentPageNum,
        pageSize: this.absentPageSize,
        examId: this.examId,
        realName: this.absentRealName || undefined
      }
      if (this.absentGradeId) {
        params.gradeId = this.absentGradeId
      }
      try {
        const res = await answerAbsentPaging(params)
        this.absentData = res.data || { records: [], total: 0 }
      } catch (e) {
        this.absentData = { records: [], total: 0 }
      }
    },
    handleAbsentSizeChange(val) {
      this.absentPageSize = val
      this.loadAbsent()
    },
    handleAbsentCurrentChange(val) {
      this.absentPageNum = val
      this.loadAbsent()
    },
    // 加载试卷题目（教师预览，无学生作答）
    async ExamDetail() {
      if (!this.examId) {
        this.data = []
        this.$message.error('缺少试卷编号，无法加载试卷')
        return
      }
      try {
        const res = await details(this.examId)
        this.data = Array.isArray(res.data) ? res.data : []
      } catch (e) {
        this.data = []
        this.$message.error(e && e.message ? e.message : '加载试卷题目失败')
      }
    },
    // 点击答题卡题号, 右侧题目滑动
    handleTag(index) {
      // 高亮选中的题目index标签
      this.quIndex = index
      // 题目滑动到锚定点
      const page = document.querySelector('.index' + index)
      page.scrollIntoView()
    }
  }
}
</script>

<style scoped lang="scss">
.exam-summary {
  margin-bottom: 12px;
  .exam-summary-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .exam-summary-meta span {
    margin-right: 20px;
    color: #606266;
    font-size: 13px;
  }
}
.exam-detail-tabs {
  margin-bottom: 8px;
}
.absent-panel {
  padding: 0 4px 16px;
}
.pagination-container {
  margin-top: 16px;
  text-align: right;
}
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
.isRight {
  background-color: rgb(215, 245, 215);
}
.incorrect {
  background-color: rgb(248, 197, 197);
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

// 试题内容样式
.qu_list {
  height: 100%;
  width: 100%;
  overflow: auto;
  page-break-after: always;

  .qu_num {
    display: inline-block;
    // background: url('~@/assets/images/tkxl/btbj.png') no-repeat 100% 100%;
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

  // 选项组
  .qu_choose_group {
    width: 100%;

    // 单个选项
    .qu_choose {
      display: block;
      margin: 10px;

      // 去除前面的radio
      ::v-deep .el-radio__input .el-radio__inner {
        display: none;
      }

      // 单个选项内容样式
      .qu_choose_tag {
        display: block;
        width: 100%;
        .qu_choose_tag_type {
          font-weight: bold;
          width: auto;
        }
        // 选项内容
        .qu_choose_tag_content {
          padding: 0 10px 10px 10px;
        }
        .qu_choose_tag_img {
          // max-height:90px;
          // max-width:300px;
          height: 100px;
          display: block;
          margin: 10px;
        }

        .qu_choose_tag_el_image {
          clear: both;
          padding-top: 10px;
        }
      }
      // 选项答案
      .qu_choose_answer {
        float: right;
      }
    }
  }

  // 试题解析
  .qu_analysis {
    padding: 10px;

    .qu_analysis_content {
      padding-top: 10px;
    }
  }

  // 试题赋分
  .qu_assign_score {
    background: #f5f5f5;
    height: 100px;
    padding-top: 35px;

    .qu_assign_score_content {
      width: 80px;
    }
  }
}
.imgC {
  height: 150px;
}
</style>
