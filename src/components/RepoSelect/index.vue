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
      type: [String, Number, Array],
      default: null
    },
    // eslint-disable-next-line vue/require-default-prop
    excludes: Array
  },
  data() {
    return {

      // 下拉选项值
      dataList: [],
      currentValue: null
    }
  },

  watch: {
    // 检测查询变化
    value: {
      immediate: true,
      handler() {
        this.currentValue = this.value == null ? (this.multi ? [] : null) : this.value
      }
    }
  },
  created() {
    this.currentValue = this.value == null ? (this.multi ? [] : null) : this.value
    this.fetchData()
  },
  methods: {

    fetchData(q) {
      const params = { pageNum: 1, pageSize: 1000 }
      if (q && String(q).trim()) {
        params.title = String(q).trim()
      }
      if (Array.isArray(this.excludes) && this.excludes.length > 0) {
        params.excludes = this.excludes.join(',')
      }
      fetchPaging(params).then((res) => {
        this.dataList = res.data
      })
    },
    handlerChange(e) {
      if (e === '' || e === null || e === undefined || (Array.isArray(e) && e.length === 0)) {
        this.$emit('change', null)
        this.$emit('input', this.multi ? [] : null)
        return
      }
      const obj = this.dataList.find((item) => {
        return String(item.id) === String(e)
      })

      if (!obj) {
        this.$emit('change', null)
        this.$emit('input', this.multi ? [] : null)
        return
      }
      this.$emit('change', obj)
      this.$emit('input', e)
    }
  }
}
</script>
