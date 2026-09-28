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
const testBundleFile = path.join(testBundleDir, 'explore-bundle.mjs');

function ensureExploreBundle() {
  if (!fs.existsSync(testBundleDir)) {
    fs.mkdirSync(testBundleDir, { recursive: true });
  }
  const cmd = `npx esbuild src/components/ExploreView.tsx --bundle --platform=node --target=node24 --format=esm --outfile=dist-test/explore-bundle.mjs --external:react --external:react-dom --external:lucide-react --external:clsx --external:tailwind-merge --external:federal-register-ts`;
  execSync(cmd, { cwd: showcaseRoot, stdio: 'pipe' });
}

test('ExploreView Human-vs-Developer Boundary & UX State Lifecycle (D-02, D-09)', async (t) => {
  await t.test('ExploreView bundles successfully with esbuild for Node 24', () => {
    ensureExploreBundle();
    assert.ok(fs.existsSync(testBundleFile), 'dist-test/explore-bundle.mjs must exist');
  });

  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
  });

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.Event = dom.window.Event;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  const rootContainer = dom.window.document.getElementById('root');
  assert.ok(rootContainer);

  const moduleUrl = pathToFileURL(testBundleFile).href;
  const { ExploreView } = await import(moduleUrl);
  let reactRoot;

  await t.test('D-02.1: Default Explore view renders human task labels rather than SDK accessor names', async () => {
    await act(async () => {
      reactRoot = ReactDOM.createRoot(rootContainer);
      reactRoot.render(
        React.createElement(ExploreView, {
          onNavigateTab: () => {},
          onOpenInWorkbench: () => {},
        })
      );
    });

    const html = rootContainer.innerHTML;

    // Human Task Labels MUST be prominent
    assert.ok(html.includes('Search Documents'), 'Must display Search Documents human label');
    assert.ok(html.includes('Public Inspection'), 'Must display Public Inspection human label');
    assert.ok(html.includes('Browse Agencies'), 'Must display Browse Agencies human label');
    assert.ok(html.includes('Browse Topics'), 'Must display Browse Topics human label');
    assert.ok(html.includes('Explore Issues'), 'Must display Explore Issues human label');
    assert.ok(html.includes('Analyze Results'), 'Must display Analyze Results human label');

    // SDK Method and Accessor Paths MUST NOT dominate primary UI
    assert.ok(!html.includes('client.documents.search'), 'Primary UI must not display client.documents.search');
    assert.ok(!html.includes('client.publicInspection.current'), 'Primary UI must not display client.publicInspection.current');
    assert.ok(!html.includes('client.agencies.list'), 'Primary UI must not display client.agencies.list');
    assert.ok(!html.includes('client.topics.list'), 'Primary UI must not display client.topics.list');
    assert.ok(!html.includes('client.issues.current'), 'Primary UI must not display client.issues.current');
    assert.ok(!html.includes('client.documents.facets.agency'), 'Primary UI must not display client.documents.facets.agency');

    // TypeScript Type Names MUST NOT be primary headings
    assert.ok(!html.includes('DocumentSearchParams'), 'Must not display DocumentSearchParams type name in UI');
    assert.ok(!html.includes('SearchResultEnvelope'), 'Must not display SearchResultEnvelope type name in UI');
    assert.ok(!html.includes('PublicInspectionSearchParams'), 'Must not display PublicInspectionSearchParams type name in UI');
    assert.ok(!html.includes('DocumentAgencyFacetMap'), 'Must not display DocumentAgencyFacetMap type name in UI');
  });

  await t.test('D-02.2: Explore view keeps SDK details as optional secondary action only', () => {
    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Developer Sandbox') || html.includes('Switch to Developer Workbench'));
  });

  await t.test('D-09.1: Delayed asynchronous request renders LoadingState and replaces on resolution', async () => {
    let resolveFetchPromise;
    const delayedPromise = new Promise((resolve) => {
      resolveFetchPromise = resolve;
    });

    globalThis.fetch = async () => {
      await delayedPromise;
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'DOC-001',
          data: {
            count: 1,
            results: [
              {
                title: 'Delayed Response Document Title',
                document_number: '2026-99999',
                publication_date: '2026-09-28',
              },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const searchBtn = Array.from(rootContainer.querySelectorAll('button')).find(
      (btn) => btn.className.includes('bg-cyan-600') && btn.textContent.includes('Search Documents')
    );
    assert.ok(searchBtn, 'Search button must exist');

    // Step 1: Click button, do not resolve promise yet
    let renderPromise;
    act(() => {
      searchBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    // Step 2: Assert loading indicator appears while promise is pending
    const loadingHtml = rootContainer.innerHTML;
    assert.ok(
      loadingHtml.includes('Fetching Federal Register data...') || loadingHtml.includes('Searching...'),
      'Loading state indicator must render while request is in-flight'
    );

    // Step 3: Resolve promise and complete render
    await act(async () => {
      resolveFetchPromise();
      await new Promise((r) => setTimeout(r, 50));
    });

    // Step 4: Assert loading is removed and results are displayed
    const finalHtml = rootContainer.innerHTML;
    assert.ok(!finalHtml.includes('Fetching Federal Register data...'), 'Loading indicator must be removed after resolution');
    assert.ok(finalHtml.includes('Delayed Response Document Title'), 'Resolved document title must render');
  });

  // Cleanup
  await act(async () => {
    if (reactRoot) reactRoot.unmount();
  });
});
