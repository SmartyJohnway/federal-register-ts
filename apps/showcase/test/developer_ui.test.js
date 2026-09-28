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
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
  globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.Event = dom.window.Event;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  // Track global fetch calls
  let lastFetchCall = null;
  let mockFetchFailure = false;
  let executionCount = 0;

  globalThis.fetch = async (url, init) => {
    const reqBody = JSON.parse(init?.body || '{}');
    executionCount++;
    lastFetchCall = {
      url,
      method: init?.method,
      headers: init?.headers,
      body: reqBody,
      count: executionCount,
    };

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
          paramsEcho: reqBody.params,
          executionIndex: executionCount,
          count: 42,
          sampleResult: { item: `result-${reqBody.operationId}-${executionCount}` },
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

  await t.test('C-08.3: Parameter editor preloads sample JSON and provides Reset action', async () => {
    const textarea = rootContainer.querySelector('textarea');
    assert.ok(textarea, 'JSON parameter editor textarea must exist');
    const initialSampleValue = textarea.value;
    assert.ok(initialSampleValue.includes('trade policy') || initialSampleValue.includes('conditions'), 'Preloaded sample parameters must exist');

    // Mutate parameter value
    await triggerChange(textarea, JSON.stringify({ conditions: { term: 'temporary-mutated' } }));
    assert.ok(textarea.value.includes('temporary-mutated'), 'Textarea must reflect edited content');

    // Find and click reset button
    const resetBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Reset Sample')
    );
    assert.ok(resetBtn, 'Reset Sample button must exist');

    await act(async () => {
      resetBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const resetTextarea = rootContainer.querySelector('textarea');
    assert.equal(resetTextarea.value, initialSampleValue, 'Reset Sample must restore canonical sample parameter JSON');
  });

  await t.test('C-08.4: Parameter editing updates generated TypeScript snippet and fetch payload', async () => {
    const textarea = rootContainer.querySelector('textarea');
    assert.ok(textarea);

    const customParams = {
      conditions: {
        term: 'custom environmental regulation query',
        publication_date: { is: '2026-09-28' },
      },
      per_page: 5,
    };

    await triggerChange(textarea, JSON.stringify(customParams, null, 2));

    // Assert generated TypeScript snippet dynamically updated
    const snippetPre = Array.from(rootContainer.querySelectorAll('pre')).find((pre) =>
      pre.textContent.includes('FederalRegisterClient')
    );
    assert.ok(snippetPre, 'Generated TypeScript snippet pre block must exist');
    assert.ok(snippetPre.textContent.includes('custom environmental regulation query'), 'Snippet must include edited term');
    assert.ok(snippetPre.textContent.includes('2026-09-28'), 'Snippet must include edited publication date');

    // Trigger run and assert fetch payload passed exact custom params
    const runBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Run DOC-001')
    );
    assert.ok(runBtn);

    await act(async () => {
      runBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastFetchCall, 'Gateway fetch must have been invoked');
    assert.equal(lastFetchCall.body.operationId, 'DOC-001');
    assert.deepEqual(lastFetchCall.body.params, customParams, 'Fetch payload must match edited JSON parameters');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('custom environmental regulation query'), 'Output view must reflect echoed response payload');
  });

  await t.test('C-08.5: Raw JSON and Formatted display toggle buttons function', async () => {
    const rawBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.trim() === 'Raw JSON'
    );
    const formattedBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.trim() === 'Formatted'
    );
    assert.ok(rawBtn, 'Raw JSON button must exist');
    assert.ok(formattedBtn, 'Formatted button must exist');

    // Initially Raw JSON is active (has bg-slate-800 text-cyan-300 classes)
    assert.ok(rawBtn.className.includes('text-cyan-300'), 'Raw JSON should be active by default');

    // Click Formatted toggle
    await act(async () => {
      formattedBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    assert.ok(formattedBtn.className.includes('text-cyan-300'), 'Formatted mode must become active');
    assert.ok(!rawBtn.className.includes('text-cyan-300'), 'Raw JSON mode must become inactive');

    // Click back to Raw JSON
    await act(async () => {
      rawBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    assert.ok(rawBtn.className.includes('text-cyan-300'), 'Raw JSON mode must become active again');
  });

  await t.test('C-08.6: Observational elapsed execution timing badge renders', () => {
    const html = rootContainer.innerHTML;
    assert.ok(html.includes('14ms'), 'Elapsed timing badge must display measured ms');
  });

  await t.test('C-08.7: Error state handling displays error message properly', async () => {
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

  await t.test('C-08.8: Bounded session-only history strictly bounds to 20 entries over 25 executions', async () => {
    const runBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Run DOC-001')
    );
    assert.ok(runBtn);

    // Run 25 consecutive executions
    for (let i = 0; i < 25; i++) {
      await act(async () => {
        runBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
    }

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Session Request History (20/20)'), 'History badge must show exactly 20/20 bound');

    const historyItems = rootContainer.querySelectorAll('.group');
    assert.equal(historyItems.length, 20, 'Rendered history row elements must strictly not exceed 20 items');
  });

  await t.test('C-08.9: History replay restores operation selection, parameters, and result', async () => {
    // 1. Switch to a different operation (e.g. AGENCY-001)
    const select = rootContainer.querySelector('select');
    assert.ok(select);
    await triggerChange(select, 'AGENCY-001');

    assert.ok(rootContainer.innerHTML.includes('AGENCY-001'), 'Must switch to AGENCY-001');

    // 2. Edit AGENCY-001 parameter and execute
    const textarea = rootContainer.querySelector('textarea');
    const agyParams = { per_page: 2 };
    await triggerChange(textarea, JSON.stringify(agyParams));

    const runBtnAgy = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Run AGENCY-001')
    );
    assert.ok(runBtnAgy);

    await act(async () => {
      runBtnAgy.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(rootContainer.innerHTML.includes('result-AGENCY-001'), 'AGENCY-001 result must be rendered in active result');

    // 3. Replay a previous DOC-001 history entry
    const historyRows = Array.from(rootContainer.querySelectorAll('.group'));
    assert.ok(historyRows.length === 20, 'History should have 20 items');

    // Find a DOC-001 row in history
    const docHistoryRow = historyRows.find((row) => row.textContent.includes('DOC-001'));
    assert.ok(docHistoryRow, 'A DOC-001 history row must exist');

    await act(async () => {
      docHistoryRow.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    // 4. Assert that workbench state has been restored to DOC-001
    const activeOpSelect = rootContainer.querySelector('select');
    assert.equal(activeOpSelect.value, 'DOC-001', 'Selected operation dropdown must be restored to DOC-001');

    const restoredHtml = rootContainer.innerHTML;
    assert.ok(restoredHtml.includes('DOC-001'), 'DOC-001 details must be displayed');
    assert.ok(restoredHtml.includes('client.documents.search'), 'Canonical path must be restored');
    assert.ok(restoredHtml.includes('result-DOC-001'), 'Active execution result must be restored to DOC-001 output');
  });

  // Cleanup
  await act(async () => {
    if (reactRoot) reactRoot.unmount();
  });
});
