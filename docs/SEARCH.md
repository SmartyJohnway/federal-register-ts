# Search Semantics & Query Architecture

This document provides the normative search semantics, query structure, and wire serialization contract for `federal-register-ts`.

Search correctness is safety-critical: a logically malformed query can return plausible-looking results without raising an error.

---

## 1. Full-Text Search vs. Structured Filters

The FederalRegister.gov API operates two distinct search mechanisms with different query semantics:

1. **Full-Text Lexical Search:** Executed via Elasticsearch `simple_query_string` parser against document full text.
2. **Structured Metadata Filters:** Exact match and terms filtering against Elasticsearch structured mappings.

```text
??????????????????????????????????????????????????????????????????????????????                       FederalRegisterClient                            ???????????????????????????????????????砂?????????????????????????????????????????Full-Text Search                  ??Structured Filters                  ????conditions: { term: "..." }       ??conditions: { agencies: [...] }     ???????????????????????????????????????潑?????????????????????????????????????????Wire: conditions[term]            ??Wire: conditions[agencies][]        ????Simple Query String               ??Terms / Range Filters               ????Standard Boolean logic:           ??Same-field: OR                      ????- "AND", "OR", "NOT", "+", "-", ""??Cross-field: AND                    ???????????????????????????????????????氯???????????????????????????????????????```

---

## 2. Canonical Full-Text Location: `conditions[term]`

The canonical, authoritative transmission location for full-text search queries is:

```text
conditions[term]=<query>
```

### Divergence / Stale Notice: Top-Level `term`
Top-level `term` (`?term=...`) is a historical downstream divergence from pre-revival code and Ruby gem remnants. The canonical SDK strictly transmits full-text queries inside the `conditions` object:

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
When multiple values are provided for a single filter field (such as an array of agency IDs or document types), upstream combines them using Elasticsearch `terms` filter, which evaluates as a **logical OR**:

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
When multiple distinct condition fields are specified, upstream combines them using Elasticsearch `bool.filter`, which evaluates as a **logical AND**:

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

### Unsupported Filter Boolean Operations
The Federal Register API **does not** support:
- Logical AND across multiple values of the same field (e.g. "must match both topic A and topic B simultaneously" on single document terms array).
- Structured NOT / inversion on structured filters (e.g. "agencies NOT EPA"). Negation is available only within full-text lexical queries (`-term` or `NOT term`).

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

## 6. Hybrid & Neural Search Caveats

The API supports experimental search modes (e.g. hybrid lexical/KNN vector searches). Note that set-relation guarantees that hold for lexical retrieval (e.g. `A AND B` returning a strict subset of `A`) do not necessarily hold under neural KNN scoring where dense embedding distances alter candidate recall.
