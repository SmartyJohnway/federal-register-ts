# 後端遷移計畫：使用 fr-ts-microservices 統一並強化現有功能

**版本：1.0.0**

**最後更新：2025-11-01**

本文件旨在分析現有的 `fr-proxy.ts` 和 `fr-ruby-adapter`，並提供一份詳細的計畫，說明如何使用我們新建的、純 TypeScript 的 `fr-ts-microservices` 函式庫來取代它們，以達到架構統一、效能提升和功能強化的目標。

---

## 1. 現有後端功能分析

目前，您的後端搜尋功能由兩個獨立的 Netlify Function 提供，各有其特點與權衡：

-   **`fr-proxy.ts`**：一個簡易的 API 代理，僅做參數轉發，缺乏快取、重試等進階功能。
-   **`fr-ruby-adapter/`**：一個功能強大但架構複雜的混合模式轉接器。它透過 Node.js 包裝層實現了快取、重試、速率限制等進階邏輯，但其核心的 API 查詢仍依賴於呼叫外部的 Ruby 腳本來完成。

**現有架構的主要痛點：**

1.  **技術棧混合**：同時依賴 Node.js 和 Ruby，增加了部署與維護的複雜性。
2.  **效能瓶頸**：呼叫 Ruby 子程序會產生額外的延遲和資源消耗。
3.  **邏輯分散**：快取和重試邏輯在 Node.js 中，而複雜的查詢字串建構邏輯卻在 Ruby 中，不利於統一管理和擴展。

---

## 2. 遷移策略：以 `fr-ts-microservices` 全面取代

我們新建的 `fr-ts-microservices` 函式庫已經用純 TypeScript 完整複製了 Ruby Gem 的所有核心功能。因此，我們可以建立一個**單一、高效**的 Netlify Function 來完全取代上述兩個舊的 Function。

這個新的 Function 將直接在 Node.js 環境中 `import` 我們的函式庫並執行查詢，從而**徹底移除對 Ruby 環境的依賴**。

### 2.1 如何取代 `fr-ruby-adapter`

`fr-ruby-adapter` 中的所有核心邏輯都可以被 `fr-ts-microservices` 中的對應模組取代：

| `fr-ruby-adapter` 中的功能 | `fr-ts-microservices` 中的對應方案 | 備註 |
| :--- | :--- | :--- |
| **複雜查詢建構 (`FrQueryBuilder`)** | **不需手動建構** | 新函式庫的 `search` 方法接收結構化的 `conditions` 物件，無需手動拼接 `AND`/`OR` 字串，更安全且不易出錯。 |
| **呼叫 Ruby Gem** | **直接呼叫 `FederalRegister.search()`** | 在 Node.js 中直接 `import` 並呼叫，無子程序開銷，效能更高。 |
| **錯誤回退 (`safe_search`)** | **`try/catch` 捕捉特定錯誤** | 新函式庫會拋出如 `BadRequest` 等特定錯誤，可以在 `catch` 區塊中實作更精準的重試邏輯 (例如移除特定篩選條件後重試)。 |
| **文件查找 (`Document.find`)** | **`Document.find()`** | 功能完全對等。 |
| **HTTP 後備與快取** | **可輕鬆整合** | 由於整個流程都在 Node.js 中，可以非常輕易地將現有的 `@netlify/blobs` 快取邏輯應用於 `FederalRegister.search()` 的呼叫前後。 |

### 2.2 如何取代 `fr-proxy.ts`

`fr-proxy.ts` 的功能將被新的 Function 完全覆蓋，因此可以直接棄用。

---

## 3. 新後端 Function 實作規劃

我建議建立一個名為 `fr-search.ts` 的新 Netlify Function，它將成為未來所有聯邦公報搜尋請求的唯一入口。

**`fr-search.ts` 的核心邏輯：**

1.  **導入函式庫**：`import { FederalRegister, ... } from '.../fr-ts-microservices/dist/index';`
2.  **解析前端參數**：從 `event.queryStringParameters` 中獲取 `term`, `conditions`, `facets` 等查詢參數。
3.  **(可選) 整合快取**：在呼叫 API 前，先根據查詢參數產生一個唯一的快取鍵 (cache key)，並嘗試從 Netlify Blobs 中讀取快取。
4.  **呼叫彙整器**：如果快取未命中，則呼叫 `FederalRegister.search(query)` 方法。
5.  **(可選) 寫入快取**：將從 API 獲取的新結果存入 Netlify Blobs。
6.  **回傳結果**：將查詢結果以 JSON 格式回傳給前端。

**範例程式碼 (`fr-search.ts`)**

```typescript
import { Handler } from "@netlify/functions";
import { FederalRegister, AggregatedQuery } from ".../fr-ts-microservices/dist/index";
// 假設您已將快取邏輯封裝成一個模組
import { readCache, writeCache } from "./cache-utils";

export const handler: Handler = async (event) => {
  const query: AggregatedQuery = JSON.parse(event.body || '{}');

  // 1. 嘗試讀取快取
  const cacheKey = `fr-search:${JSON.stringify(query)}`;
  const cached = await readCache(cacheKey);
  if (cached) {
    return { statusCode: 200, body: JSON.stringify(cached), headers: { 'X-Cache': 'hit' } };
  }

  try {
    // 2. 快取未命中，呼叫我們的函式庫
    const response = await FederalRegister.search(query);

    // 3. 寫入快取 (例如，快取15分鐘)
    await writeCache(cacheKey, response, 15 * 60 * 1000);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: { 'X-Cache': 'miss' },
    };
  } catch (error: any) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

---

## 4. 帶來的強化與效益

透過這次遷移，您將獲得：

1.  **架構統一**：100% 的 TypeScript/Node.js 技術棧，移除對 Ruby 的依賴，簡化了開發、測試和部署流程。
2.  **效能提升**：消除了啟動 Ruby 子程序的延遲，API 回應會更快。
3.  **功能強化**：
    -   **Facet 搜尋**：新的彙整器原生支援 `facets` 參數，前端現在可以輕易地在一次請求中，同時獲取文件結果和多維度的分類統計數據，這是舊 `fr-ruby-adapter` 難以實現的。
    -   **更強的查詢能力**：可以直接傳遞複雜的 `conditions` 物件，而不用在前端或後端拼接容易出錯的查詢字串。
    -   **類型安全**：整個流程都是強型別的，從後端函式庫到 API Function，再到前端，都能享受到 TypeScript 帶來的開發期錯誤檢查和自動完成的便利。
4.  **更高的可維護性**：所有商業邏輯都集中在 `fr-ts-microservices` 函式庫中，未來升級或修改都只需在一個地方進行。
