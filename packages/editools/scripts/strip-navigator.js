// Node 21+ 內建全域 navigator,lottie-web 會誤判成瀏覽器、在載入時存取 document,
// 使 Node 24 下 keystone 崩潰(ReferenceError: document is not defined)。
// 伺服器端移除 navigator,讓它走非瀏覽器路徑(等同 Node <=20)。
try {
  Object.defineProperty(globalThis, 'navigator', {
    value: undefined,
    configurable: true,
  })
} catch {
  try {
    delete globalThis.navigator
  } catch {
    /* 兩種方式都失敗就放著,不影響啟動 */
  }
}
