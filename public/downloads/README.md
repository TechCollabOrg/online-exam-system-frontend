# 学生端下载（Web）

## 预置配置写在哪？

**改这个文件（部署用，会打进下载与 exe 旁配置）：**

`online-exam-system-frontend/electron/app-config.deploy.json`

```json
{
  "apiBaseUrl": "http://你的服务器IP:8080/api",
  "wsUrl": "ws://你的服务器IP:8080/websocket",
  "minioBaseUrl": "http://你的服务器IP:9000"
}
```

本地开发模板（不参与部署复制）：`electron/app-config.example.json`

## 生成下载文件

```bash
cd online-exam-system-frontend
npm install          # 确保有 archiver，否则 zip 不会生成
npm run electron:dist
npm run build:prod
```

脚本会生成：

- `public/downloads/app-config.json`（来自 deploy 配置）
- `public/downloads/student-client.exe`
- `public/downloads/student-client.zip`

若只有 json 没有 zip：看终端是否报 `archiver` 或 `release/` 无 exe；可单独执行 `npm run sync:client-downloads`（需已有 release 里的 exe）。

## 部署

将 `dist/downloads/` 拷到 nginx 根目录（如 `deploy/dist/downloads/`）。
