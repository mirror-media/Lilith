# SPEC.md — mirrormedia

> Package-specific spec for `packages/mirrormedia`. See root [SPEC.md](../../SPEC.md) for monorepo-wide architecture.

## Overview

Mirror Media 週刊的 CMS，基於 KeystoneJS 6。服務 Mirror Media 主站內容管理。

- **Port**: 3000
- **Migrations**: 58

---

## Lists

| List | Purpose |
| --- | --- |
| `Announcement` | 公告訊息 |
| `AnnouncementScope` | 公告顯示範圍 |
| `Audio` | 音檔 |
| `Category` | 文章分類 |
| `Contact` | 聯絡資訊 |
| `EditorChoice` | 編輯精選 |
| `Event` | 活動 |
| `External` | 外部連結文章 |
| `Group` | 群組 |
| `Header` | 頁首設定 |
| `Image` | 圖片 |
| `Magazine` | 雜誌 |
| `Partner` | 合作夥伴 |
| `Post` | 文章 |
| `PromoteTopic` | 推薦主題 |
| `PromoteVideo` | 推薦影片 |
| `Section` | 版區 |
| `Tag` | 標籤 |
| `Topic` | 專題 |
| `User` | 使用者 |
| `Video` | 影片 |

---

## Storage

| Key | Route | Path | Purpose |
| --- | --- | --- | --- |
| `files` | `/files` | `public/files` | 一般檔案上傳 |
| `images` | `/images` | `public/images` | 圖片上傳 |

Max upload size: **2 GB**

---

## Express Mini-Apps

| Mini-app | Condition | Protected paths | File |
| --- | --- | --- | --- |
| Preview proxy | `ACL.CMS` only | `/preview-server/*` | `express-mini-apps/preview/app.js` |

---

## Key Environment Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `ACCESS_CONTROL_STRATEGY` | `cms` | `cms` / `gql` / `preview` |
| `GCS_BUCKET` | `static-vision-tw-dev` | GCS bucket for media |
| `PREVIEW_SERVER_ORIGIN` | — | Preview server URL |
| `PREVIEW_SERVER_PATH` | — | Preview server path prefix |
| `PROMOTE_TOPIC_SERVICE_URL` | — | PromoteTopic 推薦服務 API |
| `DATA_SERVICE_API` | — | 資料服務 API |
| `INVALID_CDN_CACHE_SERVER_URL` | — | CDN cache invalidation endpoint |
| `AUTO_TAGGING` | `false` | 自動標籤功能開關 |
| `AUTO_FAQ_POST` | `false` | Post 自動 FAQ 開關 |
| `AUTO_FAQ_EXTERNAL` | `false` | External 自動 FAQ 開關 |
| `IS_CACHE_ENABLED` | `false` | 啟用 Apollo Redis cache |
| `REDIS_SERVER` | — | Redis URL |
| `CACHE_IDENTIFIER` | `weekly-cms` | Redis cache namespace |
| `CACHE_MAXAGE` | — | Cache max-age (seconds) |
| `CACHE_CONNECT_TIMEOUT` | — | Redis 連線逾時 (ms) |

---

## Access Control

- 使用 `utils.accessControl` from `@mirrormedia/lilith-core`
- 策略由 `ACCESS_CONTROL_STRATEGY` 控制：`cms`（預設）/ `gql` / `preview`
- Roles：`admin`, `moderator`, `editor`, `contributor`
- **Editor 特例**：list query 只看自己的 Post；mutation / 單筆查詢可看所有 Post

---

## Notable Features

### Extended GraphQL
新增 `allPostsForRelation` 與 `allPostsForRelationCount` 自訂查詢，繞過存取控制過濾，供 relation field 選單使用。

### Apollo Server Caching
當 `ACCESS_CONTROL_STRATEGY=gql` 且 `IS_CACHE_ENABLED=true` 時，掛載 Redis-based Apollo response cache plugin。

### Login Logging
整合 login logging plugin，記錄每次登入事件。

### Large Payload Support
JSON body parser 上限設為 **500 MB**。
