<template>
  <div class="app-container proctor-page">
    <el-card shadow="never">
      <div slot="header" class="header-row">
        <div>
          <span class="title">考试监考 — {{ examTitle || ('考试 #' + examId) }}</span>
          <span class="sub">选中考生即可观看实时画面；告警通过 WebSocket 推送</span>
        </div>
        <el-button size="small" @click="refreshAll">刷新</el-button>
      </div>

      <el-row :gutter="16">
        <el-col :span="8">
          <p class="section-title">进行中考生</p>
          <el-table
            v-loading="loadingParticipants"
            :data="participants"
            size="small"
            highlight-current-row
            @current-change="onSelectStudent"
          >
            <el-table-column prop="realName" label="姓名" min-width="80">
              <template slot-scope="{ row }">{{ row.realName || row.userName || row.userId }}</template>
            </el-table-column>
            <el-table-column label="状态" width="72" align="center">
              <template slot-scope="{ row }">
                <el-tag v-if="row.inLeave" type="warning" size="mini">暂离</el-tag>
                <el-tag v-else-if="row.online" type="success" size="mini">在线</el-tag>
                <el-tag v-else type="info" size="mini">离线</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-col>

        <el-col :span="10">
          <p class="section-title">实时画面</p>
          <div ref="watchVideoWrap" class="watch-wrap">
            <div v-if="!selectedStudent" class="placeholder">请从左侧选择考生</div>
            <video v-show="selectedStudent" ref="watchVideo" autoplay playsinline class="watch-video" />
          </div>
        </el-col>

        <el-col :span="6">
          <p class="section-title">告警记录</p>
          <el-scrollbar class="event-scroll">
            <div v-for="ev in events" :key="ev.id" class="event-item">
              <div class="ev-time">{{ ev.createTime }}</div>
              <div class="ev-body">{{ ev.userName || ev.userId }} · {{ eventLabel(ev.eventType) }}</div>
              <div v-if="ev.detail" class="ev-detail">{{ ev.detail }}</div>
            </div>
            <div v-if="!events.length" class="placeholder small">暂无告警</div>
          </el-scrollbar>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { Room, RoomEvent } from 'livekit-client'
import { EventBus } from '@/utils/websocket'
import { getExamDetail } from '@/api/exam'
import {
  getProctorToken,
  listProctorEvents,
  listProctorParticipants
} from '@/api/proctor'

const EVENT_LABELS = {
  FACE_AWAY: '人脸偏离',
  NO_FACE: '未检测到人脸',
  MULTIPLE_FACES: '多人入镜',
  LEAVE_EXPIRED: '暂离超时',
  LEAVE_START: '开始暂离',
  LEAVE_RETURN: '暂离返回',
  CAMERA_OFF: '摄像头异常'
}

export default {
  name: 'ExamProctorMonitor',
  data() {
    return {
      examId: null,
      examTitle: '',
      participants: [],
      events: [],
      loadingParticipants: false,
      selectedStudent: null,
      room: null,
      attachedTrack: null,
      pollTimer: null
    }
  },
  created() {
    this.examId = this.$route.query.examId
    if (!this.examId) {
      this.$message.error('缺少 examId')
      return
    }
    this.loadExamTitle()
    this.connectRoom()
    this.refreshAll()
    this.pollTimer = setInterval(() => this.refreshParticipants(), 15000)
    EventBus.$on('websocket-message', this.onWsMessage)
  },
  beforeDestroy() {
    EventBus.$off('websocket-message', this.onWsMessage)
    if (this.pollTimer) clearInterval(this.pollTimer)
    this.disconnectRoom()
  },
  methods: {
    eventLabel(t) {
      return EVENT_LABELS[t] || t
    },
    async loadExamTitle() {
      try {
        const res = await getExamDetail(this.examId)
        this.examTitle = (res.data && res.data.title) || ''
      } catch (e) { /* ignore */ }
    },
    async connectRoom() {
      try {
        const res = await getProctorToken(this.examId, 'proctor')
        const t = res.data
        this.room = new Room()
        this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (!this.selectedStudent) return
          const expect = `student-${this.selectedStudent.userId}`
          if (participant.identity !== expect && track.kind === 'video') return
          if (participant.identity === expect && track.kind === 'video') {
            this.attachWatchTrack(track)
          }
        })
        this.room.on(RoomEvent.TrackUnsubscribed, track => {
          track.detach()
        })
        await this.room.connect(t.livekitUrl, t.token)
      } catch (e) {
        this.$message.error('连接 LiveKit 失败，请确认 LiveKit 服务已启动')
      }
    },
    attachWatchTrack(track) {
      if (this.attachedTrack) {
        this.attachedTrack.detach()
      }
      this.attachedTrack = track
      const el = this.$refs.watchVideo
      if (el) track.attach(el)
    },
    onSelectStudent(row) {
      this.selectedStudent = row
      if (!row || !this.room) return
      const identity = row.livekitIdentity || `student-${row.userId}`
      this.room.remoteParticipants.forEach(p => {
        if (p.identity === identity) {
          p.videoTrackPublications.forEach(pub => {
            if (pub.track) this.attachWatchTrack(pub.track)
          })
        }
      })
    },
    async refreshParticipants() {
      this.loadingParticipants = true
      try {
        const res = await listProctorParticipants(this.examId)
        this.participants = res.data || []
      } finally {
        this.loadingParticipants = false
      }
    },
    async refreshEvents() {
      const res = await listProctorEvents(this.examId, 80)
      this.events = res.data || []
    },
    refreshAll() {
      this.refreshParticipants()
      this.refreshEvents()
    },
    onWsMessage(raw) {
      let msg = raw
      if (typeof raw === 'string') {
        try { msg = JSON.parse(raw) } catch (e) { return }
      }
      if (!msg || msg.type !== 'proctor_alert') return
      if (String(msg.examId) !== String(this.examId)) return
      this.$notify({
        title: '监考告警',
        message: `${msg.eventType}${msg.detail ? '：' + msg.detail : ''}`,
        type: 'warning',
        duration: 8000
      })
      this.refreshEvents()
      this.refreshParticipants()
    },
    async disconnectRoom() {
      if (this.room) {
        try { await this.room.disconnect() } catch (e) { /* ignore */ }
        this.room = null
      }
    }
  }
}
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.title { font-weight: 600; font-size: 16px; }
.sub { display: block; font-size: 12px; color: #909399; margin-top: 4px; }
.section-title { font-weight: 600; margin: 0 0 8px; font-size: 14px; }
.watch-wrap {
  background: #1a1a1a;
  border-radius: 8px;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.watch-video {
  width: 100%;
  max-height: 360px;
  border-radius: 8px;
}
.placeholder { color: #909399; font-size: 14px; }
.placeholder.small { padding: 12px; font-size: 12px; }
.event-scroll { height: 320px; }
.event-item {
  padding: 8px 4px;
  border-bottom: 1px solid #ebeef5;
  font-size: 12px;
}
.ev-time { color: #909399; }
.ev-body { color: #303133; margin-top: 2px; }
.ev-detail { color: #e6a23c; margin-top: 2px; }
</style>
