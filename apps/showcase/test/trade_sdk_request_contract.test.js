import test from 'node:test';
import assert from 'node:assert/strict';
import { FederalRegisterClient } from 'federal-register-ts';
import { STATIC_EXECUTOR_MAP } from '../src/lib/executor.ts';
import {
  buildSection232SearchParams,
  buildSteelAluminumSearchParams,
  buildCommerceMonitoringParams,
  buildPresidentialTradeParams,
  buildPublicInspectionTradeSearchParams,
  buildFacetedTradeParams,
} from '../src/lib/tradeRequestBuilders.ts';

/**
 * Deterministic Exact-SDK Trade Request Contract Integration Test Suite
 *
 * Verifies that all parameter payloads constructed by Trade workflows (E-W1 to E-W6)
 * conform strictly to the canonical federal-register-ts@1.1.0 client contracts
 * and produce valid, verified URL routes and query strings without RequestValidationError.
 */

test('Trade Exact-SDK Request Contract Verification Suite', async (t) => {
  let capturedRequest = null;
  let liveNetworkAttempted = false;

  const mockFetch = async (input, init) => {
    const urlStr = typeof input === 'string' ? input : input.url;
    const url = new URL(urlStr, 'https://www.federalregister.gov');
    capturedRequest = {
      url: urlStr,
      pathname: url.pathname,
      searchParams: url.searchParams,
      method: init?.method || 'GET',
    };

    if (!urlStr.startsWith('https://www.federalregister.gov/api/v1')) {
      liveNetworkAttempted = true;
      throw new Error(`Unexpected destination: ${urlStr}`);
    }

    // Return minimal valid responses matching each endpoint shape
    if (url.pathname.includes('/documents')) {
      if (url.pathname.includes('/facets/')) {
        return new Response(
          JSON.stringify({
            'international-trade-administration': {
              name: 'International Trade Administration',
              count: 42,
            },
            'bureau-of-industry-and-security': {
              name: 'Bureau of Industry and Security',
              count: 18,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({
          count: 1,
          total_pages: 1,
          results: [
            {
              title: 'Section 232 Trade Notice',
              document_number: '2026-00001',
              type: 'NOTICE',
              publication_date: '2026-09-28',
              html_url: 'https://www.federalregister.gov/documents/2026/09/28/2026-00001',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (url.pathname.includes('/public-inspection-documents')) {
      if (url.pathname.includes('/current')) {
        return new Response(
          JSON.stringify({
            count: 1,
            results: [
              {
                title: 'Trade Public Inspection Notice',
                document_number: '2026-00002-PI',
                filing_date: '2026-09-28',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({
          count: 1,
          total_pages: 1,
          results: [
            {
              title: 'Trade Public Inspection Search Result',
              document_number: '2026-00003-PI',
              filing_date: '2026-09-28',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const client = new FederalRegisterClient({
    fetch: mockFetch,
    baseUrl: 'https://www.federalregister.gov/api/v1',
  });

  // E-W1: Section 232
  await t.test('E-W1: buildSection232SearchParams validates and serializes through DOC-001', async () => {
    capturedRequest = null;
    const params = buildSection232SearchParams({
      term: 'Section 232',
      type: 'NOTICE',
      publicationDate: '2026-09-28',
      perPage: 15,
    });

    const executor = STATIC_EXECUTOR_MAP['DOC-001'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.pathname, '/api/v1/documents');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'Section 232');
    assert.equal(capturedRequest.searchParams.get('conditions[type][]'), 'NOTICE');
    assert.equal(capturedRequest.searchParams.get('conditions[publication_date][is]'), '2026-09-28');
    assert.equal(capturedRequest.searchParams.get('per_page'), '15');
  });

  // E-W2: Steel / Aluminum
  await t.test('E-W2: buildSteelAluminumSearchParams serializes presets through DOC-001', async () => {
    capturedRequest = null;
    const steelParams = buildSteelAluminumSearchParams({ preset: 'steel' });
    const executor = STATIC_EXECUTOR_MAP['DOC-001'];
    await executor(client, steelParams);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.pathname, '/api/v1/documents');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'steel');

    // Combined
    capturedRequest = null;
    const combinedParams = buildSteelAluminumSearchParams({ preset: 'combined' });
    await executor(client, combinedParams);
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'steel aluminum');
  });

  // E-W3: Commerce Monitoring
  await t.test('E-W3: buildCommerceMonitoringParams scopes by agency through DOC-001', async () => {
    capturedRequest = null;
    const params = buildCommerceMonitoringParams({
      term: 'antidumping',
      agency: 'commerce-department',
    });

    const executor = STATIC_EXECUTOR_MAP['DOC-001'];
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.pathname, '/api/v1/documents');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'antidumping');
    assert.equal(capturedRequest.searchParams.get('conditions[agencies][]'), 'commerce-department');
  });

  // E-W4: Presidential Documents
  await t.test('E-W4: buildPresidentialTradeParams restricts type to PRESDOCU through DOC-001', async () => {
    capturedRequest = null;
    const params = buildPresidentialTradeParams({
      term: 'trade emergency',
      publicationDate: '2026-09-28',
    });

    const executor = STATIC_EXECUTOR_MAP['DOC-001'];
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.pathname, '/api/v1/documents');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'trade emergency');
    assert.equal(capturedRequest.searchParams.get('conditions[type][]'), 'PRESDOCU');
    assert.equal(capturedRequest.searchParams.get('conditions[publication_date][is]'), '2026-09-28');
  });

  // E-W5: Public Inspection Early Warning
  await t.test('E-W5: Public inspection current and search execute through PI-003 and PI-001', async () => {
    // PI-003
    capturedRequest = null;
    const piCurrentExecutor = STATIC_EXECUTOR_MAP['PI-003'];
    await piCurrentExecutor(client, {});
    assert.ok(capturedRequest);
    assert.equal(capturedRequest.pathname, '/api/v1/public-inspection-documents/current');

    // PI-001
    capturedRequest = null;
    const searchParams = buildPublicInspectionTradeSearchParams({ term: 'customs' });
    const piSearchExecutor = STATIC_EXECUTOR_MAP['PI-001'];
    await piSearchExecutor(client, searchParams);
    assert.ok(capturedRequest);
    assert.equal(capturedRequest.pathname, '/api/v1/public-inspection-documents');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'customs');
  });

  // E-W6: Faceted Trade Research
  await t.test('E-W6: Facet parameters serialize correctly through DOC-FACET-001, DOC-FACET-004, DOC-FACET-010', async () => {
    // Agency facet
    capturedRequest = null;
    const agencyFacetParams = buildFacetedTradeParams({ dimension: 'agency', term: 'tariff' });
    const agencyExecutor = STATIC_EXECUTOR_MAP['DOC-FACET-001'];
    const res = await agencyExecutor(client, agencyFacetParams);
    assert.ok(capturedRequest);
    assert.equal(capturedRequest.pathname, '/api/v1/documents/facets/agency');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'tariff');
    assert.ok(typeof res === 'object');
    assert.equal(res['international-trade-administration'].count, 42);
    assert.equal(res['international-trade-administration'].name, 'International Trade Administration');
    assert.ok(!JSON.stringify(res).includes('[object Object]'));

    // Doc Type facet
    capturedRequest = null;
    const docTypeFacetParams = buildFacetedTradeParams({ dimension: 'docType', term: 'tariff' });
    const docTypeExecutor = STATIC_EXECUTOR_MAP['DOC-FACET-004'];
    await docTypeExecutor(client, docTypeFacetParams);
    assert.ok(capturedRequest);
    assert.equal(capturedRequest.pathname, '/api/v1/documents/facets/type');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'tariff');

    // Yearly facet
    capturedRequest = null;
    const yearlyFacetParams = buildFacetedTradeParams({ dimension: 'yearly', term: 'tariff' });
    const yearlyExecutor = STATIC_EXECUTOR_MAP['DOC-FACET-010'];
    await yearlyExecutor(client, yearlyFacetParams);
    assert.ok(capturedRequest);
    assert.equal(capturedRequest.pathname, '/api/v1/documents/facets/yearly');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'tariff');
  });

  await t.test('Guarantees 0 live network calls occurred', () => {
    assert.equal(liveNetworkAttempted, false);
  });
});
