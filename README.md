# Lilith

### Monorepo setup
This is a monorepo containing sub-packages:
- [@mirrormedia/lilith-core](https://github.com/mirror-media/lilith/tree/main/packages/core): see `packages/core`
- [@mirrormedia/lilith-vision](https://github.com/mirror-media/lilith/tree/main/packages/vision): see `packages/vision`
- [@mirrormedia/lilith-mesh](https://github.com/mirror-media/lilith/tree/main/packages/mesh): see `packages/mesh`
- [@mirrormedia/lilith-editools](https://github.com/mirror-media/lilith/tree/main/packages/vision): see `packages/editools`

This monorepo adopts `husky`, `lint-staged` and `yarn workspaces`. 
`husky` and `lint-staged` will 
1. run eslint for needed sub-packages before `git commit`

`yarn workspaces` will install dependencies of all the sub-packages wisely and effienciently.

### Development
Before modifying sub-packages' source codes, make sure you install dependencies on root. 
We need `husky` and `lint-staged` installed first.

### Installation
`yarn install`

### Troubleshootings
#### Q1: 我在 root 資料夾底下跑 `yarn install` 時，在 `yarn postinstall` 階段發生錯誤。

A1: 如果錯誤訊息與 `@mirrormedia/lilith-core` 有關，可以嘗試先到 `packages/core` 底下，執行
  1. `yarn build`
  2. `yarn install`

確保 local 端有 `@mirrormedia-/lilith-core` 相關的檔案可以讓 `packages/(vision|mesh|editools)` 載入。
