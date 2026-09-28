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
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.Event = dom.window.Event;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

  const triggerChange = async (element, value) => {
    await act(async () => {
      element.value = value;
      const reactPropsKey = Object.keys(element).find((k) => k.startsWith('__reactProps'));
      if (reactPropsKey && element[reactPropsKey]?.onChange) {
        element[reactPropsKey].onChange({ target: { value } });
      } else {
        element.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
        element.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
      }
    });
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

  await t.test('C-07.3: Namespace filtering actually filters rendered operation catalog', async () => {
    const selects = Array.from(rootContainer.querySelectorAll('select'));
    const nsSelect = selects[0];
    assert.ok(nsSelect, 'Namespace select filter must exist');

    // Filter by 'documents' namespace (20 operations total: 10 core + 10 facets)
    await triggerChange(nsSelect, 'documents');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('20 of 54 Operations'), 'Must show 20 matching operations for documents namespace');
    assert.ok(html.includes('DOC-001'), 'Must include DOC-001');
    assert.ok(html.includes('DOC-FACET-001'), 'Must include DOC-FACET-001');
    assert.ok(!html.includes('AGENCY-001'), 'Must NOT include AGENCY-001');
    assert.ok(!html.includes('PI-001'), 'Must NOT include PI-001');
    assert.ok(!html.includes('TOPIC-001'), 'Must NOT include TOPIC-001');

    // Reset namespace filter to 'all'
    await triggerChange(nsSelect, 'all');
    assert.ok(rootContainer.innerHTML.includes('54 of 54 Operations'), 'Must restore full 54 operations');
  });

  await t.test('C-07.4: Tier filtering actually filters rendered operation catalog', async () => {
    const selects = Array.from(rootContainer.querySelectorAll('select'));
    const tierSelect = selects[1];
    assert.ok(tierSelect, 'Tier select filter must exist');

    // 1. Filter Tier A (9 operations)
    await triggerChange(tierSelect, 'Tier A');
    let html = rootContainer.innerHTML;
    assert.ok(html.includes('9 of 54 Operations'), 'Must show 9 matching operations for Tier A');
    assert.ok(html.includes('DOC-001') && html.includes('AGENCY-001') && html.includes('PI-001'), 'Tier A operations must be present');
    assert.ok(!html.includes('DOC-003'), 'Tier B operation DOC-003 must be absent');
    assert.ok(!html.includes('DOC-008'), 'Tier C operation DOC-008 must be absent');

    // 2. Filter Tier B (33 operations)
    await triggerChange(tierSelect, 'Tier B');
    html = rootContainer.innerHTML;
    assert.ok(html.includes('33 of 54 Operations'), 'Must show 33 matching operations for Tier B');
    assert.ok(html.includes('DOC-003') && html.includes('DOC-FACET-001'), 'Tier B operations must be present');
    assert.ok(!html.includes('DOC-001'), 'Tier A operation DOC-001 must be absent');
    assert.ok(!html.includes('DOC-008'), 'Tier C operation DOC-008 must be absent');

    // 3. Filter Tier C (12 operations)
    await triggerChange(tierSelect, 'Tier C');
    html = rootContainer.innerHTML;
    assert.ok(html.includes('12 of 54 Operations'), 'Must show 12 matching operations for Tier C');
    assert.ok(html.includes('DOC-008') && html.includes('IMAGE-001') && html.includes('DOCS-001'), 'Tier C operations must be present');
    assert.ok(!html.includes('DOC-001'), 'Tier A operation DOC-001 must be absent');
    assert.ok(!html.includes('DOC-003'), 'Tier B operation DOC-003 must be absent');

    // Reset Tier filter to 'all'
    await triggerChange(tierSelect, 'all');
    assert.ok(rootContainer.innerHTML.includes('54 of 54 Operations'), 'Must restore full 54 operations');
  });

  await t.test('C-07.5: Runnable vs Documented filtering actually filters rendered catalog', async () => {
    const selects = Array.from(rootContainer.querySelectorAll('select'));
    const statusSelect = selects[2];
    assert.ok(statusSelect, 'Status select filter must exist');

    // 1. Filter Runnable (42 operations: 9 Tier A + 33 Tier B)
    await triggerChange(statusSelect, 'runnable');
    let html = rootContainer.innerHTML;
    assert.ok(html.includes('42 of 54 Operations'), 'Must show 42 matching runnable operations');
    assert.ok(html.includes('DOC-001') && html.includes('DOC-003'), 'Runnable operations must be present');
    assert.ok(!html.includes('DOC-008'), 'Documented-only operation DOC-008 must be absent');

    // 2. Filter Documented Only (12 operations: Tier C)
    await triggerChange(statusSelect, 'documented');
    html = rootContainer.innerHTML;
    assert.ok(html.includes('12 of 54 Operations'), 'Must show 12 matching documented operations');
    assert.ok(html.includes('DOC-008') && html.includes('CATCOUNT-001'), 'Documented operations must be present');
    assert.ok(!html.includes('DOC-001'), 'Runnable operation DOC-001 must be absent');

    // Reset status filter to 'all'
    await triggerChange(statusSelect, 'all');
    assert.ok(rootContainer.innerHTML.includes('54 of 54 Operations'), 'Must restore full 54 operations');
  });

  await t.test('C-07.6: Text search query filters operations and restoring clears filter', async () => {
    const searchInput = rootContainer.querySelector('input[type="text"]');
    assert.ok(searchInput, 'Search text input must exist');

    // Search for specific operation path
    await triggerChange(searchInput, 'client.documents.autocomplete');
    let html = rootContainer.innerHTML;
    assert.ok(html.includes('1 of 54 Operations'), 'Must match exactly 1 operation');
    assert.ok(html.includes('DOC-006'), 'Must display DOC-006');
    assert.ok(!html.includes('DOC-001'), 'Unrelated operation DOC-001 must be absent');
    assert.ok(!html.includes('AGENCY-001'), 'Unrelated operation AGENCY-001 must be absent');

    // Clear search query
    await triggerChange(searchInput, '');
    html = rootContainer.innerHTML;
    assert.ok(html.includes('54 of 54 Operations'), 'Must restore full 54 operations after clearing search');
  });

  await t.test('C-07.7: Expandable detail view renders canonical contract properties', async () => {
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

  await t.test('C-07.8: Clicking Open in Workbench triggers navigation with selected operationId', async () => {
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
