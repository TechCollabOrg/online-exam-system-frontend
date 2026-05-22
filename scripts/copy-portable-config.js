/**
 * electron:dist 完成后：
 * 1. release/ 下生成 app-config.json（portable exe 旁）
 * 2. public/downloads/ 同步 app-config.json 与 student-client.exe（Web 登录页一键下载两个文件）
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const releaseDir = path.join(root, 'release')
const example = path.join(root, 'electron', 'app-config.example.json')
const publicDownloads = path.join(root, 'public', 'downloads')

if (!fs.existsSync(releaseDir)) {
  process.exit(0)
}

const exampleText = fs.readFileSync(example, 'utf8')
fs.mkdirSync(publicDownloads, { recursive: true })

fs.writeFileSync(path.join(publicDownloads, 'app-config.json'), exampleText, 'utf8')
console.log('[sync-client-downloads] 已更新 public/downloads/app-config.json')

const exes = fs
  .readdirSync(releaseDir)
  .filter((f) => f.endsWith('.exe') && !/setup/i.test(f))

if (!exes.length) {
  console.warn('[sync-client-downloads] release/ 下未找到 portable exe，Web 端仅可下载配置文件')
  process.exit(0)
}

const releaseConfig = path.join(releaseDir, 'app-config.json')
if (!fs.existsSync(releaseConfig)) {
  fs.writeFileSync(releaseConfig, exampleText, 'utf8')
  console.log('[sync-client-downloads] 已写入 release/app-config.json')
}

const portableExe = exes
  .map((name) => ({
    name,
    size: fs.statSync(path.join(releaseDir, name)).size
  }))
  .sort((a, b) => b.size - a.size)[0]

const exeSrc = path.join(releaseDir, portableExe.name)
const exeDest = path.join(publicDownloads, 'student-client.exe')
fs.copyFileSync(exeSrc, exeDest)
console.log(
  '[sync-client-downloads] 已复制安装包:',
  portableExe.name,
  '-> public/downloads/student-client.exe',
  `(${(fs.statSync(exeDest).size / 1024 / 1024).toFixed(1)} MB)`
)
