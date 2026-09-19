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

| Namespace | Accessor | Canonical Operations | Description |
|---|---|---|---|
| Documents | `client.documents` | 10 operations | Search, retrieve, export, citation lookup, and autocomplete for published Federal Register documents. |
| Document Facets | `client.documents.facets` | 10 operations | Aggregations and breakdowns by agency, topic, section, type, subtype, and date ranges. |
| Public Inspection | `client.publicInspection` | 9 operations | Search, retrieve, and export Public Inspection (pre-publication) documents. |
| Public Inspection Facets | `client.publicInspection.facets` | 3 operations | Facet breakdowns for Public Inspection documents by type and agency. |
| Public Inspection Issue Facets | `client.publicInspection.issues.facets` | 2 operations | Daily and document-type aggregations for Public Inspection issues. |
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
| Documentation | `client.documentation` | 1 operation | Upstream OpenAPI v1 specification download. |
| Clippings | `client.clippings` | 1 operation | Web-owned user clipping folders (session-authenticated). |

---

## 1. Documents Service (`client.documents`)

### `client.documents.search(params?)`
Search published Federal Register documents with structured conditions and full-text querying.

- **Wire Route:** `GET /documents.json`
- **Parameters:** `DocumentSearchParams` (optional)
  - `conditions?: DocumentConditions` ??Structured filters (e.g. `conditions.term` for full-text search, `conditions.agencies`, `conditions.publication_date`, etc.).
  - `fields?: readonly DocumentField[]` ??Requested response fields.
  - `perPage?: number` ??Results per page (2..2000).
  - `page?: number` ??Page number (1..50).
  - `order?: DocumentSearchOrder` ??Sort order (`"newest"`, `"oldest"`, `"relevance"`, `"executive_order"`).
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

- **Wire Route:** `GET /documents/{document_number}.json`
- **Parameters:** `DocumentFindParams`
  - `documentNumber: string` ??Opaque document number (e.g. `"2024-01234"`).
  - `fields?: readonly DocumentField[]` ??Requested response fields.
- **Returns:** `Promise<DocumentShow<K>>`

```typescript
const doc = await client.documents.find({
  documentNumber: '2024-01234',
  fields: ['title', 'document_number', 'publication_date', 'html_url'],
});
```

### `client.documents.findMany(params)`
Retrieve multiple published documents by document numbers. Partial success (when some documents exist and others do not) is returned in the envelope without throwing.

- **Wire Route:** `GET /documents/{document_numbers}.json`
- **Parameters:** `DocumentFindManyParams`
  - `documentNumbers: readonly [string, ...string[]]` ??Non-empty array of document numbers.
  - `fields?: readonly DocumentField[]` ??Requested response fields.
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

- **Wire Route:** `GET /documents/{volume}%20FR%20{page}.json`
- **Parameters:** `DocumentCitationFindParams`
  - `volume: number` ??Federal Register volume number.
  - `page: number` ??Federal Register page number.
  - `fields?: readonly DocumentField[]` ??Requested response fields.
- **Returns:** `Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>`

```typescript
const citation = await client.documents.findByCitation({
  citation: { volume: 89, page: 12345 },
});
```

### `client.documents.findManyByCitation(params)`
Retrieve multiple documents by citations.

- **Wire Route:** `GET /documents/{citations}.json`
- **Parameters:** `DocumentCitationFindManyParams`
  - `citations: readonly [FederalRegisterCitation, ...FederalRegisterCitation[]]` ??Non-empty list of citations (`{ volume, page }`).
  - `fields?: readonly DocumentField[]` ??Requested response fields.
- **Returns:** `Promise<MultiLookupEnvelope<DocumentShow<K | "citation">>>`

### `client.documents.autocomplete(params)`
Retrieve search autocomplete suggestions matching a partial term.

- **Wire Route:** `GET /documents/autocomplete-suggestions.json`
- **Parameters:** `DocumentAutocompleteParams`
  - `term: string` ??Partial search query text.
- **Returns:** `Promise<DocumentAutocompleteSuggestion[]>`

### `client.documents.searchDetails(params?)`
Retrieve search metadata, query breakdown, and refinement suggestions for a given document search.

- **Wire Route:** `GET /documents/search-details.json`
- **Parameters:** `DocumentSearchDetailsParams` (optional)
- **Returns:** `Promise<DocumentSearchDetails>`

### `client.documents.findCsv(params)`
Export metadata of specified documents as raw CSV text.

- **Wire Route:** `GET /documents/{document_numbers}.csv`
- **Parameters:** `DocumentFindCsvParams`
  - `documentNumbers: readonly [string, ...string[]]` ??Non-empty array of document numbers.
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
| `agency(params?)` | `GET /documents/facets/agency.json` | `Promise<DocumentAgencyFacetMap>` | Counts grouped by agency. |
| `topic(params?)` | `GET /documents/facets/topic.json` | `Promise<DocumentTopicFacetMap>` | Counts grouped by topic. |
| `section(params?)` | `GET /documents/facets/section.json` | `Promise<DocumentSectionFacetMap>` | Counts grouped by Federal Register section. |
| `type(params?)` | `GET /documents/facets/type.json` | `Promise<DocumentTypeFacetMap>` | Counts grouped by document type (`RULE`, `PRORULE`, `NOTICE`, `PRESDOCU`). |
| `subtype(params?)` | `GET /documents/facets/subtype.json` | `Promise<DocumentSubtypeFacetMap>` | Counts grouped by presidential document subtype. |
| `daily(params?)` | `GET /documents/facets/daily.json` | `Promise<DocumentDailyFacetMap>` | Daily publication count histogram. |
| `weekly(params?)` | `GET /documents/facets/weekly.json` | `Promise<DocumentWeeklyFacetMap>` | Weekly publication count histogram. |
| `monthly(params?)` | `GET /documents/facets/monthly.json` | `Promise<DocumentMonthlyFacetMap>` | Monthly publication count histogram. |
| `quarterly(params?)` | `GET /documents/facets/quarterly.json` | `Promise<DocumentQuarterlyFacetMap>` | Quarterly publication count histogram. |
| `yearly(params?)` | `GET /documents/facets/yearly.json` | `Promise<DocumentYearlyFacetMap>` | Yearly publication count histogram. |

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

- **Wire Route:** `GET /public-inspection-documents.json`
- **Parameters:** `PublicInspectionSearchParams` (optional)
- **Returns:** `Promise<SearchResultEnvelope<PublicInspectionSearchItem<K>>>`

### `client.publicInspection.availableOn(params)`
Retrieve public inspection documents available on a specific calendar date.

- **Wire Route:** `GET /public-inspection-documents/available_on/{date}.json`
- **Parameters:** `PublicInspectionAvailableOnParams`
  - `date: string` ??ISO date (`YYYY-MM-DD`).
- **Returns:** `Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>`

### `client.publicInspection.current(params?)`
Retrieve the current filed public inspection documents.

- **Wire Route:** `GET /public-inspection-documents/current.json`
- **Parameters:** `PublicInspectionCurrentParams` (optional)
- **Returns:** `Promise<PublicInspectionIssueDocumentsEnvelope<PublicInspectionIssueItem<K>>>`

### `client.publicInspection.find(params)`
Retrieve a single public inspection document by document number.

- **Wire Route:** `GET /public-inspection-documents/{document_number}.json`
- **Parameters:** `PublicInspectionFindParams`
- **Returns:** `Promise<PublicInspectionShow<K>>`

### `client.publicInspection.findMany(params)`
Retrieve multiple public inspection documents by document numbers.

- **Wire Route:** `GET /public-inspection-documents/{document_numbers}.json`
- **Parameters:** `PublicInspectionFindManyParams`
- **Returns:** `Promise<MultiLookupEnvelope<PublicInspectionShow<K>>>`

### `client.publicInspection.searchDetails(params?)`
Retrieve search query breakdown and suggestions for a public inspection search.

- **Wire Route:** `GET /public-inspection-documents/search-details.json`
- **Parameters:** `PublicInspectionSearchDetailsParams` (optional)
- **Returns:** `Promise<PublicInspectionSearchDetails>`

### `client.publicInspection.currentCsv(params?)`
Export current public inspection documents as CSV text.

- **Wire Route:** `GET /public-inspection-documents/current.csv`
- **Returns:** `Promise<PublicInspectionCsvText>`

### `client.publicInspection.searchCsv(params?)`
Export public inspection search results as CSV text.

- **Wire Route:** `GET /public-inspection-documents.csv`
- **Returns:** `Promise<PublicInspectionCsvText>`

### `client.publicInspection.searchRss(params?)`
Retrieve public inspection search results as an RSS feed.

- **Wire Route:** `GET /public-inspection-documents.rss`
- **Returns:** `Promise<PublicInspectionRssXmlText>`

---

## 4. Public Inspection Facets (`client.publicInspection.facets` & `issues.facets`)

### Document Facets (`client.publicInspection.facets`)

| Method | Wire Route | Return Type | Description |
|---|---|---|---|
| `type(params?)` | `GET /public-inspection-documents/facets/type.json` | `Promise<PublicInspectionTypeFacetMap>` | Counts by document type. |
| `agency(params?)` | `GET /public-inspection-documents/facets/agency.json` | `Promise<PublicInspectionAgencyIdFacetMap>` | Counts by numeric agency ID. |
| `agencies(params?)` | `GET /public-inspection-documents/facets/agencies.json` | `Promise<PublicInspectionAgencySlugFacetMap>` | Counts by agency text slug. |

### Issue Facets (`client.publicInspection.issues.facets`)

| Method | Wire Route | Return Type | Description |
|---|---|---|---|
| `daily(params?)` | `GET /public-inspection-issues/facets/daily.json` | `Promise<PublicInspectionIssueDailyFacetMap>` | Daily count histogram across public inspection issues. |
| `type(params?)` | `GET /public-inspection-issues/facets/type.json` | `Promise<PublicInspectionIssueTypeFacetMap>` | Document type breakdown across public inspection issues. |

---

## 5. Agencies Service (`client.agencies`)

### `client.agencies.list(params?)`
Retrieve the directory of federal agencies.

- **Wire Route:** `GET /agencies.json`
- **Parameters:** `AgencyListParams` (optional)
  - `fields?: readonly AgencyField[]` ??Requested response fields.
- **Returns:** `Promise<AgencyIndexItem<K>[]>`

```typescript
const agencies = await client.agencies.list();
```

### `client.agencies.find(params)`
Retrieve detailed information for a single agency by slug or numeric ID.

- **Wire Route:** `GET /agencies/{slug_or_id}.json`
- **Parameters:** `AgencyFindParams`
  - `idOrSlug: PositiveInteger | string` ??Agency identifier (e.g. `"environmental-protection-agency"` or `492`).
  - `fields?: readonly AgencyField[]` ??Requested response fields.
- **Returns:** `Promise<AgencyProjection<K>>`

```typescript
const epa = await client.agencies.find({ idOrSlug: 'environmental-protection-agency' });
```

### `client.agencies.findMany(params)`
Retrieve multiple agencies by identifiers.

- **Wire Route:** `GET /agencies/{slugs_or_ids}.json`
- **Parameters:** `AgencyFindManyParams`
  - `slugsOrIds: readonly [string | number, ...(string | number)[]]` ??Non-empty array of slugs/IDs.
- **Returns:** `Promise<AgencyProjection<K>[]>`

### `client.agencies.suggestions(params)`
Retrieve agency suggestions based on query text.

- **Wire Route:** `GET /agencies/suggestions.json`
- **Parameters:** `AgencySuggestionsParams`
  - `term: string` ??Query term.
- **Returns:** `Promise<AgencyProjection<K>[]>`

---

## 6. Other Specialized Services

### Topics Service (`client.topics`)
- `suggestions(params)`: `GET /topics/suggestions.json` ??Suggestions matching partial topic names.

### Sections Service (`client.sections`)
- `list()`: `GET /sections.json` ??List all subject sections of the Federal Register (e.g. Money, Environment, World).

### Suggested Searches Service (`client.suggestedSearches`)
- `list()`: `GET /suggested_searches.json` ??List curated suggested searches.
- `listBySections(params)`: `GET /suggested_searches/sections/{sections}.json` ??List curated searches by section slug.
- `find(params)`: `GET /suggested_searches/{slug}.json` ??Retrieve details for a specific suggested search.

### Holidays Service (`client.holidays`)
- `list()`: `GET /holidays.json` ??List all official Federal legal public holidays.

### Effective Dates Service (`client.effectiveDates`)
- `calculate(params)`: `GET /effective_date_calculator.json` ??Calculate procedurally delayed effective dates given a publication date and delay rule.

### Issues Service (`client.issues`)
- `current()`: `GET /issues/current.json` ??Retrieve the table of contents for the current daily Federal Register issue.
- `find(params)`: `GET /issues/{date}.json` ??Retrieve table of contents for a specific issue date (`YYYY-MM-DD`).

### Images Service (`client.images`)
- `find(params)`: `GET /images/{id}.json` ??Retrieve image metadata, variants, and dimensions by image ID.

### Category Counts Service (`client.categoryCounts`)
- `documentTypeCsv()`: `GET /category_counts/document_type.csv` ??CSV reporting document distribution by category type.
- `pageCountCsv()`: `GET /category_counts/page_count.csv` ??CSV reporting page count totals.

### Site Notifications Service (`client.siteNotifications`)
- `find()`: `GET /site_notifications.json` ??Retrieve active and historical site notifications.

### Documentation Service (`client.documentation`)
- `fetchOpenApi()`: `GET /openapi/v1.json` ??Fetch the official OpenAPI v1 specification directly from FederalRegister.gov.

### Clippings Service (`client.clippings`)
- `current()`: `GET /my/clippings.json` ??Web-owned session clippings endpoint. Requires upstream session authentication cookies.

---

## Error Hierarchy

All SDK errors inherit from the root `FederalRegisterError` class.

```text
FederalRegisterError
??? RequestValidationError                  (Client-side request validation failure)
??? FederalRegisterHttpError<TBody>        (Non-2xx HTTP status from API)
    ??? FederalRegisterStatusMessageError   ({ status, message } body from upstream)
    ??? FederalRegisterSearchValidationError ({ errors: { [field]: reason } })
    ??? FederalRegisterAgencyNotFoundError  ({ error: 404 } for missing agency)
    ??? FederalRegisterEffectiveDateRangeError ({ error: string } for date calc)
    ??? PublicInspectionIssueConditionError ({ status: 400, error: string })
    ??? FederalRegisterEmptyJsonError       (Empty JSON {} response body)
    ??? FederalRegisterEmptyBodyError       (Empty body with 0 bytes)
    ??? FederalRegisterRawResponseError     (Non-JSON or unparseable body)
```

### Inspecting Errors

```typescript
import {
  FederalRegisterClient,
  FederalRegisterError,
  FederalRegisterSearchValidationError,
  FederalRegisterHttpError,
} from 'federal-register-ts';

try {
  await client.documents.search({
    conditions: { publicationDate: { is: 'invalid-date' } },
  });
} catch (err) {
  if (err instanceof FederalRegisterSearchValidationError) {
    console.error('Validation errors from API:', err.body?.errors);
  } else if (err instanceof FederalRegisterHttpError) {
    console.error(`HTTP status ${err.status}:`, err.rawText);
  } else if (err instanceof FederalRegisterError) {
    console.error('General SDK error:', err.message);
  }
}
```
