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
const testBundleFile = path.join(testBundleDir, 'trade-bundle.mjs');

function ensureTradeBundle() {
  if (!fs.existsSync(testBundleDir)) {
    fs.mkdirSync(testBundleDir, { recursive: true });
  }
  const cmd = `npx esbuild src/components/TradeExamplesView.tsx --bundle --platform=node --target=node24 --format=esm --outfile=dist-test/trade-bundle.mjs --external:react --external:react-dom --external:lucide-react --external:clsx --external:tailwind-merge --external:federal-register-ts`;
  execSync(cmd, { cwd: showcaseRoot, stdio: 'pipe' });
}

test('TradeExamplesView UI Acceptance Suite (R3-10E-C1 / E-W1..E-W6)', async (t) => {
  await t.test('C1-C.1: TradeExamplesView bundles successfully with esbuild for Node 24', () => {
    ensureTradeBundle();
    assert.ok(fs.existsSync(testBundleFile), 'dist-test/trade-bundle.mjs must exist');
  });

  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
  });

  let copiedText = null;

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
  globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.Event = dom.window.Event;
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: {
      writeText: async (text) => {
        copiedText = text;
      },
    },
    configurable: true,
    writable: true,
  });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  let lastGatewayCall = null;
  let mockMode = 'documents'; // 'documents' | 'pi-current' | 'facets-canonical' | 'error-500' | 'validation-error'

  globalThis.fetch = async (url, init) => {
    const reqBody = JSON.parse(init?.body || '{}');
    lastGatewayCall = { url, body: reqBody };

    if (mockMode === 'error-500') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'UPSTREAM_TRADE_SEARCH_FAILED',
          message: 'Federal Register trade query upstream 500 error',
          operationId: reqBody.operationId,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (mockMode === 'validation-error') {
      return new Response(
        JSON.stringify({
          success: false,
          validationError: 'Invalid document type parameter for trade query',
          operationId: reqBody.operationId,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (mockMode === 'pi-current') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: reqBody.operationId,
          data: [
            {
              title: 'Antidumping Proceedings: Steel Plate from Japan',
              document_number: '2026-PI-001',
              filing_date: '2026-09-28',
              publication_date: '2026-09-29',
              num_pages: 14,
              html_url: 'https://www.federalregister.gov/public-inspection/current/2026-PI-001',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (mockMode === 'facets-canonical') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: reqBody.operationId,
          data: {
            'international-trade-administration': {
              name: 'International Trade Administration',
              count: 42,
            },
            'customs-and-border-protection': {
              name: 'U.S. Customs and Border Protection',
              count: 28,
            },
            'commerce-department': {
              name: 'Commerce Department',
              count: 19,
            },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Default mock documents list
    return new Response(
      JSON.stringify({
        success: true,
        operationId: reqBody.operationId,
        data: {
          count: 85,
          total_pages: 9,
          page: 1,
          results: [
            {
              title: 'Notice of Covered Merchandise Referral: Steel Conduit Fittings',
              type: 'Notice',
              abstract: 'The Department of Commerce initiates a Section 232 / trade scope inquiry.',
              document_number: '2026-08191',
              html_url: 'https://www.federalregister.gov/documents/2026/09/28/2026-08191/steel-conduit-fittings',
              publication_date: '2026-09-28',
              agencies: [{ name: 'International Trade Administration', raw_name: 'ITA' }],
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
  const { TradeExamplesView } = await import(moduleUrl);
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

  const clickButton = async (btn) => {
    assert.ok(btn, 'Target button must exist');
    await act(async () => {
      btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
  };

  await t.test('C1-C.2: Mounts TradeExamplesView and verifies Policy Disclaimer & R4 Matrix', async () => {
    await act(async () => {
      reactRoot = ReactDOM.createRoot(rootContainer);
      reactRoot.render(React.createElement(TradeExamplesView));
    });

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Federal Register Trade Research Reference'), 'Header title must render');
    assert.ok(html.includes('Trade Policy Boundary:'), 'Policy boundary disclaimer must render');
    assert.ok(
      html.includes('not a tariff calculator, HTS engine, or legal determination authority'),
      'Clear authority disclaimer text must render'
    );

    // Verify collapsible R4 Matrix
    const toggleBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Show R4 Architecture Separation')
    );
    assert.ok(toggleBtn, 'R4 toggle button must exist');

    await clickButton(toggleBtn);
    assert.ok(rootContainer.innerHTML.includes('53 Call Sites Mapped'), 'R4 matrix badge must render');
    assert.ok(rootContainer.innerHTML.includes('Canonical SDK Core'), 'Category 1 must render');
    assert.ok(rootContainer.innerHTML.includes('Consumer Adapter'), 'Category 2 must render');
    assert.ok(rootContainer.innerHTML.includes('Handy Domain Logic'), 'Category 3 must render');

    // Collapse again
    await clickButton(toggleBtn);
    assert.ok(!rootContainer.innerHTML.includes('53 Call Sites Mapped'), 'R4 matrix must collapse');
  });

  await t.test('C1-C.3: E-W1 Section 232 Trade Remedies input editing, execution, and result display', async () => {
    mockMode = 'documents';
    const inputs = Array.from(rootContainer.querySelectorAll('input'));
    const termInput = inputs.find((inp) => inp.value === 'Section 232');
    assert.ok(termInput, 'Section 232 term input must exist');
    await triggerChange(termInput, 'Section 232 aluminum quotas');

    const typeSelect = rootContainer.querySelector('select');
    assert.ok(typeSelect, 'Document type select must exist');
    await triggerChange(typeSelect, 'NOTICE');

    const executeBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Execute Trade Research Request')
    );
    assert.ok(executeBtn, 'Execute button must exist');

    await clickButton(executeBtn);

    assert.ok(lastGatewayCall, 'Gateway must be called');
    assert.equal(lastGatewayCall.body.operationId, 'DOC-001');
    assert.deepEqual(lastGatewayCall.body.params, {
      conditions: {
        term: 'Section 232 aluminum quotas',
        types: ['NOTICE'],
      },
      perPage: 10,
    });

    // Check rendered results
    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Found <strong class="text-white font-mono">85</strong> matching records'));
    assert.ok(html.includes('Notice of Covered Merchandise Referral: Steel Conduit Fittings'));
    assert.ok(html.includes('2026-08191'));
    assert.ok(html.includes('https://www.federalregister.gov/documents/2026/09/28/2026-08191/steel-conduit-fittings'));
  });

  await t.test('C1-C.4: E-W2 Steel / Aluminum preset switching & custom term dispatch', async () => {
    // Switch to E-W2
    const w2Btn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Steel / Aluminum')
    );
    await clickButton(w2Btn);

    // Preset 'aluminum'
    const alBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.trim().toLowerCase() === 'aluminum'
    );
    await clickButton(alBtn);

    const executeBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Execute Trade Research Request')
    );
    await clickButton(executeBtn);

    assert.equal(lastGatewayCall.body.operationId, 'DOC-001');
    assert.equal(lastGatewayCall.body.params.conditions.term, 'aluminum');
    assert.equal(lastGatewayCall.body.params.perPage, 10);

    // Preset 'custom'
    const customBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.trim().toLowerCase() === 'custom'
    );
    await clickButton(customBtn);

    const customInput = Array.from(rootContainer.querySelectorAll('input')).find((inp) =>
      inp.placeholder?.includes('copper, titanium')
    );
    assert.ok(customInput, 'Custom term input must exist');
    await triggerChange(customInput, 'specialty alloy quota');

    await clickButton(executeBtn);
    assert.equal(lastGatewayCall.body.params.conditions.term, 'specialty alloy quota');
    assert.equal(lastGatewayCall.body.params.perPage, 10);
  });

  await t.test('C1-C.5: E-W3 Commerce Department Monitoring input and agency filter dispatch', async () => {
    // Switch to E-W3
    const w3Btn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Commerce Monitoring')
    );
    await clickButton(w3Btn);

    const termInput = Array.from(rootContainer.querySelectorAll('input')).find((inp) =>
      inp.value === 'antidumping'
    );
    assert.ok(termInput, 'Commerce term input must exist');
    await triggerChange(termInput, 'countervailing solar');

    const agencySelect = rootContainer.querySelector('select');
    assert.ok(agencySelect, 'Commerce agency select must exist');
    await triggerChange(agencySelect, 'international-trade-administration');

    const executeBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Execute Trade Research Request')
    );
    await clickButton(executeBtn);

    assert.equal(lastGatewayCall.body.operationId, 'DOC-001');
    assert.deepEqual(lastGatewayCall.body.params, {
      conditions: {
        term: 'countervailing solar',
        agencies: ['international-trade-administration'],
      },
      perPage: 10,
    });
  });

  await t.test('C1-C.6: E-W4 Presidential Trade Proclamations PRESDOCU filtering', async () => {
    // Switch to E-W4
    const w4Btn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Presidential Documents')
    );
    await clickButton(w4Btn);

    const termInput = Array.from(rootContainer.querySelectorAll('input')).find((inp) =>
      inp.value === 'trade'
    );
    assert.ok(termInput, 'Presidential term input must exist');
    await triggerChange(termInput, 'tariff adjustment');

    const executeBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Execute Trade Research Request')
    );
    await clickButton(executeBtn);

    assert.equal(lastGatewayCall.body.operationId, 'DOC-001');
    assert.deepEqual(lastGatewayCall.body.params, {
      conditions: {
        term: 'tariff adjustment',
        types: ['PRESDOCU'],
      },
      perPage: 10,
    });
  });

  await t.test('C1-C.7: E-W5 Public Inspection Current Feed & Pre-Publication Search', async () => {
    // Switch to E-W5
    const w5Btn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Public Inspection')
    );
    await clickButton(w5Btn);

    mockMode = 'pi-current';

    // Current feed (PI-003)
    const executeBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Execute Trade Research Request')
    );
    await clickButton(executeBtn);

    assert.equal(lastGatewayCall.body.operationId, 'PI-003');
    assert.equal(lastGatewayCall.body.params, undefined);

    // Assert PI card rendered
    assert.ok(rootContainer.innerHTML.includes('Antidumping Proceedings: Steel Plate from Japan'));
    assert.ok(rootContainer.innerHTML.includes('2026-PI-001'));
    assert.ok(rootContainer.innerHTML.includes('Publishes: 2026-09-29'));

    // Switch to search mode (PI-001)
    const searchModeBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Search Pre-Publication')
    );
    await clickButton(searchModeBtn);

    const piInput = Array.from(rootContainer.querySelectorAll('input')).find((inp) =>
      inp.placeholder?.includes('trade, customs, tariff')
    );
    assert.ok(piInput, 'PI search input must exist');
    await triggerChange(piInput, 'customs compliance');

    await clickButton(executeBtn);
    assert.equal(lastGatewayCall.body.operationId, 'PI-001');
    assert.deepEqual(lastGatewayCall.body.params, {
      conditions: {
        term: 'customs compliance',
      },
      perPage: 10,
    });
  });

  await t.test('C1-C.8: E-W6 Faceted Research Breakdown & ZERO [object Object] canonical rendering', async () => {
    // Switch to E-W6
    const allButtons = Array.from(rootContainer.querySelectorAll('button'));
    const w6Btn = allButtons.find((b) =>
      b.textContent?.includes('Faceted Breakdown')
    );
    await clickButton(w6Btn);

    mockMode = 'facets-canonical';

    const executeBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Execute Trade Research Request')
    );
    await clickButton(executeBtn);

    assert.equal(lastGatewayCall.body.operationId, 'DOC-FACET-001');
    assert.deepEqual(lastGatewayCall.body.params, {
      conditions: {
        term: 'tariff',
      },
    });

    const facetContainer = rootContainer.querySelector('[data-testid="facet-results-container"]');
    assert.ok(facetContainer, 'Facet results container must exist');

    const containerText = facetContainer.textContent || '';
    const containerHtml = facetContainer.innerHTML || '';

    // ZERO [object Object] PROOF
    assert.equal(
      containerText.includes('[object Object]'),
      false,
      'CRITICAL: UI text must NEVER render [object Object] for canonical facet objects'
    );
    assert.equal(
      containerHtml.includes('[object Object]'),
      false,
      'CRITICAL: UI html must NEVER render [object Object] for canonical facet objects'
    );

    // Verify canonical agency names and counts
    assert.ok(containerText.includes('International Trade Administration'));
    assert.ok(containerText.includes('42'));
    assert.ok(containerText.includes('U.S. Customs and Border Protection'));
    assert.ok(containerText.includes('28'));
    assert.ok(containerText.includes('Commerce Department'));
    assert.ok(containerText.includes('19'));

    // Verify dimension switching to docType (DOC-FACET-004)
    const docTypeFacetBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.trim() === 'By Doc Type'
    );
    await clickButton(docTypeFacetBtn);
    await clickButton(executeBtn);
    assert.equal(lastGatewayCall.body.operationId, 'DOC-FACET-004');

    // Verify dimension switching to yearly (DOC-FACET-010)
    const yearlyFacetBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.trim() === 'By Year'
    );
    await clickButton(yearlyFacetBtn);
    await clickButton(executeBtn);
    assert.equal(lastGatewayCall.body.operationId, 'DOC-FACET-010');
  });

  await t.test('C1-C.9: TypeScript Code Snippet Generation and Clipboard Copy UX', async () => {
    copiedText = null;
    const copyBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Copy Snippet') || b.textContent?.includes('Copied!')
    );
    assert.ok(copyBtn, 'Copy button must exist');

    await clickButton(copyBtn);
    assert.ok(copiedText !== null, 'Clipboard writeText must be called');
    assert.ok(copiedText.includes('import { FederalRegisterClient }'), 'Snippet must include client import');
    assert.ok(copiedText.includes('client.documents.facets.yearly'), 'Snippet must reflect current active workflow');
    assert.ok(rootContainer.innerHTML.includes('Copied!'), 'Copy button state must show Copied!');
  });

  await t.test('C1-C.10: Feedback States for Upstream Error and Parameter Validation Failure', async () => {
    const executeBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Execute Trade Research Request')
    );

    // Test validation error state
    mockMode = 'validation-error';
    await clickButton(executeBtn);
    assert.ok(rootContainer.innerHTML.includes('SDK Parameter Validation Error'));
    assert.ok(rootContainer.innerHTML.includes('Invalid document type parameter for trade query'));

    // Test 500 error state
    mockMode = 'error-500';
    await clickButton(executeBtn);
    assert.ok(rootContainer.innerHTML.includes('UPSTREAM_TRADE_SEARCH_FAILED'));
  });
});
