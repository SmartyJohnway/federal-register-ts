# Search Semantics & Query Architecture

This document provides the normative search semantics, query structure, and wire serialization contract for `federal-register-ts`.

Search correctness is safety-critical: a logically malformed query can return plausible-looking results without raising an error.

---

## 1. Full-Text Search vs. Structured Filters

The FederalRegister.gov API operates two distinct search mechanisms with different query semantics:

1. **Full-Text Lexical Search:** Executed via OpenSearch `simple_query_string` parser against document full text.
2. **Structured Metadata Filters:** Filter clauses (`terms`, `match_phrase`, `range`, `term`) executed against OpenSearch structured mappings.

```text
+-------------------------------------------------------------------------------+
|                             FederalRegisterClient                             |
+---------------------------------------+---------------------------------------+
| Full-Text Lexical Query               | Structured Metadata Filters           |
| conditions: { term: "..." }           | conditions: { agencyIds: [...] }      |
+---------------------------------------+---------------------------------------+
| Wire: conditions[term]                | Wire: conditions[agency_ids][]        |
| OpenSearch Simple Query String        | OpenSearch Filter Clauses             |
| Lexical query rules:                  | Filter type semantics:                |
| - Whitespace = default AND            | - Multi-value array = OR (terms)      |
| - "|" = OR                            | - Cross-field = AND (bool.filter)     |
| - Unary "-" = NOT / exclude           | - match_phrase (docket/RIN)           |
| - "&" -> "+" alias                    | - range (dates/CFR)                   |
| - '""' = phrase, () = grouping        | - term (boolean flags)                |
| - NOTE: textual "AND"/"OR"/"NOT" are  | - No same-field AND                   |
|   NOT promoted to operator tokens     | - No structured filter NOT            |
+---------------------------------------+---------------------------------------+
```

---

## 2. Canonical Full-Text Location: `conditions[term]`

The canonical, authoritative transmission location for full-text search queries is:

```text
conditions[term]=<query>
```

### Divergence / Stale Notice: Top-Level `term`
Top-level `term` (`?term=...`) is a noncanonical / historical downstream form from pre-revival code and Ruby gem remnants. The canonical SDK strictly transmits full-text queries inside the `conditions` object:

```typescript
// Canonical SDK Usage:
const results = await client.documents.search({
  conditions: {
    term: 'environmental protection',
  },
});
```

---

## 3. Structured Filter Semantics

### Same-Field Multi-Value: Logical OR
When multiple values are provided for a single filter field (such as an array of agency IDs or document types), upstream combines them using OpenSearch `terms` filter, which evaluates as a **logical OR**:

```typescript
const results = await client.documents.search({
  conditions: {
    // Matches documents from EPA (492) OR Forest Service (468)
    agencyIds: [492, 468],
    // Matches documents of type RULE OR NOTICE
    types: ['RULE', 'NOTICE'],
  },
});
```

### Cross-Field Conditions: Logical AND
When multiple distinct condition fields are specified, upstream combines them using OpenSearch `bool.filter`, which evaluates as a **logical AND**:

```typescript
const results = await client.documents.search({
  conditions: {
    // (EPA OR Forest Service) AND (RULE OR NOTICE) AND published on 2024-01-15
    agencyIds: [492, 468],
    types: ['RULE', 'NOTICE'],
    publicationDate: { is: '2024-01-15' },
  },
});
```

### Structured Filter Types & Semantics
Upstream executes distinct filter types depending on field mapping:
- **`terms` (Logical OR):** Multi-value arrays such as `agency_ids`, `types`, `sections`, `topics`, `presidents`.
- **`match_phrase`:** Scalar analyzed phrase matching for identifiers such as `docket_id` and `regulation_id_number` (RIN). Because this relies on OpenSearch `match_phrase` on analyzed text fields rather than an exact-term keyword filter, queries are subject to upstream analyzer tokenization boundaries, and partial phrase matching may occur.
- **`range`:** Bounded or half-bounded range intervals for dates (`publication_date`, `effective_date`, `signing_date`) and CFR titles/parts.
- **`term`:** Single-value exact match for boolean flags (e.g. `significant`, `correction`, `accepting_comments`).
- **`bool.filter` (Logical AND):** Combines distinct filter fields together.

### Unsupported Filter Boolean Operations
The Federal Register API **does not** support:
- Logical AND across multiple values of the same field (e.g. "must match both topic A and topic B simultaneously" on single document terms array).
- Structured NOT / inversion on structured filters (e.g. "agencies NOT EPA"). Negation is available only within full-text lexical queries (`-term`).

The SDK strictly reflects upstream API capabilities and does not manufacture pseudo-Boolean capabilities client-side.

---

## 4. Parameter Serialization Rules

The SDK implements RFC 3986 compliant query serialization matching upstream Rails Rack parameter parsing:

1. **Repeated Array Keys (`[]`):** Arrays are serialized with repeated bracket keys:
   ```text
   conditions[type][]=RULE&conditions[type][]=NOTICE
   fields[]=title&fields[]=citation&fields[]=document_number
   ```
2. **Nested Objects (`[parent][child]`):** Date range filters and nested conditions are bracket-encoded:
   ```text
   conditions[publication_date][gte]=2024-01-01&conditions[publication_date][lte]=2024-01-31
   ```
3. **No Mixed Scalar/Array Forms:** Empty or undefined parameters are omitted from query strings; parameters are never emitted in contradictory scalar and array formats.

---

## 5. Pagination & Opaque Navigation

The FederalRegister.gov API enforces strict pagination limits:

- **Results Per Page (`perPage`):** Valid range is `2..2000` (default: 20).
  - *Exception:* Executive Order CSV export allows up to `10000` (`ExecutiveOrderCsvSearchParams`).
- **Maximum Page Number (`page`):** Hard ceiling of `50`. Requesting `page > 50` is rejected by SDK client-side validation.
- **Deep Pagination:** Beyond 50 pages or 10,000 documents, consumers should partition queries using date range windows (`conditions.publication_date.gte` / `lte`) rather than attempting deep page offsets.
- **Opaque Next/Previous URLs:** Paginated responses return `next_page_url` and `previous_page_url`. These URLs are opaque, pre-serialized server URLs.

---

## 6. SearchTypeId & Search Engine Modes

FederalRegister.gov supports multiple internal search strategies via `conditions.searchTypeId`:

| Numeric ID | Official Source Identifier & Description | Governed Capability Record | Observed Availability (2026-09) |
|---:|---|---|---|
| `1` | `lexical` (standard lexical with 365-day decay) | `FR-SEARCHTYPE-001` | HTTP 405 (Dated live state) |
| `2` | `lexical_optimized` (lexical without decay scoring) | `FR-SEARCHTYPE-002` | HTTP 200 (Active) |
| `3` | `hybrid` (hybrid lexical and Function min-score) | `FR-SEARCHTYPE-005` | HTTP 200 (Active) |
| `4` | `hybrid_knn_min_score` (hybrid with KNN vector threshold) | `FR-SEARCHTYPE-006` | HTTP 405 (Dated live state) |
| `5` | `lexical_optimized_with_decay` (optimized lexical with 365-day decay) | `FR-SEARCHTYPE-003` | HTTP 405 (Dated live state) |
| `6` | `lexical_optimized_with_expansive_decay` (optimized lexical with 1095-day decay) | `FR-SEARCHTYPE-004` | HTTP 200 (Active) |

### Service Defaults
- **Documents Search (`client.documents.search`):** Defaults to `6` (`lexical_optimized_with_expansive_decay`).
- **Public Inspection Search (`client.publicInspection.search`):** Defaults to `2` (`lexical_optimized`).
- *Note:* `6` is not a universal default across all endpoints.

### Search Semantics & Neural Retrieval Caveats
The API supports experimental search modes (e.g. `searchTypeId: 3`). Note that classical set-relation guarantees for lexical retrieval (such as `A AND B` returning a strict subset of `A`) do not necessarily hold under neural KNN scoring where dense embedding distances alter candidate recall. Furthermore, the presence of `is_neural: true` in response metadata indicates server-side contextual behavior rather than a static engine classifier.
