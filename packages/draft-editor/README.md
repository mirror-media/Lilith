# [@mirrormedia/lilith-draft-editor](https://www.npmjs.com/package/@mirrormedia/lilith-draft-editor) &middot; ![npm version](https://img.shields.io/npm/v/@mirrormedia/lilith-draft-editor.svg?style=flat)

## Installation

`yarn install`

## Development

`@mirrormedia/lilith-draft-editor` export `@mirrormedia/lilith-core` 所需要的 `RichTextEditor`，而 `@mirrormedia/lilith-core` 則是被 `@mirrormedia/lilith-(mirrormedia|readr|mesh|editools)` 所使用，因此在開發上會以各網站的角度去切入，在本套件中修改 editor 相關的程式碼，並在 lilith-(mirrormedia|readr|mesh|editools) 中測試開發狀況。

舉 lilith-mirrormedia 為例，要修改 mirrormedia 相關的 RichTextEditor 需要在 `packages/lilith-draft-editor` 中進行改動，改動完之後跑 `yarn build` 產生 transpiled 後的程式碼，若 `packages/lilith-draft-editor` 有修改 package.json 中的套件版本時，則需要同時修改 `packages/core` 中 import `@mirrormedia/lilith-draft-editor` 的版本; 同理，若是因此 `packages/core` 有修改版本號的話也需要跑 `yarn build`， `packages/mirrormedia` 也同樣需要修改 import `@mirrormedia/lilith-core` 的版本。

因為 lilith-mirrormedia, lilith-core, lilith-draft-editor 都在 monorepo 中，yarn workspaces 會為 lilith-core, lilith-draft-editor pkg 建立 soft link，將 `node_modules/@mirrormedia/lilith-core` 指到 `packages/core` 而 `node_modules/@mirrormedia/lilith-draft-editor` 指到 `packages/draft-editor`，所以 `yarn build` 產生的新的程式碼，可以不需要透過 npm publish 和 yarn install 的方式，立即讓 lilith-mirrormedia, lilith-core 使用。

等到確定程式碼修改完畢後，我們再將最新的程式碼上傳(`npm publish`)到 npm registry 去，讓 lilith-editools 的 CI/CD 可以下載到最新的版本。

## File Structure

在 `src` 資料夾下有兩大類的檔案

1. 共用的 draft.js 程式碼： 主要是 draft.js button UI, draft-converter 和其他 helper function
2. 各網站客製化的改動：

依照各網站需求修改`src/website/${website}/`中的檔案

- block-renderer : 在既有(注 1)的 block-renderer 上附加可編輯的 wrapper，僅有部分 block renderers 適用
- selector: 依照各網站 keystone list 來調整 photo, video 和 post 的 gql query
- draft-editor: 主要 export 出 RichTextEditor 的檔案，實際使用在 lilith-core 對應的 webiste 中，可直接決定 RichTextEditor 樣式(注 2)

\* 註 1: lilith-draft-editor 各個 buttons 對應的 block-renderers, entity-decorators 會 maintain 在 lilith-draft-renderer，由各網站 Next.js 專案開發人員實作，在本專案中會直接將 lilith-draft-renderer 中定義好的 block-renderers, entity-decorators 直接使用(除了少數需要再編輯的 block-renderer，參考 `src/website/${website}/block-renderer`中的 editor wrapper component)。

\* 註 2: 雖然各個網站都 maintain 了一個 draft-editor，可以自行決定 import 進來的 buttons，不過因為 lilith-core 中實作 disalbedButtons 的功能，所以目前一率將所有的 buttons 加入 RichTextEditor 中，由 lilith-(mirrormedia|readr|mesh|editools) 來控制所使用的 buttons。

## Build

`yarn build`

## Publish

`npm run publish`

在 publish 前，請根據 conventional commits 的規範，將 package.json#version 升版。

## Notable Details
* 元件裡的 `import React from 'react'` 為必要的，避免 babel transpile 後，無法抓取的 react 依賴的問題。
