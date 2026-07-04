<template>
  <el-container style="height: 100vh; border: 1px solid #eee">
    <el-container>
      <el-main class="right">
        <el-col>
          <el-card v-loading="loading" class="qu_list">
            <div>
              <template v-for="(index,indexx) in data">
                <!-- eslint-disable-next-line vue/require-v-for-key -->
                <div
                  v-if="index.quType === 1 || index.quType === 2 || index.quType === 3"
                  :class="'index' + index"
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
                        <div class="qu_content" style="font-weight: 600; margin-bottom: 6px">
                          {{ indexx + 1 }}、
                        </div>
                        <rich-html-content :html="questionStemDisplay(index)" />
                      </div>

                      <!-- 选项 -->
                      <el-radio-group class="qu_choose_group">
                        <!-- ['A', 'B', 'C', 'D'] -->
                        <el-radio
                          v-for="(item, indexs) in index.option"
                          :key="indexs"
                          :label="item.content"
                          border

                          class="qu_choose"
                          :class="{'imgC':parseImageUrls(item.image).length > 0,'isRight':index.myOption!=null&& isCheck(index.myOption ,item.sort) && item.isRight , 'incorrect':index.myOption!=null && isCheck(index.myOption ,item.sort) && !item.isRight}"
                        >

                          <!-- 选项flex浮动 -->
                          <div class="qu_choose_tag">
                            <div class="qu_choose_tag_type">
                              {{ numberToLetter(indexs) }}、{{ item.content }}
                            </div>
                            <div v-if="parseImageUrls(item.image).length" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px">
                              <el-image
                                v-for="(img, oi) in parseImageUrls(item.image)"
                                :key="'exo-' + indexs + '-' + oi"
                                :src="img"
                                :preview-src-list="parseImageUrls(item.image)"
                                fit="contain"
                                class="qu_choose_tag_img"
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
                          <div>
                            <span>考生答案：</span>
                            <span>{{ numberToLetter(index.myOption) }}</span><br>
                          </div>
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
              <template v-for="index in data">
                <!-- eslint-disable-next-line vue/require-v-for-key -->
                <div v-if="index.quType === 4" :class="'index' + index">
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
                          placeholder="请输入内容"
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
              <template v-for="(item, indexx) in data">
                <div v-if="item.quType === 5" :key="'compound-' + indexx" :class="'index' + indexx">
                  <el-row :gutter="24">
                    <el-col :span="20" style="text-align: left">
                      <div class="qu_content" style="font-weight: 600; margin-bottom: 6px">
                        {{ indexx + 1 }}、
                        <el-tag size="mini" type="info" style="margin-left: 8px">复合题</el-tag>
                      </div>
                      <compound-stem-block
                        :stem-content="questionStemDisplay(item)"
                        :stem-image="item.image"
                        :stem-audio="item.audio"
                      />
                      <div
                        v-for="(sub, sidx) in item.subItemList || []"
                        :key="'sub-' + indexx + '-' + sidx"
                        style="margin: 14px 0; padding-bottom: 12px; border-bottom: 1px dashed #ebeef5"
                      >
                        <div v-if="sub.content" style="margin-bottom: 8px">
                          <span style="font-weight: 600">({{ sidx + 1 }})</span>
                          <rich-html-content :html="sub.content" />
                        </div>
                        <div v-if="sub.quType === 1 || sub.quType === 3 || sub.quType === 2">
                          <div style="margin-top: 8px; color: #606266">考生答案：{{ formatObjectiveAnswer(sub) }}</div>
                          <div style="margin-top: 6px; color: #606266">正确答案：{{ formatSubRightAnswer(sub) }}</div>
                        </div>
                        <div v-else-if="sub.quType === 4">
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
                          <div v-for="(opt, oidx) in sub.options || []" :key="'ref-' + sidx + '-' + oidx" style="margin-top: 8px">
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
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { recordExerciseDetail } from '@/api/record'
import imageUrlsMixin from '@/mixins/imageUrlsMixin'
import RichHtmlContent from '@/components/RichHtmlContent'
import AnalysisRichBlock from '@/components/AnalysisRichBlock'
import CompoundStemBlock from '@/components/CompoundStemBlock'
import { saqReferenceDisplayHtml } from '@/utils/saqAnswerHtml'
import { questionStemDisplayHtml } from '@/utils/questionStemHtml'

export default {
  name: 'ExamProcess',
  components: { RichHtmlContent, AnalysisRichBlock, CompoundStemBlock },
  mixins: [imageUrlsMixin],
  data() {
    return {
      input: '',
      quIndex: -1,
      repoId: 0,
      data: [],
      loading: false
    }
  },
  created() {
    this.resolveRepoIdFromRouteOrStorage()
    this.ExerciseDetail()
  },
  watch: {
    '$route'() {
      this.resolveRepoIdFromRouteOrStorage()
      this.ExerciseDetail()
    }
  },
  methods: {
    resolveRepoIdFromRouteOrStorage() {
      const q = this.$route.query || {}
      const fromQuery = q.repoId || (q.zhi && q.zhi.id)
      const fromStorage = localStorage.getItem('record_exercise_repoId')
      this.repoId = fromQuery || fromStorage
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
    formatSubRightAnswer(sub) {
      if (!sub || !sub.options || !sub.options.length) return '—'
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const rights = sub.options
        .map((opt, oidx) => ((opt.isRight === 1 || opt.isRight === true) ? letters[oidx] || oidx : null))
        .filter(Boolean)
      return rights.length ? rights.join('、') : '—'
    },
    questionStemDisplay(row) {
      return questionStemDisplayHtml(row || {})
    },
    saqRefDisplay(row) {
      return saqReferenceDisplayHtml(row.option && row.option[0])
    },
    isCheck(myOption, sort) {
      const arr = myOption.split(',').map(Number) // 将字符串转换为数字数组
      if (arr.includes(sort)) {
        return true
      } else {
        return false
      }
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
      const singleNumberToLetter = (num) => numberToCharMap[parseInt(num, 10)] || ''

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
    // 分页查询
    async ExerciseDetail() {
      if (!this.repoId) {
        this.data = []
        this.$message.error('缺少题库编号，无法加载刷题记录')
        return
      }
      this.loading = true
      try {
        const params = { repoId: this.repoId }
        const res = await recordExerciseDetail(params)
        this.data = res.data || []
      } catch (error) {
        console.error('获取练习详情失败:', error)
        this.data = []
        this.$message.error('获取练习详情失败，请稍后重试')
      } finally {
        this.loading = false
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
.isRight{
  background-color: rgb(215, 245, 215);
}
.incorrect{
  background-color: rgb(248, 197, 197);
}
.imageWrapper {
  // 确保图片独占一行，必要时可以添加margin或padding调整间距
  width: 100%;
  text-align: center; // 如果需要居中显示图片
}

.optionImage {
  display: block; // 确保图片作为块级元素显示，独占一行
  max-width: 100%; // 图片宽度不超过其容器宽度
  height: auto; // 保持图片的宽高比
  margin: 10px 0; // 上下外边距，确保与其他内容有足够的间隔
}

.imgC{
  height:150px
}
</style>
