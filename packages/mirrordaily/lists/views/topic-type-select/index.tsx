/** @jsxRuntime classic */
/** @jsx jsx */

// eslint-disable-next-line
import { jsx } from '@keystone-ui/core'
import { useEffect } from 'react'
import { FieldContainer, FieldLabel, Select } from '@keystone-ui/fields'
import { FieldProps } from '@keystone-6/core/types'
import { controller } from '@keystone-6/core/fields/types/select/views'
import { fieldFilterManager } from '../shared/fieldFilterManager'

// 只覆寫 Field 加廣播，controller/Cell/CardValue 沿用 select 預設（Keystone 自動 merge）

/**
 * Topic「型態」欄位：值變動時把型態廣播給 fieldFilterManager（key: 'topicType'），
 * 讓 groupTags 欄位能即時依是否為 group 決定顯示與否。
 */
export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) => {
  const selected = value.value

  // 廣播目前型態給 groupTags 欄位
  useEffect(() => {
    fieldFilterManager.updateField(
      'topicType',
      selected ? [selected.value] : []
    )
  }, [selected?.value])

  // unmount 時清掉殘留，避免下一頁 groupTags 讀到上一頁的 topicType 而閃爍
  useEffect(() => {
    return () => fieldFilterManager.updateField('topicType', [])
  }, [])

  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      <Select
        id={field.path}
        isClearable
        autoFocus={autoFocus}
        isDisabled={onChange === undefined}
        options={field.options}
        value={selected}
        onChange={(option) => onChange?.({ ...value, value: option })}
      />
    </FieldContainer>
  )
}
