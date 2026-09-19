# federal-register-ts Cookbook & Examples

This directory contains executable code examples demonstrating canonical SDK usage patterns for `federal-register-ts`.

---

## Example Categories

### 1. CommonJS (`examples/commonjs/`)
Standard CommonJS consumption in Node.js applications:
- **`search-documents.js`**: Searching published documents with structured conditions, field selection, and single document lookup.
- **`error-handling.js`**: Differentiating client-side validation errors (`RequestValidationError`) from server HTTP responses (`FederalRegisterHttpError`).

### 2. Node.js ESM Interoperability (`examples/esm-interop/`)
Using `federal-register-ts` from native Node.js ECMAScript Modules (`"type": "module"` or `.mjs` files):
- **`search-documents.mjs`**: Verified default import + destructuring interoperability pattern:
  ```javascript
  import federalRegisterPkg from 'federal-register-ts';
  const { FederalRegisterClient } = federalRegisterPkg;
  ```
- **`public-inspection.mjs`**: Querying pre-publication Public Inspection documents and aggregation facets.

### 3. TypeScript Consumer (`examples/typescript/`)
End-to-end type safety with precise field projections:
- **`typed-queries.ts`**: Strongly typed search conditions, generic field projection narrowing (`fields: ['title', 'document_number']`), and type-safe envelope handling (`SearchResultEnvelope<T>`).

---

## Offline & Mock Transport

All examples support injecting a custom `fetch` handler via `new FederalRegisterClient({ fetch: customFetch })`. This allows applications and tests to run in isolated, offline, or mock environments without making live network requests to FederalRegister.gov.

A reusable mock implementation is available in `examples/mock-transport.js`.

---

## Running the Examples

> **Note:** The `examples/**` directory is maintained within the source repository for documentation and integration testing; it is intentionally not included inside the published npm package tarball.

### In this Repository Clone

To run all examples in an isolated consumer workspace using the built SDK tarball:

```bash
# Build the SDK and run the automated example test runner
node examples/run-all-examples.js
```

### In an External Application

When consuming the published `federal-register-ts` npm package in your own application:

1. Install the package:
   ```bash
   npm install federal-register-ts
   ```

2. Import and initialize the client:
   - **CommonJS:**
     ```javascript
     const { FederalRegisterClient } = require('federal-register-ts');
     const client = new FederalRegisterClient();
     ```
   - **ESM (`.mjs` or `"type": "module"`):**
     ```javascript
     import federalRegisterPkg from 'federal-register-ts';
     const { FederalRegisterClient } = federalRegisterPkg;
     const client = new FederalRegisterClient();
     ```
   - **TypeScript:**
     ```typescript
     import { FederalRegisterClient, DocumentSearchItem, SearchResultEnvelope } from 'federal-register-ts';
     const client = new FederalRegisterClient();
     ```
