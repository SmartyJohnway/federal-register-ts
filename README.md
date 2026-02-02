# Federal Register API Client (TypeScript)

A robust, type-safe TypeScript client for the Federal Register API. This library is a TypeScript implementation inspired by the official `federal_register` Ruby gem, designed to make searching and retrieving US government documents easy in modern JavaScript/TypeScript applications.

## Features

*   🚀 **Full TypeScript Support**: Comprehensive type definitions for search parameters and responses.
*   🔍 **Advanced Search**: Support for complex filtering, facets, and conditions.
*   📄 **Document Retrieval**: Fetch detailed document information and metadata.
*   🏛️ **Agency & PI Support**: Includes endpoints for Agencies and Public Inspection documents.

## Installation

```bash
npm install federal-register-ts
```

## Usage

### 1. Searching Documents

```typescript
import { searchDocuments, SearchParams } from 'federal-register-ts';

const params: SearchParams = {
  term: 'environment',
  per_page: 10,
  order: 'newest',
  conditions: {
    agency_ids: ['492'], // Environmental Protection Agency
    publication_date: {
      gte: '2023-01-01'
    }
  }
};

async function runSearch() {
  const response = await searchDocuments(params);
  console.log('Results:', response);
}
```

### 2. Finding a Specific Document

Retrieve a document by its document number.

```typescript
import { findDocument } from 'federal-register-ts';

async function getDoc() {
  const docNumber = '2023-12345';
  const response = await findDocument(docNumber, {
    fields: ['title', 'abstract', 'publication_date']
  });
  
  console.log(response);
}
```

## Development

1. Clone the repo
2. `npm install`
3. `npm run build`

## Porting History & Documentation

This project is a complete TypeScript port of the official `federal_register` Ruby Gem. To help developers understand the translation process and architecture decisions, we have included the following resources in the repository:

*   **`progress_logs/`**: A detailed daily log of the development process. It documents the step-by-step porting workflow, from the initial analysis of the Ruby Gem to the scaffolding of adapters (e.g., `Agency`, `Document`, `Facet`) and the implementation of specific features.
*   **`docs/`**: Contains architectural analysis of the original Ruby Gem (`ruby_gem_analysis_summary`) and project schema definitions (JSON Schema / OpenAPI) used to ensure type safety and API consistency during the migration.
*   **`tests/`**: Comprehensive unit tests that mirror the functionality of the original gem, ensuring that the TypeScript implementation behaves identically to the Ruby version.

## License

MIT