# 移植指南：從直接呼叫 API 到使用 `fr-ts-microservices`

本指南提供說明與範例，指導您如何將現有專案中直接使用 `fetch` 呼叫 Federal Register API 的方式，遷移到使用我們新建的、更穩健的 `fr-ts-microservices` 函式庫。

---

## 1. 移植的優勢

-   **簡潔與可讀性：** 用清晰、語意化的方法取代手動建構 URL 和 `fetch` 呼叫。
-   **穩健性：** 函式庫內部處理了請求批次處理、類型轉換以及API特有的回應結構等複雜邏輯。
-   **錯誤處理：** 您將能獲取結構化、類型化的錯誤（如 `BadRequest`, `RecordNotFound` 等），而無需再手動檢查 HTTP 狀態碼。
-   **可維護性：** 未來若 Federal Register API 發生變更，只需更新函式庫即可，而無需修改您的應用程式碼。

---

## 2. 設定

您不再需要直接呼叫 `fetch`，而是從函式庫的主入口點導入所需的類別。

```typescript
// 移除舊的 fetch 邏輯
// import fetch from 'node-fetch';

// 加入新的 import
import { FederalRegister, Document, AggregatedQuery } from './src/index';
```

---

## 3. 移植範例

以下是常見使用情境的「修改前」與「修改後」並排比較。

### 範例 1：簡單文件搜尋

**修改前 (直接 `fetch`)**

```typescript
async function oldSearch() {
  const baseUrl = 'https://www.federalregister.gov/api/v1/documents.json';
  const params = new URLSearchParams({
    'conditions[term]': 'environmental justice',
    'per_page': '10',
  });

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`找到 ${data.count} 份文件。`);
    // ... 手動處理 data.results
  } catch (error) {
    console.error("搜尋失敗:", error);
  }
}
```

**修改後 (使用函式庫)**

```typescript
import { FederalRegister } from './src/index';

async function newSearch() {
  try {
    const response = await FederalRegister.search({
      term: 'environmental justice',
      per_page: 10,
    });
    console.log(`找到 ${response.documents.count} 份文件。`);
    for (const doc of response.documents) {
      console.log(`- [${doc.document_number}] ${doc.title}`);
    }
  } catch (error) {
    console.error("搜尋失敗:", error);
  }
}
```

### 範例 2：尋找單一文件

**修改前 (直接 `fetch`)**

```typescript
async function oldFind() {
  const docNumber = '2024-01234';
  const url = `https://www.federalregister.gov/api/v1/documents/${docNumber}.json`;

  try {
    const response = await fetch(url);
    const docData = await response.json();
    console.log(docData.title);
  } catch (error) {
    console.error("尋找失敗:", error);
  }
}
```

**修改後 (使用函式庫)**

```typescript
import { Document } from './src/index';

async function newFind() {
  try {
    const doc = await Document.find('2024-01234');
    console.log(doc.title);
  } catch (error) {
    console.error("尋找失敗:", error);
  }
}
```

### 範例 3：包含分類統計的複雜搜尋

這是函式庫能帶來最大效益的地方，它避免了多次手動呼叫 API。

**修改前 (多次 `fetch` 呼叫)**

```typescript
async function oldComplexSearch() {
  const term = 'offshore wind';
  const docUrl = `https://www.federalregister.gov/api/v1/documents.json?conditions[term]=${term}`;
  const agencyFacetUrl = `https://www.federalregister.gov/api/v1/documents/facets/agency.json?conditions[term]=${term}`;

  try {
    // 手動並行執行呼叫
    const [docResponse, facetResponse] = await Promise.all([
      fetch(docUrl).then(res => res.json()),
      fetch(agencyFacetUrl).then(res => res.json()),
    ]);

    console.log(`找到 ${docResponse.count} 份文件。`);
    console.log('各聯邦機構文件數量統計:', facetResponse);

  } catch (error) {
    console.error("複雜搜尋失敗:", error);
  }
}
```

**修改後 (使用彙整器)**

```typescript
import { FederalRegister } from './src/index';

async function newComplexSearch() {
  try {
    const response = await FederalRegister.search({
      term: 'offshore wind',
      facets: ['agency'], // 只需宣告您需要的分類統計
    });

    console.log(`找到 ${response.documents.count} 份文件。`);
    console.log('各聯邦機構文件數量統計:');
    for (const agency of response.facets.agency) {
        console.log(`- ${agency.name}: ${agency.count}`);
    }

  } catch (error) {
    console.error("複雜搜尋失敗:", error);
  }
}
```
