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

test('ExploreView Documents Search Workflow Suite (D-03 / D-W1)', async (t) => {
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
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.Event = dom.window.Event;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  let lastGatewayCall = null;
  let mockFailure = false;
  let mockEmptyResults = false;

  globalThis.fetch = async (url, init) => {
    const reqBody = JSON.parse(init?.body || '{}');
    lastGatewayCall = { url, body: reqBody };

    if (mockFailure) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'DOCUMENT_SEARCH_UPSTREAM_ERROR',
          message: 'Simulated Federal Register upstream search failure',
          operationId: reqBody.operationId,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (mockEmptyResults) {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: reqBody.operationId,
          data: {
            count: 0,
            total_pages: 0,
            page: 1,
            results: [],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        operationId: reqBody.operationId,
        data: {
          count: 128,
          total_pages: 13,
          page: 1,
          results: [
            {
              title: 'Adjustments to Imports of Steel and Aluminum into the United States',
              type: 'Rule',
              abstract: 'Proclamation 9704 adjusting tariff rates on imports of steel articles pursuant to Section 232.',
              document_number: '2026-10452',
              html_url: 'https://www.federalregister.gov/documents/2026/09/28/2026-10452/adjustments-to-imports-of-steel',
              pdf_url: 'https://www.govinfo.gov/content/pkg/FR-2026-09-28/pdf/2026-10452.pdf',
              publication_date: '2026-09-28',
              agencies: [{ name: 'International Trade Administration', raw_name: 'ITA' }],
            },
            {
              title: 'Antidumping and Countervailing Duty Proceedings: Electronic Filing Requirements',
              type: 'Proposed Rule',
              abstract: 'The Department of Commerce proposes to amend regulations regarding submission of trade remedy documents.',
              document_number: '2026-10453',
              html_url: 'https://www.federalregister.gov/documents/2026/09/28/2026-10453/ad-cvd-electronic-filing',
              publication_date: '2026-09-28',
              agencies: [{ name: 'Commerce Department', raw_name: 'DOC' }],
            },
          ],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  const rootContainer = dom.window.document.getElementById('root');
  assert.ok(rootContainer);

  const moduleUrl = pathToFileURL(testBundleFile).href;
  const { ExploreView } = await import(moduleUrl);
  let reactRoot;
  let openedWorkbenchWith = null;

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

  await t.test('D-03.1: Mounts ExploreView with Documents search workflow active by default', async () => {
    await act(async () => {
      reactRoot = ReactDOM.createRoot(rootContainer);
      reactRoot.render(
        React.createElement(ExploreView, {
          onOpenInWorkbench: (opId) => {
            openedWorkbenchWith = opId;
          },
        })
      );
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Search Published Federal Register Documents'), 'Search header must render');
    assert.ok(html.includes('Search Keywords or Document Title'), 'Search label must render');
    assert.ok(html.includes('Document Type'), 'Document type filter label must render');
    assert.ok(html.includes('Publication Date'), 'Publication date filter label must render');
  });

  await t.test('D-03.2: User edits search inputs and triggers document search with exact SDK consumer params', async () => {
    const inputs = Array.from(rootContainer.querySelectorAll('input'));
    const selects = Array.from(rootContainer.querySelectorAll('select'));

    // Input 1: Keyword search
    const termInput = inputs.find((inp) => inp.placeholder?.includes('tariff'));
    assert.ok(termInput, 'Term input must exist');
    await triggerChange(termInput, 'critical minerals trade');

    // Input 2: Document type select
    const typeSelect = selects.find((sel) => sel.innerHTML.includes('Final Rule'));
    assert.ok(typeSelect, 'Type select must exist');
    await triggerChange(typeSelect, 'RULE');

    // Input 3: Agency text
    const agencyInput = inputs.find((inp) => inp.placeholder?.includes('commerce'));
    assert.ok(agencyInput, 'Agency input must exist');
    await triggerChange(agencyInput, 'international-trade-administration');

    // Input 4: Publication date
    const dateInput = inputs.find((inp) => inp.placeholder === 'YYYY-MM-DD');
    assert.ok(dateInput, 'Date input must exist');
    await triggerChange(dateInput, '2026-09-28');

    // Submit search
    const searchBtn = Array.from(rootContainer.querySelectorAll('button')).find(
      (btn) => btn.className.includes('bg-cyan-600') && btn.textContent.includes('Search Documents')
    );
    assert.ok(searchBtn, 'Search submit button must exist');

    await act(async () => {
      searchBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Assert gateway call mapping with exact SDK consumer keys
    assert.ok(lastGatewayCall, 'Gateway must have been invoked');
    assert.equal(lastGatewayCall.body.operationId, 'DOC-001');
    assert.deepEqual(lastGatewayCall.body.params, {
      conditions: {
        term: 'critical minerals trade',
        types: ['RULE'],
        agencies: ['international-trade-administration'],
        publicationDate: { is: '2026-09-28' },
      },
      perPage: 10,
    });
  });

  await t.test('D-03.3: Renders human-readable document results and official links', () => {
    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Search Results (128 Documents Found)'), 'Total results count header must render');
    assert.ok(html.includes('Adjustments to Imports of Steel and Aluminum'), 'Document title must render');
    assert.ok(html.includes('2026-10452'), 'Document number must render');
    assert.ok(html.includes('Rule'), 'Document type badge must render');
    assert.ok(html.includes('International Trade Administration'), 'Publishing agency must render');
    assert.ok(html.includes('Section 232'), 'Abstract snippet must render');
    assert.ok(html.includes('FederalRegister.gov'), 'Official link button must render');

    const anchors = Array.from(rootContainer.querySelectorAll('a'));
    const frLink = anchors.find((a) => a.href.includes('2026-10452'));
    assert.ok(frLink, 'External anchor to FederalRegister.gov must exist');
    assert.equal(frLink.target, '_blank');
    assert.equal(frLink.rel, 'noopener noreferrer');
  });

  await t.test('D-03.4: Empty search results render human-friendly EmptyState', async () => {
    mockEmptyResults = true;

    const searchBtn = Array.from(rootContainer.querySelectorAll('button')).find(
      (btn) => btn.className.includes('bg-cyan-600') && btn.textContent.includes('Search Documents')
    );
    assert.ok(searchBtn);

    await act(async () => {
      searchBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('No documents match the specified search conditions.'), 'Empty state message must render');

    mockEmptyResults = false;
  });

  await t.test('D-03.5: Gateway error displays stable human-friendly ErrorState without raw stack', async () => {
    mockFailure = true;

    const searchBtn = Array.from(rootContainer.querySelectorAll('button')).find(
      (btn) => btn.className.includes('bg-cyan-600') && btn.textContent.includes('Search Documents')
    );
    assert.ok(searchBtn);

    await act(async () => {
      searchBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const html = rootContainer.innerHTML;
    assert.ok(
      html.includes("We couldn't complete this Federal Register request"),
      'Stable human readable error message must render'
    );
    assert.ok(!html.includes('TypeError:'), 'Raw stack trace must not be exposed');
    assert.ok(!html.includes('DOCUMENT_SEARCH_UPSTREAM_ERROR'), 'Raw error code must not be exposed');

    mockFailure = false;
  });

  await t.test('D-03.6: Developer Sandbox deep-link button invokes onOpenInWorkbench with DOC-001', async () => {
    const devBtn = Array.from(rootContainer.querySelectorAll('button')).find((btn) =>
      btn.textContent.includes('Developer Sandbox')
    );
    assert.ok(devBtn, 'Developer sandbox button must exist');

    await act(async () => {
      devBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    assert.equal(openedWorkbenchWith, 'DOC-001', 'Must pass DOC-001 to onOpenInWorkbench callback');
  });

  // Cleanup
  await act(async () => {
    if (reactRoot) reactRoot.unmount();
  });
});
