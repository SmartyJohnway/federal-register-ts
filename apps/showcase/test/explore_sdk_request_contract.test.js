import test from 'node:test';
import assert from 'node:assert/strict';
import { FederalRegisterClient } from 'federal-register-ts';
import { STATIC_EXECUTOR_MAP } from '../src/lib/executor.ts';
import {
  buildDocumentSearchParams,
  buildPublicInspectionSearchParams,
  buildPublicInspectionAvailableOnParams,
  buildAgencyListParams,
  buildAgencyFindParams,
  buildAgencySuggestionsParams,
  buildTopicSuggestionsParams,
  buildIssueFindParams,
  buildDocumentFacetParams,
  buildPublicInspectionFacetParams,
} from '../src/lib/exploreRequestBuilders.ts';

/**
 * Deterministic Exact-SDK Request Contract Integration Test Suite
 *
 * Verifies that all parameter payloads constructed by Explore workflows conform
 * strictly to the canonical federal-register-ts@1.1.0 client contracts and produce
 * valid, verified URL routes and query strings without RequestValidationError.
 */

test('Explore Exact-SDK Request Contract Verification Suite', async (t) => {
  let capturedRequest = null;

  const mockFetch = async (input, init) => {
    const urlStr = typeof input === 'string' ? input : input.url;
    const url = new URL(urlStr, 'https://www.federalregister.gov');
    capturedRequest = {
      url: urlStr,
      pathname: url.pathname,
      searchParams: url.searchParams,
      method: init?.method || 'GET',
    };

    // Return minimal valid responses matching each endpoint shape
    if (url.pathname.includes('/documents')) {
      if (url.pathname.includes('/facets/')) {
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ count: 1, total_pages: 1, results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.pathname.includes('/public-inspection-documents')) {
      if (url.pathname.includes('/facets/')) {
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ count: 1, results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.pathname.includes('/agencies')) {
      if (url.pathname.includes('/suggestions')) {
        return new Response(JSON.stringify({ results: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.pathname.includes('/topics')) {
      if (url.pathname.includes('/suggestions')) {
        return new Response(JSON.stringify({ results: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({
          meta: { count: { thesaurus: 0, ad_hoc: 0, total: 0 } },
          results: { thesaurus: [], ad_hoc: [] },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (url.pathname.includes('/issues')) {
      return new Response(
        JSON.stringify({
          meta: { publication_date: '2026-09-28' },
          agencies: [],
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

  // --------------------------------------------------------------------------
  // DOC-001: Search Documents
  // --------------------------------------------------------------------------
  await t.test('DOC-001: buildDocumentSearchParams validates and serializes correctly through exact SDK', async () => {
    capturedRequest = null;
    const params = buildDocumentSearchParams({
      term: 'critical minerals trade',
      type: 'RULE',
      agency: 'commerce-department',
      publicationDate: '2026-09-28',
      perPage: 10,
    });

    const executor = STATIC_EXECUTOR_MAP['DOC-001'];
    assert.ok(executor, 'DOC-001 executor must exist');
    await executor(client, params);

    assert.ok(capturedRequest, 'SDK must execute request through injected mock fetch');
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/documents');
    assert.equal(capturedRequest.searchParams.get('per_page'), '10');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'critical minerals trade');
    assert.equal(capturedRequest.searchParams.get('conditions[type][]'), 'RULE');
    assert.equal(capturedRequest.searchParams.get('conditions[agencies][]'), 'commerce-department');
    assert.equal(capturedRequest.searchParams.get('conditions[publication_date][is]'), '2026-09-28');
  });

  // --------------------------------------------------------------------------
  // PI-001, PI-002, PI-003: Public Inspection
  // --------------------------------------------------------------------------
  await t.test('PI-001: buildPublicInspectionSearchParams validates and serializes through exact SDK', async () => {
    capturedRequest = null;
    const params = buildPublicInspectionSearchParams({
      term: 'customs tariff',
      perPage: 10,
    });

    const executor = STATIC_EXECUTOR_MAP['PI-001'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/public-inspection-documents');
    assert.equal(capturedRequest.searchParams.get('per_page'), '10');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'customs tariff');
  });

  await t.test('PI-002: buildPublicInspectionAvailableOnParams serializes availableOn correctly', async () => {
    capturedRequest = null;
    const params = buildPublicInspectionAvailableOnParams('2026-09-28');

    const executor = STATIC_EXECUTOR_MAP['PI-002'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/public-inspection-documents');
    assert.equal(capturedRequest.searchParams.get('conditions[available_on]'), '2026-09-28');
  });

  await t.test('PI-003: current public inspection documents executes successfully', async () => {
    capturedRequest = null;
    const executor = STATIC_EXECUTOR_MAP['PI-003'];
    assert.ok(executor);
    await executor(client, {});

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/public-inspection-documents/current');
  });

  // --------------------------------------------------------------------------
  // AGENCY-001, AGENCY-002, AGENCY-004: Agencies
  // --------------------------------------------------------------------------
  await t.test('AGENCY-001: buildAgencyListParams executes without prohibited pagination', async () => {
    capturedRequest = null;
    const params = buildAgencyListParams();

    const executor = STATIC_EXECUTOR_MAP['AGENCY-001'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/agencies');
    assert.equal(capturedRequest.searchParams.get('per_page'), null, 'Must not emit per_page for AgencyList');
  });

  await t.test('AGENCY-002: buildAgencyFindParams serializes idOrSlug correctly', async () => {
    capturedRequest = null;
    const params = buildAgencyFindParams('international-trade-administration');

    const executor = STATIC_EXECUTOR_MAP['AGENCY-002'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/agencies/international-trade-administration');
  });

  await t.test('AGENCY-004: buildAgencySuggestionsParams serializes term query correctly', async () => {
    capturedRequest = null;
    const params = buildAgencySuggestionsParams('Commerce');

    const executor = STATIC_EXECUTOR_MAP['AGENCY-004'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/agencies/suggestions');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'Commerce');
  });

  // --------------------------------------------------------------------------
  // TOPIC-001, TOPIC-002: Topics
  // --------------------------------------------------------------------------
  await t.test('TOPIC-001: topic catalog executes successfully', async () => {
    capturedRequest = null;
    const executor = STATIC_EXECUTOR_MAP['TOPIC-001'];
    assert.ok(executor);
    await executor(client, {});

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/topics.json');
  });

  await t.test('TOPIC-002: buildTopicSuggestionsParams serializes term correctly', async () => {
    capturedRequest = null;
    const params = buildTopicSuggestionsParams('tariffs');

    const executor = STATIC_EXECUTOR_MAP['TOPIC-002'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/topics/suggestions');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'tariffs');
  });

  // --------------------------------------------------------------------------
  // ISSUE-001, ISSUE-002: Issues
  // --------------------------------------------------------------------------
  await t.test('ISSUE-001: buildIssueFindParams serializes publicationDate path correctly', async () => {
    capturedRequest = null;
    const params = buildIssueFindParams('2026-09-25');

    const executor = STATIC_EXECUTOR_MAP['ISSUE-001'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/issues/2026-09-25.json');
  });

  await t.test('ISSUE-002: current issue executes successfully', async () => {
    capturedRequest = null;
    const executor = STATIC_EXECUTOR_MAP['ISSUE-002'];
    assert.ok(executor);
    await executor(client, {});

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/issues/current.json');
  });

  // --------------------------------------------------------------------------
  // Facets: DOC-FACET-001, DOC-FACET-004, DOC-FACET-010, PI-FACET-001
  // --------------------------------------------------------------------------
  await t.test('DOC-FACET-001: agency facet serializes conditions correctly', async () => {
    capturedRequest = null;
    const params = buildDocumentFacetParams('steel');

    const executor = STATIC_EXECUTOR_MAP['DOC-FACET-001'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/documents/facets/agency');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'steel');
  });

  await t.test('DOC-FACET-004: document type facet serializes conditions correctly', async () => {
    capturedRequest = null;
    const params = buildDocumentFacetParams('energy');

    const executor = STATIC_EXECUTOR_MAP['DOC-FACET-004'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/documents/facets/type');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'energy');
  });

  await t.test('DOC-FACET-010: yearly timeline facet serializes conditions correctly', async () => {
    capturedRequest = null;
    const params = buildDocumentFacetParams('tariff');

    const executor = STATIC_EXECUTOR_MAP['DOC-FACET-010'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/documents/facets/yearly');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'tariff');
  });

  await t.test('PI-FACET-001: public inspection type facet serializes conditions correctly', async () => {
    capturedRequest = null;
    const params = buildPublicInspectionFacetParams('trade');

    const executor = STATIC_EXECUTOR_MAP['PI-FACET-001'];
    assert.ok(executor);
    await executor(client, params);

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.method, 'GET');
    assert.equal(capturedRequest.pathname, '/api/v1/public-inspection-documents/facets/type');
    assert.equal(capturedRequest.searchParams.get('conditions[term]'), 'trade');
  });
});
