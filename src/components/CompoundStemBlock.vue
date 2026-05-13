<template>
  <div
    v-if="stemContent || parseImageUrls(stemImage || '').length"
    class="compound-stem-block"
    style="margin-bottom: 16px; padding: 12px 14px; background: #f9fafb; border: 1px solid #e4e7ed; border-radius: 6px"
  >
    <div style="margin-bottom: 8px">
      <el-tag v-if="parentQuId != null && parentQuId !== ''" size="small" type="info">同一大题 · 共用题干</el-tag>
    </div>
    <p v-if="stemContent" style="margin: 0; white-space: pre-wrap; line-height: 1.65; color: #303133">{{ stemContent }}</p>
    <div
      v-if="parseImageUrls(stemImage || '').length"
      style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center"
    >
      <el-image
        v-for="(img, i) in parseImageUrls(stemImage || '')"
        :key="'compound-stem-img-' + i"
        :src="img"
        :preview-src-list="parseImageUrls(stemImage || '')"
        fit="contain"
        style="max-width: 220px; max-height: 220px"
      />
    </div>
  </div>
</template>

<script>
import imageUrlsMixin from '@/mixins/imageUrlsMixin'

export default {
  name: 'CompoundStemBlock',
  mixins: [imageUrlsMixin],
  props: {
    stemContent: { type: String, default: '' },
    stemImage: { type: String, default: '' },
    parentQuId: { type: [Number, String], default: null }
  }
}
</script>
