import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// 入口檔會被各套件的 Admin UI 打包進瀏覽器端，往下載入的檔案若用了
// Node 專用模組（例如 net），Admin UI 會因找不到模組而回 500
// 用 Node 自己的清單，不手寫（例如 zlib、stream、fs/promises 都要算）
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NODE_BUILTINS: string[] = require('module').builtinModules

// 先去掉註解與「只引入型別」的語句（編譯後會被抹掉，不會進打包），
// 再找 from、require(、import( 與只有副作用的 import '...'
const importsOf = (source: string) => {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\b(?:import|export)\s+type\s[^;]*?from\s*['"][^'"]+['"]/g, '')
  return [
    ...code.matchAll(
      /(?:\bfrom|\brequire\s*\(|\bimport\s*\(|\bimport)\s*['"]([^'"]+)['"]/g
    ),
  ].map((m) => m[1])
}

const resolveLocal = (from: string, spec: string) => {
  const base = path.resolve(path.dirname(from), spec)
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.json`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
  ]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate
    }
  }
  // 找不到就明講，不要悄悄略過，不然這個守護會有看不見的缺口
  throw new Error(`找不到 ${spec}（來自 ${path.basename(from)}）`)
}

// 從入口檔往下追所有相對路徑的檔案，回傳用了 Node 專用模組的位置
const findNodeBuiltinImports = (entry: string) => {
  const seen = new Set<string>()
  const offenders: string[] = []

  const visit = (file: string) => {
    if (seen.has(file)) return
    seen.add(file)
    for (const spec of importsOf(fs.readFileSync(file, 'utf8'))) {
      const name = spec.replace(/^node:/, '')
      if (NODE_BUILTINS.includes(name)) {
        offenders.push(`${path.basename(file)} 載入了 ${spec}`)
      } else if (spec.startsWith('.')) {
        visit(resolveLocal(file, spec))
      }
    }
  }
  visit(entry)
  return offenders
}

const fixture = (files: Record<string, string>) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'client-safe-'))
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content)
  }
  return path.join(dir, 'index.ts')
}

test('入口檔往下載入的檔案都沒有用 Node 專用模組', () => {
  assert.deepEqual(
    findNodeBuiltinImports(path.resolve(__dirname, 'index.ts')),
    []
  )
})

test('守護測試本身抓得到:只有副作用的 import 也會被追蹤', () => {
  const entry = fixture({
    'index.ts': "import './b'\n",
    'b.ts': "import { isIP } from 'net'\nexport const x = isIP\n",
  })
  assert.deepEqual(findNodeBuiltinImports(entry), ['b.ts 載入了 net'])
})

test('守護測試本身抓得到:動態 import、export * 與 node: 前綴', () => {
  const entry = fixture({
    'index.ts': "export * from './b'\nconst lazy = () => import('node:zlib')\n",
    'b.ts': "export const y = require ('crypto')\n",
  })
  assert.deepEqual(findNodeBuiltinImports(entry).sort(), [
    'b.ts 載入了 crypto',
    'index.ts 載入了 node:zlib',
  ])
})

test('守護測試本身抓得到:相對路徑找不到檔案時明確報錯,不會悄悄略過', () => {
  const entry = fixture({
    'index.ts': "import './missing'\n",
  })
  assert.throws(() => findNodeBuiltinImports(entry), /找不到/)
})

test('守護測試不誤判:只引入型別的 Node 模組不算', () => {
  const entry = fixture({
    'index.ts': "import type { Socket } from 'net'\nexport type S = Socket\n",
  })
  assert.deepEqual(findNodeBuiltinImports(entry), [])
})
