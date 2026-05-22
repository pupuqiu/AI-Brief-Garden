# AI Brief Garden

AI Brief Garden：一个浅色中文 AI 晚报阅读产品，用更克制、更适合长时间浏览的方式重构 Obsidian 里的每日 AI Markdown。

## Run locally

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## 如何启动 AI Brief Garden

```bash
npm run garden
```

默认会使用 `4321` 端口启动，并在成功后自动打开：

```text
http://localhost:4321
```

如果检测到当前环境不允许 `0.0.0.0` 监听，启动脚本会自动回退到 `127.0.0.1` 本地监听。

## 如何关闭

```bash
npm run garden:stop
```

## 如何查看状态

```bash
npm run garden:status
```

## Stack

- Next.js App Router
- React
- Tailwind CSS
- 浅色中文阅读界面

## Current UI

- `/daily/[date]` 晚报浏览页
- `/brief/[id]` 独立文章详情页
- `/api/briefs` 与 `/api/briefs/[id]` 本地读取 Obsidian Markdown
- 左侧固定导航 + 中间文章卡片流
- 米白纸张色、中文杂志感排版、轻阴影卡片
- 基于 Obsidian `_Inbox/YYYY-MM-DD/*.md` 的真实内容读取
