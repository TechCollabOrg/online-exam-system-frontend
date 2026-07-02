<template>
  <div v-if="stemContent || stemAudio || (stemImage && parseImageUrls(stemImage).length)" class="compound-stem-block">
    <el-tag size="mini" type="info" style="margin-bottom: 8px">共用材料</el-tag>
    <rich-html-content :html="stemContent" />
    <question-audio-player v-if="stemAudio" :audio="stemAudio" />
    <div v-if="stemImage && parseImageUrls(stemImage).length" style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px">
      <el-image
        v-for="(img, idx) in parseImageUrls(stemImage)"
        :key="'stem-img-' + idx"
        :src="img"
        :preview-src-list="parseImageUrls(stemImage)"
        fit="contain"
        style="max-width: 240px"
      />
    </div>
  </div>
</template>

<script>
import RichHtmlContent from '@/components/RichHtmlContent'
import QuestionAudioPlayer from '@/components/QuestionAudioPlayer'
import imageUrlsMixin from '@/mixins/imageUrlsMixin'

export default {
  name: 'CompoundStemBlock',
  components: { RichHtmlContent, QuestionAudioPlayer },
  mixins: [imageUrlsMixin],
  props: {
    stemContent: { type: String, default: '' },
    stemImage: { type: String, default: '' },
    stemAudio: { type: String, default: '' }
  }
}
</script>

<style scoped>
.compound-stem-block {
  margin: 0 0 14px;
  padding: 12px 14px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}
</style>
