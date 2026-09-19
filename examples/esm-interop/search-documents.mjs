/**
 * Node.js ESM Interoperability Example: Searching Documents
 * Demonstrates:
 * - Verified Node.js ESM interop pattern: default import followed by destructuring
 * - Executing document queries from an ECMAScript Module environment
 */

import federalRegisterPkg from 'federal-register-ts';
import { createRequire } from 'module';

const { FederalRegisterClient } = federalRegisterPkg;
const require = createRequire(import.meta.url);
const { createMockFetch } = require('../mock-transport.js');

async function main() {
  const mockFetch = createMockFetch();
  const client = new FederalRegisterClient({ fetch: mockFetch });

  console.log('[ESM] Querying published documents...');
  const results = await client.documents.search({
    conditions: {
      term: 'renewable fuel',
      publicationDate: { gte: '2024-01-01' }
    },
    fields: ['title', 'document_number', 'publication_date'],
    perPage: 5
  });

  console.log(`[ESM] Found ${results.count} results:`);
  if ('results' in results) {
    for (const item of results.results) {
      console.log(`- [${item.document_number}] ${item.title}`);
    }
  }
}

main().catch((err) => {
  console.error('[ESM] Execution failed:', err);
  process.exit(1);
});
