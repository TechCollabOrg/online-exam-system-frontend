import { checkPublicAssetExists, resolvePublicAssetUrl } from '@/utils/staticDownload'

export const DEFAULT_CLIENT_FILES = [
  {
    id: 'client-exe',
    path: 'downloads/student-client.exe',
    fileName: '校园在线考试学生端.exe',
    label: '下载 Windows 安装包',
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
      if (data && Array.isArray(data.files) && data.files.length) {
        return data
      }
    }
  } catch (e) {
    console.warn('[studentClientFiles] manifest 读取失败', e)
  }
  return {
    title: '学生端桌面客户端',
    files: DEFAULT_CLIENT_FILES
  }
}

export async function probeStudentClientFiles(files) {
  const list = files || DEFAULT_CLIENT_FILES
  const availability = {}
  await Promise.all(
    list.map(async (item) => {
      availability[item.id] = await checkPublicAssetExists(item.path)
    })
  )
  return availability
}

export function canDownloadStudentClient(files, availability) {
  return (files || DEFAULT_CLIENT_FILES)
    .filter((f) => f.required !== false)
    .every((f) => availability[f.id])
}
