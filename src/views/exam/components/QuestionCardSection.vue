<template>
  <div v-if="questions && questions.length > 0">
    <p class="card-title">{{ title }}</p>
    <el-row :gutter="24" class="card-line">
      <el-tag
        v-for="(item, index) in questions"
        :key="index"
        :type="getCardItemClass(item)"
        style="width: calc(100% / 8); text-align: center; margin: 2px;"
        @click="selectQuestion(item)"
      >
        {{ item.sort + 1 }}
      </el-tag>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'QuestionCardSection',
  props: {
    title: {
      type: String,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    currentItem: {
      type: Object,
      required: true
    }
  },
  methods: {
    /**

     * 答题卡点击：向父组件 emit 切换题目事件并更新当前题高亮样式。

     */
    selectQuestion(item) {
      this.$emit('select-question', item)
    },
    /**

     * 根据题目是否已答、是否为当前题返回答题卡格子的 class 名称。

     */
    getCardItemClass(item) {
      // 当前题目
      if (item.questionId === this.currentItem.questionId) {
        return 'warning'
      }
      // 已答题
      if (item.checkout === 1) {
        return 'success'
      }
      // 未答题
      return 'info'
    }
  }
}
</script>

<style scoped>
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
</style>
