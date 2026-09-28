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

test('ExploreView Public Inspection Workflow Suite (D-04 / D-W2)', async (t) => {
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

  globalThis.fetch = async (url, init) => {
    const reqBody = JSON.parse(init?.body || '{}');
    lastGatewayCall = { url, body: reqBody };

    if (mockFailure) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'PI_SERVICE_UNAVAILABLE',
          message: 'Public Inspection docket feed temporarily unavailable',
          operationId: reqBody.operationId,
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (reqBody.operationId === 'PI-003') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'PI-003',
          data: {
            count: 34,
            results: [
              {
                title: 'Notice of Preliminary Antidumping Duty Determination on Aluminum Extrusions',
                type: 'Notice',
                document_number: '2026-PI-001',
                html_url: 'https://www.federalregister.gov/public-inspection/2026/09/28/2026-PI-001/notice-of-preliminary-determination',
                filed_at: '2026-09-28 08:45 AM',
                scheduled_publication_date: '2026-09-29',
                agencies: [{ name: 'International Trade Commission' }],
              },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (reqBody.operationId === 'PI-001') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'PI-001',
          data: {
            count: 12,
            results: [
              {
                title: 'Customs Tariff Schedule Update for Harmonized System Codes',
                type: 'Rule',
                document_number: '2026-PI-002',
                html_url: 'https://www.federalregister.gov/public-inspection/2026/09/28/2026-PI-002/tariff-update',
                filed_at: '2026-09-28 11:15 AM',
                scheduled_publication_date: '2026-09-30',
                agencies: [{ name: 'U.S. Customs and Border Protection' }],
              },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (reqBody.operationId === 'PI-002') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'PI-002',
          data: {
            count: 5,
            results: [
              {
                title: 'Export Control Restrictions on Advanced Dual-Use Technologies',
                type: 'Rule',
                document_number: '2026-PI-003',
                html_url: 'https://www.federalregister.gov/public-inspection/2026/09/28/2026-PI-003/export-controls',
                filed_at: '2026-09-28 09:00 AM',
                scheduled_publication_date: '2026-09-29',
                agencies: [{ name: 'Bureau of Industry and Security' }],
              },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, data: { results: [] } }), { status: 200 });
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

  await t.test('D-04.1: Switch to Public Inspection workflow and verify explanatory presentation', async () => {
    await act(async () => {
      reactRoot = ReactDOM.createRoot(rootContainer);
      reactRoot.render(React.createElement(ExploreView));
    });

    const piTabBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Public Inspection')
    );
    assert.ok(piTabBtn, 'Public Inspection tab button must exist');

    await act(async () => {
      piTabBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Public Inspection Notices'), 'PI header must render');
    assert.ok(html.includes('About Public Inspection:'), 'Explanatory banner must render');
    assert.ok(html.includes('Today\'s Filed Feed'), 'Feed mode button must exist');
    assert.ok(html.includes('Search Filed Notices'), 'Search mode button must exist');
    assert.ok(html.includes('Lookup by Filing Date'), 'Date lookup mode button must exist');
  });

  await t.test('D-04.2: Execute Today\'s Filed Feed workflow (PI-003)', async () => {
    const loadFeedBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.className.includes('bg-purple-600') && b.textContent.includes('Load Today\'s Filed Feed')
    );
    assert.ok(loadFeedBtn, 'Load feed button must exist');

    await act(async () => {
      loadFeedBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'PI-003');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Notice of Preliminary Antidumping Duty Determination'), 'Notice title must render');
    assert.ok(html.includes('Preliminary Filing'), 'Preliminary Filing badge must render');
    assert.ok(html.includes('Filed: 2026-09-28 08:45 AM'), 'Filing timestamp must render');
    assert.ok(html.includes('Pub Date: 2026-09-29'), 'Scheduled pub date must render');
    assert.ok(html.includes('International Trade Commission'), 'Agency must render');
  });

  await t.test('D-04.3: Switch to Search Filed Notices mode and execute search (PI-001)', async () => {
    const searchModeBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent === 'Search Filed Notices'
    );
    assert.ok(searchModeBtn);

    await act(async () => {
      searchModeBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const termInput = rootContainer.querySelector('input');
    assert.ok(termInput);
    await triggerChange(termInput, 'customs tariff');

    const submitBtn = Array.from(rootContainer.querySelectorAll('.border-t button')).find(
      (b) => b.textContent.includes('Search Filed Notices')
    );
    assert.ok(submitBtn);

    await act(async () => {
      submitBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'PI-001');
    assert.deepEqual(lastGatewayCall.body.params.conditions, { term: 'customs tariff' });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Customs Tariff Schedule Update'), 'PI search result title must render');
    assert.ok(html.includes('U.S. Customs and Border Protection'), 'PI search result agency must render');
  });

  await t.test('D-04.4: Switch to Lookup by Filing Date mode and execute date query (PI-002)', async () => {
    const dateModeBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent === 'Lookup by Filing Date'
    );
    assert.ok(dateModeBtn);

    await act(async () => {
      dateModeBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const dateInput = rootContainer.querySelector('input');
    assert.ok(dateInput);
    await triggerChange(dateInput, '2026-09-28');

    const submitBtn = Array.from(rootContainer.querySelectorAll('button')).find(
      (b) => b.className.includes('bg-purple-600') && b.textContent.includes('Lookup Filing Date')
    );
    assert.ok(submitBtn);

    await act(async () => {
      submitBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'PI-002');
    assert.equal(lastGatewayCall.body.params.available_on, '2026-09-28');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Export Control Restrictions on Advanced Dual-Use Technologies'), 'Result title must render');
  });

  await t.test('D-04.5: Validation error displayed if filing date is empty in date mode', async () => {
    const dateInput = rootContainer.querySelector('input');
    assert.ok(dateInput);
    await triggerChange(dateInput, '');

    const submitBtn = Array.from(rootContainer.querySelectorAll('button')).find(
      (b) => b.className.includes('bg-purple-600') && b.textContent.includes('Lookup Filing Date')
    );
    assert.ok(submitBtn);

    await act(async () => {
      submitBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Please specify a valid filing date (YYYY-MM-DD).'), 'Validation error message must render');
  });

  await t.test('D-04.6: Upstream failure displays human-readable ErrorState', async () => {
    mockFailure = true;

    const dateInput = rootContainer.querySelector('input');
    assert.ok(dateInput);
    await triggerChange(dateInput, '2026-09-28');

    const submitBtn = Array.from(rootContainer.querySelectorAll('button')).find(
      (b) => b.className.includes('bg-purple-600') && b.textContent.includes('Lookup Filing Date')
    );
    assert.ok(submitBtn);

    await act(async () => {
      submitBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Public Inspection docket feed temporarily unavailable'), 'Human-readable error must render');

    mockFailure = false;
  });

  // Cleanup
  await act(async () => {
    if (reactRoot) reactRoot.unmount();
  });
});
