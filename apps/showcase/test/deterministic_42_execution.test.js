import test from 'node:test';
import assert from 'node:assert/strict';
import { FederalRegisterClient } from 'federal-register-ts';
import canonicalRegistry from '../src/data/canonicalRegistry.json' with { type: 'json' };
import { executeOperation, STATIC_EXECUTOR_MAP } from '../src/lib/executor.ts';
import { PRESENTATION_OVERLAYS } from '../src/data/presentationOverlay.ts';

test('Deterministic 42/42 Synthetic SDK Execution Suite', async (t) => {
  let networkCallCount = 0;

  // Custom mock fetch returning deterministic synthetic JSON responses
  const mockFetch = async (url, init) => {
    networkCallCount++;
    const urlStr = String(url);

    // Return synthetic envelopes according to endpoint path
    let payload = {};

    if (urlStr.includes('/documents/facets/') || urlStr.includes('/public-inspection-documents/facets/') || urlStr.includes('/public-inspection-issues/facets/')) {
      payload = { 'Sample Category': 42, 'Category 2': 10 };
    } else if (urlStr.includes('/documents/autocomplete-suggestions')) {
      payload = { suggestions: [{ term: 'environmental', count: 5 }] };
    } else if (urlStr.includes('/documents/search-details') || urlStr.includes('/public-inspection-documents/search-details')) {
      payload = { filters: {}, suggestions: {} };
    } else if (urlStr.includes('/documents') || urlStr.includes('/public-inspection-documents')) {
      payload = {
        count: 1,
        total_pages: 1,
        results: [
          {
            title: 'Synthetic Test Document',
            document_number: '2024-00123',
            citation: '89 FR 12345',
            type: 'Rule',
            action: 'Final Rule',
            publication_date: '2024-03-01',
          },
        ],
      };
    } else if (urlStr.includes('/agencies/suggestions') || urlStr.includes('/topics/suggestions')) {
      payload = [{ name: 'Commerce Department', slug: 'commerce', id: 112 }];
    } else if (urlStr.includes('/agencies')) {
      payload = [{ name: 'International Trade Administration', slug: 'international-trade-administration', id: 112 }];
    } else if (urlStr.includes('/topics')) {
      payload = { 'Trade': { count: 10, name: 'Trade', slug: 'trade' } };
    } else if (urlStr.includes('/sections')) {
      payload = { 'money': { title: 'Money', slug: 'money' } };
    } else if (urlStr.includes('/suggested_searches')) {
      payload = { 'tariffs': { title: 'Tariffs', slug: 'tariffs' } };
    } else if (urlStr.includes('/holidays')) {
      payload = { '2024-01-01': { name: 'New Year\'s Day' } };
    } else if (urlStr.includes('/effective_dates')) {
      payload = { '2024-03-01': { effective_date: '2024-04-30' } };
    } else if (urlStr.includes('/issues')) {
      payload = { issue_date: '2024-03-01', table_of_contents: {} };
    } else {
      payload = { status: 'success', message: 'Synthetic response' };
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const syntheticClient = new FederalRegisterClient({
    baseUrl: 'https://mock.federalregister.test/api/v1',
    fetch: mockFetch,
  });

  const runnableOps = canonicalRegistry.filter((op) => op.tier === 'Tier A' || op.tier === 'Tier B');
  assert.equal(runnableOps.length, 42);

  for (const op of runnableOps) {
    await t.test(`Execute runnable operation #${op.ordinal} ${op.id} (${op.path})`, async () => {
      const sampleParams = PRESENTATION_OVERLAYS[op.id]?.sampleParams || undefined;
      const initialCount = networkCallCount;

      const result = await executeOperation(syntheticClient, op.id, sampleParams);

      assert.ok(result !== undefined, `Operation ${op.id} must return a result`);
      assert.ok(networkCallCount > initialCount, `Operation ${op.id} must invoke mock fetch transport`);
    });
  }

  await t.test('All 42 runnable operations executed deterministically with mock transport', () => {
    assert.equal(networkCallCount, 42);
  });
});
