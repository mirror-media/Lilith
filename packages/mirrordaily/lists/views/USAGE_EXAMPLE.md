# 使用範例：創建新的過濾關係

假設我們想創建一個新功能：**Tags 根據 Categories 過濾**

## 步驟 1：創建過濾組件

```bash
# 創建目錄
mkdir -p packages/mirrordaily/lists/views/post/tags-filtered
```

創建 `packages/mirrordaily/lists/views/post/tags-filtered/index.tsx`：

```typescript
import { createFilteredRelationship } from '../../shared'

// 創建組件 - 就這麼簡單！
const { Field, Cell, CardValue, controller } = createFilteredRelationship({
  sourceField: 'categories',      // 監聽 categories 欄位的變化
  filterByField: 'categories',    // 在 GraphQL 中根據 categories 過濾
  emptyMessage: '請先選擇分類，才能選擇標籤',
})

export { Field, Cell, CardValue, controller }
```

## 步驟 2：更新 Categories View 來通知變化

修改 `packages/mirrordaily/lists/views/post/categories/index.tsx`：

```typescript
import { Fragment, useState, useEffect } from 'react'
import { fieldFilterManager } from '../../shared'  // 導入 manager

export const Field = ({ value, onChange, ... }) => {
  // 新增：當 categories 值變化時通知 manager
  useEffect(() => {
    if (value.kind === 'many' && Array.isArray(value.value)) {
      const categoryIds = value.value.map((item: any) => item.id).filter(Boolean)
      fieldFilterManager.updateField('categories', categoryIds)
    }
  }, [value])
  
  // ... 其餘原有代碼保持不變
}
```

## 步驟 3：更新 Tags Controller

修改 `packages/mirrordaily/lists/views/post/tags-filtered/index.tsx` 的 controller：

```typescript
export const controller = (config: any): any => {
  return {
    // ... 其他配置
    graphqlSelection: `
      ${config.path}InInputOrder {
        id
        label: ${config.fieldMeta.refLabelField}
      }
      categories {
        id
      }
    `,
    deserialize: (data: any) => {
      // 提取 categories 的 IDs
      const categoriesIds = (data.categories || []).map((c: any) => c.id)
      
      if (config.fieldMeta.many) {
        const value = (data[`${config.path}InInputOrder`] || []).map((x: any) => ({
          id: x.id,
          label: x.label || x.id,
        }))
        return {
          kind: 'many',
          id: data.id,
          initialValue: value,
          value,
          categoriesIds,  // 關鍵：傳遞給 Field 組件
        }
      }
      // ... one 的情況類似
    },
  }
}
```

## 步驟 4：在 Post.ts 中使用

```typescript
// Post.ts
{
  // 原有的 categories 欄位
  categories: relationship({
    label: '分類',
    ref: 'Category.posts',
    many: true,
    ui: {
      labelField: 'name',
      views: './lists/views/post/categories/index',  // 確保使用會通知變化的版本
    },
  }),

  // 新的 tags 欄位 - 會根據 categories 過濾
  tags: relationship({
    label: '標籤',
    ref: 'Tag.posts',
    many: true,
    ui: {
      labelField: 'name',
      views: './lists/views/post/tags-filtered/index',  // 使用過濾組件
    },
  }),
}
```

## 完成！

現在當用戶：
1. 選擇 Categories
2. Categories 值變化時通知 `fieldFilterManager`
3. Tags 組件訂閱這些變化
4. Tags 下拉選單自動只顯示屬於所選 Categories 的 Tags

---

## 進階範例：三層級過濾

**Sections → Categories → Tags**

```typescript
// 1. Sections 通知變化
// packages/mirrordaily/lists/views/post/sections/index.tsx
useEffect(() => {
  fieldFilterManager.updateField('sections', sectionIds)
}, [value])

// 2. Categories 根據 Sections 過濾，並通知自己的變化
// packages/mirrordaily/lists/views/post/categories/index.tsx
useEffect(() => {
  fieldFilterManager.updateField('categories', categoryIds)
}, [value])

// 3. Tags 根據 Categories 過濾
// 使用 createFilteredRelationship({ sourceField: 'categories', ... })
```

---

## 其他可能的使用場景

### 場景 1：Authors 根據 Department 過濾
```typescript
const { Field, Cell, CardValue, controller } = createFilteredRelationship({
  sourceField: 'department',
  filterByField: 'departments',
  emptyMessage: '請先選擇部門',
})
```

### 場景 2：Products 根據 Brand 過濾
```typescript
const { Field, Cell, CardValue, controller } = createFilteredRelationship({
  sourceField: 'brand',
  filterByField: 'brand',
  emptyMessage: '請先選擇品牌',
})
```

### 場景 3：Cities 根據 Country 過濾
```typescript
const { Field, Cell, CardValue, controller } = createFilteredRelationship({
  sourceField: 'country',
  filterByField: 'country',
  emptyMessage: '請先選擇國家',
})
```

---

## 注意事項

1. **GraphQL 關係必須存在**：確保目標模型（如 Tag）有指向源模型（如 Category）的關係
2. **欄位名稱一致**：`filterByField` 必須與 GraphQL schema 中的關係名稱一致
3. **通知機制**：源欄位必須在值變化時調用 `fieldFilterManager.updateField()`
4. **ID 傳遞**：controller 的 `deserialize` 必須提取並傳遞源欄位的 IDs

## 疑難排解

### 問題：過濾不生效
- 檢查源欄位是否調用了 `fieldFilterManager.updateField()`
- 檢查 `sourceField` 和 `filterByField` 名稱是否正確
- 檢查 controller 是否正確傳遞了源欄位的 IDs

### 問題：顯示 "請先選擇..." 但已經選擇了
- 檢查源欄位的 `useEffect` 依賴是否正確
- 檢查是否在正確的時機調用 `updateField()`

### 問題：TypeScript 錯誤
- 確保添加了必要的 `// @ts-ignore` 註釋
- 檢查導入路徑是否正確

