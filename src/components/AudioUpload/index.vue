<template>
  <div>
    <audio-upload-local v-model="fileUrl" :accept="accept" :tips="tips" :limit="limit" />
  </div>
</template>

<script>
import AudioUploadLocal from './local'

export default {
  name: 'AudioUpload',
  components: { AudioUploadLocal },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: String,
    accept: {
      type: String,
      default: '.mp3,.wav,.m4a,.ogg,.aac,.webm'
    },
    // eslint-disable-next-line vue/require-default-prop
    tips: String,
    limit: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      fileUrl: ''
    }
  },
  watch: {
    value: {
      handler() {
        this.fillValue()
      }
    },
    fileUrl: {
      handler() {
        this.$emit('input', this.fileUrl)
      }
    }
  },
  created() {
    this.fillValue()
  },
  methods: {
    fillValue() {
      this.fileUrl = this.value
    }
  }
}
</script>
