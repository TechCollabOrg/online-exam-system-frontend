/** 解析路由/缓存中的正整数 ID，过滤 null、undefined、字符串 "null" */
export function parsePositiveInt(val) {
  if (val == null || val === '' || val === 'null' || val === 'undefined') {
    return null
  }
  const n = Number(val)
  if (!Number.isFinite(n) || n <= 0) {
    return null
  }
  return Math.floor(n)
}

const SCORE_DETAIL_CTX_KEY = 'score_detail_ctx'

export function saveScoreDetailContext(ctx) {
  if (!ctx || ctx.examId == null || ctx.gradeId == null) {
    return
  }
  sessionStorage.setItem(SCORE_DETAIL_CTX_KEY, JSON.stringify({
    examId: ctx.examId,
    gradeId: ctx.gradeId,
    examTitle: ctx.examTitle || '',
    gradeName: ctx.gradeName || ''
  }))
}

export function loadScoreDetailContext() {
  try {
    const raw = sessionStorage.getItem(SCORE_DETAIL_CTX_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function briefingStorageKey(examId, gradeId) {
  return `ai_briefing_${examId}_${gradeId}`
}

export function chatStorageKey(userId) {
  return `ai_assistant_chat_${userId || 'guest'}`
}

const CHAT_MAX_MESSAGES = 50

export function loadChatMessages(userId) {
  try {
    const raw = sessionStorage.getItem(chatStorageKey(userId))
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list.filter(m => m && m.role && m.content) : []
  } catch (e) {
    return []
  }
}

export function saveChatMessages(userId, messages) {
  const list = (messages || [])
    .filter(m => m && !m.loading && m.content)
    .slice(-CHAT_MAX_MESSAGES)
  sessionStorage.setItem(chatStorageKey(userId), JSON.stringify(list))
}

export function clearChatMessages(userId) {
  sessionStorage.removeItem(chatStorageKey(userId))
}

export function loadBriefingText(examId, gradeId) {
  return sessionStorage.getItem(briefingStorageKey(examId, gradeId)) || ''
}

export function saveBriefingText(examId, gradeId, text) {
  const key = briefingStorageKey(examId, gradeId)
  if (text) {
    sessionStorage.setItem(key, text)
  } else {
    sessionStorage.removeItem(key)
  }
}
