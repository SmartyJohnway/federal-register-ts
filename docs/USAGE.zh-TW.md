# Federal Register TS 函式庫 - 使用指南

本指南說明如何使用 `fr-ts-microservices` 函式庫來與 Federal Register API 進行互動。

---

## 安裝

假設專案已經建置完成，您可以從主入口點導入所需的類別：

```typescript
import {
  FederalRegister,
  Document,
  Agency,
  DocumentAgencyFacet,
  // ... 以及其他類別
} from './src/index';
```

---

## 1. 彙整搜尋 (建議方式)

使用此函式庫最簡單的方式是透過 `FederalRegister` 彙整器，它可以同時處理對文件和分類統計 (facets) 的複雜查詢。

### 範例：尋找關於「氣候變遷」的文件，並取得依聯邦機構分類的統計數量

```typescript
import { FederalRegister, AggregatedQuery, AggregatedResponse } from './src/index';

async function performSearch() {
  const query: AggregatedQuery = {
    term: 'climate change',
    conditions: {
      publication_date: { year: '2023' },
    },
    facets: ['agency', 'daily'], // 要求回傳「機構」和「每日」的分類統計
    per_page: 10,
  };

  try {
    const response: AggregatedResponse = await FederalRegister.search(query);

    // 1. 處理文件結果
    console.log(`找到 ${response.documents.count} 份文件。`);
    for (const doc of response.documents) {
      console.log(`- [${doc.document_number}] ${doc.title}`);
    }

    // 2. 處理分類統計結果
    if (response.facets.agency) {
      console.log('\n各聯邦機構文件數量統計:');
      for (const agencyFacet of response.facets.agency) {
        console.log(`- ${agencyFacet.name}: ${agencyFacet.count}`);
      }
    }

  } catch (error) {
    console.error("搜尋失敗:", error);
  }
}

performSearch();
```

---

## 2. 直接使用適配器

對於更特定的任務，您可以直接使用個別的適配器。

### 範例 1：透過文件編號尋找單一文件

```typescript
import { Document } from './src/index';

async function findDocument() {
  try {
    const doc = await Document.find('2023-12345');
    console.log('找到文件:');
    console.log(`標題: ${doc.title}`);
    console.log(`網址: ${doc.html_url}`);
  } catch (error) {
    console.error("尋找文件失敗:", error);
  }
}

findDocument();
```

### 範例 2：取得所有聯邦機構的列表

```typescript
import { Agency } from './src/index';

async function listAgencies() {
  try {
    const agencies = await Agency.all({ fields: ['name', 'slug'] });
    console.log('所有聯邦機構:');
    for (const agency of agencies) {
      console.log(`- ${agency.name} (slug: ${agency.slug})`);
    }
  } catch (error) {
    console.error("列出聯邦機構失敗:", error);
  }
}

listAgencies();
```

### 範例 3：只取得特定主題的分類統計數量

```typescript
import { DocumentTopicFacet, FacetResultSet } from './src/index';

async function getTopicFacets() {
  const query = {
    conditions: { term: 'nuclear energy' },
  };

  try {
    const resultSet: FacetResultSet<DocumentTopicFacet> = await DocumentTopicFacet.search(query, DocumentTopicFacet);
    console.log('關於 "nuclear energy" 的主題統計:');
    for (const topic of resultSet) {
      console.log(`- ${topic.name}: ${topic.count}`);
    }
  } catch (error) {
    console.error("取得主題統計失敗:", error);
  }
}

getTopicFacets();
```
