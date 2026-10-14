/** @jsxRuntime classic */
/** @jsx jsx */

// eslint-disable-next-line
import { jsx } from '@keystone-ui/core'
import { useEffect, useMemo, useState } from 'react'
import { Select } from '@keystone-ui/fields'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'

type Option = { label: string; value: string }

// 依關鍵字搜尋 Tag（server 端過濾，最多取 50 筆）
const SEARCH_TAGS = gql`
  query TopicGroupTagOptions($where: TagWhereInput!, $take: Int!) {
    tags(where: $where, take: $take, orderBy: [{ name: asc }]) {
      id
      name
    }
  }
`

// 解析目前已選 tag 的名稱（可能不在搜尋結果內，例如編輯既有資料時）
const TAG_BY_ID = gql`
  query TopicGroupTagById($id: ID!) {
    tag(where: { id: $id }) {
      id
      name
    }
  }
`

function useDebouncedValue<T>(value: T, limitMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), limitMs)
    return () => clearTimeout(id)
  }, [value, limitMs])
  return debounced
}

export function TagSelect({
  value,
  onChange,
  isDisabled,
  placeholder,
  excludeIds = [],
}: {
  value: string | null
  onChange: (id: string | null) => void
  isDisabled?: boolean
  placeholder?: string
  // 其他格已選的 tagId，互斥用：不出現在本格候選裡
  excludeIds?: string[]
}) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 200)

  // 以內容（而非陣列參考）當依賴，避免每次 render 都重算
  const excludeKey = excludeIds.join(',')
  const excludeSet = useMemo(
    () => new Set(excludeKey ? excludeKey.split(',') : []),
    [excludeKey]
  )

  // 查詢只依關鍵字；互斥在 client 端剔除，別格變動不會觸發本格重查、6 格共用快取
  const where = useMemo(() => {
    const trimmed = debouncedSearch.trim()
    return trimmed ? { name: { contains: trimmed, mode: 'insensitive' } } : {}
  }, [debouncedSearch])

  const { data, loading } = useQuery(SEARCH_TAGS, {
    variables: { where, take: 50 },
    // 先顯示快取、同時背景重查，避免「剛建立的 tag 因 cache-first 不出現」
    fetchPolicy: 'cache-and-network',
  })

  const { data: selectedData } = useQuery(TAG_BY_ID, {
    variables: { id: value },
    // 已選 tag 若已在搜尋結果裡就不另外單筆查
    skip:
      !value || (data?.tags ?? []).some((t: { id: string }) => t.id === value),
  })

  const options: Option[] = useMemo(
    () =>
      (data?.tags || [])
        // 互斥：剔除其他格已選的 Tag
        .filter((tag: { id: string; name: string }) => !excludeSet.has(tag.id))
        .map((tag: { id: string; name: string }) => ({
          value: tag.id,
          label: tag.name,
        })),
    [data, excludeSet]
  )

  const selectedOption: Option | null = useMemo(() => {
    if (!value) return null
    const fromOptions = options.find((o) => o.value === value)
    if (fromOptions) return fromOptions
    if (selectedData?.tag) {
      return { value: selectedData.tag.id, label: selectedData.tag.name }
    }
    return { value, label: value }
  }, [value, options, selectedData])

  return (
    <Select
      isClearable
      isDisabled={isDisabled}
      isLoading={loading}
      placeholder={placeholder}
      value={selectedOption}
      options={options}
      // server 端已過濾，關閉 client 端二次過濾
      filterOption={null}
      onInputChange={(val) => setSearch(val)}
      onChange={(option) => onChange(option ? option.value : null)}
    />
  )
}
