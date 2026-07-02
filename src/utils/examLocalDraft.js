/** 考试长文题（简答/复合题）localStorage 草稿：心跳写入、刷新后回填 */

const KEY_PREFIX = 'exam_long_draft_'

export function draftStorageKey(examId, userId) {
  return `${KEY_PREFIX}${examId}_${userId || 'guest'}`
}

export function loadExamDraft(examId, userId) {
  if (!examId) return { answers: {} }
  try {
    const raw = localStorage.getItem(draftStorageKey(examId, userId))
    if (!raw) return { answers: {} }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : { answers: {} }
  } catch (e) {
    return { answers: {} }
  }
}

function persistDraft(examId, userId, draft) {
  if (!examId) return
  localStorage.setItem(draftStorageKey(examId, userId), JSON.stringify(draft))
}

/** 判断草稿条目是否含有效作答 */
export function hasDraftFill(entry) {
  if (!entry || entry.answer == null) return false
  const a = String(entry.answer).trim()
  if (!a) return false
  if (entry.quType === 5) {
    try {
      const obj = JSON.parse(a)
      if (!obj || typeof obj !== 'object') return false
      return Object.keys(obj).some((k) => {
        const v = obj[k]
        if (Array.isArray(v)) return v.some((s) => s != null && String(s).trim() !== '')
        return v !== undefined && v !== null && v !== ''
      })
    } catch (e) {
      return false
    }
  }
  if (a.startsWith('[')) {
    try {
      const arr = JSON.parse(a)
      return Array.isArray(arr) && arr.some((s) => s != null && String(s).trim() !== '')
    } catch (e) {
      return false
    }
  }
  return true
}

export function getQuestionDraft(examId, userId, questionId) {
  const draft = loadExamDraft(examId, userId)
  return (draft.answers || {})[String(questionId)] || null
}

/** 保存单题长文草稿；无有效内容时移除该题记录 */
export function saveQuestionDraft(examId, userId, questionId, payload) {
  if (!examId || !questionId) return
  const draft = loadExamDraft(examId, userId)
  if (!draft.answers) draft.answers = {}
  const key = String(questionId)
  if (!payload || !hasDraftFill(payload)) {
    delete draft.answers[key]
  } else {
    draft.answers[key] = {
      quType: payload.quType,
      answer: payload.answer,
      updatedAt: Date.now()
    }
  }
  draft.updatedAt = Date.now()
  if (Object.keys(draft.answers).length === 0) {
    localStorage.removeItem(draftStorageKey(examId, userId))
  } else {
    persistDraft(examId, userId, draft)
  }
}

export function clearExamDraft(examId, userId) {
  if (!examId) return
  localStorage.removeItem(draftStorageKey(examId, userId))
}
