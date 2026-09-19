# federal-register-ts Cookbook & Examples

This directory contains executable code examples demonstrating canonical SDK usage patterns for `federal-register-ts`.

---

## Example Categories

### 1. CommonJS (`examples/commonjs/`)
Standard CommonJS consumption in Node.js applications:
- **`search-documents.js`**: Searching published documents with structured conditions, field selection, and pagination.
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
- **`typed-queries.ts`**: Generic response narrowing (`fields: ['title', 'document_number']`), typed condition builders, and multi-document lookup handling.

---

## Offline & Mock Transport

All examples support injecting a custom `fetch` handler via `new FederalRegisterClient({ fetch: customFetch })`. This allows applications and tests to run in isolated, offline, or mock environments without making live network requests to FederalRegister.gov.

A helper implementation is available in `examples/mock-transport.js`.

---

## Running the Examples

From a consumer project with `federal-register-ts` installed:

```bash
# CommonJS
node examples/commonjs/search-documents.js
node examples/commonjs/error-handling.js

# ECMAScript Modules (ESM)
node examples/esm-interop/search-documents.mjs
node examples/esm-interop/public-inspection.mjs

# TypeScript Typecheck
npx tsc --project examples/typescript/tsconfig.json
```
