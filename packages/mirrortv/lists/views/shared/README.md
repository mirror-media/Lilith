# 通用過濾關係組件

這個模組提供了一個靈活的方式來創建具有動態過濾功能的關係欄位。

## 功能

- ✅ 根據另一個欄位的值動態過濾選項
- ✅ 即時響應欄位變化
- ✅ 支援多對多和一對多關係
- ✅ 完全可配置

## 使用方法

### 範例 1：Categories 根據 Sections 過濾

```typescript
// 在 packages/mirrordaily/lists/views/post/categories-filtered/index.tsx

import { createFilteredRelationship } from '../../shared/createFilteredRelationship'

// 創建組件
const { Field, Cell, CardValue, controller } = createFilteredRelationship({
  sourceField: 'sections',        // 監聽的源欄位
  filterByField: 'sections',      // GraphQL 查詢中用於過濾的欄位名稱
  emptyMessage: '請先選擇大分類（Sections），才能選擇小分類（Categories）',
})

export { Field, Cell, CardValue, controller }
```

### 範例 2：Tags 根據 Categories 過濾

```typescript
// 創建 Tags 過濾組件
const { Field, Cell, CardValue, controller } = createFilteredRelationship({
  sourceField: 'categories',      // 監聽 categories 欄位
  filterByField: 'categories',    // 根據 categories 過濾
  emptyMessage: '請先選擇分類，才能選擇標籤',
})
```

### 範例 3：Authors 根據 Department 過濾

```typescript
const { Field, Cell, CardValue, controller } = createFilteredRelationship({
  sourceField: 'department',
  filterByField: 'departments',   // 注意：可以是複數形式
  emptyMessage: '請先選擇部門，才能選擇作者',
})
```

## 在 Post.ts 中使用

### 步驟 1：確保源欄位會通知變化

在源欄位（例如 sections）的 view 中添加：

```typescript
import { fieldFilterManager } from '../shared/fieldFilterManager'

export const Field = ({ value, onChange, ... }) => {
  // 當值變化時通知 manager
  useEffect(() => {
    if (value.kind === 'many' && Array.isArray(value.value)) {
      const ids = value.value.map((item: any) => item.id).filter(Boolean)
      fieldFilterManager.updateField('sections', ids)  // 使用對應的 sourceField 名稱
    }
  }, [value])
  
  // ... 其餘代碼
}
```

### 步驟 2：在目標欄位中使用過濾組件

```typescript
// Post.ts
categories: relationship({
  label: '小分類',
  ref: 'Category.posts',
  many: true,
  ui: {
    labelField: 'name',
    views: './lists/views/post/categories-filtered/index',  // 使用過濾組件
  },
}),
```

### 步驟 3：確保 GraphQL 查詢包含源欄位數據

修改目標欄位的 controller：

```typescript
// 在 categories-filtered/index.tsx
export const controller = (config) => {
  return {
    // ... 其他配置
    graphqlSelection: `
      ${config.path}InInputOrder {
        id
        label: ${config.fieldMeta.refLabelField}
      }
      sections {
        id
      }
    `,
    deserialize: (data) => {
      // 提取源欄位的 IDs
      const sectionsIds = (data.sections || []).map((s: any) => s.id)
      
      // 返回時包含 sectionsIds
      return {
        kind: 'many',
        id: data.id,
        initialValue: value,
        value,
        sectionsIds,  // 關鍵：傳遞給 Field 組件
      }
    }
  }
}
```

## 架構說明

```
fieldFilterManager (狀態管理)
    ↓
    通知變化
    ↓
createFilteredRelationship (組件工廠)
    ├─ Field 組件
    ├─ RelationshipSelect (過濾邏輯)
    └─ Controller (GraphQL)
```

## 完整範例

查看以下文件了解完整實現：
- `packages/mirrordaily/lists/views/post/categories/`
- `packages/mirrordaily/lists/views/post/sections/`

## API 文檔

### `createFilteredRelationship(config)`

#### 參數

- `config.sourceField` (string): 要監聽的源欄位名稱
- `config.filterByField` (string): GraphQL 查詢中用於過濾的欄位名稱
- `config.emptyMessage` (string, optional): 當沒有選擇源欄位時顯示的提示訊息

#### 返回值

返回一個包含以下屬性的物件：
- `Field`: 欄位組件
- `Cell`: 列表單元格組件
- `CardValue`: 卡片值組件
- `controller`: Keystone 控制器

### `fieldFilterManager`

#### 方法

- `subscribe(fieldKey, listener)`: 訂閱欄位變化
- `updateField(fieldKey, values)`: 更新欄位值
- `getCurrentValues(fieldKey)`: 獲取當前值
- `clearField(fieldKey)`: 清除特定欄位
- `clearAll()`: 清除所有欄位

