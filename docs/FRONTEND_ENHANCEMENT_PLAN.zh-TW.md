# 前端遷移與強化計畫

**版本：1.0.0**

**最後更新：2025-11-01**

本文件旨在提供一份詳細的計畫，指導如何將現有的 React 前端元件從呼叫舊的後端 (`fr-ruby-adapter`) 遷移到使用我們新建的、基於 `fr-ts-microservices` 的後端 Function。同時，本文件也將提出一系列創新性的功能強化建議，以充分發揮新函式庫的潛力。

---

## 1. 核心遷移策略

遷移的核心是建立一個新的、統一的 Netlify Function (例如 `fr-search.ts`，如 `BACKEND_MIGRATION_PLAN.zh-TW.md` 中所述)，這個 Function 將使用我們的 `fr-ts-microservices` 函式庫。所有前端元件的 `fetch` 呼叫都將指向這個新的 Function。

**舊的呼叫方式**：
```javascript
fetch(`/api/fr-ruby-adapter?term=...&mode=...`)
```

**新的呼叫方式**：
將查詢參數作為一個 JSON 物件，透過 POST 請求的 body 發送給新的 Function。
```javascript
fetch(`/.netlify/functions/fr-search`, {
  method: 'POST',
  body: JSON.stringify({ 
    term: '...',
    conditions: { ... },
    facets: ['agency'] 
  })
});
```
**優點**：透過 POST body 傳遞複雜的巢狀 `conditions` 物件，遠比手動拼接 URL 參數更清晰、更不容易出錯。

---

## 2. 元件遷移指南

### 2.1 `HtsResultCard.tsx` 與 `RelatedFRCard.tsx`

這兩個元件是 API 呼叫的主要發起者，是遷移的重點。

**遷移步驟**：

1.  **修改 `handleToggleDetails` / `load` 函式**：
    -   移除並行發起多個 `fetch` 到 `fr-ruby-adapter` 的邏輯。
    -   改為**單次 `fetch` 呼叫**到新的 `/netlify/functions/fr-search`。
    -   將原本用於查詢 Sec 232, 301 的多個 `term`，整合成一個更結構化的查詢。例如，可以利用新函式庫強大的布林搜尋能力 (雖然我們在後端處理，但前端可以傳遞更結構化的參數)。

2.  **更新資料處理邏輯**：
    -   API 的回應將從多個獨立的、結構不一的 JSON，變成一個統一的 `AggregatedResponse` 物件。
    -   更新元件的 `state` 和渲染邏輯，從 `response.documents` 和 `response.facets` 中獲取數據。

**修改範例 (`HtsResultCard.tsx`)**：

```typescript
// ...
const handleToggleDetails = async () => {
  // ...
  try {
    // 原本是 Promise.allSettled + 多個 fetch
    // 現在是單一 fetch
    const response = await fetch('/.netlify/functions/fr-search', {
      method: 'POST',
      body: JSON.stringify({
        term: `${fullHtsCode}`,
        // 這裡可以傳遞更複雜的條件，讓後端處理
        // 例如，可以定義一個 custom_filter 來同時查 232, 301, 201
        custom_filter: ['sec232', 'sec301', 'sec201'] 
      })
    });
    const data = await response.json();

    // data.fr_232, data.fr_301 將由後端 API 直接回傳
    // 或者前端根據回傳的單一文件列表和 agency 進行分類
    setRawResponses(data); 
  } catch (e) {
    // ...
  }
}
// ...
```

### 2.2 `ADCVDCoutryTracker.tsx` 與 `CompanyRatesModal.tsx`

這兩個是純 UI 元件，它們的遷移依賴於其父元件。

**遷移步驟**：

1.  找到呼叫這兩個元件的父元件。
2.  在父元件中，將其獲取 `countryList` 和 `rows` 的 API 呼叫邏輯，從 `fr-ruby-adapter` 遷移到新的 `fr-search` Function。
3.  確保傳遞給這兩個元件的 `props` 資料結構保持一致，或者根據新 API 的回傳進行調整。

---

## 3. 功能強化創意與想像

遷移完成後，我們可以利用新函式庫強大的 `Aggregator` 和 `Facet` 功能，為前端帶來前所未有的互動體驗。

### 3.1 強化 `HtsResultCard.tsx`：**智慧儀表板**

當使用者展開「細節」時，我們不再只是呈現三個靜態的文件列表，而是呈現一個**動態的、互動式的「法規情報儀表板」**。

1.  **智慧摘要與視覺化**：
    -   **新增需求**：修改後端 `fr-search` 的請求，在 `facets` 陣列中加入 `'agency'` 和 `'daily'`。
    -   **前端實現**：
        -   **機構分佈圓餅圖**：利用 `response.facets.agency` 的數據，使用 `recharts` 或 `nivo` 等圖表庫，繪製一個圓餅圖，直觀地展示與此 HTS 碼相關的文件都是由哪些機構發布的，以及各機構的佔比。
        -   **近期活動趨勢圖**：利用 `response.facets.daily` 的數據，繪製一個時間序列的長條圖，顯示過去一段時間內（如30天）每天發布的相關文件數量。這可以讓使用者一眼看出近期的法規活動是頻繁還是稀少。
        -   **關鍵字雲**：對所有回傳文件的 `title` 進行分析，產生一個關鍵字雲，突顯出最常出現的詞彙 (如 `Investigation`, `Review`, `Determination`)。

2.  **互動式篩選**：
    -   **新增需求**：儀表板上的所有圖表都應該是可點擊的。
    -   **前端實現**：
        -   當使用者點擊圓餅圖中的某個「機構」(例如，Commerce Department)，下方的文件列表會**即時篩選**，只顯示該機構發布的文件。
        -   當使用者在趨勢圖上拖拉選擇一個時間區間，文件列表也隨之篩選，只顯示該時間段內的文件。
        -   這個互動不需要重新呼叫後端 API，所有操作都在前端完成，響應極快。

### 3.2 強化 `ADCVDCoutryTracker.tsx`：**國家風險儀表板**

將其從一個簡單的列表，升級為一個包含更多洞見的國家風險儀表板。

1.  **增加 AD/CVD 案件類型統計**：
    -   **新增需求**：在請求 `countryList` 的同時，為每個國家請求 `type` 的 `facet` 統計 (`facets: ['type']`)。
    -   **前端實現**：在每個國家旁邊，不僅顯示最新案件標題，還以徽章(Badge)形式顯示該國涉及的案件類型統計，例如：`[初步裁定: 2] [最終裁定: 5] [複審: 3]`。這能讓使用者對案件的進展階段有更全面的了解。

### 3.3 強化 `CompanyRatesModal.tsx`：**關聯資訊智慧連結**

在顯示公司稅率的同時，提供更多上下文資訊。

1.  **連結到相似公司**：
    -   **新增需求**：當後端解析文件並找到公司稅率時，可以同時分析該文件中的其他公司。
    -   **前端實現**：在稅率表格的每一行公司名稱旁邊，增加一個「尋找相似」按鈕。點擊後，可以觸發一個新的搜尋，尋找在其他 AD/CVD 案件中也出現過這家公司的文件，幫助使用者建立關聯性分析。

### **總結**

透過遷移到新的 `fr-ts-microservices` 函式庫，我們不僅統一了技術棧、提升了效能，更重要的是解鎖了強大的 `Facet` 和彙整查詢能力。這讓我們有機會將現有的前端從「靜態的資訊列表」轉變為「**動態的、互動式的情報分析儀表板**」，為使用者創造前所未有的價值與洞見。