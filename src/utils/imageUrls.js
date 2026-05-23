/**
 * 题干 / 选项等多张图片在库中存为一条字符串，使用 unlikely-in-URL 的分隔符拼接。
 * 旧数据为单 URL 时不含该串，parse 后仍为单元素数组。
 */
import { resolveMediaUrl } from '@/utils/resolveMediaUrl'

export const MULTI_IMAGE_SEP = '###'

export function parseImageUrls(str) {
  if (str == null || str === '') return []
  if (typeof str !== 'string') return []
  return str
    .split(MULTI_IMAGE_SEP)
    .map((s) => resolveMediaUrl(s.trim()))
    .filter(Boolean)
}

export function joinImageUrls(urls) {
  if (!urls || !urls.length) return ''
  return urls.filter(Boolean).join(MULTI_IMAGE_SEP)
}
