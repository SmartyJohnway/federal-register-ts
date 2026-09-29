import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const showcaseRoot = path.resolve(__dirname, '..');

test('Metadata Duplication and Single Source of Truth Scan', async (t) => {
  const canonicalPath = path.join(showcaseRoot, 'src', 'data', 'canonicalRegistry.json');
  assert.ok(fs.existsSync(canonicalPath), 'canonicalRegistry.json must exist');

  await t.test('Exactly one canonical JSON metadata file exists under src/data/', () => {
    const dataFiles = fs.readdirSync(path.join(showcaseRoot, 'src', 'data'));
    const jsonFiles = dataFiles.filter((f) => f.endsWith('.json'));
    assert.deepEqual(jsonFiles, ['canonicalRegistry.json'], 'Only canonicalRegistry.json is permitted as JSON metadata');
  });

  await t.test('presentationOverlay.ts is non-authoritative overlay only', () => {
    const overlayPath = path.join(showcaseRoot, 'src', 'data', 'presentationOverlay.ts');
    assert.ok(fs.existsSync(overlayPath));
    const content = fs.readFileSync(overlayPath, 'utf8');

    // Must NOT define new canonical operations or override tiers
    assert.ok(!content.includes('"tier":'), 'presentationOverlay must not declare canonical tier fields');
    assert.ok(!content.includes('"ordinal":'), 'presentationOverlay must not declare canonical ordinal fields');
    assert.ok(!content.includes('"returns":'), 'presentationOverlay must not declare canonical returns contracts');
  });
});
