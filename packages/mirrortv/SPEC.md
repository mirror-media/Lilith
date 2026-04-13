# SPEC.md — mirrortv

> Package-specific spec for `packages/mirrortv`. See root [SPEC.md](../../SPEC.md) for monorepo-wide architecture.

## Overview

Mirror TV 的 CMS，基於 KeystoneJS 6。服務 MNews（鏡新聞）電視媒體內容管理，包含影音內容與頻道節目。

- **Port**: 3004
- **Migrations**: 27

---

## Lists

| List | Purpose |
| --- | --- |
| `ArtShow` | 藝文節目 |
| `Audio` | 音檔 |
| `Category` | 文章分類 |
| `Contact` | 聯絡資訊 |
| `Download` | 下載項目 |
| `EditLog` | 編輯紀錄 |
| `EditorChoice` | 編輯精選 |
| `Event` | 活動 |
| `External` | 外部連結文章 |
| `Image` | 圖片 |
| `Partner` | 合作夥伴 |
| `Post` | 文章 |
| `PromoteTopic` | 推薦主題 |
| `PromotionVideo` | 推廣影片 |
| `Sale` | 銷售/廣告 |
| `Section` | 版區 |
| `Serie` | 系列 |
| `Show` | 節目 |
| `Sponsor` | 贊助商 |
| `Tag` | 標籤 |
| `Topic` | 專題 |
| `User` | 使用者 |
| `Video` | 影片 |
| `VideoEditorChoice` | 影片編輯精選 |

---

## Storage

| Key | Route | Path | Purpose |
| --- | --- | --- | --- |
| `files` | `/files` | `public/files` | 一般檔案上傳 |
| `images` | `/images` | `public/images` | 圖片上傳（受 auth 保護） |
| `videos` | `/video-files` | `public/video-files` | 影片上傳 |

Max upload size: **8 GB**

---

## Express Mini-Apps

| Mini-app | Condition | Protected paths | File |
| --- | --- | --- | --- |
| Image auth | 永遠啟用 | `/images/*` | `express-mini-apps/images/app.js` |
| Preview proxy | `ACL.CMS` only | `/preview-server/*` | `express-mini-apps/preview/app.js` |

> **重要**：Image auth mini-app 必須在 Keystone storage static middleware 之前註冊（在 `extendExpressApp` 中完成）。未登入請求回傳 `401 Unauthorized`。

---

## Key Environment Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `ACCESS_CONTROL_STRATEGY` | `cms` | `cms` / `gql` / `preview` / `restricted` |
| `GCS_BUCKET` | `v2-static-mnews-tw-dev` | GCS bucket for media |
| `PREVIEW_SERVER_ORIGIN` | — | Preview server URL |
| `PREVIEW_SERVER_PATH` | — | Preview server path prefix |
| `YOUTUBE_API_KEY` | — | YouTube Data API 金鑰 |
| `TOPIC_SERVICE_API` | — | Topic 服務 API |
| `DOMAIN_URL` | — | 服務網域 URL |
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

### Image Auth (Protected Static Files)
`/images/*` 路徑需要有效的 Keystone session（已登入使用者），保護電視媒體圖片資產不被未授權存取。詳見根層級 SPEC.md 的 [mirrortv: Image Auth Middleware](../../SPEC.md#mirrortv-image-auth-middleware) 段落。

### Video Duration Worker
啟動時執行 `startVideoWorker`，背景處理影片時長計算。

### YouTube Integration
透過 `YOUTUBE_API_KEY` 整合 YouTube Data API，供影片資料同步使用。

### Large Payload Support
JSON body parser 上限設為 **8 GB**，支援大型影音檔案上傳。
