/**
 * electron:dist 完成后同步 public/downloads/：
 * - 配置来源：electron/app-config.deploy.json（部署用，优先）→ app-config.example.json
 * - 松散文件：student-client.exe、app-config.json
 * - 压缩包：student-client.zip
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const releaseDir = path.join(root, 'release')
const deployConfig = path.join(root, 'electron', 'app-config.deploy.json')
const exampleConfig = path.join(root, 'electron', 'app-config.example.json')
const publicDownloads = path.join(root, 'public', 'downloads')

function resolveConfigSource() {
  if (fs.existsSync(deployConfig)) {
    return deployConfig
  }
  if (fs.existsSync(exampleConfig)) {
    return exampleConfig
  }
  throw new Error('未找到 electron/app-config.deploy.json 或 app-config.example.json')
}

function loadArchiver() {
  try {
    return require('archiver')
  } catch (e) {
    throw new Error(
      '缺少 archiver 依赖，请在 online-exam-system-frontend 目录执行: npm install',
      { cause: e }
    )
  }
}

function buildZip(archiver, exePath, exeName, configPath, zipDest) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipDest)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => resolve(archive.pointer()))
    archive.on('error', reject)
    output.on('error', reject)

    archive.pipe(output)
    archive.file(exePath, { name: exeName })
    archive.file(configPath, { name: 'app-config.json' })
    archive.finalize()
  })
}

async function main() {
  const configSource = resolveConfigSource()
  const configText = fs.readFileSync(configSource, 'utf8')

  fs.mkdirSync(publicDownloads, { recursive: true })

  const publicConfig = path.join(publicDownloads, 'app-config.json')
  fs.writeFileSync(publicConfig, configText, 'utf8')
  console.log('[sync-client-downloads] 配置来源:', path.relative(root, configSource))
  console.log('[sync-client-downloads] 已写入 public/downloads/app-config.json')

  if (!fs.existsSync(releaseDir)) {
    console.warn('[sync-client-downloads] 未找到 release/，跳过 exe 与 zip（请先 npm run electron:dist）')
    process.exit(0)
  }

  const exes = fs
    .readdirSync(releaseDir)
    .filter((f) => f.endsWith('.exe') && !/setup/i.test(f))

  if (!exes.length) {
    console.warn('[sync-client-downloads] release/ 下无 portable exe，仅发布配置文件')
    process.exit(0)
  }

  const releaseConfig = path.join(releaseDir, 'app-config.json')
  fs.writeFileSync(releaseConfig, configText, 'utf8')
  console.log('[sync-client-downloads] 已写入 release/app-config.json（exe 同目录）')

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
    '[sync-client-downloads] 已复制:',
    portableExe.name,
    '-> public/downloads/student-client.exe',
    `(${(fs.statSync(exeDest).size / 1024 / 1024).toFixed(1)} MB)`
  )

  const archiver = loadArchiver()
  const zipDest = path.join(publicDownloads, 'student-client.zip')
  const bytes = await buildZip(archiver, exeSrc, portableExe.name, publicConfig, zipDest)
  console.log(
    '[sync-client-downloads] 已生成压缩包:',
    zipDest,
    `(${(bytes / 1024 / 1024).toFixed(1)} MB)`
  )
}

main().catch((err) => {
  console.error('[sync-client-downloads] 失败:', err.message || err)
  process.exit(1)
})
