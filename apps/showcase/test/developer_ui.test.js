import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import React, { act } from 'react';
import ReactDOM from 'react-dom/client';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const showcaseRoot = path.resolve(__dirname, '..');
const testBundleDir = path.join(showcaseRoot, 'dist-test');
const testBundleFile = path.join(testBundleDir, 'developer-bundle.mjs');

test('DeveloperView Interactive Workbench Suite', async (t) => {
  // Step 1: Transpile/bundle DeveloperView for Node execution
  await t.test('DeveloperView bundles successfully with esbuild', () => {
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
  globalThis.fetch = async (_url, init) => {
    const reqBody = JSON.parse(init?.body || '{}');
    return new Response(
      JSON.stringify({
        success: true,
        operationId: reqBody.operationId,
        elapsedMs: 12,
        data: {
          status: 'success',
          executed: reqBody.operationId,
          sampleResult: { count: 1 },
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

  await t.test('DeveloperView mounts and renders full workbench controls', async () => {
    await act(async () => {
      reactRoot = ReactDOM.createRoot(rootContainer);
      reactRoot.render(React.createElement(DeveloperView, { initialOperationId: 'DOC-001' }));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Developer Workbench &amp; Live SDK Sandbox'));
    assert.ok(html.includes('DOC-001'));
    assert.ok(html.includes('client.documents.search'));
    assert.ok(html.includes('Generated TypeScript Code'));
    assert.ok(html.includes('Session Request History (0/20)'));
  });

  await t.test('Execution triggers fetch and updates output and history', async () => {
    const runButton = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Run DOC-001')
    );
    assert.ok(runButton, 'Run button must exist');

    await act(async () => {
      runButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      // Give async microtasks time to settle
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Verify output rendered
    const html = rootContainer.innerHTML;
    assert.ok(html.includes('12ms'), 'Elapsed timing badge must render');
    assert.ok(html.includes('Session Request History (1/20)'), 'Session history must record 1 execution');
    assert.ok(html.includes('sampleResult'), 'Execution result JSON must render');
  });

  // Cleanup
  await act(async () => {
    if (reactRoot) reactRoot.unmount();
  });
});
