import { parseImageUrls } from '@/utils/imageUrls'

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * 接口或列表行里题干字段：优先 content，否则部分页面使用 title。
 */
export function questionStemRowText(row) {
  if (!row) return ''
  const c = row.content
  if (c != null && String(c).trim() !== '') return String(c)
  const t = row.title
  return t != null ? String(t) : ''
}

/**
 * 题干展示：以 content（或 title）为主，可含 Quill 内嵌图；
 * 若仍有旧版「试题图片」且正文中无 img，则把附图 URL 拼在末尾。
 */
export function questionStemDisplayHtml(row) {
  let html = questionStemRowText(row)
  const urls = parseImageUrls(row.image)
  if (urls.length && !/<img\s/i.test(html)) {
    html += urls.map((u) => `<p><img src="${escapeAttr(u)}"></p>`).join('')
  }
  return html
}

/**
 * 编辑试题时：把旧版单独存的「试题图片」合并进题干 content，并清空 image，避免与富文本重复。
 */
export function mergeLegacyQuestionImageIntoContent(row) {
  if (!row) return
  const urls = parseImageUrls(row.image)
  if (!urls.length) return
  const c = row.content != null ? String(row.content) : ''
  if (/<img\s/i.test(c)) {
    row.image = ''
    return
  }
  const suffix = urls.map((u) => `<p><img src="${escapeAttr(u)}"></p>`).join('')
  row.content = c + suffix
  row.image = ''
}

/**
 * 题干是否「有内容」：纯文本、内嵌图片或非空 HTML 均视为已填写（Quill 空内容为 <p><br></p> 等）。
 */
export function questionStemHasMeaningfulContent(html) {
  if (html == null) return false
  const s = String(html).trim()
  if (!s) return false
  if (/<img\s/i.test(s)) return true
  const text = s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u200b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 0
}

/** 列表页题干摘要：去掉 HTML 标签 */
export function questionStemPlainSummary(row, maxLen = 100) {
  const raw = questionStemRowText(row)
  let s = String(raw).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (s.length > maxLen) s = s.slice(0, maxLen) + '…'
  return s || '—'
}
