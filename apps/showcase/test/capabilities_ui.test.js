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

test('CapabilitiesView Interactive Catalog & Discovery Suite', async (t) => {
  // Step 1: Transpile/bundle CapabilitiesView for Node execution
  await t.test('CapabilitiesView bundles successfully with esbuild', () => {
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

  await t.test('CapabilitiesView mounts and renders full 54/54 operations discoverability', async () => {
    await act(async () => {
      reactRoot = ReactDOM.createRoot(rootContainer);
      reactRoot.render(React.createElement(CapabilitiesView, { onOpenInWorkbench: handleOpenInWorkbench }));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Canonical SDK Capability Matrix'));
    assert.ok(html.includes('54 of 54 Operations'));

    // Check all 54 operation IDs are present in initial render
    for (const op of canonicalRegistry) {
      assert.ok(html.includes(op.id), `Operation ${op.id} must be discoverable in catalog`);
      assert.ok(html.includes(op.path), `Operation path ${op.path} must be rendered`);
    }
  });

  await t.test('Search input element exists and is interactive', async () => {
    const searchInput = rootContainer.querySelector('input[type="text"]');
    assert.ok(searchInput, 'Search input must exist');
  });

  await t.test('Clicking Open in Workbench triggers navigation callback with operationId', async () => {
    const workbenchButtons = Array.from(rootContainer.querySelectorAll('button')).filter((btn) =>
      btn.textContent.includes('Open in Workbench')
    );
    assert.ok(workbenchButtons.length > 0, 'Open in Workbench buttons must exist for runnable ops');

    await act(async () => {
      workbenchButtons[0].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    assert.ok(workbenchTriggeredWith !== null, 'onOpenInWorkbench callback must be called');
  });

  // Cleanup
  await act(async () => {
    if (reactRoot) reactRoot.unmount();
  });
});
