# Federal Register TS 函式庫 — 使用指南

本指南說明如何使用 `federal-register-ts` 獨立 TypeScript SDK 來與 FederalRegister.gov API 進行互動。

---

## 安裝

```bash
npm install federal-register-ts
```

---

## 1. 快速開始

### 建立 Client 實例

所有 API 操作皆透過 `FederalRegisterClient` 進行：

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

// 使用預設設定 (https://www.federalregister.gov/api/v1)
const client = new FederalRegisterClient();
```

---

## 2. 搜尋聯邦公報文件

使用 `client.documents.search()` 進行全文檢索與結構化條件過濾：

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function searchEnvironmentalRules() {
  const response = await client.documents.search({
    conditions: {
      term: 'clean air',
      types: ['RULE', 'PRORULE'],
      publicationDate: { gte: '2024-01-01' },
    },
    perPage: 10,
    page: 1,
    order: 'newest',
  });

  console.log(`符合條件的文件總數: ${response.count}`);
  if ('results' in response) {
    for (const doc of response.results) {
      console.log(`- [${doc.document_number}] ${doc.title} (${doc.publication_date})`);
    }
  }
}

searchEnvironmentalRules();
```

---

## 3. 取得單一與多筆文件

### 透過文件編號查詢單一文件

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function getDocument() {
  const doc = await client.documents.find({
    documentNumber: '2024-01234',
    fields: ['title', 'document_number', 'publication_date', 'html_url', 'agency_names'],
  });

  console.log('標題:', doc.title);
  console.log('網址:', doc.html_url);
}
```

### 多筆文件查詢與部分成功處理

當查詢多筆文件時，不存在的文件編號會收集於 `errors.not_found` 陣列中，不會導致整個請求失敗：

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function getBatch() {
  const batch = await client.documents.findMany({
    documentNumbers: ['2024-01234', 'invalid-doc-number'],
  });

  console.log(`成功找到 ${batch.count} 份文件。`);
  for (const doc of batch.results) {
    console.log(`找到: ${doc.document_number}`);
  }

  if (batch.errors?.not_found) {
    console.warn('未找到的文件編號:', batch.errors.not_found);
  }
}
```

---

## 4. 主題目錄與主題建議 (CAP-001)

### 取得完整主題目錄 (Topic Catalog)

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function getTopics() {
  const catalog = await client.topics.list();
  console.log(`專有名詞主題數量: ${catalog.results.thesaurus.length}`);
  console.log(`自訂/特定主題數量: ${catalog.results.ad_hoc.length}`);
}
```

---

## 5. 聯邦機構名錄

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function listAgencies() {
  const agencies = await client.agencies.list();

  console.log(`已載入 ${agencies.length} 個聯邦機構。`);
  const epa = agencies.find(a => a.slug === 'environmental-protection-agency');
  if (epa) {
    console.log(`EPA ID: ${epa.id}, 官方網址: ${epa.url}`);
  }
}
```

---

## 6. 錯誤處理架構

SDK 區分前端參數驗證錯誤與 API 傳輸/回應錯誤：

- `RequestValidationError`：前端參數驗證失敗（延伸自 JavaScript 原生 `Error`），發起請求前立即拋出，不發送網路請求（`fetch = 0`）。
- `FederalRegisterError`：所有 API 相關錯誤的基底類別（包含 `FederalRegisterHttpError`、`FederalRegisterSearchValidationError`、`FederalRegisterAgencyNotFoundError` 等）。

```typescript
import {
  FederalRegisterClient,
  RequestValidationError,
  FederalRegisterSearchValidationError,
  FederalRegisterAgencyNotFoundError,
  FederalRegisterHttpError,
  FederalRegisterError,
} from 'federal-register-ts';

const client = new FederalRegisterClient();

async function safeSearch() {
  try {
    const results = await client.documents.search({
      conditions: { term: 'energy' },
    });
    console.log('搜尋結果數量:', results.count);
  } catch (err) {
    if (err instanceof RequestValidationError) {
      console.error('前端參數驗證失敗:', err.message, err.field);
    } else if (err instanceof FederalRegisterSearchValidationError) {
      console.error('API 搜尋條件錯誤:', err.body?.errors);
    } else if (err instanceof FederalRegisterAgencyNotFoundError) {
      console.error('找不到該機構');
    } else if (err instanceof FederalRegisterHttpError) {
      console.error(`HTTP Status ${err.status}:`, err.rawText);
    } else if (err instanceof FederalRegisterError) {
      console.error('SDK API 錯誤:', err.message);
    }
  }
}
```
