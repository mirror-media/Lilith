# Ly-Budget

立法院預算管理系統

## 功能概述

本系統用於管理立法院預算相關資料，包含以下主要功能：

### 核心資料管理
- **屆期管理** (Term): 管理立法院各屆期資料
- **委員會管理** (Committee): 管理各委員會及其成員
- **立法委員管理** (People): 管理立委及黨團資料
- **政府部會管理** (Government): 管理政府各部會資料

### 預算管理
- **預算書管理** (Budget): 管理政府預算書資料
- **會議管理** (Meeting): 管理預算審議相關會議
- **提案管理** (Proposal): 管理立委提案單

### 圖像辨識
- **辨識圖檔** (RecognitionImage): 管理會議相關圖檔
- **辨識狀態** (RecognitionStatus): 管理圖像辨識結果

## 技術架構

- **Keystone 6**: 後端 CMS 框架
- **PostgreSQL**: 資料庫
- **TypeScript**: 開發語言
- **Docker**: 容器化部署

## 開發環境設置

1. 安裝依賴：
```bash
yarn install
```

2. 設置環境變數：
```bash
cp .env.example .env
# 編輯 .env 文件設定資料庫連線等參數
```

3. 啟動開發伺服器：
```bash
yarn dev
```

## 部署

使用 Docker 進行部署：

```bash
docker build -t ly-budget .
docker run -p 3000:3000 ly-budget
```

## 資料庫遷移

```bash
yarn db-migrate
```

## 權限管理

系統包含以下角色：
- **admin**: 完整管理權限
- **moderator**: 內容管理權限
- **editor**: 編輯權限
- **contributor**: 貢獻者權限
