# 在线考试系统 · 前端（Vue 2 + Element UI）

> 本目录是 **Web 管理端 / 学生浏览器端**，并可打包为 **Electron 学生桌面端**。完整业务说明见仓库根目录 [README.md](../README.md)。  
> **维护约定**：修改本目录内会影响启动、路由、页面入口或打包方式的代码时，请同步更新本文（由 Cursor 规则 `readme-sync-frontend.mdc` 自动提醒 Agent）。

---

## 快速启动

### 环境要求

| 软件 | 版本 |
|------|------|
| Node.js | **16 LTS**（不推荐 18+） |
| 后端 | 已启动，默认 http://127.0.0.1:8080 |

### 安装与开发

```bash
cd online-exam-system-frontend
npm install
npm run dev
```

| 项目 | 默认值 |
|------|--------|
| 开发地址 | http://localhost:9527 |
| 登录页 | http://localhost:9527/#/login |
| API 代理 | `/api` → `http://127.0.0.1:8080` |
| WebSocket 代理 | `/websocket` → `ws://127.0.0.1:8080` |

`vue.config.js` 已设置 `devServer.host = '0.0.0.0'`，局域网同学可用 `http://你的IP:9527` 访问（需放行防火墙 9527、8080）。

### 默认测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `admin` | `123456` |
| 教师 | `teacher` | `123456` |
| 学生 | `student` | `123456` |

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 浏览器开发模式 |
| `npm run build:prod` | 生产静态包（`dist/`） |
| `npm run electron:dev` | Electron 桌面调试 |
| `npm run electron:dist` | 打包 Windows `.exe`（产物在 `release/`） |

机考全屏调试：

```bash
npx cross-env EXAM_KIOSK=1 npm run electron:dev
```

---

## 配置说明

### 开发代理

`vue.config.js`：

- 端口默认 **9527**（可用环境变量 `port` 覆盖）
- `/api`、`/websocket` 代理到后端 8080
- `cookieDomainRewrite: ''`：避免局域网访问时 Cookie 因 `Domain=127.0.0.1` 丢失

### 环境变量

| 文件 | 用途 |
|------|------|
| `.env.example` | 浏览器开发模板（复制为 `.env.development.local`，已被 gitignore） |
| `.env.electron.example` | Electron 打包模板（复制为 `.env.electron`） |

打包学生端前编辑 `.env.electron`（主要为加密密钥；API 默认地址也可在此设置）：

```env
VUE_APP_BASE_API=http://你的服务器IP:8080/api
VUE_APP_WS_URL=ws://你的服务器IP:8080/websocket
VUE_APP_CRYPTO_KEY=与后端 EXAM_AES_KEY 一致
VUE_APP_CRYPTO_IV=与后端 EXAM_AES_IV 一致
```

**已安装 exe 后**：优先改安装目录下的 `app-config.json`，不必为改 IP/端口重新 `electron:dist`。

**Web 登录页一键下载**：`npm run electron:dist` 会同步 `public/downloads/student-client.exe` 与 `app-config.json`；再 `npm run build:prod` 部署后，登录页一个按钮会**依次下载两个文件**（非 zip）。仅更新安装包可执行 `npm run sync:client-downloads`。

**部署目录**：`dist/downloads/`（本仓库 `deploy/dist/downloads/`）。详见 `public/downloads/README.md`。

---

## 目录结构

```
online-exam-system-frontend/
├── package.json
├── vue.config.js               # 端口、代理、构建
├── electron/main.js            # 桌面壳、全屏
├── public/template/            # 试题 Excel 导入模板等
└── src/
    ├── main.js                 # 入口、路由守卫、WebSocket
    ├── router/index.js         # 路由与角色权限
    ├── store/                  # Vuex（登录态等）
    ├── api/                    # 与后端 Controller 对应
    ├── views/                  # 页面
    └── utils/request.js        # axios、Token 刷新
```

---

## 主要页面路由

| 路径 | 页面 | 角色 |
|------|------|------|
| `/login` | 登录 | 全部 |
| `/register` | 注册（可选学生/教师/管理员；后两者须邀请码） | 匿名 |
| `/invite-code` | 邀请码管理 | 管理员 |
| `/text-center` | 试卷中心 | 学生 |
| `/prepare-exam` | 准备考试 | 学生 |
| `/start-exam` | 答题（全屏） | 学生 |
| `/exam-management` | 考试管理 | 教师、管理员 |
| `/exam-details/exam-details` | 考试详情（试卷预览 + 缺考名单） | 教师、管理员 |
| `/exam-add` | 创建考试（含「随机抽题」预览与改分） | 教师、管理员 |
| `/questions-management` | 试题管理 | 教师、管理员 |
| `/repo-management` | 题库管理 | 教师、管理员 |
| `/answer-manage` | 阅卷管理 | 教师、管理员 |
| `/answer-show` | 待批阅 / 缺考名单 | 教师、管理员 |
| `/exam-record` | 考试记录（交卷后可见，含待批改） | 学生 |
| `/exam-record-detail` | 考试记录详情（每题得分） | 学生、教师 |
| `/score-analysis` | 成绩分析 | 教师、管理员 |
| `/exercise-center` | 刷题中心 | 学生 |
| `/wrong-book` | 错题本 | 学生 |

完整路由表见 `src/router/index.js`。

---

## 推荐阅读顺序（改代码前）

1. `src/main.js` — 入口与守卫
2. `src/router/index.js` — 权限与菜单
3. `src/utils/request.js` — 请求与 Token
4. `src/store/modules/user.js` — 登录态
5. `src/api/` — 按业务浏览
6. `src/views/exam/` — 考试相关页面
7. `electron/main.js` — 桌面全屏

---

## 打包学生端 .exe

```bash
copy .env.electron.example .env.electron
# 编辑 .env.electron 中的加密密钥等（API 地址也可在此写默认值）
npm run electron:dist
```

产物在 `release/`：

| 文件 | 说明 |
|------|------|
| `*.exe` / `win-unpacked/` | 桌面客户端（**不含** Java 后端） |
| **`app-config.json`**（与 exe 同目录） | **部署后改这个即可**，无需重新打包 |

**portable 单文件 `.exe` 特别说明**：运行时真实进程在临时目录，`app-config.json` 必须放在**你双击的那个 exe 所在文件夹**（electron-builder 通过 `PORTABLE_EXECUTABLE_DIR` 定位）。`electron:dist` 后 `release/` 下也会生成一份示例 `app-config.json` 供复制。

`app-config.json` 示例（模板见 `electron/app-config.example.json`）：

```json
{
  "apiBaseUrl": "http://127.0.0.1:8080/api",
  "wsUrl": "ws://127.0.0.1:8080/websocket"
}
```

改完保存后**刷新客户端页面**（或重启 exe）。仍须先启动后端，并保证学生机能访问上述地址。

---

## 常见问题

### `npm install` 失败

使用 Node 16；可 `nvm use 16` 后删除 `node_modules` 再安装。

### 接口 404 / 跨域

确认后端已启动；开发模式依赖 `vue.config.js` 代理，**勿**把 `VUE_APP_BASE_API` 写成带域名的绝对地址（除非你知道在做什么）。

### WebSocket 已关闭

1. 后端 8080 已启动  
2. 改 `vue.config.js` 后需重启 `npm run dev`  
3. F12 → Network → WS，应看到 `101` 状态

### 富文本 / 选项解析报错

项目固定 `quill@1.3.7`；若异常，删除 `node_modules` 后重新 `npm install`。

### 局域网同学 403 / 验证码失败

确认代理中 `cookieDomainRewrite` 已启用并重启前端；见根 README「让同学在同一局域网访问」。

---

## 技术栈

Vue 2 · Element UI · Vuex · axios · vue-quill-editor · ECharts · Electron

---

*最后更新：2026-05-22*
