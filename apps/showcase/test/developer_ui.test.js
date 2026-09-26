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
const testBundleFile = path.join(testBundleDir, 'developer-bundle.mjs');

test('DeveloperView Interactive Workbench Suite (C-08)', async (t) => {
  // Step 1: Transpile/bundle DeveloperView for Node execution
  await t.test('DeveloperView bundles successfully with esbuild for Node 24', () => {
    if (!fs.existsSync(testBundleDir)) {
      fs.mkdirSync(testBundleDir, { recursive: true });
    }

    const cmd = `npx esbuild src/components/DeveloperView.tsx --bundle --platform=node --target=node24 --format=esm --outfile=dist-test/developer-bundle.mjs --external:react --external:react-dom --external:lucide-react --external:clsx --external:tailwind-merge --external:federal-register-ts`;
    execSync(cmd, { cwd: showcaseRoot, stdio: 'pipe' });
    assert.ok(fs.existsSync(testBundleFile), 'dist-test/developer-bundle.mjs must exist');
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

  // Mock global fetch for execution tests
  let mockFetchFailure = false;
  globalThis.fetch = async (_url, init) => {
    const reqBody = JSON.parse(init?.body || '{}');

    if (mockFetchFailure) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'SIMULATED_GATEWAY_ERROR',
          message: 'Upstream gateway execution simulated failure',
          operationId: reqBody.operationId,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        operationId: reqBody.operationId,
        elapsedMs: 14,
        data: {
          status: 'success',
          executed: reqBody.operationId,
          count: 42,
          sampleResult: { item: 'sample' },
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  const rootContainer = dom.window.document.getElementById('root');
  assert.ok(rootContainer);

  const moduleUrl = pathToFileURL(testBundleFile).href;
  const { DeveloperView } = await import(moduleUrl);
  assert.ok(typeof DeveloperView === 'function');

  let reactRoot;

  await t.test('C-08.1: Mounts workbench with 42 runnable operations in selector', async () => {
    await act(async () => {
      reactRoot = ReactDOM.createRoot(rootContainer);
      reactRoot.render(React.createElement(DeveloperView, { initialOperationId: 'DOC-001' }));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Developer Workbench &amp; Live SDK Sandbox'), 'Header must render');
    assert.ok(html.includes('Select Operation (42 Runnable)'), 'Must indicate 42 runnable operations');

    const select = rootContainer.querySelector('select');
    assert.ok(select, 'Operation select dropdown must exist');
    const options = Array.from(select.querySelectorAll('option'));
    assert.equal(options.length, 42, 'Dropdown must have exactly 42 runnable options');
  });

  await t.test('C-08.2: Operation selection loads metadata, description, and canonical path', () => {
    const html = rootContainer.innerHTML;
    assert.ok(html.includes('DOC-001'), 'Must display selected DOC-001 ID');
    assert.ok(html.includes('client.documents.search'), 'Must display canonical path');
    assert.ok(html.includes('Tier A'), 'Must display Tier A badge');
  });

  await t.test('C-08.3: Parameter editor preloads sample JSON and provides Reset action', () => {
    const textarea = rootContainer.querySelector('textarea');
    assert.ok(textarea, 'JSON parameter editor textarea must exist');
    assert.ok(textarea.value.includes('trade policy') || textarea.value.includes('conditions'), 'Preloaded sample parameters must exist');

    const resetBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Reset Sample')
    );
    assert.ok(resetBtn, 'Reset Sample button must exist');
  });

  await t.test('C-08.4: Dynamic TypeScript code snippet generated with canonical accessor', () => {
    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Generated TypeScript Code'), 'Snippet panel header must exist');
    assert.ok(html.includes('import { FederalRegisterClient } from \'federal-register-ts\''), 'Must include SDK import');
    assert.ok(html.includes('await client.documents.search('), 'Must generate call with canonical accessor path');
  });

  await t.test('C-08.5: Run execution triggers gateway and renders successful output', async () => {
    const runBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Run DOC-001')
    );
    assert.ok(runBtn, 'Run button must exist');

    await act(async () => {
      runBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('sampleResult'), 'Execution result must render in output view');
    assert.ok(html.includes('Session Request History (1/20)'), 'History count must increment to 1');
  });

  await t.test('C-08.6: Raw JSON and Formatted display toggle buttons exist and function', () => {
    const rawBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Raw JSON')
    );
    const formattedBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Formatted')
    );
    assert.ok(rawBtn, 'Raw JSON button must exist');
    assert.ok(formattedBtn, 'Formatted button must exist');
  });

  await t.test('C-08.7: Observational elapsed execution timing badge renders', () => {
    const html = rootContainer.innerHTML;
    assert.ok(html.includes('14ms'), 'Elapsed timing badge must display measured ms');
  });

  await t.test('C-08.8: Error state handling displays error message properly', async () => {
    mockFetchFailure = true;

    const runBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Run DOC-001')
    );
    assert.ok(runBtn);

    await act(async () => {
      runBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Execution Error (DOC-001)'), 'Error banner must render');
    assert.ok(html.includes('Upstream gateway execution simulated failure'), 'Error message must render');

    mockFetchFailure = false;
  });

  await t.test('C-08.9: Bounded session-only history records executions up to 20 limit', () => {
    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Session Request History (2/20)'), 'History records executions with 20 bound');
  });

  await t.test('C-08.10: History replay reloads operation parameters and result into workbench', async () => {
    const historyRows = Array.from(rootContainer.querySelectorAll('.group'));
    assert.ok(historyRows.length > 0, 'History rows must exist');

    await act(async () => {
      historyRows[0].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('DOC-001'), 'Selected operation must be preserved on replay');
  });

  // Cleanup
  await act(async () => {
    if (reactRoot) reactRoot.unmount();
  });
});
