# [@mirrormedia/lilith-draft-renderer](https://www.npmjs.com/package/@mirrormedia/lilith-draft-renderer) &middot; ![npm version](https://img.shields.io/npm/v/@mirrormedia/lilith-draft-renderer.svg?style=flat)

## Introduction

本套件是由 `@mirrormedia/lilith-draft-editor` 將其 maintain 的 buttons 對應的 block renderers 和 entity decorators 的邏輯 decouple，
以應用在 Next.js 專案以及 CMS 上。

## Installation

`yarn install`

## Development

在開發順序上，一開始各網站會有一套 default 的 block renderers 和 entity decorators，這些預設的 components 將會被 export 給 lilith-draft-editor 使用並在 CMS 上呈現出各 button 新增的 content。

## For Next.js to use

在各網站開發時，工程師將因應設計將會針對 block renderers 和 entity decorators 修改樣式，因此會在各個網站的資料夾中修改網站專屬的 block renderers 和 entity decorators，這個套件將直接用在該 Next.js 專案上，當作 React component 直接使用，只要帶入 CMS 上拿到的 draft.js 相關的 contentBlock 的資料即可呈現樣式。

除了 block renderers 和 entity decorators 等檔案可以針對 block type 修改之外，built-in 的 draft.js block type 可以透過 `src/website/${website}/draft-renderer.tsx`中的 styled-components `DraftEditorWrapper` 中的 css 來修改

```
  /* Draft built-in buttons' style */
  .public-DraftStyleDefault-header-two {
  }
  .public-DraftStyleDefault-header-three {
  }
  .public-DraftStyleDefault-header-four {
  }
  .public-DraftStyleDefault-blockquote {
  }
  .public-DraftStyleDefault-ul {
  }
  .public-DraftStyleDefault-unorderedListItem {
  }
  .public-DraftStyleDefault-ol {
  }
  .public-DraftStyleDefault-orderedListItem {
  }
  /* code-block */
  .public-DraftStyleDefault-pre {
  }
```

修改完成後修改 package version, 跑 `yarn build` 和 `npm publish` 即可以發布新版套件並在 Next.js 中 `yarn install` 使用。

### For CMS to use

在特定網站的 block renderers 和 entity decorators 改動之後，為了保持 CMS 上的 draft-editorn 所見即所得呈現和 Next.js 端同樣的樣式，
在完成 `npm publish` 後需要到 `packages/draft-editor` 去更新 `@mirrormedia/lilith-draft-renderer` 的版本，並依照該套件的 README.md 的指示在該網站的 CMS 中測試。

## File Structure

在 `src` 資料夾下有兩大類的檔案

1. 共用的 draft.js 程式碼： 主要是 draft.js button UI, draft-converter 和其他 helper function
2. 各網站客製化的改動：

依照各網站需求修改`src/website/${website}/`中的檔案

- block-renderer : 在既有(注 1)的 block-renderer 上附加可編輯的 wrapper，僅有部分 block renderers 適用
- selector: 依照各網站 keystone list 來調整 photo, video 和 post 的 gql query
- draft-editor: 主要 export 出 RichTextEditor 的檔案，實際使用在 lilith-core 對應的 webiste 中，可直接決定 RichTextEditor 樣式(注 2)

\*注 1: lilith-draft-editor 各個 buttons 對應的 block-renderers, entity-decorators 會 maintain 在 lilith-draft-renderer，由各網站 Next.js 專案開發人員實作，在本專案中會直接將 lilith-draft-renderer 中定義好的 block-renderers, entity-decorators 直接使用(除了少數需要再編輯的 block-renderer，參考 `src/website/${website}/block-renderer`中的 editor wrapper component)。

\*注 2: 雖然各個網站都 maintain 了一個 draft-editor，可以自行決定 import 進來的 buttons，不過因為 lilith-core 中實作 disalbedButtons 的功能，所以目前一率將所有的 buttons 加入 RichTextEditor 中，由 lilith-(mirrormedia|readr|mesh|editools) 來控制所使用的 buttons。

## Build

`yarn build`

## Publish

`npm run publish`

在 publish 前，請根據 conventional commits 的規範，將 package.json#version 升版。

## Notable Details
