import { parseImageUrls } from '@/utils/imageUrls'

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * 简答题参考答案展示：以 content 为主（可含 Quill 内嵌图），若仍有旧版「答案附图」列则拼在末尾。
 */
export function saqReferenceDisplayHtml(option) {
  if (!option) return ''
  let html = option.content || ''
  const urls = parseImageUrls(option.image)
  if (urls.length && !/<img\s/i.test(html)) {
    html += urls.map((u) => `<p><img src="${escapeAttr(u)}"></p>`).join('')
  }
  return html
}

/**
 * 编辑简答题时：把旧版单独存的答案附图合并进 content，并清空 image，避免与富文本重复。
 */
export function mergeLegacySaqOptionImageIntoContent(option) {
  if (!option) return
  const urls = parseImageUrls(option.image)
  if (!urls.length) return
  const c = option.content || ''
  if (/<img\s/i.test(c)) {
    option.image = ''
    return
  }
  const suffix = urls.map((u) => `<p><img src="${escapeAttr(u)}"></p>`).join('')
  option.content = c + suffix
  option.image = ''
}
