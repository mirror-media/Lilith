/** @jsxRuntime classic */
/** @jsx jsx */

import { useState, useEffect, useRef } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from '@keystone-ui/core'
import {
  FieldContainer,
  FieldDescription,
  FieldLabel,
  Select,
} from '@keystone-ui/fields'
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types'
import { CellContainer } from '@keystone-6/core/admin-ui/components'
import { useList } from '@keystone-6/core/admin-ui/context'

import { fieldFilterManager } from '../../shared/fieldFilterManager'
import { useDialogScope } from '../../shared/useDialogScope'

type Option = { label: string; value: string }
type SelectValue = string | null

type SelectController = FieldController<SelectValue, string> & {
  options: Option[]
  listKey: string
}

/**
 * 核心驗證邏輯 (SSOT)
 * 判斷是否應該阻擋儲存：state 為已發布/預約發布，且 sections 或 categories 其中一個沒有值
 */
function checkBlocked(
  stateValue: SelectValue,
  sLen: number,
  cLen: number
): boolean {
  if (stateValue !== 'published' && stateValue !== 'scheduled') return false
  return sLen === 0 || cLen === 0
}

export const Field = ({
  field,
  value,
  onChange,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const [showModal, setShowModal] = useState(false)
  const { anchorRef, scopedKey } = useDialogScope()

  // 頁面底部 toolbar 主按鈕的文字：編輯頁為「Save changes」，新建頁為「Create <單數名>」(例如 Create Post)
  // 用精準比對，才不會誤攔 cards 欄位的內嵌建立鈕(例如 heroImage 的「Create Photo」)
  const localList = useList((field as SelectController).listKey)
  const primaryActionLabelsRef = useRef<string[]>([])
  primaryActionLabelsRef.current = [
    'Save changes',
    `Create ${localList.singular}`,
  ]

  const [sectionsLen, setSectionsLen] = useState(0)
  const [categoriesLen, setCategoriesLen] = useState(0)

  useEffect(() => {
    const unsub1 = fieldFilterManager.subscribe(scopedKey('sections'), (vals) =>
      setSectionsLen(vals.length)
    )
    const unsub2 = fieldFilterManager.subscribe(
      scopedKey('categories'),
      (vals) => setCategoriesLen(vals.length)
    )
    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  const isBlocked = checkBlocked(value, sectionsLen, categoriesLen)

  const isBlockedRef = useRef(isBlocked)
  useEffect(() => {
    isBlockedRef.current = isBlocked
  }, [isBlocked])

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const button = target.closest('button')

      if (!button || !isBlockedRef.current) return

      // 避免 deadlock：抽屜 (Drawer/Dialog) 內的建立鈕直接放行，避免擋到「新建關聯項目」
      if (button.closest('[role="dialog"]')) return

      // 只攔截頁面底部 toolbar 的「儲存/建立」主按鈕
      const text = button.textContent?.trim() ?? ''
      if (!primaryActionLabelsRef.current.includes(text)) return

      e.preventDefault()
      e.stopPropagation()
      setShowModal(true)
    }

    document.addEventListener('click', handleGlobalClick, true)
    return () => document.removeEventListener('click', handleGlobalClick, true)
  }, [])

  useEffect(() => {
    if (forceValidation && isBlocked) {
      setShowModal(true)
    }
  }, [forceValidation, isBlocked])

  const options = (field as SelectController).options
  const selectedOption = options.find((opt) => opt.value === value) ?? null

  return (
    <FieldContainer>
      <span ref={anchorRef} hidden />
      <FieldLabel>{field.label}</FieldLabel>
      {field.description && (
        <FieldDescription id={`${field.path}-description`}>
          {field.description}
        </FieldDescription>
      )}

      <Select
        value={selectedOption}
        options={options}
        onChange={(option: Option | null) => onChange?.(option?.value ?? null)}
        isDisabled={onChange === undefined}
      />

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '36px 40px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: '16px',
                color: '#e53e3e',
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              貼心小提醒！
            </h3>
            <p
              style={{
                fontSize: '16px',
                color: '#4a5568',
                marginBottom: '32px',
                lineHeight: 1.6,
                marginTop: 0,
              }}
            >
              要記得選大分類和小分類才能送出喔~
            </p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                padding: '10px 32px',
                backgroundColor: '#3182ce',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              確認
            </button>
          </div>
        </div>
      )}
    </FieldContainer>
  )
}

export const Cell: CellComponent<typeof controller> = ({ item, field }) => {
  const f = field as SelectController
  const options = f.options
  const value = item[f.path]
  const option = options.find((o) => o.value === value)
  return <CellContainer>{option?.label ?? value ?? ''}</CellContainer>
}

export const CardValue: CardValueComponent<typeof controller> = ({
  item,
  field,
}) => {
  const f = field as SelectController
  const options = f.options
  const value = item[f.path]
  const option = options.find((o) => o.value === value)
  return (
    <FieldContainer>
      <FieldLabel>{f.label}</FieldLabel>
      <div>{option?.label ?? value ?? ''}</div>
    </FieldContainer>
  )
}

export const controller = (
  config: FieldControllerConfig<{
    options: Option[]
    defaultValue: string | null
  }>
): SelectController => {
  return {
    path: config.path,
    listKey: config.listKey,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    options: config.fieldMeta.options,
    defaultValue: config.fieldMeta.defaultValue ?? null,
    deserialize: (data) => data[config.path] ?? null,
    serialize: (value) => ({ [config.path]: value }),
    // 正確性改由後端 hooks.validateInput 把關(涵蓋主頁 + 抽屜 + API)。
    // 前端不再用 validate 擋存檔,避免讀全域單例導致抽屜被無聲擋下。
    validate: () => true,
    filter: {
      Filter: ({
        onChange,
        value,
      }: {
        onChange: (value: string) => void
        value: string
      }) => {
        const options = config.fieldMeta.options
        const selected = options.find((o) => o.value === value) ?? null
        return (
          <Select
            value={selected}
            options={options}
            onChange={(opt: Option | null) => onChange(opt?.value ?? '')}
          />
        )
      },
      graphql: ({ value }: { value: string }) => ({
        [config.path]: { equals: value },
      }),
      Label: ({ value }: { value: string }) => {
        const option = config.fieldMeta.options.find((o) => o.value === value)
        return option?.label ?? value
      },
      types: {
        matches: {
          label: 'is',
          initialValue: '',
        },
      },
    },
  }
}
