# 学生端下载（Web）

## 管理员

```bash
npm run electron:dist
npm run build:prod
```

部署 `dist/` → 本仓库多为 `deploy/dist/`。登录页右上角或顶栏「学生端下载」进入说明页并自动下载：

- `/downloads/student-client.exe`
- `/downloads/app-config.json`

## app-config.json 字段

| 字段 | 说明 |
|------|------|
| `apiBaseUrl` | 后端 API，如 `http://IP:8080/api` |
| `wsUrl` | WebSocket |
| `minioBaseUrl` | 题图走 MinIO 时必填，与后端 `minio.endpoint` 一致（学生机须能访问） |

本地存储题图（`/api/upload/files/...`）可不填 MinIO，仅保证 `apiBaseUrl` 正确。

## Nginx 部署题图（可选）

浏览器访问且题图为 `http://内网:9000/...` 时，可在 nginx 增加 MinIO 反代，或让学生只用桌面 exe 并配置 `minioBaseUrl`。
