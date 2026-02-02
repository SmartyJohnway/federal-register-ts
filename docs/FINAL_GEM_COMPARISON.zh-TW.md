# fr-ts-microservices vs. Ruby Gem - 最終功能比對

**版本：1.0.0**

**最後更新：2025-11-01**

本文件旨在對 `fr-ts-microservices` (TypeScript) 函式庫與原始的 `federal_register` (Ruby Gem) 進行最終的、逐一檔案的深度功能比對。目標是確認功能覆蓋的完整性，並標示出任何需要後續補強的差距。

---

## 比對總結

經過詳細比對，**TypeScript 函式庫在核心功能層面上，已經與 Ruby Gem 達成了高度的功能對等 (Feature Parity)**。所有主要的資料模型、查詢方法、以及複雜邏輯（如 `find_all` 批次處理）都已成功移植並通過測試。

主要的差異在於一些 Ruby 語言的動態特性 (如 `add_attribute` 元編程) 在 TypeScript 中採用了更明確、靜態的寫法 (如 `getter` 屬性)，這提升了程式碼的型別安全與可預測性。

以下是逐一檔案的比對詳情，以及標示出的細微差距和未來可選的強化項目。

---

## 核心元件比對 (Core Components)

| Ruby Gem 檔案 | 對應的 TS 檔案 | 狀態 | 比對分析與註記 |
| :--- | :--- | :--- | :--- |
| `client.rb` | `client.ts` | ✅ **完整** | **功能**：HTTP 請求、基礎 URL 設定、錯誤處理 (將 4xx/5xx 狀態碼轉換為自訂錯誤) 皆已完整實作。<br>**差異**：TS 版本使用 `fetch` API，而 Ruby 使用 `HTTParty`，但對外行為一致。 |
| `base.rb` | `base.ts` | ✅ **完整** | **功能**：作為所有資料模型的基底類別，提供屬性容器 (`attributes`) 和 `full?` 狀態檢查。`override_base_uri` 方法也已實作。<br>**差異**：Ruby 的 `add_attribute` 元編程，在 TS 中被替換為明確的 `getter` 和 `getAttribute` 輔助方法，以進行型別轉換，更符合 TS 的靜態型別特性。 |
| `result_set.rb` | `result_set.ts` | ✅ **完整** | **功能**：處理分頁的 API 回應，包含 `count`, `total_pages`, `results` 的解析，以及 `next()` 和 `previous()` 分頁方法。TS 版本也實作了 `Iterable` 介面，支援 `for...of` 迴圈。<br>**狀態**：功能完全對等。 |
| `document.rb` | `document.ts` | ✅ **完整** | **功能**：核心的文件適配器。`search`, `find` 方法皆已實作。`agencies`, `images`, `page_views` 等巢狀資料的解析方法也已對應。<br>**狀態**：功能完全對等。 |
| `document_utilities.rb` | `document.ts` | ✅ **完整** | **功能**：最關鍵的 `find_all` 方法，包含處理超長 URL 的**批次請求邏輯**，已在 `document.ts` 中完整實作並通過測試。<br>**狀態**：功能完全對等。 |
| `agency.rb` | `agency.ts` | ✅ **完整** | **功能**：`all`, `find`, `suggestions` 等查詢方法，以及 `logo_url` 實例方法皆已實作。<br>**狀態**：功能完全對等。 |
| `public_inspection_document.rb` | `public_inspection_document.ts` | ✅ **完整** | **功能**：與 `Document` 類似，其 `search`, `find`, `find_all`, `available_on`, `current` 等方法皆已完整實作。<br>**狀態**：功能完全對等。 |
| `utilities.rb` | `utilities.ts` | ✅ **完整** | **功能**：Ruby 中的 `extract_options` 輔助方法在 TS 中較少使用，但我們依然提供了一個功能對等的靜態方法。<br>**狀態**：功能完全對等。 |
| `article.rb` | `(無)` | ✅ **完整** | **分析**：此檔案只是 `FederalRegister::Article = FederalRegister::Document` 的別名，用於向後相容。TS 版本不需要此檔案，因為沒有歷史包袱。 |
| `highlighted_document.rb` | `highlighted_document.ts` | ✅ **完整** | **狀態**：主要功能 (屬性 `getter`, `photoUrl`) 已實作，`photoCredit` getter 已增強記憶化。<br>**分析**：功能完全對等。 |
| `section.rb` | `section.ts` | ✅ **完整** | **功能**：`search` 方法和 `highlighted_documents` 的解析邏輯皆已實作。<br>**狀態**：功能完全對等。 |
| `suggested_search.rb` | `suggested_search.ts` | ✅ **完整** | **功能**：`search` 和 `find` 方法皆已實作。<br>**狀態**：功能完全對等。 |
| `topic.rb` | `topic.ts` | ✅ **完整** | **功能**：`suggestions` 方法已實作。<br>**狀態**：功能完全對等。 |
| `document_image.rb` | `document_image.ts` | ✅ **完整** | **分析**：此類別用於解析文件中的 `images` 屬性。已建立 `src/document_image.ts`，並在 `Document` 類別的 `images` getter 中回傳 `DocumentImage` 的實例陣列。<br>**狀態**：功能完全對等。 |
| `document_search_details.rb` | `document_search_details.ts` | ✅ **完整** | **分析**：用於 `/documents/search-details` 端點，提供搜尋建議和過濾器。此功能已實作並通過測試。<br>**狀態**：功能完全對等。 |
| `public_inspection_document_search_details.rb` | `public_inspection_document_search_details.ts` | ✅ **完整** | **分析**：同上，但用於公開預覽文件。此功能已實作並通過測試。<br>**狀態**：功能完全對等。 |

---

## 分類統計元件比對 (Facet Components)

| Ruby Gem 檔案 | 對應的 TS 檔案 | 狀態 | 比對分析與註記 |
| :--- | :--- | :--- | :--- |
| `facet.rb` | `facet.ts` | ✅ **完整** | **功能**：`Facet` 基底類別已建立，`search` 方法已實作。<br>**狀態**：功能完全對等。 |
| `facet_result_set.rb` | `facet_result_set.ts` | ✅ **完整** | **功能**：專門處理 Facet API 回應的 `ResultSet` 已實作，能正確處理鍵值對格式的回應。<br>**狀態**：功能完全對等。 |
| `facet/public_inspection_issue.rb` | `facet.ts` | ✅ **完整** | **功能**：`PublicInspectionIssueFacet` 的核心邏輯，包括 `specialFilings` 和 `regularFilings` 皆已實作並通過測試。<br>**狀態**：功能完全對等。 |
| `facet/document/frequency.rb` | `facets/document/frequency.ts` | ✅ **完整** | **狀態**：已作為其他時間類別的基底。<br>**分析**：Ruby 中的 `chart_url` 方法使用了 `HTTParty::HashConversions.to_params` 來序列化參數。經查，TS 版本目前使用的 `buildParams` 函數已能完全對應其序列化行為，對於複雜的巢狀參數處理一致。<br>**狀態**：功能完全對等。 |
| 所有其他的具體 Facet 檔案 | `facets/**/*.ts` | ✅ **完整** | **分析**：所有具體的 Facet 類別 (如 `Agency`, `Daily`, `Topic` 等) 都已建立，並正確地透過 `getUrl()` 方法指向其專屬的 API 端點。<br>**狀態**：功能完全對等。 |

---

## 結論與後續計畫

我們的 TypeScript 函式庫已經成功複製了原始 Ruby Gem **所有核心商業邏輯**，並已完成所有先前標示為「缺少」或「部分」的功能點。

**綜合評估：目前的 `fr-ts-microservices` 專案已經可以作為 Ruby Gem 的高效能、強型別替代品，投入到後續的整合與應用開發中。**

**下一步：**

1.  繼續執行原計畫的第二步：分析並取代現有的後端 `fr-proxy.ts` 和 `fr-ruby-adapter`。
