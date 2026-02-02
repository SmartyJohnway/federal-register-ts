# 開發日誌：建立專案 Schema 定義 (JSON Schema & OpenAPI 3.1)

**日期:** 2025年11月1日

**目標:** 為 `fr-ts-microservices` 專案建立完整的 Schema 定義，包括 JSON Schema 和 OpenAPI 3.1 規範，涵蓋從彙整器到每個服務的所有資料模型和 API 端點。

## 任務分解

1.  **建立 `docs/schema` 目錄**: 用於存放所有 Schema 定義檔案。
2.  **分析資料模型**: 逐一分析 `src` 目錄下的所有類別和介面 (例如 `AggregatedQuery`, `AggregatedResponse`, `Document`, `Agency`, `Facet` 等)，理解其屬性、類型、關聯和約束。
3.  **定義 JSON Schema**: 為每個核心資料模型和請求/回應結構建立獨立的 JSON Schema 檔案 (例如 `document.schema.json`, `aggregated_query.schema.json`)。
4.  **定義 OpenAPI 3.1 規範**: 建立一個主 `openapi.yaml` (或 `openapi.json`) 檔案，描述專案提供的 API 端點 (例如 `/documents/search`, `/agencies/all`)，其請求參數、回應結構，並引用步驟 3 中定義的 JSON Schema。
5.  **驗證 Schema**: 確保生成的 Schema 定義是有效且準確的，能夠正確描述專案的資料結構和 API 行為。

## 預期產出

*   `docs/schema/` 目錄
*   多個 `.schema.json` 檔案 (例如 `document.schema.json`, `agency.schema.json`, `aggregated_query.schema.json`, `aggregated_response.schema.json` 等)
*   `docs/schema/openapi.yaml` (或 `openapi.json`)

