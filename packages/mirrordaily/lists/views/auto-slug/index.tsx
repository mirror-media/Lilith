/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core'
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields'
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types'
import { useEffect } from 'react'

// 生成 unique ID 的函數（使用 YYYYMMDDHHMM + 隨機毫秒數）
function generateUniqueId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const randomMs = Math.floor(Math.random() * 1000)
  
  return `${year}${month}${day}${hour}${minute}${randomMs}`
}

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) => {
  // 在創建模式下，如果值為空，自動生成 ID
  useEffect(() => {
    if (!value) {
      onChange?.(generateUniqueId())
    }
  }, []) // 只在組件掛載時執行一次

  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      <TextInput
        id={field.path}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="自動生成的 unique ID（可修改）"
      />
    </FieldContainer>
  )
}

export const Cell = ({ item, field }: { item: any; field: any }) => {
  const value = item[field.path]
  if (!value) return null
  return <div css={{ textAlign: 'left' }}>{value}</div>
}

export const CardValue = ({ item, field }: { item: any; field: any }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <div>{item[field.path]}</div>
    </FieldContainer>
  )
}

export const controller = (
  config: FieldControllerConfig
): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize: (data) => data[config.path] ?? '',
    serialize: (value) => ({ [config.path]: value }),
  }
}

