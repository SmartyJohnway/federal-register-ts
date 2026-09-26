import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import React, { act } from 'react';
import ReactDOM from 'react-dom/client';
import { JSDOM } from 'jsdom';
import canonicalRegistry from '../src/data/canonicalRegistry.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const showcaseRoot = path.resolve(__dirname, '..');
const testBundleDir = path.join(showcaseRoot, 'dist-test');
const testBundleFile = path.join(testBundleDir, 'capabilities-bundle.mjs');

test('CapabilitiesView Interactive Catalog & Discovery Suite (C-07)', async (t) => {
  // Step 1: Transpile/bundle CapabilitiesView for Node execution
  await t.test('CapabilitiesView bundles successfully with esbuild for Node 24', () => {
    if (!fs.existsSync(testBundleDir)) {
      fs.mkdirSync(testBundleDir, { recursive: true });
    }

    const cmd = `npx esbuild src/components/CapabilitiesView.tsx --bundle --platform=node --target=node24 --format=esm --outfile=dist-test/capabilities-bundle.mjs --external:react --external:react-dom --external:lucide-react --external:clsx --external:tailwind-merge`;
    execSync(cmd, { cwd: showcaseRoot, stdio: 'pipe' });
    assert.ok(fs.existsSync(testBundleFile), 'dist-test/capabilities-bundle.mjs must exist');
  });

  // Step 2: Set up JSDOM environment
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
  });

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.Event = dom.window.Event;

  const rootContainer = dom.window.document.getElementById('root');
  assert.ok(rootContainer);

  const moduleUrl = pathToFileURL(testBundleFile).href;
  const { CapabilitiesView } = await import(moduleUrl);
  assert.ok(typeof CapabilitiesView === 'function');

  let reactRoot;
  let workbenchTriggeredWith = null;

  const handleOpenInWorkbench = (opId) => {
    workbenchTriggeredWith = opId;
  };

  await t.test('C-07.1: Mounts and renders full 54/54 operations discoverability', async () => {
    await act(async () => {
      reactRoot = ReactDOM.createRoot(rootContainer);
      reactRoot.render(React.createElement(CapabilitiesView, { onOpenInWorkbench: handleOpenInWorkbench }));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Canonical SDK Capability Matrix'), 'Must render matrix header');
    assert.ok(html.includes('54 of 54 Operations'), 'Must render full 54 count badge');

    // Verify all 54 canonical IDs are rendered
    for (const op of canonicalRegistry) {
      assert.ok(html.includes(op.id), `Operation ${op.id} must be discoverable`);
      assert.ok(html.includes(op.path), `Operation path ${op.path} must be rendered`);
    }
  });

  await t.test('C-07.2: All 14 root namespaces represented in table and matrix', () => {
    const html = rootContainer.innerHTML;
    const namespaces = Array.from(new Set(canonicalRegistry.map((op) => op.path.split('.')[1])));
    assert.equal(namespaces.length, 14, 'Must have exactly 14 unique root namespaces');

    for (const ns of namespaces) {
      assert.ok(html.includes(`client.${ns}`), `Namespace client.${ns} must be present in table`);
    }
  });

  await t.test('C-07.3: Tier filter groups and counts (9 Tier A, 33 Tier B, 12 Tier C)', () => {
    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Tier A: 9'), 'Tier A count badge must be 9');
    assert.ok(html.includes('Tier B: 33'), 'Tier B count badge must be 33');
    assert.ok(html.includes('Tier C: 12'), 'Tier C count badge must be 12');
  });

  await t.test('C-07.4: Runnable vs Documented status visual distinction (42 vs 12)', () => {
    const html = rootContainer.innerHTML;
    const runnableCount = canonicalRegistry.filter((op) => op.tier === 'Tier A' || op.tier === 'Tier B').length;
    const documentedCount = canonicalRegistry.filter((op) => op.tier === 'Tier C').length;

    assert.equal(runnableCount, 42);
    assert.equal(documentedCount, 12);
    assert.ok(html.includes('Runnable'), 'Runnable badges must render');
    assert.ok(html.includes('Documented Only'), 'Documented Only badges must render');
  });

  await t.test('C-07.5: Interactive search input and filter selectors exist', () => {
    const searchInput = rootContainer.querySelector('input[type="text"]');
    assert.ok(searchInput, 'Search text input must exist');

    const selects = Array.from(rootContainer.querySelectorAll('select'));
    assert.ok(selects.length >= 3, 'Must have namespace, tier, and status select filters');
  });

  await t.test('C-07.6: Expandable detail view renders canonical contract properties', async () => {
    const detailButtons = Array.from(rootContainer.querySelectorAll('button')).filter((b) =>
      b.textContent.includes('View Full Details')
    );
    assert.ok(detailButtons.length > 0, 'Detail buttons must exist');

    await act(async () => {
      detailButtons[0].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Canonical Signature &amp; Overlay Metadata') || html.includes('Canonical Signature & Overlay Metadata'));
    assert.ok(html.includes('Namespace Owner:'));
    assert.ok(html.includes('Parameter Requirement:'));
  });

  await t.test('C-07.7: Clicking Open in Workbench triggers navigation with selected operationId', async () => {
    const workbenchButtons = Array.from(rootContainer.querySelectorAll('button')).filter((btn) =>
      btn.textContent.includes('Open in Workbench')
    );
    assert.ok(workbenchButtons.length > 0, 'Open in Workbench buttons must exist for runnable ops');

    await act(async () => {
      workbenchButtons[0].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    assert.ok(workbenchTriggeredWith !== null, 'onOpenInWorkbench callback must be called');
    assert.ok(canonicalRegistry.some((op) => op.id === workbenchTriggeredWith), 'Triggered opId must be valid');
  });

  // Cleanup
  await act(async () => {
    if (reactRoot) reactRoot.unmount();
  });
});
