/** @jsxRuntime classic */
/** @jsx jsx */

// eslint-disable-next-line
import { jsx } from '@keystone-ui/core'
import { useEffect, useState } from 'react'
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields'
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types'
import { fieldFilterManager } from '../shared/fieldFilterManager'
import { TagSelect } from './TagSelect'

const ROW_COUNT = 6
const MAX_TEXT_LENGTH = 6
const CN_NUMBERS = ['一', '二', '三', '四', '五', '六']

type Row = { tagId: string | null; text: string }
type Value = Row[]

// 計算字數：中文一個字算一個（以 code point 計）
function textLength(text: string): number {
  return Array.from(text).length
}

// 把任意來源的 json 正規化成固定 6 列
function normalize(raw: unknown): Value {
  const rows: Value = []
  for (let i = 0; i < ROW_COUNT; i++) {
    const r = Array.isArray(raw)
      ? (raw[i] as Partial<Row> | undefined)
      : undefined
    rows.push({
      tagId: r && typeof r.tagId === 'string' ? r.tagId : null,
      text: r && typeof r.text === 'string' ? r.text : '',
    })
  }
  return rows
}

function filledCount(rows: Value): number {
  return rows.filter((r) => r.tagId || r.text.trim()).length
}

/**
 * Topic「group 標籤」欄位：固定 6 組「標籤＋對應文字(限6字)」。
 * 訂閱 fieldFilterManager 的 'topicType'，只有 group 時才顯示。
 */
export const Field = ({
  field,
  value,
  onChange,
}: FieldProps<typeof controller>) => {
  const [topicType, setTopicType] = useState<string | null>(
    fieldFilterManager.getCurrentValues('topicType')[0] ?? null
  )

  useEffect(() => {
    const unsubscribe = fieldFilterManager.subscribe('topicType', (values) => {
      setTopicType(values[0] ?? null)
    })
    return unsubscribe
  }, [])

  // 型態不是 group 時整塊不顯示
  if (topicType !== 'group') return null

  const rows = value
  const readOnly = onChange === undefined

  const updateRow = (idx: number, patch: Partial<Row>) => {
    if (!onChange) return
    onChange(rows.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
  }

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <div css={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {rows.map((row, idx) => {
          return (
            <div
              key={idx}
              css={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                columnGap: 24,
              }}
            >
              <div>
                <div
                  css={{
                    color: '#d6002b',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {`標籤${CN_NUMBERS[idx]}`}
                </div>
                <TagSelect
                  value={row.tagId}
                  isDisabled={readOnly}
                  placeholder="Select..."
                  // 互斥：排除其他格已選的 Tag
                  excludeIds={rows
                    .filter((r, i) => i !== idx && r.tagId)
                    .map((r) => r.tagId as string)}
                  onChange={(id) => updateRow(idx, { tagId: id })}
                />
              </div>
              <div>
                <div
                  css={{
                    color: '#d6002b',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {`對應文字${CN_NUMBERS[idx]}(限${MAX_TEXT_LENGTH}字)`}
                </div>
                <TextInput
                  value={row.text}
                  disabled={readOnly}
                  placeholder="請輸入文字"
                  onChange={(e) => {
                    const next = e.target.value
                    // 硬限制：超過上限就不寫入（打不進去）
                    if (textLength(next) <= MAX_TEXT_LENGTH) {
                      updateRow(idx, { text: next })
                    }
                  }}
                />
                <div css={{ fontSize: 12, marginTop: 4, color: '#999' }}>
                  {`${textLength(row.text)}/${MAX_TEXT_LENGTH}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </FieldContainer>
  )
}

export const Cell: CellComponent = ({ item, field }) => {
  const count = filledCount(normalize(item[field.path]))
  return <div css={{ textAlign: 'left' }}>{count ? `${count} 組` : ''}</div>
}

export const CardValue: CardValueComponent = ({ item, field }) => {
  const count = filledCount(normalize(item[field.path]))
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <div>{count ? `${count} 組` : '—'}</div>
    </FieldContainer>
  )
}

export const controller = (
  config: FieldControllerConfig
): FieldController<Value, Value> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: normalize(null),
    deserialize: (data) => normalize(data[config.path]),
    // 全空時存 null，避免 DB 留下 6 筆空物件
    serialize: (value) => ({
      [config.path]: filledCount(value) > 0 ? value : null,
    }),
  }
}
