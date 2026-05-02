<template>
  <el-select
    v-model="currentValue"
    :multiple="multi"
    :remote-method="fetchData"
    filterable
    remote
    reserve-keyword
    clearable
    automatic-dropdown
    placeholder="选择或搜索题库"
    class="filter-item"
    @change="handlerChange"
  >
    <el-option
      v-for="item in dataList"
      :key="item.id"
      :label="item.title"
      :value="item.id"
    />
  </el-select>
</template>

<script>
import { fetchPaging } from '@/api/repo'

export default {
  name: 'RepoSelect',
  props: {
    multi: {
      type: Boolean,
      default: false
    },
    // eslint-disable-next-line vue/require-default-prop
    value: {
      type: [String, Array],
      default: null
    },
    // eslint-disable-next-line vue/require-default-prop
    excludes: Array
  },
  data() {
    return {

      // 下拉选项值
      dataList: [],
      currentValue: []
    }
  },

  watch: {
    // 检测查询变化
    value: {
      handler() {
        this.currentValue = this.value
      }
    }
  },
  created() {
    this.currentValue = this.value
    this.fetchData()
  },
  methods: {

    /**
     * 加载题库简要列表：调用 repo/list（fetchPaging），参数预留远程关键字 q；结果写入 dataList。
     */
    fetchData(q) {
      // , title: q, excludes: this.excludes
      fetchPaging({ pageNum: 1, pageSize: 1000 }).then((res) => {
        this.dataList = res.data
      })
    },
    /**
     * 选择题库：在 dataList 中按 id 查找整条 repo 记录 emit change，同时 emit input 更新 v-model。
     */
    handlerChange(e) {
      const obj = this.dataList.find((item) => {
        return item.id === e
      })

      this.$emit('change', obj)
      this.$emit('input', e)
    }
  }
}
</script>
