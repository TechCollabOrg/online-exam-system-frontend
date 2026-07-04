<template>
  <div>
    <audio-upload-local
      :value="value"
      :accept="accept"
      :tips="tips"
      :limit="limit"
      @input="$emit('input', $event)"
    />
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
  }
}
</script>
