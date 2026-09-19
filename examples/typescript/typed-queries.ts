/**
 * TypeScript Consumer Example: Strongly Typed Queries and Envelopes
 * Demonstrates:
 * - End-to-end type safety for request filters and field projections
 * - Generic response narrowing (DocumentShow<K> and DocumentSearchItem<K>)
 * - Multi-document lookup envelope handling (MultiLookupEnvelope<T>)
 */

import {
  FederalRegisterClient,
  SearchResultEnvelope,
  DocumentSearchItem,
  DocumentShow,
  MultiLookupEnvelope,
  RequestValidationError
} from 'federal-register-ts';

// Reusable mock fetch wrapper for offline execution
const mockFetch: typeof globalThis.fetch = async (input: RequestInfo | URL) => {
  const url = new URL(typeof input === 'string' ? input : input.toString());
  if (url.pathname.endsWith('/documents')) {
    const payload: SearchResultEnvelope<DocumentSearchItem<'title' | 'document_number' | 'publication_date'>> = {
      count: 1,
      total_pages: 1,
      results: [
        {
          title: 'Standards for Clean Water Infrastructure',
          document_number: '2024-00201',
          publication_date: '2024-01-20'
        }
      ]
    };
    return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (url.pathname.includes('/documents/2024-00201')) {
    const docPayload: DocumentShow<'title' | 'document_number' | 'abstract'> = {
      title: 'Standards for Clean Water Infrastructure',
      document_number: '2024-00201',
      abstract: 'EPA action updating water standards.'
    };
    return new Response(JSON.stringify(docPayload), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ status: 200, message: 'Mock response' }), { status: 200 });
};

async function runTypedQueries(): Promise<void> {
  const client = new FederalRegisterClient({ fetch: mockFetch });

  // 1. Typed search with narrowed projection
  console.log('[TypeScript] Running typed search query...');
  const searchResponse: SearchResultEnvelope<DocumentSearchItem<'title' | 'document_number' | 'publication_date'>> =
    await client.documents.search({
      conditions: {
        term: 'clean water',
        types: ['RULE']
      },
      fields: ['title', 'document_number', 'publication_date'],
      perPage: 5
    });

  console.log(`[TypeScript] Search count: ${searchResponse.count}`);
  if ('results' in searchResponse) {
    for (const item of searchResponse.results) {
      // Type-safe access: title, document_number, and publication_date are statically known
      console.log(`- [${item.document_number}] ${item.title}`);
    }
  }

  // 2. Typed single document lookup
  console.log('\n[TypeScript] Retrieving typed document...');
  const doc: DocumentShow<'title' | 'document_number' | 'abstract'> = await client.documents.find({
    documentNumber: '2024-00201',
    fields: ['title', 'document_number', 'abstract']
  });

  console.log(`Title: ${doc.title}`);
  console.log(`Abstract: ${doc.abstract}`);
}

runTypedQueries().catch((err: unknown) => {
  console.error('[TypeScript] Execution failed:', err);
  process.exit(1);
});
