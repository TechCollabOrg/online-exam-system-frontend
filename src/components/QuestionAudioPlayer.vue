<template>
  <div class="question-audio-player">
    <div v-for="(url, idx) in audioUrls" :key="'audio-' + idx" class="question-audio-player__item">
      <span v-if="audioUrls.length > 1" class="question-audio-player__label">音频 {{ idx + 1 }}</span>
      <audio :src="url" controls preload="metadata" style="width: 100%; max-width: 480px" />
    </div>
  </div>
</template>

<script>
import { parseImageUrls } from '@/utils/imageUrls'

export default {
  name: 'QuestionAudioPlayer',
  props: {
    audio: { type: String, default: '' }
  },
  computed: {
    audioUrls() {
      return parseImageUrls(this.audio)
    }
  }
}
</script>

<style scoped>
.question-audio-player__item {
  margin: 8px 0;
}
.question-audio-player__label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
