# Federal Register TypeScript SDK — Usage Guide

This guide illustrates real-world usage patterns for `federal-register-ts`, an independent TypeScript client for the FederalRegister.gov API.

---

## 1. Quick Start

### Installation Note
> **Publication Notice:** The package has not yet been published to the npm public registry. After formal publication occurs, installation will be:
> ```bash
> npm install federal-register-ts
> ```

### Creating a Client

All operations are accessed through `FederalRegisterClient`:

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();
```

---

## 2. Searching Documents

Full-text queries and structured filters are passed via the `conditions` object.

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function searchEnvironmentalRules() {
  const response = await client.documents.search({
    conditions: {
      term: 'clean air',
      types: ['RULE', 'PRORULE'],
      publicationDate: { gte: '2024-01-01' },
    },
    perPage: 10,
    page: 1,
    order: 'newest',
  });

  console.log(`Total matching documents: ${response.count}`);
  if ('results' in response) {
    for (const doc of response.results) {
      console.log(`- [${doc.document_number}] ${doc.title} (${doc.publication_date})`);
    }
  }
}
```

---

## 3. Retrieving Documents

### Single Document by Document Number
```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function getDocument() {
  const doc = await client.documents.find({
    documentNumber: '2024-01234',
    fields: ['title', 'document_number', 'publication_date', 'html_url', 'agency_names'],
  });

  console.log('Title:', doc.title);
  console.log('URL:', doc.html_url);
}
```

### Multiple Documents with Partial Success Handling
When looking up multiple documents, any non-existent document numbers are returned in the `errors.not_found` array rather than aborting the request:

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function getBatch() {
  const batch = await client.documents.findMany({
    documentNumbers: ['2024-01234', 'invalid-doc-number'],
  });

  console.log(`Found ${batch.count} documents.`);
  for (const doc of batch.results) {
    console.log(`Found: ${doc.document_number}`);
  }

  if (batch.errors?.not_found) {
    console.warn('Not found:', batch.errors.not_found);
  }
}
```

### Citation Lookup
Retrieve documents by official Federal Register volume and page number:

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function getCitation() {
  const lookup = await client.documents.findByCitation({
    citation: { volume: 89, page: 12345 },
  });

  for (const doc of lookup.results) {
    console.log(`Citation result: ${doc.title}`);
  }
}
```

---

## 4. Working with Facets & Aggregations

Facets provide real-time aggregation counts without needing to paginate through all documents.

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function getAgencyCounts() {
  // Breakdown of 2024 documents by publishing agency
  const counts = await client.documents.facets.agency({
    conditions: {
      publicationDate: { gte: '2024-01-01', lte: '2024-12-31' },
    },
  });

  for (const [agencySlug, entry] of Object.entries(counts)) {
    console.log(`${agencySlug} (${entry.name}): ${entry.count} documents`);
  }
}
```

---

## 5. Public Inspection Documents (Pre-Publication)

Public Inspection documents are filed with the Office of the Federal Register and available for public review prior to official daily publication:

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function checkCurrentPublicInspection() {
  const current = await client.publicInspection.current();

  console.log(`Filed for inspection: ${current.count} documents`);
  if ('results' in current) {
    for (const doc of current.results) {
      console.log(`- [${doc.document_number}] ${doc.title}`);
    }
  }
}
```

---

## 6. Federal Agencies Directory

```typescript
import { FederalRegisterClient } from 'federal-register-ts';

const client = new FederalRegisterClient();

async function listAgencies() {
  const agencies = await client.agencies.list();

  console.log(`Loaded ${agencies.length} federal agencies.`);
  const epa = agencies.find(a => a.slug === 'environmental-protection-agency');
  if (epa) {
    console.log(`EPA ID: ${epa.id}, Website: ${epa.url}`);
  }
}
```

---

## 7. Error Handling

Structured error classes enable granular handling:

```typescript
import {
  FederalRegisterClient,
  FederalRegisterSearchValidationError,
  FederalRegisterAgencyNotFoundError,
  FederalRegisterHttpError,
  FederalRegisterError,
} from 'federal-register-ts';

const client = new FederalRegisterClient();

async function safeSearch() {
  try {
    const results = await client.documents.search({
      conditions: {
        term: 'energy',
      },
    });
    console.log('Results:', results.count);
  } catch (err) {
    if (err instanceof FederalRegisterSearchValidationError) {
      console.error('Invalid search parameters:', err.body?.errors);
    } else if (err instanceof FederalRegisterAgencyNotFoundError) {
      console.error('Agency does not exist.');
    } else if (err instanceof FederalRegisterHttpError) {
      console.error(`HTTP ${err.status}:`, err.rawText);
    } else if (err instanceof FederalRegisterError) {
      console.error('SDK Error:', err.message);
    }
  }
}
```
