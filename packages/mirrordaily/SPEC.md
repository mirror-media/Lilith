# SPEC.md — mirrordaily

> Package-specific spec for `packages/mirrordaily`. See root [SPEC.md](../../SPEC.md) for monorepo-wide architecture.

## Overview

Mirror Daily 的 CMS，基於 KeystoneJS 6。服務鏡週刊日報內容管理，包含即時新聞、遊戲與熱門標籤追蹤，並整合流量分析 Dashboard。

- **Port**: 3003
- **Migrations**: 46

---

## Lists

| List | Purpose |
| --- | --- |
| `Audio` | 音檔 |
| `Category` | 文章分類 |
| `Contact` | 聯絡資訊 |
| `EditorChoice` | 編輯精選 |
| `Event` | 活動 |
| `External` | 外部連結文章 |
| `Game` | 遊戲內容 |
| `Group` | 群組 |
| `Header` | 頁首設定 |
| `HotNews` | 熱門新聞 |
| `Partner` | 合作夥伴 |
| `PopularTag` | 熱門標籤 |
| `Post` | 文章 |
| `PromoteTopic` | 推薦主題 |
| `Section` | 版區 |
| `Tag` | 標籤 |
| `Topic` | 專題 |
| `User` | 使用者 |
| `Video` | 影片 |
| `Warning` | 警告/敏感內容標記 |

---

## Storage

| Key | Route | Path | Purpose |
| --- | --- | --- | --- |
| `files` | `/files` | `public/files` | 一般檔案上傳 |
| `images` | `/images` | `public/images` | 圖片上傳 |
| `videos` | `/video-files` | `public/video-files` | 影片上傳 |

Max upload size: **8 GB**

---

## Express Mini-Apps

| Mini-app | Condition | Protected paths | File |
| --- | --- | --- | --- |
| Preview proxy | `ACL.CMS` only | `/preview-server/*` | `express-mini-apps/preview/app.js` |
| Dashboard proxy | `ACL.CMS` only | `/dashboard/*` | `express-mini-apps/dashboard/app.js` |

---

## Key Environment Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `ACCESS_CONTROL_STRATEGY` | `cms` | `cms` / `gql` / `preview` |
| `GCS_BUCKET` | `static-vision-tw-dev` | GCS bucket for media |
| `PREVIEW_SERVER_ORIGIN` | — | Preview server URL |
| `PREVIEW_SERVER_PATH` | — | Preview server path prefix |
| `DASHBOARD_SERVER_ORIGIN` | `https://traffic-analytics-web-dev-...` | 流量分析 Dashboard 服務 URL |
| `DASHBOARD_SERVER_PATH` | — | Dashboard path prefix |
| `YOUTUBE_API_KEY` | — | YouTube Data API 金鑰 |
| `TOPIC_SERVICE_API` | — | Topic 服務 API |
| `TOPIC_SERVICE_URL` | — | Topic 服務 URL |
| `PROMOTE_TOPIC_SERVICE_URL` | — | PromoteTopic 推薦服務 API |
| `VIDEOS_BASE_URL` | — | 影片基礎 URL |
| `VIDEOS_STORAGE_PATH` | — | 影片儲存路徑 |
| `IS_CACHE_ENABLED` | `false` | 啟用 Apollo Redis cache |
| `REDIS_SERVER` | — | Redis URL |
| `CACHE_IDENTIFIER` | — | Redis cache namespace |
| `CACHE_MAXAGE` | — | Cache max-age (seconds) |
| `CACHE_CONNECT_TIMEOUT` | — | Redis 連線逾時 (ms) |

---

## Access Control

- 使用 `ACL` enum：`GraphQL = 'gql'`、`CMS = 'cms'`、`Preview = 'preview'`
- 策略由 `ACCESS_CONTROL_STRATEGY` 控制
- Roles：`admin`, `moderator`, `editor`, `contributor`

---

## Notable Features

### SEO / Crawler Protection
所有 response 自動加上 `X-Robots-Tag: noindex, nofollow, noimageindex` header；CMS 模式下同時提供 `robots.txt`（封鎖所有爬蟲）。

### Dashboard Mini-App
`/dashboard/*` 反向代理至流量分析服務（`DASHBOARD_SERVER_ORIGIN`），讓編輯在 CMS 內直接查看文章流量數據。僅 `ACL.CMS` 策略下啟用。

### Unique Content Types
- `Game`：遊戲內容管理
- `Warning`：敏感內容警告標記
- `HotNews`：熱門新聞排序
- `PopularTag`：熱門標籤追蹤

### Large Payload Support
JSON body parser 上限設為 **8 GB**，支援大型影音檔案上傳。
