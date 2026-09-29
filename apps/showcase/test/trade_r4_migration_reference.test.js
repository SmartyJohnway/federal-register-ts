import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { transformR310AToR4Map } = require('../scripts/generate_r4_migration_reference.cjs');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const canonicalRegistryPath = path.join(__dirname, '../src/data/canonicalRegistry.json');
const canonicalRegistry = JSON.parse(fs.readFileSync(canonicalRegistryPath, 'utf8'));

describe('R3-10E R4 Migration Reference Mapping & Semantic Contract', () => {
  it('pure transformation correctly derives IDs from canonicalRegistry without drift', () => {
    const mockItems = [
      {
        id: 1,
        handyPath: 'src/lib/frTsApi2.ts:searchDocuments',
        symbol: 'searchDocuments(params)',
        wrapper: 'POST /api/fr-ts-search',
        canonical: 'client.documents.search',
        appLogic: 'Maps Handy SearchParams to query params',
        retirement: 'Direct invocation',
        r4Obligation: 'Verify pagination',
      },
      {
        id: 38,
        handyPath: 'src/lib/frTsApi2.ts:suggestedSearchFind',
        symbol: 'suggestedSearchFind(slug)',
        wrapper: 'GET /api/fr-ts-suggested-searches',
        canonical: 'client.suggestedSearches.find',
        appLogic: 'Find by slug',
        retirement: 'Direct invocation',
        r4Obligation: 'Verify slug lookup',
      },
      {
        id: 24,
        handyPath: 'netlify/functions/fr-ts-pi.ts',
        symbol: 'handler',
        wrapper: 'PublicInspection router',
        canonical: 'client.publicInspection.*',
        appLogic: 'Routes current vs availableOn vs search',
        retirement: 'Replace router',
        r4Obligation: 'Verify PI routes',
      },
      {
        id: 40,
        handyPath: 'netlify/functions/fr-ts-suggested-searches.ts',
        symbol: 'handler',
        wrapper: 'SuggestedSearches router',
        canonical: 'client.suggestedSearches.*',
        appLogic: 'Dispatches list vs find by slug',
        retirement: 'Replace router',
        r4Obligation: 'Verify suggested search routes',
      },
    ];

    const transformed = transformR310AToR4Map(mockItems, canonicalRegistry);
    assert.equal(transformed.length, 4);

    // Row 1: client.documents.search -> DOC-001
    assert.deepEqual(transformed[0].canonical_sdk_operation_ids, ['DOC-001']);
    assert.equal(transformed[0].responsibility_class, 'DIRECT_CANONICAL_SDK');

    // Row 38: client.suggestedSearches.find -> SUGGEST-003 (NOT SUGGEST-002)
    assert.deepEqual(transformed[1].canonical_sdk_operation_ids, ['SUGGEST-003']);

    // Row 24: wildcard client.publicInspection.* -> exactly [PI-001, PI-002, PI-003]
    assert.deepEqual(transformed[2].canonical_sdk_operation_ids, ['PI-001', 'PI-002', 'PI-003']);
    assert.equal(transformed[2].responsibility_class, 'EMBEDDED_FR_DUPLICATION_CANDIDATE');

    // Row 40: wildcard client.suggestedSearches.* -> exactly [SUGGEST-001, SUGGEST-003]
    assert.deepEqual(transformed[3].canonical_sdk_operation_ids, ['SUGGEST-001', 'SUGGEST-003']);
  });

  // Governed Evidence Integration Test (executes when file exists at specified or default location)
  const envMapPath = process.env.R3_10E_MAP_JSON || 'G:/我的雲端硬碟/ChatGPT-Workspace/Federal-Register-TS/15-R3-10-SDK-Showcase/R3-10E-C1-Evidence/e-c1_06_r4_migration_reference_corrected.json';
  
  if (fs.existsSync(envMapPath)) {
    describe('Governed 53-row Evidence Integrity Verification', () => {
      const r4Rows = JSON.parse(fs.readFileSync(envMapPath, 'utf8'));
      const validOpIds = new Set(canonicalRegistry.map((op) => op.id));

      it('contains exactly 53 rows with unique reference IDs 1..53', () => {
        assert.equal(r4Rows.length, 53);
        const idSet = new Set(r4Rows.map((r) => r.reference_id));
        assert.equal(idSet.size, 53);
        for (let i = 1; i <= 53; i++) {
          assert.ok(idSet.has(i), `Missing reference_id ${i}`);
        }
      });

      it('strictly corrects rows 38, 39, 24, and 40 semantic mappings', () => {
        const row38 = r4Rows.find((r) => r.reference_id === 38);
        const row39 = r4Rows.find((r) => r.reference_id === 39);
        const row24 = r4Rows.find((r) => r.reference_id === 24);
        const row40 = r4Rows.find((r) => r.reference_id === 40);

        assert.ok(row38 && row39 && row24 && row40);
        assert.deepEqual(row38.canonical_sdk_operation_ids, ['SUGGEST-003'], 'Row 38 must be SUGGEST-003');
        assert.deepEqual(row39.canonical_sdk_operation_ids, ['SUGGEST-003'], 'Row 39 must be SUGGEST-003');
        assert.deepEqual(row24.canonical_sdk_operation_ids, ['PI-001', 'PI-002', 'PI-003'], 'Row 24 must be [PI-001, PI-002, PI-003]');
        assert.deepEqual(row40.canonical_sdk_operation_ids, ['SUGGEST-001', 'SUGGEST-003'], 'Row 40 must be [SUGGEST-001, SUGGEST-003]');
      });

      it('every canonical_sdk_operation_id exists in canonical 54 registry', () => {
        for (const row of r4Rows) {
          assert.ok(Array.isArray(row.canonical_sdk_operation_ids));
          for (const opId of row.canonical_sdk_operation_ids) {
            assert.ok(validOpIds.has(opId), `Invalid opId ${opId} in row ${row.reference_id}`);
          }
        }
      });

      it('strictly excludes v1.2 / cursor / E-CAP features', () => {
        for (const row of r4Rows) {
          const str = JSON.stringify(row).toLowerCase();
          assert.ok(!str.includes('search_after_cursor'));
          assert.ok(!str.includes('e-cap-001'));
          assert.ok(!str.includes('e-cap-002'));
        }
      });
    });
  }
});
