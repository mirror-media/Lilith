# @mirrormedia/lilith-vision

## Preface

此 Repo

- 使用[KeystoneJS 6](https://keystonejs.com/docs)來產生 CMS 服務。
- 串接 Cloud Build 產生 Docker image 和部署到 Cloud Run 上。

cloud builds:

- [lilith-vision-dev](https://console.cloud.google.com/cloud-build/triggers;region=global/edit/cc6f0aa7-87dc-4b01-8a45-3a09785a93f8?project=arctic-signer-341307)
- [lilith-vision-staging](https://console.cloud.google.com/cloud-build/triggers;region=global/edit/379c4f27-2495-4b20-bf07-72dfba441b20?project=arctic-signer-341307)
- [lilith-vision-prod](https://console.cloud.google.com/cloud-build/triggers;region=global/edit/379c4f27-2495-4b20-bf07-72dfba441b20?project=arctic-signer-341307)

cloud runs:

- [vision-cms-dev](https://console.cloud.google.com/run/detail/asia-east1/vision-cms-dev?project=arctic-signer-341307)
- [vision-cms-staging](https://console.cloud.google.com/run/detail/asia-east1/vision-cms-staging?project=arctic-signer-341307)
- [vision-cms-prod](https://console.cloud.google.com/run/detail/asia-east1/vision-cms-prod?project=arctic-signer-341307)
- [vision-gql-dev](https://console.cloud.google.com/run/detail/asia-east1/vision-gql-dev?project=arctic-signer-341307)
- [vision-gql-staging](https://console.cloud.google.com/run/detail/asia-east1/vision-gql-staging?project=arctic-signer-341307)
- [vision-gql-prod](https://console.cloud.google.com/run/detail/asia-east1/vision-gql-prod?project=arctic-signer-341307)
- [vision-preview-gql-dev](https://console.cloud.google.com/run/detail/asia-east1/vision-preview-gql-dev?project=arctic-signer-341307)
- [vision-preview-gql-staging](https://console.cloud.google.com/run/detail/asia-east1/vision-preview-gql-staging?project=arctic-signer-341307)
- [vision-preview-gql-prod](https://console.cloud.google.com/run/detail/asia-east1/vision-preview-gql-prod?project=arctic-signer-341307)

## Environment Variables

關於 lilith-vision 中使用到哪些環境變數，可以至 [`environment-variables.ts`](https://github.com/mirror-media/Lilith/blob/main/packages/vision/environment-variables.ts) 查看。

## Getting started on local environment

### Start postgres instance

在起 lilith-vision 服務前，需要在 local 端先起 postgres database。
而我們可以透過 [Docker](https://docs.docker.com/) 快速起 postgres database。
在電腦上安裝 Docker 的方式，可以參考 [Docker 安裝文件](https://docs.docker.com/engine/install/)。
安裝 Docker 後，可以執行以下 command 來產生 local 端需要的 postgres 服務。

```
docker run -p 5433:5432 --name lilith-vision -e POSTGRES_PASSWORD=passwd -e POSTGRES_USER=account -e POSTGRES_DB=lilith-vision -d postgres
```

註：
`POSTGRES_PASSWORD`, `POSTGRES_USER` 和 `POSTGRES_DB` 都可更動。
只是要注意，改了後，在起 lilith-vision 的服務時，也要更改傳入的 `DATABASE_URL` 環境變數。

### Install dependencies

我們透過 yarn 來安裝相關套件。

```
yarn install
```

### Start dev instance

確定 postgres 服務起來和相關套件安裝完畢後，可以執行以下 command 來起 lilith-vision 服務

```
yarn dev
// or
npm run dev
```

如果你的 database 的設定與上述不同，
可以透過 `DATABASE_URL` 環境變數傳入。

```
DATABASE_URL=postgres://anotherAccount:anotherPasswd@localhost:5433/anotherDatabase yarn dev
// or
DATABASE_URL=postgres://anotherAccount:anotherPasswd@localhost:5433/anotherDatabase npm run dev
```

成功將服務起來後，使用瀏覽器打開 [http://localhost:3000](http://localhost:3000)，便可以開始使用 CMS 服務。

### GraphQL playground

起 lilith-vision CMS 服務後，我們可以透過 [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql) 來使用 GraphQL playground。

### Start GraphQL API server only

我們也可以單獨把 lilith-vision 當作 GraphQL API server 使用。
透過傳入 `IS_UI_DISABLED` 環境變數，我們可以把 CMS WEB UI 的部分關閉，只留下 GraphQL endpoint `/api/graphql`。

```
IS_UI_DISABLED=true npm run dev
```

### Access control

透過 `npm run dev` 起服務時，預設是起 CMS 的服務，所以我們必須是登入的狀態下，才能使用 GraphQL endpoint `http://localhost:3000/api/graphql`。
若是在登出的狀態下，我們是無法使用 GraphQL API 的。

除了 `cms` 權限控管模式，我們可以使用 `ACCESS_CONTROL_STRATEGY` 環境變數來切換不同的 GraphQL API 權限控管的模式。
例如：

```
ACCESS_CONTROL_STRATEGY=gql npm run dev
```

切換成 `gql` 模式後，GraphQL API server 就不會檢查使用者是否處於登入的狀態（意即 GraphQL API server 會處理所有的 requests）。
注意：`gql` 模式的使用上，需要搭配「不允許外部網路的限制」來部署程式碼，以免門戶大開。

在 local 端會需要 `gql` 模式的情境如下：
我想在 local 端開發 [vision-nuxt](https://github.com/visionproject-org-tw/vision-nuxt)時，搭配 local 的 lilith-vision 當作 GraphQL API server。
vision-nuxt 若是搭配 `cms` 模式的 lilith-vision，會遇到 authentication 的問題，因為 vision-nuxt 並沒有使用 headless 的登入方式取得 authentication token。

## How we build rich text editor

（待補充）

## How we do db migrations

（待補充）

## How we build preview server

lilith-vision 有提供「draft 文章（Post）預覽」的功能，文章預覽的功能有以下幾個需求：

1. 有 ACL （Access Control List）管理，使用者必須有觀看權限才能預覽
2. 文章頁必須使用 [visionproject-org-tw/vision-nuxt](https://github.com/visionproject-org-tw/vision-nuxt) 來呈現
3. 文章頁的內容要拿最新的檔案，不要使用 cache 的版本

註：
接下來會用到

- lilith-vision
- lilith-vision-gql
- lilith-vision-preview-gql
- vision-nuxt
- preview-vision-nuxt
  等名詞。它們皆是透過 Cloud Run 部署在我們系統中的一項服務。

lilith-vision, lilith-vision-gql 和 lilith-vision-preview-gql 皆部署 `@mirror-media/lilith-vision` 程式碼，
其不同點僅在於環境變數設定不同。

vision-nuxt 和 preview-vision-nuxt 是部署 `visionproject-org-tw/vision-nuxt` 程式碼，它們之間的不同也單單是環境變數的不同。

接下透過圖解來簡單說明

### 1. lilith-vision （KeystoneJS 6）（CMS）如何管理使用者權限？

下圖一用簡易的圖表說明 KeystoneJS 6（以下簡稱 K6）如何管理使用者瀏覽 CMS 上任何資源的權限。

<img src="https://user-images.githubusercontent.com/3000343/182289771-fddb5c93-d3e9-4ee4-93c4-ceee4999102c.jpg" width="50%">
圖一：K6 透過 Authentication/Authorization layer 來實作 ACL。

在創建使用者時，我們都會賦予使用者身份，而身份代表了使用者在 K6 中的權限。
當使用者登入 CMS 後，對於 K6 server 發送的 requests，都會經過 K6 的 Authentication/Authorization layer，
Authentication/Authorization layer 會比對 requests 上的 cookies 和 database 中該使用者的身份，
來判斷該 requests 是否可以順利通過 Authentication/Authorization layer。

註：
lilith-vision 即是透過 K6 架構出來的 CMS 服務。

### 2. nuxt-vision （FE）為何拿不到 `draft`（尚未發布）的文章？

下圖二的圖表說明 lilith-vision-gql 如何保護 `draft`（尚未發布）的文章，不讓前端（vision-nuxt）可以 query 到。

<img src="https://user-images.githubusercontent.com/3000343/182289779-7ec4b57e-66c4-4d70-ba52-e7270e187a91.jpg" width="50%">
圖二：lilith-vision-gql 阻擋使用者 query `draft` 文章。

當 K6 的環境變數 `ACCESS_CONTROL_STRATEGY` 為 `gql` 時，任何 query draft 文章的 request 都會被擋下來。
所以 vision-nuxt 會回傳 404 頁面不存在。

註：
lilith-vision-gql 和 lilith-vision 不同，前者僅提供 GraphQL API，而後者提供 GraphQL API 和 Web UI （CMS）服務。

### 3. 如何部署、設定 lilith-vision, previwe-nuxt-vision 和 lilith-vision-preview-gql 來達到文章預覽功能？

下圖三的圖表說明我們如何部署、設定環境變數和在 K6 上新增 route 來 proxy requests 到 preview-vision-nuxt 上。

<img src="https://user-images.githubusercontent.com/3000343/182289774-2fc36adc-a65c-4c88-acca-2edeabc1a9d0.jpg" width="50%">
圖三：透過 lilith-vision, preview-vision-nuxt,  lilith-vision-preview-gql 的部署來實現文章預覽功能。

文章預覽的需求 1 有提到「使用者必須有觀看權限才能瀏覽文章」，此部分是透過 K6 的 Authentication/Authorization layer 來幫忙把關。
當使用者要預覽文章，該 request 會先進入 K6 server，驗證使用者身份，若有權限，該 request 才會被 bypass 和 proxy 到 preview-vision-nuxt 上。
（實作細節請見 `keystone.ts` 中的 `extendExpressApp` 設定，在該設定中，我們有新增 routes 來幫忙 proxy request）

preview-vision-nuxt 會向 lilith-vision-preview-gql query draft 文章，因為 lilith-vision-preview-gql 的 `ACCESS_CONTROL_STRATEGY` 環境變數被設定為 `preview`，
代表 lilith-vision-preview-gql 不會阻擋 draft 文章的 query。
lilith-vision-preview-gql 回傳 draft 文章給 preview-vision-nuxt，preview-vision-nuxt 根據 draft 文章內容 render 給使用者。

註：
為了區別外部使用者和內部使用者使用的系統，我們有部署

- preview-vision-nuxt，其功能與 vision-nuxt 僅差別 GQL 打的 endpoint 不同
- lilith-vision-preview-gql 僅提供 GraphQL endpoint，且 `ACCESS_CONTROL_STRATEGY` 環境變數被設定為 `preview`，讓 draft 文章可以被 query

## How we upload images

請見[圖片上傳與 resize — 以 openwarehouse-k6 為例](https://paper.dropbox.com/doc/resize-openwarehouse-k6---BgSS7fZlve8ejXyx8NAwLQ0eAg-nEMMAMYOoMLvaaI2bcyBf)。

### Troubleshootings

#### Q1: 我在 `packages/(vision|mesh|editools)` 資料夾底下跑 `yarn install` 時，在 `yarn postinstall` 階段發生錯誤。

A1: 如果錯誤訊息與 `@mirrormedia/lilith-core` 有關，可以嘗試先到 `packages/core` 底下，執行

1. `yarn build`
2. `yarn install`

確保 local 端有 `@mirrormedia-/lilith-core` 相關的檔案可以讓 `packages/(vision|mesh|editools)` 載入。

## Patch

### 目前使用 patch-package 讓 keystone admin UI (keystone-6/core 5.2.0) 可以在手機版進行編輯，該功能已在 keystone-6/core 5.5.1 新增，日後更新 keystone 板上時可移除。
