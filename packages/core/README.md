# [@mirrormedia/lilith-core](https://www.npmjs.com/package/@mirrormedia/lilith-core) &middot; ![npm version](https://img.shields.io/npm/v/@mirrormedia/lilith-core.svg?style=flat)

## Installation

`yarn install`

## Development

`@mirrormedia/lilith-core` 被 `@mirrormedia/lilith-(vision|mesh|editools)` 所依賴，因此，在開發 lilith-core 的程式碼時，
可以透過 lilith-(vision|mesh|editools) 來協助開發。

舉 lilith-editools 為例，
我們可以先起 lilith-editools server，接著修改 lilith-core 的程式碼，
修改到一個階段，想要測試，便在 `packages/core` 底下跑 `yarn build`，產生新的 transpiled 程式碼。
因為 lilith-editools 和 lilith-core 都在 monorepo 中，yarn workspaces 會為 lilith-core pkg 建立 soft link，
將 `node_modules/@mirrormedia/lilith-core` 指到 `packages/core`，所以 `yarn build` 產生的新的程式碼，
可以不需要透過 npm publish 和 yarn install 的方式，立即讓 lilith-editools 使用。
等到確定程式碼修改完畢後，我們再將最新的程式碼上傳(`npm publish`)到 npm registry 去，讓 lilith-editools 的 CI/CD 可以下載到最新的版本。

### After v1.2.6

使用 `@mirrormedia/lilith-core` 的 richTextEditor 時，需要帶入 `website` 的參數以便 `@mirrormedia/lilith-core` 引用的對應網站的 draft-editor 版本，
在新增 keystone 的情況下，可以暫時填入既有的 `website` 值先快速建立，日後若有需求可以再另外新增 website 在 `@mirrormedia/lilith-core`, `@mirrormedia/lilith-draft-editor` 和 `@mirrormedia/lilith-renderer` 中。

## Build

`yarn build`

## Publish

`npm run publish`

在 publish 前，請根據 conventional commits 的規範，將 package.json#version 升版。

## Notable Details

### For those files under `views/` folder, we transpile them specifically.

For those files under `views/` folder, we transpile them by babel according to different configuation.
The specific babel configuration is `.views.babelrc.js`.
In `.views.babelrc.js`, we tell babel not to transpile `import` and `export` es6 codes into commonJS codes.
The Keystone server won't start server well if those files under `views/` are transpiled into commonJS codes.
