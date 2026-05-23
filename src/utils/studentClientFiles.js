import { checkPublicAssetExists, resolvePublicAssetUrl } from '@/utils/staticDownload'

export const DEFAULT_CLIENT_BUNDLE = {
  id: 'client-zip',
  path: 'downloads/student-client.zip',
  fileName: '校园在线考试学生端.zip',
  label: '下载压缩包（推荐）'
}

export const DEFAULT_CLIENT_FILES = [
  {
    id: 'client-exe',
    path: 'downloads/student-client.exe',
    fileName: '校园在线考试学生端.exe',
    label: '下载安装包',
    buttonType: 'primary',
    required: true
  },
  {
    id: 'app-config',
    path: 'downloads/app-config.json',
    fileName: 'app-config.json',
    label: '下载配置文件',
    buttonType: 'default',
    required: true
  }
]

export async function loadStudentClientManifest() {
  try {
    const href = resolvePublicAssetUrl('downloads/downloads.manifest.json')
    const res = await fetch(href, { credentials: 'same-origin' })
    if (res.ok) {
      const data = await res.json()
      if (data && (data.bundle || (Array.isArray(data.files) && data.files.length))) {
        return {
          title: data.title || '学生端桌面客户端',
          bundle: data.bundle || DEFAULT_CLIENT_BUNDLE,
          files: data.files && data.files.length ? data.files : DEFAULT_CLIENT_FILES
        }
      }
    }
  } catch (e) {
    console.warn('[studentClientFiles] manifest 读取失败', e)
  }
  return {
    title: '学生端桌面客户端',
    bundle: DEFAULT_CLIENT_BUNDLE,
    files: DEFAULT_CLIENT_FILES
  }
}

export async function probeStudentClientDownloads(manifest) {
  const m = manifest || {}
  const availability = {}
  const bundle = m.bundle || DEFAULT_CLIENT_BUNDLE
  if (bundle && bundle.path) {
    availability[bundle.id] = await checkPublicAssetExists(bundle.path)
  }
  const files = m.files || DEFAULT_CLIENT_FILES
  await Promise.all(
    files.map(async (item) => {
      availability[item.id] = await checkPublicAssetExists(item.path)
    })
  )
  return availability
}
