import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FederalRegisterClient } from 'federal-register-ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registryPath = path.resolve(__dirname, '../src/data/canonicalRegistry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

test('Netlify Function Server Boundary & SDK Runtime Compatibility', async (t) => {
  await t.test('FederalRegisterClient instantiates in Node.js 24 without error', () => {
    const client = new FederalRegisterClient();
    assert.ok(client, 'FederalRegisterClient must instantiate');
    assert.ok(client.documents, 'client.documents must exist');
    assert.ok(client.agencies, 'client.agencies must exist');
    assert.ok(client.publicInspection, 'client.publicInspection must exist');
    assert.ok(client.topics, 'client.topics must exist');
    assert.ok(client.sections, 'client.sections must exist');
    assert.ok(client.suggestedSearches, 'client.suggestedSearches must exist');
    assert.ok(client.holidays, 'client.holidays must exist');
    assert.ok(client.effectiveDates, 'client.effectiveDates must exist');
    assert.ok(client.issues, 'client.issues must exist');
    assert.ok(client.images, 'client.images must exist');
    assert.ok(client.categoryCounts, 'client.categoryCounts must exist');
    assert.ok(client.siteNotifications, 'client.siteNotifications must exist');
    assert.ok(client.documentation, 'client.documentation must exist');
    assert.ok(client.clippings, 'client.clippings must exist');
  });

  await t.test('Static Allowlist covers all 54 operations', () => {
    const allowlist = new Map(registry.map((item) => [item.id, item]));
    assert.strictEqual(allowlist.size, 54, 'Allowlist must contain exactly 54 entries');
    assert.ok(allowlist.has('DOC-001'), 'Allowlist must contain DOC-001');
    assert.ok(allowlist.has('AGENCY-001'), 'Allowlist must contain AGENCY-001');
    assert.ok(allowlist.has('PI-001'), 'Allowlist must contain PI-001');
  });

  await t.test('Disallowed operation lookup returns not found', () => {
    const allowlist = new Map(registry.map((item) => [item.id, item]));
    const invalidLookup = allowlist.get('UNKNOWN-999');
    assert.strictEqual(invalidLookup, undefined, 'Non-allowlisted operations must return undefined');
  });

  await t.test('Gateway code contains zero unsafe eval or dynamic traversal', () => {
    const gatewaySrcPath = path.resolve(__dirname, '../netlify/functions/gateway.ts');
    const gatewaySrc = fs.readFileSync(gatewaySrcPath, 'utf8');

    assert.ok(!gatewaySrc.includes('eval('), 'Gateway must not contain eval()');
    assert.ok(!gatewaySrc.includes('Function('), 'Gateway must not contain Function constructor');
    assert.ok(!gatewaySrc.includes('client['), 'Gateway must not contain dynamic client indexing');
  });
});
