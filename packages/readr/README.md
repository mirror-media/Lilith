# @mirrormedia/lilith-readr

## Preface
此Repo
- 使用[KeystoneJS 6](https://keystonejs.com/docs)來產生CMS服務。
- 串接 Cloud Build 產生 Docker image 和部署到 Cloud Run 上。

cloud builds:
- []()

cloud runs:
- []()

## Environment Variables
關於 lilith-readr 中使用到哪些環境變數，可以至 [`environment-variables.ts`](https://github.com/mirror-media/Lilith/blob/main/packages/readr/environment-variables.ts) 查看。

## Getting started on local environment
### Start postgres instance
在起 lilith-readr 服務前，需要在 local 端先起 postgres database。
而我們可以透過 [Docker](https://docs.docker.com/) 快速起 postgres database。
在電腦上安裝 Docker 的方式，可以參考 [Docker 安裝文件](https://docs.docker.com/engine/install/)。
安裝 Docker 後，可以執行以下 command 來產生 local 端需要的 postgres 服務。
```
docker run -p 5433:5432 --name lilith-readr -e POSTGRES_PASSWORD=passwd -e POSTGRES_USER=account -e POSTGRES_DB=lilith-readr -d postgres
```

註：
`POSTGRES_PASSWORD`, `POSTGRES_USER` 和 `POSTGRES_DB` 都可更動。
只是要注意，改了後，在起 lilith-readr 的服務時，也要更改傳入的 `DATABASE_URL` 環境變數。

### Install dependencies
我們透過 yarn 來安裝相關套件。
```
yarn install
```

### Start dev instance
確定 postgres 服務起來和相關套件安裝完畢後，可以執行以下 command 來起 lilith-readr 服務
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
起 lilith-readr CMS 服務後，我們可以透過 [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql) 來使用 GraphQL playground。

### MCP endpoint

READr 也在同一個 Keystone/Express process 提供 MCP Streamable HTTP endpoint：`POST /mcp`。
此 endpoint 預設不啟用：只有在環境變數 `IS_MCP_ENABLED` 設為 `true` 的環境才會掛載，所以把程式碼 promote 到 staging/prod 不會自動開放 MCP。未來其他 package 啟用 MCP 時也沿用相同的 flag 慣例。
認證接受兩種方式：OAuth Bearer token（以 token 內的使用者身分執行，並受 scope 限制），或 package 既有的 Keystone session cookie（權限與 Admin UI 相同）。兩種方式最終都以該使用者建立 Keystone session，因此各 list 的 access control 仍由 `context.query` 強制執行。

READr 同時提供 OAuth 2.0 Authorization Code with PKCE endpoints：`GET /oauth/authorize`、`POST /oauth/token`、`POST /oauth/register`（Dynamic Client Registration）。設定 `OAUTH_ISSUER`（公開 HTTPS base URL）與 `OAUTH_SIGNING_SECRET`（至少 32 字元、由 Secret Manager 注入）後才會啟用。CMS 管理員也可直接在 `OAuthClient` list 管理 client：唯一的 client ID、精確的 redirect URI 白名單與可請求 scope。使用者先登入 CMS，再透過 `/oauth/authorize` 授權；client 以 authorization code 與 S256 PKCE verifier 向 `/oauth/token` 交換短效 access token。目前只支援 public client（禁止 client secret），並強制 `code_challenge_method=S256`。

OAuth metadata 位於 `/.well-known/oauth-authorization-server`；MCP 的 protected-resource metadata 位於 `/.well-known/oauth-protected-resource/mcp`。部署時將 `MCP_RESOURCE_URL` 設為外部 MCP endpoint 的完整 canonical URL，`OAUTH_ISSUER` 維持 authorization server 的 canonical URL。

Tools 與所需 scope：`list_recent_posts`、`get_post`、`get_posts`、`search_posts`、`filter_posts`、`convert_to_draftjs` 需要 `readr.posts.read`；`upload_image`、`create_post`、`update_post` 需要 `readr.posts.write`；`publish_post` 需要 `readr.posts.publish`。session cookie 登入者不受 scope 限制（scope 用來限縮第三方 OAuth client，不限縮使用者本人）。`convert_to_draftjs` 可將 Google Docs 匯出或複製的 HTML、Markdown 或純文字轉為 Draft.js Raw Content State，轉換結果可放入 `create_post` / `update_post` 的 `data.content`、`data.summary`、`data.actionList`、`data.citation`。

`upload_image` 接受 JPEG、PNG、WebP 或 GIF 的 base64 字串（或 `data:image/...;base64,...` data URL），解碼後最大 10 MiB；base64 中常見的換行、空白和省略 padding 皆可接受。它會以目前 OAuth/CMS 使用者身分建立 `Photo`，並把檔案交給 Keystone 的 `imageFile` storage；因此既有的 CMS 權限、GCS Fuse 寫入和後續 resize trigger 都會沿用。原圖在寫入成功後即可使用；`resized`／`resizedWebp` URL 則由非同步 resize pipeline 產生，完成前可能回傳 404。Cloud Run 環境必須把 `IMAGES_STORAGE_PATH` 設為 GCS Fuse 的圖片目錄（目前 container mount 為 `/app/gcs`，應設定為 `/app/gcs/images`），否則原檔會被寫入 ephemeral container filesystem。

要讓其他 package 啟用 MCP，請在它們的 `extendExpressApp` 以自己的 `IS_MCP_ENABLED` flag 包住 `createMcpExpressHandler`，並提供該 package 的 context factory、tools 與 `isAuthorized`；transport 一律使用 `@mirrormedia/lilith-mcp` 的實作（獨立小套件、零依賴，不需要動該 package 的 `lilith-core` 版本）。

### Start GraphQL API server only
我們也可以單獨把 lilith-readr 當作 GraphQL API server 使用。
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

## How we upload images
請見[圖片上傳與 resize — 以 openwarehouse-k6 為例](https://paper.dropbox.com/doc/resize-openwarehouse-k6---BgSS7fZlve8ejXyx8NAwLQ0eAg-nEMMAMYOoMLvaaI2bcyBf)。

### Troubleshootings
#### Q1: 我在 `packages/*` 資料夾底下跑 `yarn install` 時，在 `yarn postinstall` 階段發生錯誤。

A1: 如果錯誤訊息與 `@mirrormedia/lilith-core` 有關，可以嘗試先到 `packages/core` 底下，執行
  1. `yarn build`
  2. `yarn install`

確保 local 端有 `@mirrormedia-/lilith-core` 相關的檔案可以讓 `packages/*` 載入。

## Patch

### 目前使用 patch-package 讓 keystone admin UI (keystone-6/core 5.2.0) 可以在手機版進行編輯，該功能已在 keystone-6/core 5.5.1 新增，日後更新 keystone 板上時可移除。
