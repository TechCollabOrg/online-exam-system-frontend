<template>
  <el-select
    v-model="innerValue"
    :multiple="isMultiple"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :filterable="filterable"
    :collapse-tags="isMultiple"
    style="width: 100%"
    @change="handleChange"
  >
    <el-option
      v-for="item in gradeList"
      :key="item.id"
      :label="item.gradeName"
      :value="item.id"
    />
  </el-select>
</template>

<script>
import { getAllGrades } from '@/api/grade'

export default {
  name: 'ClassSelect',
  props: {
    value: {
      type: [String, Number, Array],
      default: ''
    },
    isMultiple: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择班级'
    },
    clearable: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      gradeList: [],
      innerValue: this.normalizeValue(this.value)
    }
  },
  watch: {
    value: {
      handler(val) {
        this.innerValue = this.normalizeValue(val)
      },
      deep: true
    },
    isMultiple() {
      this.innerValue = this.normalizeValue(this.value)
    }
  },
  created() {
    this.loadGrades()
  },
  methods: {
    dedupeGrades(list) {
      const source = Array.isArray(list) ? list : []
      const seen = new Set()
      const result = []
      for (const item of source) {
        if (!item || item.id === '' || item.id == null) {
          continue
        }
        const key = String(item.id)
        if (seen.has(key)) {
          continue
        }
        seen.add(key)
        result.push(item)
      }
      return result
    },
    normalizeValue(val) {
      if (this.isMultiple) {
        if (Array.isArray(val)) {
          return Array.from(new Set(val.filter((id) => id !== '' && id != null)))
        }
        if (val === '' || val == null) {
          return []
        }
        return [val]
      }
      if (Array.isArray(val)) {
        return val.length ? val[0] : ''
      }
      return val == null ? '' : val
    },
    async loadGrades() {
      try {
        const res = await getAllGrades()
        this.gradeList = this.dedupeGrades(res.data)
      } catch (e) {
        this.gradeList = []
      }
    },
    handleChange(selected) {
      const out = this.isMultiple
        ? (Array.isArray(selected) ? selected : [])
        : selected
      this.$emit('input', out)
      this.$emit('change', out)
    }
  }
}
</script>
