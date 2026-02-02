# 專案完整指南 (fr-ts-microservices)

**版本：1.0.0**

**最後更新：2025-11-01**

本文件旨在為開發團隊提供一份關於 `fr-ts-microservices` 專案的完整、詳細且易於理解的權威性指南。其目標是讓任何一位新成員都能快速了解專案的架構、設計理念、使用方法、測試流程以及最終的部署與整合方式。

---

## 第一部分：架構、結構與工具

本部分將宏觀地介紹專案的整體架構、檔案組織方式，以及所使用的程式語言與工具。

### 1.1 檔案結構

專案的根目錄為 `federal_register-master/ts_microservices_implementation`，其核心檔案結構如下：

```
.
├── /docs/              # 存放所有專案文件 (包括本指南)
├── /dist/              # TypeScript 編譯後輸出的 JavaScript 程式碼
├── /node_modules/      # 專案依賴的第三方套件
├── /src/               # 專案所有 TypeScript 原始碼的核心目錄
│   ├── /facets/        # 存放所有具體的 Facet (分類統計) 類別
│   ├── /interfaces/    # 存放共用的介面定義
│   ├── aggregator.ts   # 彙整器服務，為函式庫的主要入口
│   ├── base.ts         # 所有資料模型 (Adapter) 的基底類別
│   ├── client.ts       # 處理對 API 的 HTTP 請求與錯誤
│   ├── index.ts        # 專案的統一出口，匯出所有可用的類別
│   └── ... (其他適配器檔案)
├── /tests/             # 存放所有 Jest 單元測試與整合測試檔案
├── package.json        # 定義專案資訊、依賴套件與腳本
└── tsconfig.json       # TypeScript 編譯器的設定檔
```

### 1.2 程式語言、風格與工具

-   **程式語言**：專案完全使用 **TypeScript** 撰寫，提供強型別檢查，增加程式碼的穩健性與可維護性。
-   **程式風格**：
    -   **物件導向**：採用以類別 (Class) 為基礎的物件導向編程，每個 API 端點或資料模型都被封裝成一個獨立的類別。
    -   **非同步操作**：所有與 API 互動的方法皆為非同步 (`async/await`)，以處理網路請求。
    -   **繼承**：透過一個共通的 `Base` 類別來處理屬性存取與類型轉換，所有資料模型都繼承自它，以達到程式碼複用。
-   **核心工具**：
    -   **Node.js**：作為執行環境。
    -   **npm**：用於管理專案的依賴套件。
    -   **Jest**：作為單元測試與整合測試的框架。

---

## 第二部分：元件深度解析

本部分將深入 `src` 目錄，詳細解釋每個核心元件的用途、關聯、以及如何與之互動。

### 2.1 `aggregator.ts` (FederalRegister 彙整器)

-   **用途**：這是**建議使用的主要入口**。它扮演一個智慧彙整器的角色，能接收複雜的查詢請求，並自動將請求分派給底下的 `Document` 和 `Facet` 適配器，最後將結果合併回傳。
-   **關聯關係**：位於最上層，調度所有其他的適配器。
-   **呼叫目標**：根據收到的查詢參數，呼叫 Federal Register API 的 `/documents.json` 和 `/documents/facets/*.json` 等多個端點。
-   **目的**：提供一個單一、簡潔的介面，讓使用者可以一次性完成「文件搜尋」和「分類統計」兩項任務，而無需手動發起多次 API 請求。
-   **得到什麼**：一個包含 `documents` (文件結果集) 和 `facets` (分類統計結果集) 的彙整物件。
-   **資料結構 (`AggregatedResponse`)**：
    ```typescript
    {
      documents: ResultSet<Document>; // ResultSet 物件，包含文件陣列與分頁資訊
      facets: {
        agency?: FacetResultSet<Facet>; // 以 facet 名稱 (如 agency) 為鍵的分類統計結果
        daily?: FacetResultSet<Facet>;
        // ... 其他 facet 結果
      }
    }
    ```
-   **如何呼叫**：
    ```typescript
    import { FederalRegister } from './src/index';

    const response = await FederalRegister.search({
      term: 'offshore wind',
      conditions: { publication_date: { year: '2024' } },
      facets: ['agency', 'daily'], // 宣告需要哪些分類統計
    });

    console.log(response.documents.count); // 取得文件總數
    console.log(response.facets.agency.results); // 取得 agency 的統計結果
    ```

### 2.2 `client.ts` (API 客戶端)

-   **用途**：處理所有底層的 HTTP 網路請求、URL 參數的序列化，以及 API 錯誤的攔截與封裝。
-   **關聯關係**：是所有適配器的基石，所有對外的 API 呼叫都由它發起。
-   **呼叫目標**：Federal Register API 的所有端點。
-   **目的**：提供一個統一的 `get` 方法，並將 HTTP 狀態碼 (如 404, 500) 轉換為具體的、可被 `try/catch` 捕捉的 TypeScript 錯誤類別 (如 `RecordNotFound`, `ServerError`)。
-   **得到什麼**：API 回傳的原始 JSON 資料，或是在失敗時拋出一個結構化的錯誤物件。
-   **如何呼叫**：通常不直接呼叫，而是由其他適配器在內部使用。

### 2.3 `document.ts` (文件適配器)

-   **用途**：專門處理與「文件 (Document)」相關的所有操作，是對 `/documents` 端點的封裝。
-   **關聯關係**：由 `aggregator.ts` 調用，或可被使用者直接呼叫。
-   **呼叫目標**：`/api/v1/documents.json` 和 `/api/v1/documents/{doc_number}.json`。
-   **目的**：搜尋文件、依編號查找特定文件。
-   **得到什麼**：`Document` 實例或 `ResultSet<Document>` 結果集。
-   **資料結構 (`Document`)**：一個代表單一文件的物件，可透過 getter (如 `.title`, `.document_number`) 直接存取其屬性。
-   **如何呼叫**：
    ```typescript
    import { Document } from './src/index';

    // 搜尋文件
    const searchResults = await Document.search({ term: 'test' });

    // 查找單一文件
    const singleDoc = await Document.find('2024-12345');
    ```

### 2.4 `facet.ts` & `/facets/*` (分類統計適配器)

-   **用途**：處理所有與「分類統計 (Facet)」相關的操作。
-   **關聯關係**：由 `aggregator.ts` 調用，或可被使用者直接呼叫以獲取特定的統計數據。
-   **呼叫目標**：`/api/v1/documents/facets/*.json` 系列端點。
-   **目的**：根據特定條件，取得文件的分類統計結果 (例如，某個主題下，各機構分別發布了多少文件)。
-   **得到什麼**：`FacetResultSet` 結果集，包含一組 `Facet` 物件。
-   **資料結構 (`Facet`)**：一個代表單一統計分類的物件 (如一個聯邦機構)，包含 `.name` (名稱), `.slug` (識別符), `.count` (數量) 等屬性。
-   **如何呼叫**：
    ```typescript
    import { DocumentAgencyFacet } from './src/index';

    // 取得 "AI" 主題下，各機構的文件統計
    const agencyFacets = await DocumentAgencyFacet.search({
      conditions: { term: 'AI' }
    }, DocumentAgencyFacet);
    ```

---

## 第三部分：驗證與測試

本部分說明如何對此專案進行驗證與測試，以確保其功能的正確性與穩定性。

### 3.1 如何執行單元測試

本專案使用 Jest 進行單元測試，所有測試都與 API 的實際網路連線隔離，以確保速度與可靠性。

1.  **安裝依賴**：在專案根目錄下，執行 `npm install` 來安裝所有必要的開發與執行依賴。
2.  **執行測試**：執行 `npm test` 命令。

    ```bash
    npm test
    ```

3.  **結果判讀**：您應該會看到所有測試套件 (Test Suites) 和測試案例 (Tests) 都顯示為 `PASS`。若有任何 `FAIL`，則代表程式碼存在問題需要修復。

### 3.2 如何驗證與 Ruby Gem 的功能一致性

要驗證我們的 TypeScript 函式庫是否完整複製了 Ruby Gem 的功能，最好的方法是進行**並排比較測試**。

**策略**：對同一個邏輯查詢，分別用 Ruby Gem 和我們的 TS 函式庫發起呼叫，然後比對回傳結果的核心指標是否一致。

1.  **準備環境**：確保您同時擁有可執行 Ruby Gem 的環境和可執行此 TS 專案的環境。
2.  **執行相同查詢**：

    **Ruby Gem 範例**
    ```ruby
    require 'federal_register'
    result = FederalRegister::Document.search(
      conditions: { term: 'offshore wind' },
      order: 'newest',
      per_page: 5
    )
    puts "Ruby Gem Count: #{result.count}"
    result.results.each do |doc|
      puts "- Ruby: #{doc.document_number}"
    end
    ```

    **TypeScript 函式庫範例**
    ```typescript
    import { Document } from './src/index';
    const response = await Document.search({
      conditions: { term: 'offshore wind' },
      order: 'newest',
      per_page: 5
    });
    console.log(`TS Lib Count: ${response.count}`);
    for (const doc of response.results) {
      console.log(`- TS: ${doc.document_number}`);
    }
    ```

3.  **比對結果**：
    -   `Count` (總數) 應該要**完全相同**。
    -   回傳的文件順序與 `document_number` 應該要**完全相同**。

    透過比對多組不同的查詢，我們可以非常有信心地確認兩個版本的功能一致性。

### 3.3 如何驗證資料的正確性

函式庫的資料來源是 Federal Register API，而 API 的最終真實性來源是 **FederalRegister.gov** 官方網站。要驗證單筆資料的正確性非常簡單：

1.  使用函式庫取得一份文件，例如 `const doc = await Document.find('2024-12345');`。
2.  在瀏覽器中打開該文件對應的 `html_url` 屬性 (例如 `doc.html_url`)。
3.  人工比對函式庫回傳的 `title`, `publication_date` 等欄位，是否與官方網頁上顯示的資訊一致。

---

## 第四部分：新使用者快速上手指南

本部分為一位初次接觸本專案的開發者，提供從零到完成部署與使用的完整流程。

### 4.1 本地安裝與設定

1.  **環境準備**：確保您的電腦已安裝 [Node.js](https://nodejs.org/) (建議 LTS 版本) 和 npm。
2.  **下載專案**：取得專案原始碼。
3.  **安裝依賴**：打開終端機，進入專案根目錄 (`ts_microservices_implementation`)，然後執行：
    ```bash
    npm install
    ```
4.  **編譯專案**：執行以下命令將 TypeScript 原始碼編譯為 JavaScript：
    ```bash
    npm run build
    ```
    編譯後的檔案會出現在 `/dist` 目錄中。現在，這個函式庫已經可以在任何 Node.js 專案中被引用。

### 4.2 部署至 Netlify Functions (作為後端 API)

本函式庫非常適合部署為 Serverless Function。以下是如何在 Netlify 上建立一個搜尋 API 的範例。

1.  **建立 Netlify Function 檔案**：
    在您的前端專案中，假設您的 Netlify Functions 目錄是 `netlify/functions`，在其中建立一個檔案，例如 `fr-search.ts`。

2.  **編寫 Function 程式碼**：
    將本專案的 `/dist` 目錄複製到您的 Netlify 專案中，以便引用。然後在 `fr-search.ts` 中寫入以下程式碼：

    ```typescript
    import { Handler, HandlerEvent } from "@netlify/functions";
    // 假設您將編譯後的函式庫放在 /lib 目錄下
    import { FederalRegister } from "../../lib/dist/index";

    export const handler: Handler = async (event: HandlerEvent) => {
      // 從前端請求的 URL 中解析查詢參數
      const queryParams = event.queryStringParameters;

      if (!queryParams || !queryParams.term) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "'term' parameter is required." }),
        };
      }

      try {
        // 使用我們的函式庫進行搜尋
        const response = await FederalRegister.search({
          term: queryParams.term,
          per_page: Number(queryParams.per_page) || 10,
          // 您可以從 queryParams 中解析更多條件
        });

        return {
          statusCode: 200,
          body: JSON.stringify(response),
          headers: { 'Content-Type': 'application/json' },
        };
      } catch (error: any) {
        return {
          statusCode: error.statusCode || 500,
          body: JSON.stringify({ error: error.message }),
        };
      }
    };
    ```

3.  **部署**：將您的專案推送到與 Netlify 連動的 Git 儲存庫，Netlify 將會自動偵測並部署此 Function。

### 4.3 前端 Web App 呼叫

一旦您的 Netlify Function 部署完成，任何前端應用程式（如 React, Vue）都可以透過一個簡單的 `fetch` 呼叫來使用它。

**React 範例**：

```jsx
import React, { useState, useEffect } from 'react';

function FederalRegisterSearch() {
  const [results, setResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState('solar panels');

  useEffect(() => {
    // 呼叫我們部署在 Netlify 上的後端 API
    fetch(`/.netlify/functions/fr-search?term=${searchTerm}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
      })
      .catch(err => console.error(err));
  }, [searchTerm]);

  if (!results) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Federal Register Search</h1>
      <h2>Found {results.documents.count} documents for "{searchTerm}"</h2>
      <ul>
        {results.documents.results.map(doc => (
          <li key={doc.document_number}>
            <a href={doc.html_url} target="_blank" rel="noopener noreferrer">
              {doc.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

透過以上步驟，您就完成了一個從後端函式庫開發、測試、部署，到前端應用的完整開發循環。
