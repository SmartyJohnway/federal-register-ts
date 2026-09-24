# federal-register-ts

[![CI](https://github.com/SmartyJohnway/federal-register-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/SmartyJohnway/federal-register-ts/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Independent, type-safe TypeScript SDK for the [FederalRegister.gov](https://www.federalregister.gov) API.

> **Disclaimer:** This project is an independent open-source library and is **not** endorsed by, maintained by, or officially affiliated with the National Archives and Records Administration (NARA), the Office of the Federal Register (OFR), or the United States Government.

---

## Installation

Install the stable release via npm:

```bash
npm install federal-register-ts
```

Or install the release candidate:

```bash
npm install federal-register-ts@rc
```

| Release Channel | Version | npm Dist-Tag |
|---|---|---|
| **Stable (Latest)** | `1.0.1` | `latest` |
| **Release Candidate** | `1.1.0-rc.3` | `rc` |

---

## Key Features

- **Governed Capability Parity:** Coverage across the historical frozen 120-capability baseline (`r2_07_oracle_120.json`, 120/120 records immutable) and validated post-release capability extensions (CAP-001 Topic Catalog `client.topics.list()`, totaling 54 canonical operations across 14 namespaces). Note: Known current upstream capability gaps—specifically E-CAP-001 Document projection fields (`amendatory_instructions`, `cfr_topics`, `related_documents`) and E-CAP-002 `search_after_cursor` deep-pagination request support—are tracked for future releases (complete current upstream parity is not claimed while these gaps remain open).
- **Type-Safe Request & Response Contracts:** End-to-end TypeScript typings for queries, filters, envelopes, models, and response projections.
- **Correct Search Semantics:** Strict adherence to upstream OpenSearch query semantics, preserving canonical `conditions[term]` search, same-field OR, and cross-field AND filtering.
- **Multi-Lookup Partial Success:** Tolerant multi-document lookup handling where existing items resolve cleanly and missing IDs are safely returned in `errors.not_found`.
- **Structured Error Hierarchy:** Granular error classification distinguishing client parameter validation (`RequestValidationError`, extending `Error`), 404 record not found, 405 method not allowed, and API status message errors (`FederalRegisterError` family).
- **JSONP Companion Methods:** 44 public operations support JSONP companion methods (`*Jsonp`), while 9 operations (CSV, RSS, and `clippings.current`) are explicitly excluded.
- **Modern Runtime Support:** Verified in CI on Node.js 22 LTS and 24 LTS on `ubuntu-latest`. Verified against exact TypeScript compiler points `5.0.4` through `7.0.2`.

---

## Quick Start

### Installation & Client Creation

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

// Connect to default endpoint (https://www.federalregister.gov/api/v1)
const client = new FederalRegisterClient();
```

### Searching Published Documents

Full-text queries are always provided via `conditions.term`:

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function run() {
  const results = await client.documents.search({
    conditions: {
      term: 'renewable energy',
      types: ['RULE', 'PRORULE'],
      publicationDate: { gte: '2024-01-01' },
    },
    perPage: 10,
    page: 1,
    order: 'newest',
  });

  console.log(`Found ${results.count} documents matching query.`);
  if ('results' in results) {
    for (const doc of results.results) {
      console.log(`- [${doc.document_number}] ${doc.title}`);
    }
  }
}

run();
```

### Retrieving a Document by Document Number

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function getDocument() {
  const doc = await client.documents.find({
    documentNumber: '2024-01234',
    fields: ['title', 'document_number', 'publication_date', 'html_url'],
  });

  console.log('Title:', doc.title);
  console.log('URL:', doc.html_url);
}
```

### Listing the Topic Catalog (CAP-001)

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function getTopics() {
  const catalog = await client.topics.list();
  console.log(`Thesaurus topics: ${catalog.results.thesaurus.length}`);
  console.log(`Ad-hoc topics: ${catalog.results.ad_hoc.length}`);
}
```

---

## 14 Operation Namespaces Overview

All 54 canonical operations (53 historical baseline operations + 1 post-release capability delta CAP-001) are accessible via 14 top-level client namespaces:

| Namespace | Accessor | Primary Capabilities | Example Methods |
|---|---|---|---|
| Documents | `client.documents` (with nested `client.documents.facets`) | Published document search, show, batch, citation lookup, CSV, RSS, and aggregations | `search`, `find`, `findMany`, `findByCitation`, `facets.agency`, `facets.daily` |
| Public Inspection | `client.publicInspection` (with nested `facets` and `issues.facets`) | Pre-publication documents filed for inspection, date lookup, CSV, RSS, and aggregations | `search`, `availableOn`, `current`, `facets.type`, `issues.facets.daily` |
| Agencies | `client.agencies` | Directory of federal agencies, single lookup, multi-lookup, suggestions | `list`, `find`, `findMany`, `suggestions` |
| Topics | `client.topics` | Topic catalog listing and search suggestions | `list`, `suggestions` |
| Sections | `client.sections` | Subject section listings | `list` |
| Suggested Searches | `client.suggestedSearches` | Curated searches by topic and section | `list`, `listBySections`, `find` |
| Holidays | `client.holidays` | Federal public legal holidays calendar | `list` |
| Effective Dates | `client.effectiveDates` | Procedural delayed effective date calculation | `calculate` |
| Issues | `client.issues` | Daily table of contents (current or historical) | `current`, `find` |
| Images | `client.images` | Document image metadata and dimensions | `find` |
| Category Counts | `client.categoryCounts` | Category and page-count statistical CSV exports | `documentTypeCsv`, `pageCountCsv` |
| Site Notifications | `client.siteNotifications` | System maintenance and API service notifications | `find` |
| Documentation | `client.documentation` | Direct download of upstream OpenAPI specification | `fetchOpenApi` |
| Clippings | `client.clippings` | User clipping folders (web-owned, session-aware) | `current` |

> **Note on Facet Subservices:** Aggregations for published and public inspection documents are implemented as nested subservices (`client.documents.facets`, `client.publicInspection.facets`, and `client.publicInspection.issues.facets`) under their parent resource namespaces, rather than separate top-level namespaces.

---

## Search Semantics & Safety (P0)

1. **Full-Text vs. Filters:** Full-text search occurs in `conditions.term` via OpenSearch `simple_query_string`. Structured filters (e.g. `agency_ids`, `type`, `publication_date`) are evaluated as structured filter clauses.
2. **OpenSearch Query Syntax:** Textual words `AND`, `OR`, `NOT` are **not** promoted to Boolean operator tokens by Federal Register preprocessing. Syntax relies on whitespace (default AND), `&` (rewritten to `+`), `|` (OR), unary `-` (exclusion), and `()` (grouping).
3. **Structured Boolean Logic:**
   - Multi-values in the *same* structured filter evaluate as **logical OR** (e.g. `agency_ids: [492, 468]` matches EPA *or* Forest Service via OpenSearch `terms`).
   - Distinct filters combine as **logical AND** (e.g. `agency_ids` *and* `type` *and* `publication_date` via OpenSearch `bool.filter`).
4. **No Top-Level `term`:** Top-level `term` is a noncanonical / historical downstream form. Always use `conditions.term`.
5. **Pagination Limits:** Upstream allows `page` up to `50` and `perPage` up to `2000`. Beyond 50 pages, partition queries using publication date ranges.

For detailed search behavior, see [docs/SEARCH.md](https://github.com/SmartyJohnway/federal-register-ts/blob/main/docs/SEARCH.md).

---

## Compatibility

- **Node.js:** Verified in CI on Node.js 22 LTS (Maintenance) and 24 LTS (Active) on `ubuntu-latest`. (Node.js 20 is an EOL historical technical-pass observation, not a supported prerequisite).
- **TypeScript:** Verified against exact compiler versions `5.0.4`, `5.2.2`, `5.4.5`, `5.6.3`, `5.9.3`, `6.0.3`, and `7.0.2`.
- **Module Format:** Distributed as a CommonJS library (`"main": "dist/index.js"`). For Node.js ESM applications, the verified interoperability pattern is default import followed by destructuring:
  ```javascript
  import federalRegisterPkg from 'federal-register-ts';
  const { FederalRegisterClient } = federalRegisterPkg;
  ```
  Note that compiling TypeScript named imports does not constitute runtime proof of named export resolution in native Node.js ESM. No native ESM dual-packaging is claimed.

For complete runtime details, see [docs/COMPATIBILITY.md](https://github.com/SmartyJohnway/federal-register-ts/blob/main/docs/COMPATIBILITY.md).

---

## Documentation Index

- **[API Reference](https://github.com/SmartyJohnway/federal-register-ts/blob/main/docs/API_REFERENCE.md):** Complete reference for all 14 namespaces and 54 canonical operations.
- **[Governed Capabilities Matrix](https://github.com/SmartyJohnway/federal-register-ts/blob/main/docs/CAPABILITIES.md):** Complete 120-capability registry.
- **[Search Semantics Guide](https://github.com/SmartyJohnway/federal-register-ts/blob/main/docs/SEARCH.md):** Search logic, query syntax, and parameter serialization.
- **[Usage Guide](https://github.com/SmartyJohnway/federal-register-ts/blob/main/docs/USAGE.md):** Practical code examples.
- **[Compatibility Guide](https://github.com/SmartyJohnway/federal-register-ts/blob/main/docs/COMPATIBILITY.md):** Supported environments and compiler versions.
- **[Contributing Guidelines](https://github.com/SmartyJohnway/federal-register-ts/blob/main/CONTRIBUTING.md):** Development workflows and PR instructions.

---

## Development

```bash
# Build TypeScript
npm run build

# Run unit tests
npm test

# Run CI test suite (in band)
npm run test:ci

# Run typecheck
npm run typecheck
```

---

## License

[MIT](LICENSE) © 2025 SmartyJohnway
