# SPEC.md — readr

> Package-specific spec for `packages/readr`. See root [SPEC.md](../../SPEC.md) for monorepo-wide architecture.

## Overview

Readr 的 CMS，基於 KeystoneJS 6。服務 Readr 調查報導平台，聚焦於專題、計畫、協作內容管理，並使用 memory-based caching（非 Redis）。

- **Port**: 3000
- **Migrations**: 23

---

## Lists

| List | Purpose |
| --- | --- |
| `Audio` | 音檔 |
| `Author` | 作者資料 |
| `Award` | 獎項 |
| `Category` | 文章分類 |
| `Collaboration` | 協作項目 |
| `Data` | 資料集 |
| `EditorChoice` | 編輯精選 |
| `Feature` | 功能/特色 |
| `Gallery` | 圖片集 |
| `Image` | 圖片 |
| `NoteCategory` | 備註分類 |
| `PageVariable` | 頁面變數（可設定的全站變數） |
| `Post` | 文章 |
| `Project` | 專案/計畫 |
| `ProjectChecklist` | 專案待辦清單 |
| `ProjectNote` | 專案備註 |
| `Quote` | 引言（記者語錄等） |
| `Tag` | 標籤 |
| `User` | 使用者 |
| `Video` | 影片 |

---

## Storage

| Key | Route | Path | Purpose |
| --- | --- | --- | --- |
| `files` | `/files` | `public/files` | 一般檔案上傳 |
| `images` | `/images` | `public/images` | 圖片上傳（含 GCS fallback URL） |

Max upload size: **50 MB**（JSON body parser 上限，遠小於其他 package）

GCS image base URL 由 `GCS_BASE_URL` 設定（預設：`https://statics-readr-tw-dev.readr.tw`）。

---

## Express Mini-Apps

無。Readr 不使用 express-mini-apps 目錄，preview 路由直接在 `keystone.ts` 中定義。

### Preview Routes（直接掛載於 keystone.ts）

| Route | Proxy Target | Notes |
| --- | --- | --- |
| `/story/:id` | Preview Nuxt server | 文章預覽 |
| `/event/:slug` | Preview Nuxt server | 活動預覽 |
| `/news/:id` | Preview Nuxt server | 新聞預覽 |

預覽時移除 `Cache-Control` header，確保草稿內容不被快取。

---

## Key Environment Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `ACCESS_CONTROL_STRATEGY` | `cms` | `cms` / `gql` / `preview` |
| `GCS_BUCKET` | `static-vision-tw-dev` | GCS bucket for media |
| `GCS_BASE_URL` | `https://statics-readr-tw-dev.readr.tw` | GCS 圖片基礎 URL |
| `PREVIEW_SERVER_ORIGIN` | — | Preview server URL |
| `MEMORY_CACHE_TTL` | `300000` | In-memory cache TTL (ms) |
| `MEMORY_CACHE_SIZE` | `300` | In-memory cache 最大項目數 |

> **注意**：Readr 使用 **in-memory cache**，不使用 Redis。

---

## Access Control

- 使用 `utils.accessControl` from `@mirrormedia/lilith-core`（模式與其他 package 相同）
- Roles：`admin`, `moderator`, `editor`, `contributor`
- 使用獨立的 `config.ts`（其他 package 通常使用 `environment-variables.ts`）

---

## Notable Features

### Memory-Based Caching
使用本地 in-memory cache（非 Redis），以 `MEMORY_CACHE_TTL`（ms）和 `MEMORY_CACHE_SIZE`（項目數）控制。適合低流量或不需跨實例共享快取的場景。

### Project / Collaboration Content Types
Readr 特有的調查報導工作流程支援：
- `Project` + `ProjectChecklist` + `ProjectNote`：計畫管理
- `Collaboration`：多方協作項目
- `Quote`：記者引言收藏
- `Award`：得獎紀錄
- `PageVariable`：全站可設定變數（動態頁面配置）

### Proxy-Based Preview Architecture
Preview 路由直接代理至 Nuxt preview server，並強制清除 Cache-Control header，確保編輯看到最新草稿。
