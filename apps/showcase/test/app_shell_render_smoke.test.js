import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const showcaseRoot = path.resolve(__dirname, '..');
const testBundleDir = path.join(showcaseRoot, 'dist-test');
const testBundleFile = path.join(testBundleDir, 'app-bundle.mjs');

test('App Shell Actual DOM Mount and Multi-Surface Navigation Smoke', async (t) => {
  // Step 1: Transpile/bundle App for Node execution using esbuild
  await t.test('App bundles successfully for test runner', () => {
    if (!fs.existsSync(testBundleDir)) {
      fs.mkdirSync(testBundleDir, { recursive: true });
    }

    const cmd = `npx esbuild src/App.tsx --bundle --platform=node --target=node24 --format=esm --outfile=dist-test/app-bundle.mjs --external:react --external:react-dom --external:@tanstack/react-query --external:lucide-react --external:clsx --external:tailwind-merge`;
    execSync(cmd, { cwd: showcaseRoot, stdio: 'pipe' });
    assert.ok(fs.existsSync(testBundleFile), 'dist-test/app-bundle.mjs must exist');
  });

  // Step 2: Set up JSDOM environment safely under Node 24
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
  });

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.MouseEvent = dom.window.MouseEvent;

  try {
    Object.defineProperty(globalThis, 'navigator', {
      value: dom.window.navigator,
      configurable: true,
      writable: true,
    });
  } catch (_e) {
    // navigator might already exist in Node 24
  }

  const rootContainer = dom.window.document.getElementById('root');
  assert.ok(rootContainer, 'Root container must exist in JSDOM');

  // Step 3: Import bundled App component
  const moduleUrl = pathToFileURL(testBundleFile).href;
  const { App } = await import(moduleUrl);
  assert.ok(typeof App === 'function', 'Exported App must be a React component');

  let reactRoot;

  // Step 4: Mount App in JSDOM
  await t.test('App mounts in JSDOM and initially renders Explore surface', async () => {
    await act(async () => {
      reactRoot = ReactDOM.createRoot(rootContainer);
      reactRoot.render(React.createElement(App));
    });

    const rootHtml = rootContainer.innerHTML;
    assert.ok(rootHtml.includes('federal-register-ts'), 'Must render SDK title');
    assert.ok(rootHtml.includes('Federal Register TypeScript SDK'), 'Must render hero banner');
    assert.ok(rootHtml.includes('54 audited operations'), 'Must render 54 operations metric');
    assert.ok(rootHtml.includes('Explore'), 'Navbar contains Explore tab');
    assert.ok(rootHtml.includes('Developer'), 'Navbar contains Developer tab');
    assert.ok(rootHtml.includes('Trade Examples'), 'Navbar contains Trade Examples tab');
    assert.ok(rootHtml.includes('Capabilities'), 'Navbar contains Capabilities tab');
  });

  // Step 5: Navigate to Developer surface
  await t.test('Navigate to Developer surface and verify rendered contents', async () => {
    const buttons = Array.from(rootContainer.querySelectorAll('nav button'));
    const devButton = buttons.find((btn) => btn.textContent.includes('Developer'));
    assert.ok(devButton, 'Developer nav button must exist');

    await act(async () => {
      devButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const devHtml = rootContainer.innerHTML;
    assert.ok(devHtml.includes('Developer Workbench'), 'Developer workbench header must render');
    assert.ok(devHtml.includes('npm install federal-register-ts@1.1.0'), 'npm install snippet must render');
    assert.ok(devHtml.includes('Operation Selector &amp; Parameters'), 'Operation selector must render');
    assert.ok(devHtml.includes('Generated TypeScript Code'), 'TypeScript generator must render');
    assert.ok(devHtml.includes('Execution Output'), 'Execution output panel must render');
  });

  // Step 6: Navigate to Trade Examples surface
  await t.test('Navigate to Trade Examples surface and verify rendered contents', async () => {
    const buttons = Array.from(rootContainer.querySelectorAll('nav button'));
    const tradeButton = buttons.find((btn) => btn.textContent.includes('Trade Examples'));
    assert.ok(tradeButton, 'Trade Examples nav button must exist');

    await act(async () => {
      tradeButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const tradeHtml = rootContainer.innerHTML;
    assert.ok(tradeHtml.includes('International Trade Examples Placeholder'), 'Trade placeholder must render');
    assert.ok(tradeHtml.includes('Scheduled for R3-10E'), 'R3-10E badge must render');
    assert.ok(tradeHtml.includes('R4 Migration Reference Separation'), 'R4 separation card must render');
  });

  // Step 7: Navigate to Capabilities surface
  await t.test('Navigate to Capabilities surface and verify rendered contents', async () => {
    const buttons = Array.from(rootContainer.querySelectorAll('nav button'));
    const capButton = buttons.find((btn) => btn.textContent.includes('Capabilities'));
    assert.ok(capButton, 'Capabilities nav button must exist');

    await act(async () => {
      capButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const capHtml = rootContainer.innerHTML;
    assert.ok(capHtml.includes('Canonical SDK Capability Matrix'), 'Matrix header must render');
    assert.ok(capHtml.includes('Tier A: 9'), 'Tier A badge must render');
    assert.ok(capHtml.includes('Tier B: 33'), 'Tier B badge must render');
    assert.ok(capHtml.includes('Tier C: 12'), 'Tier C badge must render');
    assert.ok(capHtml.includes('client.documents'), 'Table must contain client.documents');
    assert.ok(capHtml.includes('client.agencies'), 'Table must contain client.agencies');
    assert.ok(capHtml.includes('client.publicInspection'), 'Table must contain client.publicInspection');
  });

  // Cleanup
  await act(async () => {
    if (reactRoot) reactRoot.unmount();
  });
});
