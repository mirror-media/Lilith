# SPEC.md — mesh

> Package-specific spec for `packages/mesh`. See root [SPEC.md](../../SPEC.md) for monorepo-wide architecture.

## Overview

Mesh 的 CMS，基於 KeystoneJS 6。服務 Mesh 社群媒體平台，是 monorepo 中功能最複雜的 package，包含 ActivityPub federation、會員系統、貨幣化功能與內容協作。

- **Port**: 3000
- **Migrations**: 59（最多）

---

## Lists

### 內容

| List | Purpose |
| --- | --- |
| `Story` | 故事/文章 |
| `StoryType` | 故事類型 |
| `Collection` | 收藏集 |
| `CollectionMember` | 收藏集成員 |
| `CollectionPick` | 收藏精選 |
| `Pick` | 單篇精選 |
| `Comment` | 留言 |
| `Podcast` | Podcast 內容 |
| `Category` | 分類 |
| `Tag` | 標籤 |
| `Image` | 圖片 |
| `Announcement` | 公告 |

### 會員與帳號

| List | Purpose |
| --- | --- |
| `Member` | 會員 |
| `User` | 使用者（CMS 後台） |
| `Publisher` | 出版商/媒體方 |
| `InvitationCode` | 邀請碼 |
| `InvalidName` | 禁用名稱清單 |
| `AccountDiscovery` | 帳號探索設定 |
| `AccountMapping` | 帳號對應（聯合登入） |
| `AccountSyncTask` | 帳號同步任務 |

### ActivityPub Federation

| List | Purpose |
| --- | --- |
| `ActivityPubActor` | AP Actor 實體 |
| `Activity` | AP Activity |
| `InboxItem` | AP Inbox 項目 |
| `OutboxItem` | AP Outbox 項目 |
| `FederationInstance` | 聯合實例 |
| `FederationConnection` | 聯合連線 |

### 貨幣化

| List | Purpose |
| --- | --- |
| `Transaction` | 交易紀錄 |
| `Revenue` | 收益 |
| `Statement` | 對帳單 |
| `Sponsorship` | 贊助關係 |
| `Exchange` | 兌換紀錄 |

### 社群互動

| List | Purpose |
| --- | --- |
| `Notify` | 通知 |
| `Activity` | 活動/動態 |
| `ReportReason` | 檢舉原因 |
| `ReportRecord` | 檢舉紀錄 |
| `Policy` | 政策（服務條款、隱私權） |

---

## Storage

| Key | Route | Path | Purpose |
| --- | --- | --- | --- |
| `files` | `/files` | `public/files` | 一般檔案上傳 |
| `images` | `/images` | `public/images` | 圖片上傳 |

Max upload size: **2 GB**

---

## Express Mini-Apps

Preview mini-app 已在 `keystone.ts` 中定義但**已停用**（被 comment out）。Mesh 主要透過 GraphQL API 直接提供資料。

---

## Key Environment Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `ACCESS_CONTROL_STRATEGY` | `cms` | `cms` / `gql` / `preview` |
| `GCS_BUCKET` | `static-mesh-tw-dev` | GCS bucket for media |
| `PREVIEW_SERVER_ORIGIN` | — | Preview server URL |
| `MEMORY_CACHE_TTL` | — | In-memory cache TTL (ms) |
| `MEMORY_CACHE_SIZE` | — | In-memory cache 最大項目數 |
| `IS_CACHE_ENABLED` | `false` | 啟用 Apollo Redis cache |
| `REDIS_SERVER` | — | Redis URL |
| `CACHE_IDENTIFIER` | — | Redis cache namespace |
| `CACHE_MAXAGE` | — | Cache max-age (seconds) |
| `CACHE_CONNECT_TIMEOUT` | — | Redis 連線逾時 (ms) |

---

## Access Control

- 使用 `utils.accessControl` from `@mirrormedia/lilith-core`
- Roles：`admin`, `moderator`, `editor`, `contributor`
- 部分敏感欄位（Story 內文、API 資料）使用自訂 access token 檢查

---

## Notable Features

### ActivityPub Federation
完整實作 ActivityPub 協議，支援去中心化社群互動：
- `ActivityPubActor`、`Activity`、`InboxItem`、`OutboxItem` 管理 AP 訊息流
- `FederationInstance` / `FederationConnection` 管理跨實例聯合

### 帳號聯合（Account Federation）
- `AccountDiscovery`：帳號探索設定
- `AccountMapping`：聯合登入帳號對應
- `AccountSyncTask`：跨平台帳號同步背景任務

### 貨幣化系統
完整的金流管理：Transaction → Revenue → Statement → Sponsorship → Exchange，支援出版商訂閱與贊助模式。

### 雙層快取策略
同時支援 **in-memory cache**（`MEMORY_CACHE_TTL` / `MEMORY_CACHE_SIZE`）與 **Redis cache**（`IS_CACHE_ENABLED` / `REDIS_SERVER`），可依部署環境選用。

### 內容審核
- `ReportReason` + `ReportRecord`：用戶檢舉系統
- `InvalidName`：禁用名稱清單
- `Policy`：服務條款與隱私權政策管理
