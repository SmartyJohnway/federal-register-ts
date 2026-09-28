import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const r4MapPath = 'G:/我的雲端硬碟/ChatGPT-Workspace/Federal-Register-TS/15-R3-10-SDK-Showcase/R3-10E-Evidence/e_06_r4_migration_reference.json';
const canonicalRegistryPath = path.join(__dirname, '../src/data/canonicalRegistry.json');

describe('R3-10E R4 Migration Reference Mapping Invariants', () => {
  const r4Rows = JSON.parse(fs.readFileSync(r4MapPath, 'utf8'));
  const canonicalRegistry = JSON.parse(fs.readFileSync(canonicalRegistryPath, 'utf8'));
  const validOpIds = new Set(canonicalRegistry.map((op) => op.id));

  it('contains exactly 53 rows corresponding to accepted R3-10A call sites', () => {
    assert.equal(r4Rows.length, 53, 'R4 migration map must have exactly 53 rows');
  });

  it('has zero duplicate reference IDs and zero missing IDs from 1 to 53', () => {
    const ids = r4Rows.map((r) => r.reference_id);
    const idSet = new Set(ids);
    assert.equal(idSet.size, 53, 'Duplicate reference IDs detected');

    for (let i = 1; i <= 53; i++) {
      assert.ok(idSet.has(i), `Missing reference_id ${i}`);
    }
  });

  it('every canonical_sdk_operation_id exists in the accepted 54 canonical registry', () => {
    for (const row of r4Rows) {
      assert.ok(Array.isArray(row.canonical_sdk_operation_ids), `Row ${row.reference_id} missing op ids array`);
      assert.ok(row.canonical_sdk_operation_ids.length > 0, `Row ${row.reference_id} has empty op ids`);
      for (const opId of row.canonical_sdk_operation_ids) {
        assert.ok(validOpIds.has(opId), `Row ${row.reference_id} references invalid operationId: ${opId}`);
      }
    }
  });

  it('responsibility_class is strictly restricted to allowed 6-value vocabulary', () => {
    const allowedClasses = new Set([
      'DIRECT_CANONICAL_SDK',
      'HANDY_CONSUMER_ADAPTER',
      'HANDY_DOMAIN_LOGIC',
      'EMBEDDED_FR_DUPLICATION_CANDIDATE',
      'DEFERRED_SDK_GAP',
      'NEEDS_R4_PREFLIGHT',
    ]);

    for (const row of r4Rows) {
      assert.ok(
        allowedClasses.has(row.responsibility_class),
        `Row ${row.reference_id} has invalid responsibility_class: ${row.responsibility_class}`
      );
    }
  });

  it('strictly excludes v1.2 / search_after_cursor / E-CAP features from v1.1.0 baseline', () => {
    for (const row of r4Rows) {
      const serialized = JSON.stringify(row).toLowerCase();
      assert.ok(!serialized.includes('search_after_cursor'), `Row ${row.reference_id} contains search_after_cursor`);
      assert.ok(!serialized.includes('e-cap-001'), `Row ${row.reference_id} contains e-cap-001`);
      assert.ok(!serialized.includes('e-cap-002'), `Row ${row.reference_id} contains e-cap-002`);
    }
  });
});
