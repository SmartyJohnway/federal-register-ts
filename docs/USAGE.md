# Federal Register TS Library - Usage Guide

This guide explains how to use the `fr-ts-microservices` library to interact with the Federal Register API.

---

## Installation

Assuming the project is built and available, you can import the necessary classes from the main entry point:

```typescript
import {
  FederalRegister,
  Document,
  Agency,
  DocumentAgencyFacet,
  // ... and other classes
} from './src/index';
```

---

## 1. Aggregated Search (Recommended)

The easiest way to use the library is through the `FederalRegister` aggregator, which can handle complex queries for documents and facets simultaneously.

### Example: Find documents about climate change and get agency facet counts

```typescript
import { FederalRegister, AggregatedQuery, AggregatedResponse } from './src/index';

async function performSearch() {
  const query: AggregatedQuery = {
    term: 'climate change',
    conditions: {
      publication_date: { year: '2023' },
    },
    facets: ['agency', 'daily'], // Request agency and daily facet counts
    per_page: 10,
  };

  try {
    const response: AggregatedResponse = await FederalRegister.search(query);

    // 1. Handle Document Results
    console.log(`Found ${response.documents.count} documents.`);
    for (const doc of response.documents) {
      console.log(`- [${doc.document_number}] ${doc.title}`);
    }

    // 2. Handle Facet Results
    if (response.facets.agency) {
      console.log('\nAgency Counts:');
      for (const agencyFacet of response.facets.agency) {
        console.log(`- ${agencyFacet.name}: ${agencyFacet.count}`);
      }
    }

  } catch (error) {
    console.error("Search failed:", error);
  }
}

performSearch();
```

---

## 2. Direct Adapter Usage

For more specific tasks, you can use the individual adapters directly.

### Example 1: Find a single document by its document number

```typescript
import { Document } from './src/index';

async function findDocument() {
  try {
    const doc = await Document.find('2023-12345');
    console.log('Found Document:');
    console.log(`Title: ${doc.title}`);
    console.log(`URL: ${doc.html_url}`);
  } catch (error) {
    console.error("Failed to find document:", error);
  }
}

findDocument();
```

### Example 2: Get a list of all agencies

```typescript
import { Agency } from './src/index';

async function listAgencies() {
  try {
    const agencies = await Agency.all({ fields: ['name', 'slug'] });
    console.log('All Agencies:');
    for (const agency of agencies) {
      console.log(`- ${agency.name} (slug: ${agency.slug})`);
    }
  } catch (error) {
    console.error("Failed to list agencies:", error);
  }
}

listAgencies();
```

### Example 3: Get only facet counts for a specific topic

```typescript
import { DocumentTopicFacet, FacetResultSet } from './src/index';

async function getTopicFacets() {
  const query = {
    conditions: { term: 'nuclear energy' },
  };

  try {
    const resultSet: FacetResultSet<DocumentTopicFacet> = await DocumentTopicFacet.search(query, DocumentTopicFacet);
    console.log('Topic Counts for "nuclear energy":');
    for (const topic of resultSet) {
      console.log(`- ${topic.name}: ${topic.count}`);
    }
  } catch (error) {
    console.error("Failed to get topic facets:", error);
  }
}

getTopicFacets();
```
