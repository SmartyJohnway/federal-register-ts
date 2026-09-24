import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registryPath = path.resolve(__dirname, '../src/data/canonicalRegistry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

test('Canonical 54 Operations Invariants', async (t) => {
  await t.test('Total count is exactly 54 operations', () => {
    assert.strictEqual(registry.length, 54, 'Registry must contain exactly 54 operations');
  });

  await t.test('All 54 accessor paths are unique', () => {
    const paths = registry.map((item) => item.path);
    const uniquePaths = new Set(paths);
    assert.strictEqual(uniquePaths.size, 54, 'All 54 accessor paths must be unique');
  });

  await t.test('All 54 operation IDs are unique', () => {
    const ids = registry.map((item) => item.id);
    const uniqueIds = new Set(ids);
    assert.strictEqual(uniqueIds.size, 54, 'All 54 operation IDs must be unique');
  });

  await t.test('Root namespaces count is exactly 14 on client accessor paths', () => {
    const rootNamespaces = new Set(registry.map((item) => item.path.split('.')[1]));
    assert.strictEqual(rootNamespaces.size, 14, 'Must have exactly 14 root namespaces');
    const expected = [
      'documents',
      'publicInspection',
      'agencies',
      'topics',
      'sections',
      'suggestedSearches',
      'holidays',
      'effectiveDates',
      'issues',
      'images',
      'categoryCounts',
      'siteNotifications',
      'documentation',
      'clippings',
    ];
    assert.deepStrictEqual(Array.from(rootNamespaces).sort(), expected.sort());
  });

  await t.test('Tier distribution is exactly 9 / 33 / 12', () => {
    const tierA = registry.filter((item) => item.tier === 'Tier A');
    const tierB = registry.filter((item) => item.tier === 'Tier B');
    const tierC = registry.filter((item) => item.tier === 'Tier C');

    assert.strictEqual(tierA.length, 9, 'Tier A count must be exactly 9');
    assert.strictEqual(tierB.length, 33, 'Tier B count must be exactly 33');
    assert.strictEqual(tierC.length, 12, 'Tier C count must be exactly 12');
  });

  await t.test('Zero JSONP methods present in canonical 54', () => {
    const jsonpMethods = registry.filter(
      (item) => item.method.toLowerCase().includes('jsonp') || item.path.toLowerCase().includes('jsonp')
    );
    assert.strictEqual(jsonpMethods.length, 0, 'Zero JSONP methods may be included in canonical 54');
  });

  await t.test('Every row has required metadata fields populated', () => {
    for (const row of registry) {
      assert.ok(typeof row.ordinal === 'number' && row.ordinal >= 1 && row.ordinal <= 54, `Ordinal invalid in ${row.id}`);
      assert.ok(typeof row.id === 'string' && row.id.length > 0, `ID missing in row`);
      assert.ok(typeof row.ns === 'string' && row.ns.length > 0, `ns missing in ${row.id}`);
      assert.ok(typeof row.path === 'string' && row.path.startsWith('client.'), `path invalid in ${row.id}`);
      assert.ok(typeof row.method === 'string' && row.method.length > 0, `method missing in ${row.id}`);
      assert.ok(
        row.paramReq === 'Required' || row.paramReq === 'Optional' || row.paramReq === 'None',
        `paramReq invalid in ${row.id}`
      );
      assert.ok(typeof row.params === 'string' && row.params.length > 0, `params missing in ${row.id}`);
      assert.ok(typeof row.returns === 'string' && row.returns.length > 0, `returns missing in ${row.id}`);
      assert.ok(row.tier === 'Tier A' || row.tier === 'Tier B' || row.tier === 'Tier C', `tier invalid in ${row.id}`);
      assert.ok(typeof row.trade === 'boolean', `trade boolean missing in ${row.id}`);
      assert.ok(typeof row.desc === 'string' && row.desc.length > 0, `desc missing in ${row.id}`);
    }
  });
});
