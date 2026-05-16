/**
 * 教师录入的富文本解析（Quill HTML）在展示前做轻量清理，降低 XSS 风险。
 * 不引入 DOMPurify 以控制依赖；内容来源为教师/管理员账号。
 */
export function sanitizeRichHtml(html) {
  if (html == null || html === '') return ''
  let s = String(html)
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  s = s.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  s = s.replace(/\s(on\w+)\s*=\s*(['"])[\s\S]*?\2/gi, '')
  s = s.replace(/\s(on\w+)\s*=\s*[^\s>]+/gi, '')
  return s
}
