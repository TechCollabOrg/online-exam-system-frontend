<template>
  <el-select
    v-model="selectedCertificateIds"
    :multiple="isMultiple"
    :remote-method="fetchCertificates"
    filterable
    remote
    reserve-keyword
    clearable
    automatic-dropdown
    placeholder="选择或搜索证书"
    class="certificate-selector"
    @change="handleCertificateChange"
  >
    <el-option
      v-for="cert in certificateList"
      :key="cert.id"
      :label="cert.certificateName"
      :value="cert.id"
    />
  </el-select>
</template>

<script>
import { certificatePaging } from '@/api/certificate' // 假定的API调用

export default {
  name: 'CertificateSelect',
  props: {
    isMultiple: {
      type: Boolean,
      default: false
    },
    // eslint-disable-next-line vue/require-default-prop
    value: [String, Array], // 支持单选或多选
    // eslint-disable-next-line vue/require-default-prop
    excludes: Array // 可选的排除项
  },
  data() {
    return {
      certificateList: [], // 证书列表
      selectedCertificateIds: [] // 选中的证书ID
    }
  },
  watch: {
    value: {
      handler(newValue) {
        this.selectedCertificateIds = newValue
      },
      immediate: true
    }
  },
  created() {
    this.fetchCertificates()
  },
  methods: {
    /**
     * 分页加载证书模板列表（pageSize=1000），写入 certificateList 供下拉展示 certificateName。
     */
    fetchCertificates() {
      certificatePaging({ pageNum: 1, pageSize: 1000 }).then((response) => {
        this.certificateList = response.data.records || []
      })
    },
    /**
     * 选中证书变更：根据 id 过滤出完整证书实体，emit change（选中项数组）与 input（v-model 绑定 id 或 id 列表）。
     */
    handleCertificateChange(selectedIds) {
      const selectedCertificates = this.certificateList.filter((cert) =>
        selectedIds.includes(cert.id)
      )
      this.$emit('change', selectedCertificates) // 发送选中的证书对象数组到父组件
      this.$emit('input', selectedIds) // 更新v-model绑定的值
    }
  }
}
</script>
