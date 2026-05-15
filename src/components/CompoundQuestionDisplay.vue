<template>
  <div v-if="subItems && subItems.length">
    <div
      v-for="(sub, sidx) in subItems"
      :key="'sub-' + sidx"
      class="compound-sub-item"
    >
      <div v-if="sub.content" style="margin: 12px 0 8px">
        <div style="font-weight: 600; margin-bottom: 6px">({{ sidx + 1 }})</div>
        <rich-html-content :html="sub.content" />
      </div>

      <div v-if="sub.quType === 1 || sub.quType === 3">
        <el-radio-group
          :value="getRadioValue(sidx)"
          @input="val => setRadioValue(sidx, val)"
        >
          <el-radio
            v-for="(opt, oidx) in sub.options || []"
            :key="'sub-' + sidx + '-r-' + oidx"
            :label="oidx"
          >
            {{ numberToLetter(oidx) }}.{{ opt.content }}
          </el-radio>
        </el-radio-group>
      </div>

      <div v-if="sub.quType === 2">
        <el-checkbox-group
          :value="getMultiValue(sidx)"
          @input="val => setMultiValue(sidx, val)"
        >
          <el-checkbox
            v-for="(opt, oidx) in sub.options || []"
            :key="'sub-' + sidx + '-m-' + oidx"
            :label="oidx"
          >
            {{ numberToLetter(oidx) }}.{{ opt.content }}
          </el-checkbox>
        </el-checkbox-group>
      </div>

      <div v-if="sub.quType === 4">
        <template v-if="(sub.options || []).length > 1">
          <div
            v-for="(opt, bidx) in sub.options"
            :key="'sub-' + sidx + '-b-' + bidx"
            style="margin-bottom: 12px"
          >
            <div style="font-size: 13px; color: #606266; margin-bottom: 4px">第 {{ bidx + 1 }} 空</div>
            <el-input
              :value="getSaqBlank(sidx, bidx)"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 6 }"
              :placeholder="'请输入第 ' + (bidx + 1) + ' 空的答案'"
              @input="val => setSaqBlank(sidx, bidx, val)"
            />
          </div>
        </template>
        <el-input
          v-else
          :value="getSaqSingle(sidx)"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="请输入内容"
          @input="val => setSaqSingle(sidx, val)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import RichHtmlContent from '@/components/RichHtmlContent'

export default {
  name: 'CompoundQuestionDisplay',
  components: { RichHtmlContent },
  props: {
    subItems: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    numberToLetter(input) {
      const map = { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F' }
      return map[input] || ''
    },
    emit(next) {
      this.$emit('input', next)
    },
    getRadioValue(sidx) {
      const v = this.value[String(sidx)]
      return v === undefined || v === null || v === '' ? '' : Number(v)
    },
    setRadioValue(sidx, val) {
      this.emit({ ...this.value, [String(sidx)]: val })
    },
    getMultiValue(sidx) {
      const v = this.value[String(sidx)]
      if (Array.isArray(v)) return v.map(Number)
      if (v === undefined || v === null || v === '') return []
      return String(v).split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n))
    },
    setMultiValue(sidx, val) {
      this.emit({ ...this.value, [String(sidx)]: val })
    },
    getSaqSingle(sidx) {
      const v = this.value[String(sidx)]
      return v == null ? '' : String(v)
    },
    setSaqSingle(sidx, val) {
      this.emit({ ...this.value, [String(sidx)]: val })
    },
    getSaqBlank(sidx, bidx) {
      const v = this.value[String(sidx)]
      let arr = []
      if (Array.isArray(v)) arr = v
      else if (typeof v === 'string' && v.trim().startsWith('[')) {
        try { arr = JSON.parse(v) } catch (e) { arr = [] }
      }
      return arr[bidx] == null ? '' : String(arr[bidx])
    },
    setSaqBlank(sidx, bidx, val) {
      const sub = this.subItems[sidx]
      const count = (sub && sub.options) ? sub.options.length : 1
      const v = this.value[String(sidx)]
      let arr = []
      if (Array.isArray(v)) arr = [...v]
      else if (typeof v === 'string' && v.trim().startsWith('[')) {
        try { arr = JSON.parse(v) } catch (e) { arr = [] }
      }
      while (arr.length < count) arr.push('')
      arr[bidx] = val
      this.emit({ ...this.value, [String(sidx)]: arr })
    }
  }
}
</script>

<style scoped>
.compound-sub-item {
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px dashed #ebeef5;
}
</style>
