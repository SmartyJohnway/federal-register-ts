/**
 * Node.js ESM Interoperability Example: Public Inspection & Facets
 * Demonstrates:
 * - Querying pre-publication Public Inspection documents
 * - Querying nested facet aggregation services
 */

import federalRegisterPkg from 'federal-register-ts';
import { createRequire } from 'module';

const { FederalRegisterClient } = federalRegisterPkg;
const require = createRequire(import.meta.url);
const { createMockFetch } = require('../mock-transport.js');

async function main() {
  const mockFetch = createMockFetch();
  const client = new FederalRegisterClient({ fetch: mockFetch });

  console.log('[ESM] Querying current Public Inspection documents...');
  const piCurrent = await client.publicInspection.current({
    fields: ['title', 'document_number', 'filed_at', 'agency_names']
  });

  console.log(`[ESM] Current Public Inspection Count: ${piCurrent.count}`);
  if (piCurrent.results) {
    for (const doc of piCurrent.results) {
      console.log(`- ${doc.title} (Filed: ${doc.filed_at})`);
    }
  }

  console.log('\n[ESM] Querying Document Agency Facet counts...');
  const agencyFacets = await client.documents.facets.agency({
    conditions: {
      publicationDate: { gte: '2024-01-01' }
    }
  });

  console.log(`[ESM] Agency Facet entries retrieved:`, Object.keys(agencyFacets));
}

main().catch((err) => {
  console.error('[ESM] Execution failed:', err);
  process.exit(1);
});
