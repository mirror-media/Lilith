# @mirrormedia/lilith-vision

## Preface
此Repo
- 使用[KeystoneJS 6](https://keystonejs.com/docs)來產生CMS服務。
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
（待補充）

## How we upload images
請見[圖片上傳與 resize — 以 openwarehouse-k6 為例](https://paper.dropbox.com/doc/resize-openwarehouse-k6---BgSS7fZlve8ejXyx8NAwLQ0eAg-nEMMAMYOoMLvaaI2bcyBf)。

### Troubleshootings
#### Q1: 我在 `packages/(vision|mesh|editools)` 資料夾底下跑 `yarn install` 時，在 `yarn postinstall` 階段發生錯誤。

A1: 如果錯誤訊息與 `@mirrormedia/lilith-core` 有關，可以嘗試先到 `packages/core` 底下，執行
  1. `yarn build`
  2. `yarn install`

確保 local 端有 `@mirrormedia-/lilith-core` 相關的檔案可以讓 `packages/(vision|mesh|editools)` 載入。
