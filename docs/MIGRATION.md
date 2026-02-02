# Migration Guide: From Direct API Calls to `fr-ts-microservices`

This guide provides instructions and examples for migrating your existing project from making direct `fetch` calls to the Federal Register API to using the new, robust `fr-ts-microservices` library.

---

## 1. Advantages of Migration

-   **Simplicity & Readability:** Replace manual URL construction and `fetch` calls with clean, declarative methods.
-   **Robustness:** The library handles complex logic like request batching, type coercion, and API-specific response structures.
-   **Error Handling:** Benefit from structured, typed errors (`BadRequest`, `RecordNotFound`, etc.) instead of manually checking HTTP status codes.
-   **Maintainability:** Future changes to the Federal Register API can be handled by updating the library, not by changing your application code.

---

## 2. Setup

Instead of calling `fetch` directly, you will now import the necessary classes from the library's entry point.

```typescript
// Remove old fetch logic
// import fetch from 'node-fetch';

// Add new import
import { FederalRegister, Document, AggregatedQuery } from './src/index';
```

---

## 3. Migration Examples

Below are side-by-side comparisons of common use cases.

### Example 1: Simple Document Search

**BEFORE (Direct `fetch`)**

```typescript
async function oldSearch() {
  const baseUrl = 'https://www.federalregister.gov/api/v1/documents.json';
  const params = new URLSearchParams({
    'conditions[term]': 'environmental justice',
    'per_page': '10',
  });

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Found ${data.count} documents.`);
    // ... manually process data.results
  } catch (error) {
    console.error("Search failed:", error);
  }
}
```

**AFTER (Using the Library)**

```typescript
import { FederalRegister } from './src/index';

async function newSearch() {
  try {
    const response = await FederalRegister.search({
      term: 'environmental justice',
      per_page: 10,
    });
    console.log(`Found ${response.documents.count} documents.`);
    for (const doc of response.documents) {
      console.log(`- [${doc.document_number}] ${doc.title}`);
    }
  } catch (error) {
    console.error("Search failed:", error);
  }
}
```

### Example 2: Finding a Single Document

**BEFORE (Direct `fetch`)**

```typescript
async function oldFind() {
  const docNumber = '2024-01234';
  const url = `https://www.federalregister.gov/api/v1/documents/${docNumber}.json`;

  try {
    const response = await fetch(url);
    const docData = await response.json();
    console.log(docData.title);
  } catch (error) {
    console.error("Find failed:", error);
  }
}
```

**AFTER (Using the Library)**

```typescript
import { Document } from './src/index';

async function newFind() {
  try {
    const doc = await Document.find('2024-01234');
    console.log(doc.title);
  } catch (error) {
    console.error("Find failed:", error);
  }
}
```

### Example 3: Complex Search with Facets

This is where the library provides the most significant benefit, avoiding multiple manual API calls.

**BEFORE (Multiple `fetch` calls)**

```typescript
async function oldComplexSearch() {
  const term = 'offshore wind';
  const docUrl = `https://www.federalregister.gov/api/v1/documents.json?conditions[term]=${term}`;
  const agencyFacetUrl = `https://www.federalregister.gov/api/v1/documents/facets/agency.json?conditions[term]=${term}`;

  try {
    // Manually execute calls in parallel
    const [docResponse, facetResponse] = await Promise.all([
      fetch(docUrl).then(res => res.json()),
      fetch(agencyFacetUrl).then(res => res.json()),
    ]);

    console.log(`Found ${docResponse.count} documents.`);
    console.log('Agency Counts:', facetResponse);

  } catch (error) {
    console.error("Complex search failed:", error);
  }
}
```

**AFTER (Using the Aggregator)**

```typescript
import { FederalRegister } from './src/index';

async function newComplexSearch() {
  try {
    const response = await FederalRegister.search({
      term: 'offshore wind',
      facets: ['agency'], // Simply declare the facets you need
    });

    console.log(`Found ${response.documents.count} documents.`);
    console.log('Agency Counts:');
    for (const agency of response.facets.agency) {
        console.log(`- ${agency.name}: ${agency.count}`);
    }

  } catch (error) {
    console.error("Complex search failed:", error);
  }
}
```
