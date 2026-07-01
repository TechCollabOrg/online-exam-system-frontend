<template>
  <div v-if="enabled" class="exam-proctor-student">
    <div class="proctor-bar">
      <span class="dot" :class="statusClass" />
      <span class="label">{{ statusText }}</span>
      <el-button v-if="allowLeave && !onLeave" size="mini" type="warning" plain @click="openLeave">暂离</el-button>
      <el-button v-if="onLeave" size="mini" type="success" plain @click="doReturn">我已返回</el-button>
    </div>
    <video ref="videoEl" class="preview" autoplay playsinline muted />
    <el-dialog title="申请暂离" :visible.sync="leaveVisible" width="360px" append-to-body>
      <el-form label-width="100px">
        <el-form-item label="暂离时长">
          <el-input-number v-model="leaveMinutes" :min="1" :max="leaveMaxMinutes" />
          <span class="hint"> 分钟（最多 {{ leaveMaxMinutes }}）</span>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="leaveVisible = false">取消</el-button>
        <el-button type="primary" :loading="leaveLoading" @click="submitLeave">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Room, RoomEvent, createLocalVideoTrack } from 'livekit-client'
import {
  getProctorConfig,
  getProctorToken,
  reportProctorEvent,
  proctorHeartbeat,
  requestProctorLeave,
  returnProctorLeave
} from '@/api/proctor'
import { initFaceDetector, startFaceMonitor, stopFaceMonitor } from '@/utils/proctorFaceDetect'

export default {
  name: 'ExamProctorStudent',
  props: {
    examId: { type: [String, Number], required: true }
  },
  data() {
    return {
      enabled: false,
      allowLeave: false,
      leaveMaxMinutes: 5,
      leaveVisible: false,
      leaveMinutes: 5,
      leaveLoading: false,
      onLeave: false,
      statusText: '监考初始化…',
      statusClass: 'pending',
      room: null,
      localTrack: null,
      heartbeatTimer: null,
      lastAlertAt: 0
    }
  },
  mounted() {
    this.bootstrap()
  },
  beforeDestroy() {
    this.teardown()
  },
  methods: {
    async bootstrap() {
      try {
        const cfgRes = await getProctorConfig(this.examId)
        const cfg = cfgRes.data || {}
        if (!cfg.proctorEnabled) {
          this.enabled = false
          return
        }
        this.enabled = true
        this.allowLeave = !!cfg.allowLeave
        this.leaveMaxMinutes = cfg.leaveMaxMinutes || 5
        this.leaveMinutes = Math.min(5, this.leaveMaxMinutes)

        await initFaceDetector()
        this.localTrack = await createLocalVideoTrack({
          resolution: { width: 640, height: 480 },
          facingMode: 'user'
        })
        const videoEl = this.$refs.videoEl
        if (videoEl) {
          this.localTrack.attach(videoEl)
        }

        const tokenRes = await getProctorToken(this.examId, 'student')
        const t = tokenRes.data
        this.room = new Room()
        await this.room.connect(t.livekitUrl, t.token)
        await this.room.localParticipant.publishTrack(this.localTrack)

        startFaceMonitor(videoEl, {
          onStateChange: (state, detail) => this.onFaceState(state, detail)
        })

        this.heartbeatTimer = setInterval(() => {
          proctorHeartbeat(this.examId).catch(() => {})
        }, 30000)
        proctorHeartbeat(this.examId).catch(() => {})

        this.statusText = '监考中'
        this.statusClass = 'ok'
        this.$emit('ready')
      } catch (e) {
        this.statusText = '监考启动失败'
        this.statusClass = 'err'
        this.$message.error((e && e.message) || '请允许摄像头权限并重试')
        reportProctorEvent({
          examId: Number(this.examId),
          eventType: 'CAMERA_OFF',
          detail: (e && e.message) || '摄像头或 LiveKit 连接失败'
        }).catch(() => {})
      }
    },
    onFaceState(state, detail) {
      if (this.onLeave) return
      const now = Date.now()
      if (now - this.lastAlertAt < 15000) return
      if (['NO_FACE', 'MULTIPLE_FACES', 'FACE_AWAY'].includes(state)) {
        this.lastAlertAt = now
        this.statusText = detail || state
        this.statusClass = 'warn'
        reportProctorEvent({
          examId: Number(this.examId),
          eventType: state,
          detail
        }).catch(() => {})
      } else if (state === 'FACE_RETURN') {
        this.statusText = '监考中'
        this.statusClass = 'ok'
      }
    },
    openLeave() {
      this.leaveVisible = true
    },
    async submitLeave() {
      this.leaveLoading = true
      try {
        await requestProctorLeave({
          examId: Number(this.examId),
          minutes: this.leaveMinutes
        })
        this.onLeave = true
        this.leaveVisible = false
        this.statusText = `暂离中（${this.leaveMinutes} 分钟）`
        this.statusClass = 'leave'
        this.$message.success('暂离已开始，请按时返回')
      } finally {
        this.leaveLoading = false
      }
    },
    async doReturn() {
      await returnProctorLeave(Number(this.examId))
      this.onLeave = false
      this.statusText = '监考中'
      this.statusClass = 'ok'
      this.$message.success('已返回考试')
    },
    async teardown() {
      stopFaceMonitor()
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
        this.heartbeatTimer = null
      }
      if (this.room) {
        try {
          await this.room.disconnect()
        } catch (e) { /* ignore */ }
        this.room = null
      }
      if (this.localTrack) {
        this.localTrack.stop()
        this.localTrack = null
      }
    }
  }
}
</script>

<style scoped>
.exam-proctor-student {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2000;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  width: 168px;
}
.proctor-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 12px;
  margin-bottom: 6px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
}
.dot.ok { background: #67c23a; }
.dot.warn { background: #e6a23c; }
.dot.err { background: #f56c6c; }
.dot.leave { background: #409eff; }
.preview {
  width: 100%;
  border-radius: 4px;
  background: #000;
  max-height: 120px;
  object-fit: cover;
}
.hint {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}
</style>
