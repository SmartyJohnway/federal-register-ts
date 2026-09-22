# API Reference

This document is the normative API reference for `federal-register-ts`, an independent TypeScript SDK for the FederalRegister.gov API.

All methods are accessed via an instance of `FederalRegisterClient`, organized into 14 top-level operation namespaces comprising exactly 53 canonical operations.

---

## Client Instantiation

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

// Default configuration (points to https://www.federalregister.gov/api/v1)
const client = new FederalRegisterClient();

// Custom configuration
const customClient = new FederalRegisterClient({
  baseUrl: 'https://www.federalregister.gov/api/v1', // optional custom base URL
  fetch: globalThis.fetch,                          // optional custom fetch implementation
});
```

### Configuration Options (`FederalRegisterClientOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | `string` | `"https://www.federalregister.gov/api/v1"` | Base URL for API requests. Trailing slashes are automatically normalized. |
| `fetch` | `typeof globalThis.fetch` | `globalThis.fetch` | Custom Fetch API implementation for environments requiring specialized HTTP transport. |

---

## Namespaces Overview

All 53 canonical operations are organized under 14 top-level client service namespaces:

| Namespace | Accessor | Operations | Description |
|---|---|---|---|
| Documents | `client.documents` | 20 operations | Published documents (10 operations) plus nested aggregations via `client.documents.facets` (10 operations). |
| Public Inspection | `client.publicInspection` | 14 operations | Pre-publication documents (9 operations) plus nested aggregations via `facets` (3 operations) and `issues.facets` (2 operations). |
| Agencies | `client.agencies` | 4 operations | Agency index, individual agency lookup, multi-lookup, and agency search suggestions. |
| Topics | `client.topics` | 1 operation | Topic suggestions. |
| Sections | `client.sections` | 1 operation | Subject sections of the Federal Register. |
| Suggested Searches | `client.suggestedSearches` | 3 operations | Curated searches by topic, section, and specific query slug. |
| Holidays | `client.holidays` | 1 operation | Federal legal public holidays schedule. |
| Effective Dates | `client.effectiveDates` | 1 operation | Procedural effective date schedule and delay calculations. |
| Issues | `client.issues` | 2 operations | Table of contents for daily Federal Register issues (by date or current). |
| Images | `client.images` | 1 operation | Image metadata lookup by identifier. |
| Category Counts | `client.categoryCounts` | 2 operations | CSV reporting for document types and page count statistics. |
| Site Notifications | `client.siteNotifications` | 1 operation | System and maintenance announcements. |
| Documentation | `client.documentation` | 1 operation | Upstream OpenAPI 3.0 specification download. |
| Clippings | `client.clippings` | 1 operation | Web-owned, session-aware endpoint for user clipping folders. |

> **Architecture Note on Facet Subservices:** Rather than being standalone top-level services, aggregation endpoints are structured as nested subservices on their parent resource services:
> - `client.documents.facets` (10 facet operations)
> - `client.publicInspection.facets` (3 facet operations)
> - `client.publicInspection.issues.facets` (2 facet operations)

---

## 1. Documents Service (`client.documents`)

### `client.documents.search(params?)`
Search published Federal Register documents with structured conditions and full-text querying.

- **Wire Route:** `GET /documents`
- **Parameters:** `DocumentSearchParams` (optional)
  - `conditions?: DocumentSearchConditions` —Structured filters (e.g. `conditions.term` for full-text search, `conditions.agencies`, `conditions.publicationDate`, etc.).
  - `fields?: readonly DocumentField[]` —Requested response fields.
  - `perPage?: number` —Results per page (2..2000).
  - `page?: number` —Page number (1..50).
  - `order?: DocumentOrderInput` —Sort order (`"newest"`, `"oldest"`, `"relevance"`, `"executive_order_number"`, `"proclamation_number"`, `"id"`, `"date"`).
- **Returns:** `Promise<SearchResultEnvelope<DocumentSearchItem<K>>>`

```typescript
const result = await client.documents.search({
  conditions: {
    term: 'water quality',
  },
  perPage: 10,
  page: 1,
  order: 'newest',
});
```

### `client.documents.find(params)`
Retrieve a single published document by its document number.

- **Wire Route:** `GET /documents/{document_number}`
- **Parameters:** `DocumentFindParams`
  - `documentNumber: string` —Opaque document number (e.g. `"2024-01234"`).
  - `fields?: readonly DocumentField[]` —Requested response fields.
- **Returns:** `Promise<DocumentShow<K>>`

```typescript
const doc = await client.documents.find({
  documentNumber: '2024-01234',
  fields: ['title', 'document_number', 'publication_date', 'html_url'],
});
```

### `client.documents.findMany(params)`
Retrieve multiple published documents by document numbers. Partial success (when some documents exist and others do not) is returned in the envelope without throwing.

- **Wire Route:** `GET /documents/{document_numbers}`
- **Parameters:** `DocumentFindManyParams`
  - `documentNumbers: readonly [string, ...string[]]` —Non-empty array of document numbers.
  - `fields?: readonly DocumentField[]` —Requested response fields.
- **Returns:** `Promise<MultiLookupEnvelope<DocumentShow<K>>>`

```typescript
const batch = await client.documents.findMany({
  documentNumbers: ['2024-01234', '2024-05678'],
});
// batch.results contains found documents
// batch.errors?.not_found contains missing numbers, if any
```

### `client.documents.findByCitation(params)`
Retrieve a document by its official Federal Register citation (volume and page number).

- **Wire Route:** `GET /documents/{volume}%20FR%20{page}`
- **Parameters:** `DocumentCitationFindParams`
  - `citation: FederalRegisterCitation` —Federal Register citation object (`{ volume: PositiveInteger, page: PositiveInteger }`).
  - `fields?: readonly DocumentField[]` —Requested response fields.
- **Returns:** `Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>`

```typescript
const citation = await client.documents.findByCitation({
  citation: { volume: 89, page: 12345 },
});
```

### `client.documents.findManyByCitation(params)`
Retrieve multiple documents by citations.

- **Wire Route:** `GET /documents/{citations}`
- **Parameters:** `DocumentCitationFindManyParams`
  - `citations: NonEmptyReadonlyArray<FederalRegisterCitation>` —Non-empty list of citations (`{ volume, page }`).
  - `fields?: readonly DocumentField[]` —Requested response fields.
- **Returns:** `Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>`

### `client.documents.autocomplete(params)`
Retrieve search autocomplete suggestions matching a partial term.

- **Wire Route:** `GET /documents/autocomplete-suggestions`
- **Parameters:** `DocumentAutocompleteParams`
  - `term: string` —Partial search query text.
- **Returns:** `Promise<DocumentAutocompleteSuggestion[]>`

### `client.documents.searchDetails(params?)`
Retrieve search metadata, query breakdown, and refinement suggestions for a given document search.

- **Wire Route:** `GET /documents/search-details`
- **Parameters:** `DocumentSearchDetailsParams` (optional)
- **Returns:** `Promise<DocumentSearchDetails>`

### `client.documents.findCsv(params)`
Export metadata of specified documents as raw CSV text.

- **Wire Route:** `GET /documents/{document_numbers}.csv`
- **Parameters:** `DocumentFindCsvParams`
  - `documentNumbers: readonly [string, ...string[]]` —Non-empty array of document numbers.
- **Returns:** `Promise<DocumentCsvText>` (string containing raw CSV data)

### `client.documents.searchCsv(params?)`
Export document search results as raw CSV text.

- **Wire Route:** `GET /documents.csv`
- **Parameters:** `DocumentSearchCsvParams` (optional)
- **Returns:** `Promise<DocumentCsvText>`

### `client.documents.searchRss(params?)`
Retrieve document search results as an RSS XML feed.

- **Wire Route:** `GET /documents.rss`
- **Parameters:** `DocumentSearchRssParams` (optional)
- **Returns:** `Promise<DocumentRssXmlText>` (string containing XML)

---

## 2. Document Facets Service (`client.documents.facets`)

Document facets return aggregation maps showing counts of documents matching conditions across various dimensions. All facet operations accept `DocumentFacetParams` (structured conditions).

| Method | Wire Route | Return Type | Description |
|---|---|---|---|
| `agency(params?)` | `GET /documents/facets/agency` | `Promise<DocumentAgencyFacetMap>` | Counts grouped by agency. |
| `topic(params?)` | `GET /documents/facets/topic` | `Promise<DocumentTopicFacetMap>` | Counts grouped by topic. |
| `section(params?)` | `GET /documents/facets/section` | `Promise<DocumentSectionFacetMap>` | Counts grouped by Federal Register section. |
| `type(params?)` | `GET /documents/facets/type` | `Promise<DocumentTypeFacetMap>` | Counts grouped by document type (`RULE`, `PRORULE`, `NOTICE`, `PRESDOCU`). |
| `subtype(params?)` | `GET /documents/facets/subtype` | `Promise<DocumentSubtypeFacetMap>` | Counts grouped by presidential document subtype. |
| `daily(params?)` | `GET /documents/facets/daily` | `Promise<DocumentDailyFacetMap>` | Daily publication count histogram. |
| `weekly(params?)` | `GET /documents/facets/weekly` | `Promise<DocumentWeeklyFacetMap>` | Weekly publication count histogram. |
| `monthly(params?)` | `GET /documents/facets/monthly` | `Promise<DocumentMonthlyFacetMap>` | Monthly publication count histogram. |
| `quarterly(params?)` | `GET /documents/facets/quarterly` | `Promise<DocumentQuarterlyFacetMap>` | Quarterly publication count histogram. |
| `yearly(params?)` | `GET /documents/facets/yearly` | `Promise<DocumentYearlyFacetMap>` | Yearly publication count histogram. |

```typescript
const agencyCounts = await client.documents.facets.agency({
  conditions: {
    publicationDate: { is: '2024-01-15' },
  },
});
```

---

## 3. Public Inspection Service (`client.publicInspection`)

Public Inspection documents are filed for public inspection prior to publication in the Federal Register.

### `client.publicInspection.search(params?)`
Search current and historical public inspection documents.

- **Wire Route:** `GET /public-inspection-documents`
- **Parameters:** `PublicInspectionSearchParams` (optional)
  - `page?: number` —Page number (1..50).
  - `perPage?: number` —Results per page (2..2000).
  - `fields?: readonly PublicInspectionField[]` —Requested response fields.
  - `conditions?: PublicInspectionSearchConditions` —Structured filter conditions.
- **Returns:** `Promise<SearchResultEnvelope<PublicInspectionSearchItem<K>>>`

### `client.publicInspection.availableOn(params)`
Retrieve public inspection documents available on a specific calendar date.

- **Wire Route:** `GET /public-inspection-documents?conditions[available_on]=YYYY-MM-DD`
- **Parameters:** `PublicInspectionAvailableOnParams`
  - `availableOn: IsoDateString` —Calendar date (`YYYY-MM-DD`).
  - `fields?: readonly PublicInspectionField[]` —Requested response fields.
- **Returns:** `Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>`

### `client.publicInspection.current(params?)`
Retrieve the current filed public inspection documents.

- **Wire Route:** `GET /public-inspection-documents/current`
- **Parameters:** `PublicInspectionCurrentParams` (optional)
  - `fields?: readonly PublicInspectionField[]` —Requested response fields.
- **Returns:** `Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>`

### `client.publicInspection.find(params)`
Retrieve a single public inspection document by document number.

- **Wire Route:** `GET /public-inspection-documents/{document_number}`
- **Parameters:** `PublicInspectionFindParams`
  - `documentNumber: DocumentNumber` —Opaque document number string.
  - `fields?: readonly PublicInspectionField[]` —Requested response fields.
- **Returns:** `Promise<PublicInspectionShow<K>>`

### `client.publicInspection.findMany(params)`
Retrieve multiple public inspection documents by document numbers.

- **Wire Route:** `GET /public-inspection-documents/{document_numbers}`
- **Parameters:** `PublicInspectionFindManyParams`
  - `documentNumbers: NonEmptyReadonlyArray<DocumentNumber>` —Non-empty array of document numbers.
  - `fields?: readonly PublicInspectionField[]` —Requested response fields.
- **Returns:** `Promise<MultiLookupEnvelope<PublicInspectionShow<K>>>`

### `client.publicInspection.searchDetails(params?)`
Retrieve search query breakdown and suggestions for a public inspection search.

- **Wire Route:** `GET /public-inspection-documents/search-details`
- **Parameters:** `PublicInspectionSearchDetailsParams` (optional)
  - `conditions?: PublicInspectionSearchConditions` —Structured filter conditions.
- **Returns:** `Promise<PublicInspectionSearchDetails>`

### `client.publicInspection.currentCsv(params?)`
Export current public inspection documents as CSV text.

- **Wire Route:** `GET /public-inspection-documents/current.csv`
- **Parameters:** `PublicInspectionCurrentCsvParams` (optional)
  - `fields?: readonly PublicInspectionField[]` —Requested response fields.
- **Returns:** `Promise<PublicInspectionCsvText>`

### `client.publicInspection.searchCsv(params?)`
Export public inspection search results as CSV text.

- **Wire Route:** `GET /public-inspection-documents.csv`
- **Parameters:** `PublicInspectionSearchCsvParams` (optional)
  - `conditions?: PublicInspectionSearchConditions` —Structured filter conditions.
  - `fields?: readonly PublicInspectionField[]` —Requested response fields.
- **Returns:** `Promise<PublicInspectionCsvText>`

### `client.publicInspection.searchRss(params?)`
Retrieve public inspection search results as an RSS feed.

- **Wire Route:** `GET /public-inspection-documents.rss`
- **Parameters:** `PublicInspectionSearchRssParams` (optional)
  - `conditions?: PublicInspectionSearchConditions` —Structured filter conditions.
- **Returns:** `Promise<PublicInspectionRssXmlText>`

---

## 4. Public Inspection Facets (`client.publicInspection.facets` & `issues.facets`)

### Document Facets (`client.publicInspection.facets`)

| Method | Wire Route | Return Type | Description |
|---|---|---|---|
| `type(params?)` | `GET /public-inspection-documents/facets/type` | `Promise<PublicInspectionTypeFacetMap>` | Counts by document type. |
| `agency(params?)` | `GET /public-inspection-documents/facets/agency` | `Promise<PublicInspectionAgencyIdFacetMap>` | Counts by numeric agency ID. |
| `agencies(params?)` | `GET /public-inspection-documents/facets/agencies` | `Promise<PublicInspectionAgencySlugFacetMap>` | Counts by agency text slug. |

### Issue Facets (`client.publicInspection.issues.facets`)

| Method | Wire Route | Return Type | Description |
|---|---|---|---|
| `daily(params)` | `GET /public-inspection-issues/facets/daily` | `Promise<PublicInspectionIssueDailyFacetMap>` | Daily count histogram across public inspection issues (`params: PublicInspectionIssueDailyFacetParams` required). |
| `type(params)` | `GET /public-inspection-issues/facets/type` | `Promise<PublicInspectionIssueTypeFacetMap>` | Document type breakdown across public inspection issues (`params: PublicInspectionIssueTypeFacetParams` required). |

---

## 5. Agencies Service (`client.agencies`)

### `client.agencies.list(params?)`
Retrieve the directory of federal agencies.

- **Wire Route:** `GET /agencies`
- **Parameters:** `AgencyListParams` (optional)
  - `fields?: readonly AgencyField[]` —Requested response fields.
- **Returns:** `Promise<AgencyIndexItem<K>[]>`

```typescript
const agencies = await client.agencies.list();
```

### `client.agencies.find(params)`
Retrieve detailed information for a single agency by slug or numeric ID.

- **Wire Route:** `GET /agencies/{idOrSlug}`
- **Parameters:** `AgencyFindParams`
  - `idOrSlug: PositiveInteger | string` —Agency identifier (e.g. `"environmental-protection-agency"` or `492`).
  - `fields?: readonly AgencyField[]` —Requested response fields.
- **Returns:** `Promise<AgencyProjection<K>>`

```typescript
const epa = await client.agencies.find({ idOrSlug: 'environmental-protection-agency' });
```

### `client.agencies.findMany(params)`
Retrieve multiple agencies by numeric identifiers.

- **Wire Route:** `GET /agencies/{ids}`
- **Parameters:** `AgencyFindManyParams`
  - `ids: NonEmptyReadonlyArray<PositiveInteger>` —Non-empty array of numeric agency IDs.
  - `fields?: readonly AgencyField[]` —Requested response fields.
- **Returns:** `Promise<AgencyProjection<K>[]>` (Note: returns array directly, omitting missing IDs; not a MultiLookupEnvelope)

### `client.agencies.suggestions(params)`
Retrieve agency suggestions based on query text.

- **Wire Route:** `GET /agencies/suggestions`
- **Parameters:** `AgencySuggestionsParams`
  - `term: string` —Query term.
  - `fields?: readonly AgencyField[]` —Requested response fields.
- **Returns:** `Promise<AgencyProjection<K>[]>`

---

## 6. Other Specialized Services

### Topics Service (`client.topics`)
- `suggestions(params)`: `GET /topics/suggestions` —Suggestions matching partial topic names. Accepts `TopicSuggestionsParams` (`term: string; fields?: readonly TopicField[]`). Returns `Promise<readonly TopicProjection<K>[]>`.

### Sections Service (`client.sections`)
- `list()`: `GET /sections` —List all subject sections of the Federal Register (e.g. Money, Environment, World). Returns `Promise<SectionMap>`.

### Suggested Searches Service (`client.suggestedSearches`)
- `list()`: `GET /suggested_searches` —List curated suggested searches. Returns `Promise<SuggestedSearchIndexMap>`.
- `listBySections(params)`: `GET /suggested_searches?conditions[sections][]=...` —List curated searches by section slug array. Accepts `SuggestedSearchSectionsParams` (`sections: readonly string[]`). Returns `Promise<SuggestedSearchIndexMap>`.
- `find(params)`: `GET /suggested_searches/{slug}` —Retrieve details for a specific suggested search. Accepts `SuggestedSearchFindParams` (`slug: string`). Returns `Promise<SuggestedSearchDetail>`.

### Holidays Service (`client.holidays`)
- `list()`: `GET /holidays` —List all official Federal legal public holidays. Returns `Promise<HolidayMap>`.

### Effective Dates Service (`client.effectiveDates`)
- `calculate(params)`: `GET /effective-dates` —Calculate procedurally delayed effective dates given start and end dates. Accepts `EffectiveDatesParams` (`startDate: IsoDateString; endDate: IsoDateString`). Returns `Promise<EffectiveDateMap>`.

### Issues Service (`client.issues`)
- `current()`: `GET /issues/current.json` —Retrieve the table of contents for the current daily Federal Register issue. Returns `Promise<IssueToc>`.
- `find(params)`: `GET /issues/{publicationDate}.json` —Retrieve table of contents for a specific issue date (`YYYY-MM-DD`). Accepts `IssueFindParams` (`publicationDate: IsoDateString`). Returns `Promise<IssueToc>`.

### Images Service (`client.images`)
- `find(params)`: `GET /images/{identifier}` —Retrieve image metadata, variants, and dimensions by image identifier. Accepts `ImageFindParams` (`identifier: string`). Returns `Promise<ImageMetadataMap>`.

### Category Counts Service (`client.categoryCounts`)
- `documentTypeCsv()`: `GET /category_counts/document_type.csv` —CSV reporting document distribution by category type. Returns `Promise<DocumentTypeCategoryCountCsvText>`.
- `pageCountCsv()`: `GET /category_counts/page_count.csv` —CSV reporting page count totals. Returns `Promise<PageCountCategoryCountCsvText>`.

### Site Notifications Service (`client.siteNotifications`)
- `find(params)`: `GET /site_notifications/{identifier}` —Retrieve site notification by identifier. Accepts `SiteNotificationFindParams` (`identifier: string`). Returns `Promise<ActiveSiteNotification | InactiveSiteNotification>`.

### Documentation Service (`client.documentation`)
- `fetchOpenApi()`: `GET /documentation` —Fetch the official OpenAPI 3.0 specification directly from FederalRegister.gov. Returns `Promise<FederalRegisterOpenApiDocument>`.

### Clippings Service (`client.clippings`)
- `current()`: `GET /clippings` —Web-owned, session-aware user clippings endpoint. Anonymous requests return an empty clipboard (verified contract); authenticated/signed-in behavior remains `AUTH_DEFERRED`. Returns `Promise<WebClippingsResponse>`.

---

## Error Hierarchy

The SDK provides a structured error hierarchy for handling request validation, HTTP transport errors, and API-specific condition payloads:

```text
Error
├── RequestValidationError                  (Client-side parameter validation failure, zero network requests)
└── FederalRegisterError                    (Base class for API-related SDK failures)
    ├── FederalRegisterHttpError<TBody>     (Non-2xx HTTP status from API)
    │   ├── FederalRegisterStatusMessageError   ({ status, message } body from upstream)
    │   ├── FederalRegisterSearchValidationError ({ errors: { [field]: reason } })
    │   ├── FederalRegisterAgencyNotFoundError  ({ error: 404 } for missing agency)
    │   ├── FederalRegisterEffectiveDateRangeError ({ error: string } for date calc)
    │   ├── FederalRegisterEmptyJsonError       (Empty JSON {} response body)
    │   ├── FederalRegisterEmptyBodyError       (Empty body with 0 bytes)
    │   └── FederalRegisterRawResponseError     (Non-JSON, HTML 404/502, or unparseable body)
    └── PublicInspectionIssueConditionError (Operation-specific semantic 400 error in HTTP 200 payload)
```

### Error Inheritance & Semantics
- **`RequestValidationError`** extends JavaScript's built-in `Error` directly and is thrown before dispatching HTTP requests when parameter validation fails (e.g. invalid date format, out-of-range pagination, unauthorized field projection, or unrecognized request keys).
- **`FederalRegisterError`** extends `Error` as the base class for server/API errors.
- **`FederalRegisterHttpError<TBody>`** extends `FederalRegisterError` for non-2xx HTTP transport responses, preserving `status`, `contentType`, `bodyKind`, `body`, and `rawText`.
- **`FederalRegisterRawResponseError`** is thrown when the upstream server returns non-JSON content (such as HTML 404 pages for missing resources or gateway error pages). Structured error types (like `FederalRegisterAgencyNotFoundError`) apply only when upstream provides the corresponding structured JSON payload.
- **`PublicInspectionIssueConditionError`** extends `FederalRegisterError` directly (not `FederalRegisterHttpError`). It represents the operation-specific Public Inspection Issue semantic error path where HTTP 200 may contain a body with status 400 semantics.

### Inspecting Errors

```typescript
import {
  FederalRegisterClient,
  RequestValidationError,
  FederalRegisterError,
  FederalRegisterSearchValidationError,
  FederalRegisterRawResponseError,
  FederalRegisterHttpError,
} from 'federal-register-ts';

const client = new FederalRegisterClient();

try {
  await client.documents.search({
    conditions: { term: 'clean energy' },
    page: 100, // Client validation rejects page > 50 before sending request
  });
} catch (err) {
  if (err instanceof RequestValidationError) {
    console.error('Client-side parameter validation failed:', err.message, err.field, err.value);
  } else if (err instanceof FederalRegisterSearchValidationError) {
    console.error('Upstream search validation errors:', err.body?.errors);
  } else if (err instanceof FederalRegisterRawResponseError) {
    console.error(`Upstream raw/HTML error (${err.status}):`, err.rawText);
  } else if (err instanceof FederalRegisterHttpError) {
    console.error(`HTTP status ${err.status}:`, err.rawText);
  } else if (err instanceof FederalRegisterError) {
    console.error('General SDK error:', err.message);
  }
}
```

---

## JSONP Companion Methods & Route-Dependent Behavior

All companion methods with the `*Jsonp` suffix (e.g. `client.documents.searchJsonp`, `client.agencies.listJsonp`) accept a required `callback` parameter:

```typescript
const jsonpResult = await client.documents.searchJsonp({
  conditions: { term: 'environment' },
  callback: 'handleResults',
});
```

> **Important Route Behavior Note:** As verified by comprehensive public sweep, upstream FederalRegister.gov JSONP behavior is route-dependent across endpoints:
> - **Wrapped Callback (19 endpoints):** Returns JavaScript function invocation `callback({...});`.
> - **Bare JSON (6 endpoints):** Returns raw JSON text regardless of the callback query parameter.
> - **Upstream Error (4 endpoints):** Certain endpoints return HTTP 405 or non-JSON errors under JSONP requests.
>
> The SDK preserves raw server response text via `JsonpText` (`string`) without fabricating artificial client-side wrapper layers.
