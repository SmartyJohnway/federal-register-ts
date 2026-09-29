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

test('ExploreView Faceted & Summary Analysis Workflow Suite (D-08 / D-W6)', async (t) => {
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
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.Event = dom.window.Event;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  let lastGatewayCall = null;

  globalThis.fetch = async (url, init) => {
    const reqBody = JSON.parse(init?.body || '{}');
    lastGatewayCall = { url, body: reqBody };

    // 1. DOC-FACET-001 (by agency) - Canonical Record<string, FacetEntry>
    if (reqBody.operationId === 'DOC-FACET-001') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'DOC-FACET-001',
          data: {
            'international-trade-administration': {
              name: 'International Trade Administration',
              count: 420,
            },
            'commerce-department': {
              name: 'Commerce Department',
              count: 310,
            },
            'environmental-protection-agency': {
              name: 'Environmental Protection Agency',
              count: 280,
            },
            'securities-and-exchange-commission': {
              name: 'Securities and Exchange Commission',
              count: 195,
            },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. DOC-FACET-004 (by document type) - Canonical Record<string, FacetEntry>
    if (reqBody.operationId === 'DOC-FACET-004') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'DOC-FACET-004',
          data: {
            RULE: { name: 'Rule', count: 1450 },
            PRORULE: { name: 'Proposed Rule', count: 620 },
            NOTICE: { name: 'Notice', count: 2890 },
            PRESDOCU: { name: 'Presidential Document', count: 110 },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. PI-FACET-001 (by public inspection type) - Canonical Record<string, FacetEntry>
    if (reqBody.operationId === 'PI-FACET-001') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'PI-FACET-001',
          data: {
            regular: { name: 'Regular Filing', count: 45 },
            special: { name: 'Special Filing', count: 12 },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. DOC-FACET-010 (by year) - Canonical DateFacetMap Record<string, DateFacetEntry>
    if (reqBody.operationId === 'DOC-FACET-010') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'DOC-FACET-010',
          data: {
            '2026': { name: '2026', count: 12500 },
            '2025': { name: '2025', count: 31200 },
            '2024': { name: '2024', count: 30800 },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, data: {} }), { status: 200 });
  };

  const rootContainer = dom.window.document.getElementById('root');
  assert.ok(rootContainer);

  const moduleUrl = pathToFileURL(testBundleFile).href;
  const { ExploreView } = await import(moduleUrl);
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

  await t.test('D-08.1: Switch to Analytics workflow and select Agency dimension (DOC-FACET-001)', async () => {
    await act(async () => {
      reactRoot = ReactDOM.createRoot(rootContainer);
      reactRoot.render(React.createElement(ExploreView));
    });

    const analyticsTab = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Analyze Results')
    );
    assert.ok(analyticsTab);

    await act(async () => {
      analyticsTab.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const agencyDimBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('By Publishing Agency')
    );
    assert.ok(agencyDimBtn);

    await act(async () => {
      agencyDimBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'DOC-FACET-001');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Faceted Distribution &amp; Summary Analysis'), 'Analytics header must render');
    assert.ok(html.includes('Total Items Analyzed:'), 'Summary count must render');
    assert.ok(html.includes('International Trade Administration'), 'ITA agency name must render');
    assert.ok(html.includes('420'), 'ITA count must render');
    assert.ok(html.includes('Commerce Department'), 'Commerce agency name must render');
  });

  await t.test('D-08.2: Switch to Document Type dimension (DOC-FACET-004)', async () => {
    const docTypeDimBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('By Document Type')
    );
    assert.ok(docTypeDimBtn);

    await act(async () => {
      docTypeDimBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'DOC-FACET-004');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Notice'), 'Notice label must render');
    assert.ok(html.includes('2,890'), 'Notice count must render');
    assert.ok(html.includes('Rule'), 'Rule label must render');
    assert.ok(html.includes('1,450'), 'Rule count must render');
  });

  await t.test('D-08.3: Switch to Public Inspection Type dimension (PI-FACET-001)', async () => {
    const piTypeDimBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Public Inspection Types')
    );
    assert.ok(piTypeDimBtn);

    await act(async () => {
      piTypeDimBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'PI-FACET-001');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Regular Filing'), 'Regular filing label must render');
    assert.ok(html.includes('45'), 'Regular filing count must render');
    assert.ok(html.includes('Special Filing'), 'Special filing label must render');
  });

  await t.test('D-08.4: Switch to Timeline dimension and apply keyword filter (DOC-FACET-010)', async () => {
    const yearlyDimBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Timeline (Yearly)')
    );
    assert.ok(yearlyDimBtn);

    await act(async () => {
      yearlyDimBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'DOC-FACET-010');

    // Apply keyword filter
    const input = rootContainer.querySelector('input');
    assert.ok(input);
    await triggerChange(input, 'steel tariffs');

    const recalcBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.className.includes('bg-indigo-600') && b.textContent === 'Recalculate'
    );
    assert.ok(recalcBtn);

    await act(async () => {
      recalcBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'DOC-FACET-010');
    assert.deepEqual(lastGatewayCall.body.params.conditions, { term: 'steel tariffs' });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('2026'), '2026 year row must render');
    assert.ok(html.includes('12,500'), '2026 count must render');
  });

  // Cleanup
  await act(async () => {
    if (reactRoot) reactRoot.unmount();
  });
});
