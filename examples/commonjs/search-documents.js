/**
 * CommonJS Example: Searching Published Documents
 * Demonstrates:
 * - CommonJS package-root require('federal-register-ts')
 * - Client instantiation (with optional mock/offline transport fallback)
 * - Structured condition filtering (conditions.term, conditions.types, publicationDate)
 * - Field selection (fields projection)
 * - Iterating search results
 */

const { FederalRegisterClient } = require('federal-register-ts');
const { createMockFetch } = require('../mock-transport');

async function main() {
  // Use mock transport for deterministic offline execution
  const mockFetch = createMockFetch();
  const client = new FederalRegisterClient({ fetch: mockFetch });

  console.log('Searching Federal Register documents...');
  const searchResults = await client.documents.search({
    conditions: {
      term: 'energy conservation',
      types: ['RULE', 'PRORULE'],
      publicationDate: { gte: '2024-01-01' }
    },
    fields: ['title', 'document_number', 'publication_date', 'html_url'],
    perPage: 10,
    page: 1,
    order: 'newest'
  });

  console.log(`Found ${searchResults.count} document(s):`);
  if ('results' in searchResults) {
    for (const doc of searchResults.results) {
      console.log(`- [${doc.document_number}] ${doc.title} (${doc.publication_date})`);
    }
  }

  console.log('\nRetrieving single document details...');
  const doc = await client.documents.find({
    documentNumber: '2024-00101',
    fields: ['title', 'document_number', 'publication_date', 'abstract', 'html_url']
  });

  console.log(`Document Title: ${doc.title}`);
  console.log(`Document Number: ${doc.document_number}`);
  console.log(`Abstract: ${doc.abstract}`);
}

main().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});
