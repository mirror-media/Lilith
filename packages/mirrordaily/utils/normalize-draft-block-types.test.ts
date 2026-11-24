import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeWrapperBlockTypes } from './normalize-draft-block-types'

const block = (type: string, text = '前言') => ({
  key: `k-${type}`,
  text,
  type,
  depth: 0,
  inlineStyleRanges: [],
  entityRanges: [],
  data: {},
})

test('article and section blocks become unstyled', () => {
  const raw = {
    blocks: [block('article'), block('section')],
    entityMap: {},
  }
  const result = normalizeWrapperBlockTypes(raw)
  assert.deepEqual(
    result.blocks.map((b) => b.type),
    ['unstyled', 'unstyled']
  )
})

test('other block types are left untouched', () => {
  const types = [
    'unstyled',
    'header-two',
    'header-three',
    'atomic',
    'blockquote',
    'unordered-list-item',
  ]
  const raw = { blocks: types.map((t) => block(t)), entityMap: {} }
  const result = normalizeWrapperBlockTypes(raw)
  assert.deepEqual(
    result.blocks.map((b) => b.type),
    types
  )
})

test('everything except the type of wrapper blocks is preserved', () => {
  const raw = {
    blocks: [
      {
        ...block('article', '輝達'),
        inlineStyleRanges: [{ offset: 0, length: 2, style: 'BOLD' }],
        data: { textAlign: 'center' },
      },
    ],
    entityMap: { 0: { type: 'LINK', mutability: 'MUTABLE', data: {} } },
  }
  const result = normalizeWrapperBlockTypes(raw)
  assert.deepEqual(result.blocks[0], {
    ...raw.blocks[0],
    type: 'unstyled',
  })
  assert.deepEqual(result.entityMap, raw.entityMap)
})

test('the input is not mutated', () => {
  const raw = { blocks: [block('article')], entityMap: {} }
  normalizeWrapperBlockTypes(raw)
  assert.equal(raw.blocks[0].type, 'article')
})

test('a draft without wrapper blocks is returned unchanged', () => {
  const raw = { blocks: [block('unstyled')], entityMap: {} }
  assert.deepEqual(normalizeWrapperBlockTypes(raw), raw)
})

test('non-draft values are returned as they are', () => {
  assert.equal(normalizeWrapperBlockTypes(null), null)
  assert.equal(normalizeWrapperBlockTypes(undefined), undefined)
  assert.equal(normalizeWrapperBlockTypes('text'), 'text')
  assert.deepEqual(normalizeWrapperBlockTypes({}), {})
  assert.deepEqual(normalizeWrapperBlockTypes({ blocks: 'x' }), { blocks: 'x' })
})

test('blocks that are not objects are kept as they are', () => {
  const raw = { blocks: [null, 'x', block('article')], entityMap: {} }
  const result = normalizeWrapperBlockTypes(raw) as typeof raw
  assert.equal(result.blocks[0], null)
  assert.equal(result.blocks[1], 'x')
  assert.equal((result.blocks[2] as ReturnType<typeof block>).type, 'unstyled')
})
