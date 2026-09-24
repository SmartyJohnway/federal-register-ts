import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const showcaseRoot = path.resolve(__dirname, '..');

const registryPath = path.join(showcaseRoot, 'src/data/canonicalRegistry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const canonicalPaths = new Set(registry.map((op) => op.path));

function scanDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (['node_modules', 'dist', 'dist-functions', '.netlify', '.cache'].includes(item)) {
      continue;
    }
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else if (/\.(ts|tsx|js|jsx|json|html|md)$/.test(item)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

test('Canonical Accessor Scan Across apps/showcase/src and apps/showcase/netlify', async (t) => {
  const srcFiles = scanDirectory(path.join(showcaseRoot, 'src'));
  const netlifyFiles = scanDirectory(path.join(showcaseRoot, 'netlify'));
  const files = [...srcFiles, ...netlifyFiles];

  const clientAccessorRegex = /client\.([a-zA-Z0-9_.]+)/g;
  const foundAccessors = [];

  for (const file of files) {
    const relativePath = path.relative(showcaseRoot, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = clientAccessorRegex.exec(content)) !== null) {
      const fullAccessor = match[0].replace(/;$/, '').replace(/\($/, '').replace(/\)$/, '');
      foundAccessors.push({
        file: relativePath,
        accessor: fullAccessor,
      });
    }
  }

  await t.test('All substantive method accessors belong to canonical 54 paths', () => {
    // Collect method accessors (length >= 3 parts: client.<ns>.<method>)
    const methodAccessors = foundAccessors.filter((a) => {
      const parts = a.accessor.split('.');
      return parts.length >= 3;
    });

    for (const item of methodAccessors) {
      const cleanAccessor = item.accessor.replace(/[^a-zA-Z0-9_.]/g, '');
      if (canonicalPaths.has(cleanAccessor)) {
        assert.ok(true, `${cleanAccessor} is canonical`);
      } else {
        assert.fail(`Non-canonical accessor found in ${item.file}: ${cleanAccessor}`);
      }
    }
  });

  await t.test('Zero occurrences of superseded client.facets.document.daily', () => {
    const invalid = foundAccessors.find((a) => a.accessor.includes('client.facets.document.daily'));
    assert.strictEqual(invalid, undefined, 'client.facets.document.daily must not exist in src or netlify');
  });
});
