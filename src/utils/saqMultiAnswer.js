/**
 * 多格简答题：作答在接口中以 JSON 数组 ["第1空","第2空"] 存储；单空题为普通字符串（兼容旧数据）。
 */
export function packSaqAnswer(parts) {
  if (!parts || parts.length === 0) return ''
  if (parts.length === 1) return (parts[0] || '').trim()
  return JSON.stringify(parts.map((p) => (p == null ? '' : String(p))))
}

export function unpackSaqAnswer(raw, slotCount) {
  const n = Math.max(1, slotCount || 1)
  const empty = () => Array.from({ length: n }, () => '')
  if (raw == null || raw === '') return empty()
  const t = String(raw).trim()
  if (t.startsWith('[')) {
    try {
      const arr = JSON.parse(t)
      if (!Array.isArray(arr)) {
        const out = empty()
        out[0] = t
        return out
      }
      const out = empty()
      for (let i = 0; i < n; i++) {
        out[i] = arr[i] != null ? String(arr[i]) : ''
      }
      return out
    } catch (e) {
      const out = empty()
      out[0] = t
      return out
    }
  }
  const out = empty()
  out[0] = t
  return out
}
