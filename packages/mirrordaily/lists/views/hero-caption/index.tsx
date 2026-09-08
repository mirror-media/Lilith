/** @jsxRuntime classic */
/** @jsx jsx */

import { useEffect, useRef } from 'react'
import { jsx } from '@keystone-ui/core'
import {
  FieldContainer,
  FieldLabel,
  FieldDescription,
  TextArea,
} from '@keystone-ui/fields'
import type {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types'
import { CellContainer } from '@keystone-6/core/admin-ui/components'
import { fieldFilterManager } from '../shared/fieldFilterManager'

// 對應 cards 選圖時發布的 `${field.path}:label`;heroImage 選圖 → 帶入 heroCaption
const HERO_IMAGE_LABEL_KEY = 'heroImage:label'

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) => {
  // 用 ref 拿最新 onChange,讓訂閱只在掛載時做一次(deps [])
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    // 全域單例 subscribe 當下會重播舊值(可能是上一篇殘留)→ 略過首次,只反應本篇之後的選圖
    let isInitialReplay = true
    const unsubscribe = fieldFilterManager.subscribe(
      HERO_IMAGE_LABEL_KEY,
      (labels) => {
        if (isInitialReplay) {
          isInitialReplay = false
          return
        }
        const label = labels?.[0]
        if (!label) return
        // 換圖一律用新圖名覆蓋圖說(含手打的);跨/同 session 一致
        onChangeRef.current?.(label)
      }
    )
    return unsubscribe
  }, [])

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {field.description && (
        <FieldDescription id={`${field.path}-description`}>
          {field.description}
        </FieldDescription>
      )}
      <TextArea
        id={field.path}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={onChange === undefined}
      />
    </FieldContainer>
  )
}

export const Cell: CellComponent = ({ item, field }) => {
  return <CellContainer>{item[field.path]}</CellContainer>
}

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  )
}

export const controller = (
  config: FieldControllerConfig
): FieldController<string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize: (data) => data[config.path] ?? '',
    // 空字串存成 null(與原生 text 一致),避免 DB 出現 '' vs null 不一致
    serialize: (value) => ({ [config.path]: value === '' ? null : value }),
  }
}
