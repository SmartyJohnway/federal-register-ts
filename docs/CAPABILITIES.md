# Governed Capabilities Matrix

This document provides the normative 120-capability matrix for `federal-register-ts`, aligning directly with the frozen canonical contract in `r0-07_final_120_capability_ts_surface_registry.json`.

> **Important Distinction:** The Federal Register API surface is governed across **120 distinct capability records**, which represent specific operations, filters, query parameters, format exports, facet dimensions, server contracts, and error profiles. **120 governed capabilities is NOT equivalent to 120 API endpoints.** The underlying API exposes 28 current v1 route patterns (27 in federalregister-api-core and 1 web-owned endpoint in federalregister-web); multiple capabilities govern distinct query parameter semantics, response representation policies, or data formats on shared routes.

## Summary Breakdown

- **Total Governed Capabilities:** 120
- **Top-Level Namespaces:** 14
- **Canonical Operations:** 53
- **TypeScript Required Coverage:** 120 / 120 (100%)
- **Intentionally Unsupported:** 0
- **Uncertainty Guards:** 16 preserved upstream behaviors (documented below)

## Capability Directory

| ID | Family | Capability Name | Mode | TypeScript Symbol / Surface | Route / Wire Surface |
|---|---|---|---|---|---|
| FR-PROTO-001 | 6.1 Protocol | Default JSON negotiation for API v1 routes | FORMAT | `policy:unsuffixed-json-default` | `/api/v1/*` |
| FR-PROTO-002 | 6.1 Protocol | Wildcard CORS response header | SERVER_BEHAVIOR | `assertion:wildcard-cors` | `/api/v1/*` |
| FR-PROTO-003 | 6.1 Protocol | JSONP callback rendering | FORMAT | `policy:jsonp-raw-text` | `JSON endpoints` |
| FR-PROTO-004 | 6.1 Protocol | Server-side fields[] projection | QUERY_INPUT | `type:ProjectionParams<TField>.fields` | `Represented endpoints` |
| FR-PROTO-005 | 6.1 Protocol | Unknown projected field error | CLIENT_ERROR_MODEL | `error:FederalRegisterStatusMessageError` | `Represented endpoints` |
| FR-PROTO-006 | 6.1 Protocol | Search validation error contract | CLIENT_ERROR_MODEL | `error:FederalRegisterSearchValidationError` | `Search/facet/search-details` |
| FR-PROTO-007 | 6.1 Protocol | Record-not-found error contract | CLIENT_ERROR_MODEL | `error:FederalRegisterStatusMessageError` | `Show/facet routes` |
| FR-PROTO-008 | 6.1 Protocol | Method-not-allowed error contract | CLIENT_ERROR_MODEL | `error:FederalRegisterStatusMessageError` | `/api/v1/*` |
| FR-PROTO-009 | 6.1 Protocol | Production/staging server-error contract | CLIENT_ERROR_MODEL | `error:FederalRegisterStatusMessageError_OR_RawResponseError` | `/api/v1/*` |
| FR-PROTO-010 | 6.1 Protocol | Page normalization and hard page ceiling | QUERY_INPUT | `type:PageNumber.page` | `Search endpoints` |
| FR-PROTO-011 | 6.1 Protocol | Pagination size normalization and effective maximum | QUERY_INPUT | `type:PerPage.perPage` | `Search endpoints` |
| FR-PROTO-013 | 6.1 Protocol | Executive Order CSV maximum_per_page exception | QUERY_INPUT | `type:ExecutiveOrderCsvSearchParams.perPage + presidentialDocumentType` | `/api/v1/documents.csv` |
| FR-PROTO-014 | 6.1 Protocol | metadata_only search mode | QUERY_INPUT | `type:DocumentSearchParams \| PublicInspectionSearchParams.metadataOnly` | `Document/PI JSON search` |
| FR-PROTO-015 | 6.1 Protocol | Canonical paginated search envelope | RESPONSE_MODEL | `type:SearchResultEnvelope<T>` | `Document/PI JSON search` |
| FR-PROTO-016 | 6.1 Protocol | Partial success for multi-document lookup | RESPONSE_MODEL | `type:MultiLookupEnvelope<T>` | `Document/PI show` |
| FR-PROTO-017 | 6.1 Protocol | Document number dash normalization | COMPATIBILITY_INPUT | `type:DocumentNumber.documentNumber` | `Document/PI show` |
| FR-PROTO-018 | 6.1 Protocol | Zero-padded/unpadded document-number variants | COMPATIBILITY_INPUT | `type:DocumentNumber.documentNumber` | `Document/PI show` |
| FR-DOC-001 | 6.2 Document Operations | Document search | OPERATION | `fr.documents.search` | `/api/v1/documents.{format}` |
| FR-DOC-002 | 6.2 Document Operations | Single document lookup by document number | OPERATION | `fr.documents.find` | `/api/v1/documents/{id}.{format}` |
| FR-DOC-003 | 6.2 Document Operations | Multiple document lookup by comma-separated numbers | OPERATION | `fr.documents.findMany` | `/api/v1/documents/{ids}.{format}` |
| FR-DOC-004 | 6.2 Document Operations | Single Federal Register citation lookup | OPERATION | `fr.documents.findByCitation` | `/api/v1/documents/{citation}.json` |
| FR-DOC-005 | 6.2 Document Operations | Multiple Federal Register citation lookup | OPERATION | `fr.documents.findManyByCitation` | `/api/v1/documents/{citations}.json` |
| FR-DOC-006 | 6.2 Document Operations | Show lookup publication_date disambiguation | QUERY_INPUT | `type:DocumentFindParams.publicationDate` | `/api/v1/documents/{id}.json?publication_date=...` |
| FR-DOC-007 | 6.2 Document Operations | Document show CSV export | FORMAT | `fr.documents.findCsv` | `/api/v1/documents/{ids}.csv` |
| FR-DOC-008 | 6.2 Document Operations | Document search RSS feed | FORMAT | `fr.documents.searchRss` | `/api/v1/documents.rss` |
| FR-DOC-009 | 6.2 Document Operations | Document search CSV export | FORMAT | `fr.documents.searchCsv` | `/api/v1/documents.csv` |
| FR-DOC-010 | 6.2 Document Operations | Document autocomplete suggestions | OPERATION | `fr.documents.autocomplete` | `/api/v1/documents/autocomplete-suggestions` |
| FR-DOC-011 | 6.2 Document Operations | Document search details | OPERATION | `fr.documents.searchDetails` | `/api/v1/documents/search-details` |
| FR-DOC-012 | 6.2 Document Operations | Search-details spelling-suggestion suppression | QUERY_INPUT | `type:DocumentSearchDetailsParams.omitSpellingSuggestions` | `/api/v1/documents/search-details?omit_spelling_suggestions=...` |
| FR-DOC-013 | 6.2 Document Operations | Search-details citation/CFR/document-number detection | RESPONSE_MODEL | `type:DocumentSearchDetails` | `/api/v1/documents/search-details` |
| FR-DOC-014 | 6.2 Document Operations | Search-details Public Inspection cross-suggestion | RESPONSE_MODEL | `type:DocumentSearchDetails` | `/api/v1/documents/search-details` |
| FR-DOC-015 | 6.2 Document Operations | Excerpts/highlight opt-in via fields | RESPONSE_MODEL | `type:DocumentSearchItem<K>` | `/api/v1/documents.json?fields[]=excerpts` |
| FR-DOC-016 | 6.2 Document Operations | Include pre-1994 documents search option | QUERY_INPUT | `type:DocumentSearchParams.includePre1994Docs` | `/api/v1/documents*?include_pre_1994_docs=true` |
| FR-DOC-FLT-001 | 6.3 Document Filters | Full-text term | QUERY_INPUT | `type:DocumentSearchConditions.term` | `/api/v1/documents*` |
| FR-DOC-FLT-002 | 6.3 Document Filters | Regulation ID Number | QUERY_INPUT | `type:DocumentSearchConditions.regulationIdNumber` | `/api/v1/documents*` |
| FR-DOC-FLT-003 | 6.3 Document Filters | Agency filter (slugs and numeric IDs) | QUERY_INPUT | `type:DocumentSearchConditions.agencies / agencyIds` | `/api/v1/documents*` |
| FR-DOC-FLT-005 | 6.3 Document Filters | Citing document numbers | QUERY_INPUT | `type:DocumentSearchConditions.citingDocumentNumbers` | `/api/v1/documents*` |
| FR-DOC-FLT-006 | 6.3 Document Filters | Document numbers | QUERY_INPUT | `type:DocumentSearchConditions.documentNumbers` | `/api/v1/documents*` |
| FR-DOC-FLT-007 | 6.3 Document Filters | Executive order numbers | QUERY_INPUT | `type:DocumentSearchConditions.executiveOrderNumbers` | `/api/v1/documents*` |
| FR-DOC-FLT-008 | 6.3 Document Filters | President identifier | QUERY_INPUT | `type:DocumentSearchConditions.presidents` | `/api/v1/documents*` |
| FR-DOC-FLT-009 | 6.3 Document Filters | Section filter (slugs and numeric IDs) | QUERY_INPUT | `type:DocumentSearchConditions.sections / sectionIds` | `/api/v1/documents*` |
| FR-DOC-FLT-010 | 6.3 Document Filters | Federal Register volume | QUERY_INPUT | `type:DocumentSearchConditions.volume` | `/api/v1/documents*` |
| FR-DOC-FLT-012 | 6.3 Document Filters | Topic filter (slugs and numeric IDs) | QUERY_INPUT | `type:DocumentSearchConditions.topics / topicIds` | `/api/v1/documents*` |
| FR-DOC-FLT-014 | 6.3 Document Filters | Document type | QUERY_INPUT | `type:DocumentSearchConditions.types` | `/api/v1/documents*` |
| FR-DOC-FLT-015 | 6.3 Document Filters | Notice type filter (identifier and numeric ID) | QUERY_INPUT | `type:DocumentSearchConditions.noticeTypes / noticeTypeIds` | `/api/v1/documents*` |
| FR-DOC-FLT-017 | 6.3 Document Filters | Presidential document type filter (identifier and numeric ID) | QUERY_INPUT | `type:DocumentSearchConditions.presidentialDocumentTypes / presidentialDocumentTypeIds` | `/api/v1/documents*` |
| FR-DOC-FLT-019 | 6.3 Document Filters | Small entity filter (identifiers and numeric IDs) | QUERY_INPUT | `type:DocumentSearchConditions.smallEntities / smallEntityIds` | `/api/v1/documents*` |
| FR-DOC-FLT-021 | 6.3 Document Filters | Agency docket ID | QUERY_INPUT | `type:DocumentSearchConditions.docketId` | `/api/v1/documents*` |
| FR-DOC-FLT-022 | 6.3 Document Filters | EO 12866 significant flag | QUERY_INPUT | `type:DocumentSearchConditions.significant` | `/api/v1/documents*` |
| FR-DOC-FLT-023 | 6.3 Document Filters | Accepting comments on Regulations.gov | QUERY_INPUT | `type:DocumentSearchConditions.acceptingComments` | `/api/v1/documents*` |
| FR-DOC-FLT-024 | 6.3 Document Filters | Correction/original flag | QUERY_INPUT | `type:DocumentSearchConditions.correction` | `/api/v1/documents*` |
| FR-DOC-FLT-025 | 6.3 Document Filters | Geographic near filter | QUERY_INPUT | `type:DocumentSearchConditions.near` | `/api/v1/documents*` |
| FR-DOC-FLT-026 | 6.3 Document Filters | Publication date | QUERY_INPUT | `type:DocumentSearchConditions.publicationDate` | `/api/v1/documents*` |
| FR-DOC-FLT-027 | 6.3 Document Filters | Signing date | QUERY_INPUT | `type:DocumentSearchConditions.signingDate` | `/api/v1/documents*` |
| FR-DOC-FLT-028 | 6.3 Document Filters | Effective date | QUERY_INPUT | `type:DocumentSearchConditions.effectiveDate` | `/api/v1/documents*` |
| FR-DOC-FLT-029 | 6.3 Document Filters | Comment close date | QUERY_INPUT | `type:DocumentSearchConditions.commentDate` | `/api/v1/documents*` |
| FR-DOC-FLT-030 | 6.3 Document Filters | Affected CFR title/part | QUERY_INPUT | `type:DocumentSearchConditions.cfr` | `/api/v1/documents*` |
| FR-DOC-SORT-001 | 6.4 Document Sorts | Default relevance | QUERY_INPUT | `type:DocumentOrderInput.order` | `/api/v1/documents*` |
| FR-DOC-SORT-002 | 6.4 Document Sorts | Newest | QUERY_INPUT | `type:DocumentOrderInput.order` | `/api/v1/documents*` |
| FR-DOC-SORT-004 | 6.4 Document Sorts | Oldest | QUERY_INPUT | `type:DocumentOrderInput.order` | `/api/v1/documents*` |
| FR-DOC-SORT-005 | 6.4 Document Sorts | Executive order number | QUERY_INPUT | `type:DocumentOrderInput.order` | `/api/v1/documents*` |
| FR-DOC-SORT-006 | 6.4 Document Sorts | Proclamation number | QUERY_INPUT | `type:DocumentOrderInput.order` | `/api/v1/documents*` |
| FR-DOC-SORT-007 | 6.4 Document Sorts | Internal ID | QUERY_INPUT | `type:DocumentOrderInput.order` | `/api/v1/documents*` |
| FR-SEARCHTYPE-001 | 6.5 Search Types | Lexical with 365d decay | QUERY_INPUT | `type:SearchTypeId.searchTypeId` | `conditions[search_type_id]` |
| FR-SEARCHTYPE-002 | 6.5 Search Types | Lexical optimized | QUERY_INPUT | `type:SearchTypeId.searchTypeId` | `conditions[search_type_id]` |
| FR-SEARCHTYPE-003 | 6.5 Search Types | Lexical optimized with 365d decay | QUERY_INPUT | `type:SearchTypeId.searchTypeId` | `conditions[search_type_id]` |
| FR-SEARCHTYPE-004 | 6.5 Search Types | Lexical optimized with 1095d decay | QUERY_INPUT | `type:SearchTypeId.searchTypeId` | `conditions[search_type_id]` |
| FR-SEARCHTYPE-005 | 6.5 Search Types | Hybrid function-min-score | QUERY_INPUT | `type:SearchTypeId.searchTypeId` | `conditions[search_type_id]` |
| FR-SEARCHTYPE-006 | 6.5 Search Types | Hybrid KNN min-score | QUERY_INPUT | `type:SearchTypeId.searchTypeId` | `conditions[search_type_id]` |
| FR-DOC-FAC-001 | 6.6 Document Facets | agency facet | OPERATION_MODE | `fr.documents.facets.agency` | `/api/v1/documents/facets/agency` |
| FR-DOC-FAC-002 | 6.6 Document Facets | topic facet | OPERATION_MODE | `fr.documents.facets.topic` | `/api/v1/documents/facets/topic` |
| FR-DOC-FAC-003 | 6.6 Document Facets | section facet | OPERATION_MODE | `fr.documents.facets.section` | `/api/v1/documents/facets/section` |
| FR-DOC-FAC-004 | 6.6 Document Facets | type facet | OPERATION_MODE | `fr.documents.facets.type` | `/api/v1/documents/facets/type` |
| FR-DOC-FAC-005 | 6.6 Document Facets | subtype facet | OPERATION_MODE | `fr.documents.facets.subtype` | `/api/v1/documents/facets/subtype` |
| FR-DOC-FAC-006 | 6.6 Document Facets | daily facet | OPERATION_MODE | `fr.documents.facets.daily` | `/api/v1/documents/facets/daily` |
| FR-DOC-FAC-007 | 6.6 Document Facets | weekly facet | OPERATION_MODE | `fr.documents.facets.weekly` | `/api/v1/documents/facets/weekly` |
| FR-DOC-FAC-008 | 6.6 Document Facets | monthly facet | OPERATION_MODE | `fr.documents.facets.monthly` | `/api/v1/documents/facets/monthly` |
| FR-DOC-FAC-009 | 6.6 Document Facets | quarterly facet | OPERATION_MODE | `fr.documents.facets.quarterly` | `/api/v1/documents/facets/quarterly` |
| FR-DOC-FAC-010 | 6.6 Document Facets | yearly facet | OPERATION_MODE | `fr.documents.facets.yearly` | `/api/v1/documents/facets/yearly` |
| FR-PI-001 | 6.7 Public Inspection Operations | Public Inspection search | OPERATION | `fr.publicInspection.search` | `/api/v1/public-inspection-documents.{format} (+ legacy /api/v1/public_inspection_documents)` |
| FR-PI-002 | 6.7 Public Inspection Operations | available_on exact issue-date retrieval | OPERATION | `fr.publicInspection.availableOn` | `/api/v1/public-inspection-documents.json?conditions[available_on]=...` |
| FR-PI-003 | 6.7 Public Inspection Operations | Current Public Inspection JSON | OPERATION | `fr.publicInspection.current` | `/api/v1/public-inspection-documents/current.json` |
| FR-PI-004 | 6.7 Public Inspection Operations | Current Public Inspection CSV | FORMAT | `fr.publicInspection.currentCsv` | `/api/v1/public-inspection-documents/current.csv` |
| FR-PI-005 | 6.7 Public Inspection Operations | Single PI document lookup | OPERATION | `fr.publicInspection.find` | `/api/v1/public-inspection-documents/{id}.json (+ legacy /api/v1/public_inspection_documents/{id})` |
| FR-PI-006 | 6.7 Public Inspection Operations | Multiple PI document lookup | OPERATION | `fr.publicInspection.findMany` | `/api/v1/public-inspection-documents/{ids}.json` |
| FR-PI-007 | 6.7 Public Inspection Operations | PI index CSV export | FORMAT | `fr.publicInspection.searchCsv` | `/api/v1/public-inspection-documents.csv` |
| FR-PI-008 | 6.7 Public Inspection Operations | PI index RSS feed | FORMAT | `fr.publicInspection.searchRss` | `/api/v1/public-inspection-documents.rss` |
| FR-PI-009 | 6.7 Public Inspection Operations | PI search details | OPERATION | `fr.publicInspection.searchDetails` | `/api/v1/public-inspection-documents/search-details` |
| FR-PI-011 | 6.7 Public Inspection Operations | PI excerpts/highlight opt-in | RESPONSE_MODEL | `type:PublicInspectionSearchItem<K>` | `/api/v1/public-inspection-documents.json?fields[]=excerpts` |
| FR-PI-FLT-001 | 6.8 Public Inspection Filters | Full-text term | QUERY_INPUT | `type:PublicInspectionSearchConditions.term` | `/api/v1/public-inspection-documents*` |
| FR-PI-FLT-002 | 6.8 Public Inspection Filters | Agency filter (slugs and numeric IDs) | QUERY_INPUT | `type:PublicInspectionSearchConditions.agencies / agencyIds` | `/api/v1/public-inspection-documents*` |
| FR-PI-FLT-004 | 6.8 Public Inspection Filters | Document type | QUERY_INPUT | `type:PublicInspectionSearchConditions.types` | `/api/v1/public-inspection-documents*` |
| FR-PI-FLT-005 | 6.8 Public Inspection Filters | Agency docket ID | QUERY_INPUT | `type:PublicInspectionSearchConditions.docketId` | `/api/v1/public-inspection-documents*` |
| FR-PI-FLT-006 | 6.8 Public Inspection Filters | Document numbers | QUERY_INPUT | `type:PublicInspectionSearchConditions.documentNumbers` | `/api/v1/public-inspection-documents*` |
| FR-PI-FLT-007 | 6.8 Public Inspection Filters | Special filing flag | QUERY_INPUT | `type:PublicInspectionSearchConditions.specialFiling` | `/api/v1/public-inspection-documents*` |
| FR-PI-FLT-008 | 6.8 Public Inspection Filters | Filed-at date | QUERY_INPUT | `type:PublicInspectionSearchConditions.filedAt` | `/api/v1/public-inspection-documents*` |
| FR-PI-FAC-001 | 6.9 Public Inspection Facets | type facet | OPERATION_MODE | `fr.publicInspection.facets.type` | `/api/v1/public-inspection-documents/facets/type` |
| FR-PI-FAC-002 | 6.9 Public Inspection Facets | agency facet | OPERATION_MODE | `fr.publicInspection.facets.agency` | `/api/v1/public-inspection-documents/facets/agency` |
| FR-PI-FAC-003 | 6.9 Public Inspection Facets | agencies facet | OPERATION_MODE | `fr.publicInspection.facets.agencies` | `/api/v1/public-inspection-documents/facets/agencies` |
| FR-PIISS-FAC-001 | 6.10 Public Inspection Issue Facets | Daily PI issue facet | OPERATION_MODE | `fr.publicInspection.issues.facets.daily` | `/api/v1/public-inspection-issues/facets/daily` |
| FR-PIISS-FAC-002 | 6.10 Public Inspection Issue Facets | Type PI issue facet | OPERATION_MODE | `fr.publicInspection.issues.facets.type` | `/api/v1/public-inspection-issues/facets/type` |
| FR-AGENCY-001 | 6.11 Agencies | List agencies | OPERATION | `fr.agencies.list` | `/api/v1/agencies` |
| FR-AGENCY-002 | 6.11 Agencies | Agency lookup by numeric ID or slug | OPERATION | `fr.agencies.find` | `/api/v1/agencies/{id}` |
| FR-AGENCY-004 | 6.11 Agencies | Multiple agency lookup by comma-separated IDs | OPERATION | `fr.agencies.findMany` | `/api/v1/agencies/{id1,id2}` |
| FR-AGENCY-005 | 6.11 Agencies | Agency suggestions | OPERATION | `fr.agencies.suggestions` | `/api/v1/agencies/suggestions` |
| FR-TOPIC-001 | 6.12 Topics | Topic suggestions | OPERATION | `fr.topics.suggestions` | `/api/v1/topics/suggestions` |
| FR-SECTION-001 | 6.13 Sections | List sections | OPERATION | `fr.sections.list` | `/api/v1/sections` |
| FR-SUGGEST-001 | 6.14 Suggested Searches | List suggested searches for all sections | OPERATION | `fr.suggestedSearches.list` | `/api/v1/suggested_searches` |
| FR-SUGGEST-002 | 6.14 Suggested Searches | Filter suggested searches by sections | OPERATION | `fr.suggestedSearches.listBySections` | `/api/v1/suggested_searches?conditions[sections][]=...` |
| FR-SUGGEST-003 | 6.14 Suggested Searches | Suggested search lookup by slug | OPERATION | `fr.suggestedSearches.find` | `/api/v1/suggested_searches/{slug}` |
| FR-HOLIDAY-001 | 6.15 Holidays | List Federal Register holidays | OPERATION | `fr.holidays.list` | `/api/v1/holidays` |
| FR-EFFDATE-001 | 6.16 Effective Dates | Effective-date calendar calculation | OPERATION | `fr.effectiveDates.calculate` | `/api/v1/effective-dates?start_date=...&end_date=...` |
| FR-ISSUE-001 | 6.17 Issues | Issue TOC by publication date | OPERATION | `fr.issues.find` | `/api/v1/issues/{YYYY-MM-DD}.json` |
| FR-ISSUE-002 | 6.17 Issues | Current issue TOC alias | OPERATION | `fr.issues.current` | `/api/v1/issues/current.json` |
| FR-IMAGE-001 | 6.18 Images | Public image metadata lookup | OPERATION | `fr.images.find` | `/api/v1/images/{identifier}[.json]` |
| FR-CATCOUNT-001 | 6.19 Category Counts | Document-type category-count CSV | OPERATION | `fr.categoryCounts.documentTypeCsv` | `/api/v1/category_counts/document_type.csv` |
| FR-CATCOUNT-002 | 6.19 Category Counts | Page-count category-count CSV | OPERATION | `fr.categoryCounts.pageCountCsv` | `/api/v1/category_counts/page_count.csv` |
| FR-SITENOTIF-001 | 6.20 Site Notifications | Site notification lookup by identifier | OPERATION | `fr.siteNotifications.find` | `/api/v1/site_notifications/{id}` |
| FR-DOCS-001 | 6.21 Documentation | OpenAPI documentation endpoint | OPERATION | `fr.documentation.fetchOpenApi` | `/api/v1/documentation` |
| FR-WEB-001 | 6.22 Web-owned API | User/session clippings API | WEB_OPERATION | `fr.clippings.current` | `/api/v1/clippings` |

## Governed Uncertainty Guards (16 Records)

The following 16 capabilities have specific frozen uncertainty dispositions established during R0-05 live probes and R0-07 contract modeling. These behaviors are preserved exactly and must not be altered without new governed upstream evidence:

### FR-DOC-006: Show lookup publication_date disambiguation
- **Family:** 6.2 Document Operations
- **Disposition:** `NOT_EXECUTED_CONDITIONAL_RESERVE_UNCONSUMED` — Conditional probe reserve unconsumed
- **Surface:** `type:DocumentFindParams.publicationDate`
- **Guard:** `PRESERVE_UNEXECUTED_CONDITIONAL_PROBE_STATE`

### FR-DOC-FLT-009: Section filter (slugs and numeric IDs)
- **Family:** 6.3 Document Filters
- **Disposition:** `INCONCLUSIVE_FIXTURE` — Inconclusive fixture (upstream lacks populated test fixtures or valid values for live verification)
- **Surface:** `type:DocumentSearchConditions.sections / sectionIds`
- **Guard:** `PRESERVE_INCONCLUSIVE_STATE; DO_NOT_UPGRADE_WITHOUT_GOVERNED_NEW_EVIDENCE`

### FR-DOC-FLT-012: Topic filter (slugs and numeric IDs)
- **Family:** 6.3 Document Filters
- **Disposition:** `INCONCLUSIVE_FIXTURE` — Inconclusive fixture (upstream lacks populated test fixtures or valid values for live verification)
- **Surface:** `type:DocumentSearchConditions.topics / topicIds`
- **Guard:** `PRESERVE_INCONCLUSIVE_STATE; DO_NOT_UPGRADE_WITHOUT_GOVERNED_NEW_EVIDENCE`

### FR-DOC-FLT-014: Document type
- **Family:** 6.3 Document Filters
- **Disposition:** `INCONCLUSIVE_FIXTURE` — Inconclusive fixture (upstream lacks populated test fixtures or valid values for live verification)
- **Surface:** `type:DocumentSearchConditions.types`
- **Guard:** `PRESERVE_INCONCLUSIVE_STATE; DO_NOT_UPGRADE_WITHOUT_GOVERNED_NEW_EVIDENCE`

### FR-DOC-FLT-019: Small entity filter (identifiers and numeric IDs)
- **Family:** 6.3 Document Filters
- **Disposition:** `INCONCLUSIVE_FIXTURE` — Inconclusive fixture (upstream lacks populated test fixtures or valid values for live verification)
- **Surface:** `type:DocumentSearchConditions.smallEntities / smallEntityIds`
- **Guard:** `PRESERVE_INCONCLUSIVE_STATE; DO_NOT_UPGRADE_WITHOUT_GOVERNED_NEW_EVIDENCE`

### FR-SEARCHTYPE-001: Lexical with 365d decay
- **Family:** 6.5 Search Types
- **Disposition:** `FEATURE_UNAVAILABLE` — Feature unavailable upstream (returns 405 Method Not Allowed; handled by SDK error contract)
- **Surface:** `type:SearchTypeId.searchTypeId`
- **Guard:** `PRESERVE_FEATURE_UNAVAILABLE_CAPABILITY_AND_ASSERT_CURRENT_405_BEHAVIOR`

### FR-SEARCHTYPE-006: Hybrid KNN min-score
- **Family:** 6.5 Search Types
- **Disposition:** `FEATURE_UNAVAILABLE` — Feature unavailable upstream (returns 405 Method Not Allowed; handled by SDK error contract)
- **Surface:** `type:SearchTypeId.searchTypeId`
- **Guard:** `PRESERVE_FEATURE_UNAVAILABLE_CAPABILITY_AND_ASSERT_CURRENT_405_BEHAVIOR`

### FR-PI-011: PI excerpts/highlight opt-in
- **Family:** 6.7 Public Inspection Operations
- **Disposition:** `INCONCLUSIVE_DATA` — Inconclusive data (upstream returns empty results or lacks active records during probing)
- **Surface:** `type:PublicInspectionSearchItem<K>`
- **Guard:** `PRESERVE_INCONCLUSIVE_STATE; DO_NOT_UPGRADE_WITHOUT_GOVERNED_NEW_EVIDENCE`

### FR-PI-FLT-001: Full-text term
- **Family:** 6.8 Public Inspection Filters
- **Disposition:** `INCONCLUSIVE_DATA` — Inconclusive data (upstream returns empty results or lacks active records during probing)
- **Surface:** `type:PublicInspectionSearchConditions.term`
- **Guard:** `PRESERVE_INCONCLUSIVE_STATE; DO_NOT_UPGRADE_WITHOUT_GOVERNED_NEW_EVIDENCE`

### FR-PI-FLT-004: Document type
- **Family:** 6.8 Public Inspection Filters
- **Disposition:** `INCONCLUSIVE_FIXTURE` — Inconclusive fixture (upstream lacks populated test fixtures or valid values for live verification)
- **Surface:** `type:PublicInspectionSearchConditions.types`
- **Guard:** `PRESERVE_INCONCLUSIVE_STATE; DO_NOT_UPGRADE_WITHOUT_GOVERNED_NEW_EVIDENCE`

### FR-PI-FLT-005: Agency docket ID
- **Family:** 6.8 Public Inspection Filters
- **Disposition:** `INCONCLUSIVE_FIXTURE` — Inconclusive fixture (upstream lacks populated test fixtures or valid values for live verification)
- **Surface:** `type:PublicInspectionSearchConditions.docketId`
- **Guard:** `PRESERVE_INCONCLUSIVE_STATE; DO_NOT_UPGRADE_WITHOUT_GOVERNED_NEW_EVIDENCE`

### FR-PI-FLT-006: Document numbers
- **Family:** 6.8 Public Inspection Filters
- **Disposition:** `INCONCLUSIVE_DATA` — Inconclusive data (upstream returns empty results or lacks active records during probing)
- **Surface:** `type:PublicInspectionSearchConditions.documentNumbers`
- **Guard:** `PRESERVE_INCONCLUSIVE_STATE; DO_NOT_UPGRADE_WITHOUT_GOVERNED_NEW_EVIDENCE`

### FR-PI-FLT-008: Filed-at date
- **Family:** 6.8 Public Inspection Filters
- **Disposition:** `INCONCLUSIVE_DATA` — Inconclusive data (upstream returns empty results or lacks active records during probing)
- **Surface:** `type:PublicInspectionSearchConditions.filedAt`
- **Guard:** `PRESERVE_INCONCLUSIVE_STATE; DO_NOT_UPGRADE_WITHOUT_GOVERNED_NEW_EVIDENCE`

### FR-TOPIC-001: Topic suggestions
- **Family:** 6.12 Topics
- **Disposition:** `RESOLVED_THIRD_BEHAVIOR` — Resolved third behavior (upstream behavior differs from both gem and docs, but verified live)
- **Surface:** `fr.topics.suggestions`
- **Guard:** `PRESERVE_FROZEN_R0_05_STATE`

### FR-SUGGEST-002: Filter suggested searches by sections
- **Family:** 6.14 Suggested Searches
- **Disposition:** `INCONCLUSIVE_FIXTURE` — Inconclusive fixture (upstream lacks populated test fixtures or valid values for live verification)
- **Surface:** `fr.suggestedSearches.listBySections`
- **Guard:** `PRESERVE_INCONCLUSIVE_STATE; DO_NOT_UPGRADE_WITHOUT_GOVERNED_NEW_EVIDENCE`

### FR-WEB-001: User/session clippings API
- **Family:** 6.22 Web-owned API
- **Disposition:** `PASS` (anonymous) / `AUTH_DEFERRED` (signed-in) — Anonymous branch verified; authenticated/signed-in branch deferred
- **Surface:** `fr.clippings.current`
- **Verified Branch:** `ANONYMOUS_BRANCH_PASS`
- **Deferred Branch:** `AUTHENTICATED_BRANCH_AUTH_DEFERRED`
- **Guard:** `PRESERVE_AUTH_DEFERRED_SIGNED_IN_BRANCH`
