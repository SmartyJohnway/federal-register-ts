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

test('ExploreView Reference Workflows Suite: Agencies, Topics, Issues (D-05, D-06, D-07)', async (t) => {
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

  globalThis.fetch = async (url, init) => {
    const reqBody = JSON.parse(init?.body || '{}');
    lastGatewayCall = { url, body: reqBody };

    // 1. AGENCY-001: list agencies
    if (reqBody.operationId === 'AGENCY-001') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'AGENCY-001',
          data: [
            { id: 104, name: 'International Trade Administration', short_name: 'ITA', slug: 'international-trade-administration' },
            { id: 89, name: 'Commerce Department', short_name: 'DOC', slug: 'commerce-department' },
            { id: 492, name: 'U.S. Customs and Border Protection', short_name: 'CBP', slug: 'customs-and-border-protection' },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. AGENCY-002: find agency by slug/id
    if (reqBody.operationId === 'AGENCY-002') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'AGENCY-002',
          data: {
            id: 104,
            name: 'International Trade Administration',
            short_name: 'ITA',
            slug: 'international-trade-administration',
            description: 'The International Trade Administration strengthens the competitiveness of U.S. industry.',
            url: 'https://www.trade.gov',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. AGENCY-004: agency suggestions
    if (reqBody.operationId === 'AGENCY-004') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'AGENCY-004',
          data: [
            { id: 89, name: 'Commerce Department', short_name: 'DOC', slug: 'commerce-department' },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. TOPIC-001: list topics
    if (reqBody.operationId === 'TOPIC-001') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'TOPIC-001',
          data: [
            { id: 1, name: 'Tariffs and Trade', slug: 'tariffs-and-trade' },
            { id: 2, name: 'Energy Conservation', slug: 'energy-conservation' },
            { id: 3, name: 'National Defense', slug: 'national-defense' },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. TOPIC-002: topic suggestions
    if (reqBody.operationId === 'TOPIC-002') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'TOPIC-002',
          data: [
            { id: 1, name: 'Tariffs and Trade', slug: 'tariffs-and-trade' },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. ISSUE-002: current issue
    if (reqBody.operationId === 'ISSUE-002') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'ISSUE-002',
          data: {
            issue_date: '2026-09-28',
            volume: 91,
            issue_number: 188,
            document_count: 52,
            table_of_contents_url: 'https://www.federalregister.gov/documents/2026/09/28',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 7. ISSUE-001: specific issue lookup
    if (reqBody.operationId === 'ISSUE-001') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'ISSUE-001',
          data: {
            issue_date: reqBody.params?.date || '2026-09-25',
            volume: 91,
            issue_number: 187,
            document_count: 48,
            table_of_contents_url: `https://www.federalregister.gov/documents/${reqBody.params?.date || '2026/09/25'}`,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fallback DOC-001 search
    if (reqBody.operationId === 'DOC-001') {
      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'DOC-001',
          data: { count: 10, results: [] },
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

  // -------------------------------------------------------------
  // D-05: Agencies Workflow Tests
  // -------------------------------------------------------------
  await t.test('D-05.1: Switch to Agencies workflow and browse all agencies (AGENCY-001)', async () => {
    await act(async () => {
      reactRoot = ReactDOM.createRoot(rootContainer);
      reactRoot.render(React.createElement(ExploreView));
    });

    const agencyTab = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Agencies')
    );
    assert.ok(agencyTab);

    await act(async () => {
      agencyTab.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const browseAllBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Browse All Federal Agencies')
    );
    assert.ok(browseAllBtn);

    await act(async () => {
      browseAllBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'AGENCY-001');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Federal Agencies (3)'), 'Agencies count header must render');
    assert.ok(html.includes('International Trade Administration'), 'ITA agency name must render');
    assert.ok(html.includes('ITA'), 'ITA short name must render');
    assert.ok(html.includes('Commerce Department'), 'DOC agency name must render');
  });

  await t.test('D-05.2: Select agency card to load and display agency details (AGENCY-002)', async () => {
    const agencyCards = Array.from(rootContainer.querySelectorAll('.cursor-pointer'));
    assert.ok(agencyCards.length > 0, 'Agency cards must exist');

    await act(async () => {
      agencyCards[0].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'AGENCY-002');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Agency Detail: International Trade Administration'), 'Agency detail header must render');
    assert.ok(html.includes('strengthens the competitiveness of U.S. industry'), 'Agency description must render');
    assert.ok(html.includes('https://www.trade.gov'), 'Official agency URL must render');
  });

  await t.test('D-05.3: Execute agency suggestions query (AGENCY-004)', async () => {
    const input = rootContainer.querySelector('input');
    assert.ok(input);
    await triggerChange(input, 'Commerce');

    const suggestionsBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent === 'Suggestions'
    );
    assert.ok(suggestionsBtn);

    await act(async () => {
      suggestionsBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'AGENCY-004');
    assert.equal(lastGatewayCall.body.params.query, 'Commerce');
  });

  // -------------------------------------------------------------
  // D-06: Topics Workflow Tests
  // -------------------------------------------------------------
  await t.test('D-06.1: Switch to Topics workflow and load topic catalog (TOPIC-001)', async () => {
    const topicTab = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Topics')
    );
    assert.ok(topicTab);

    await act(async () => {
      topicTab.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const loadTopicsBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Load Topic Catalog')
    );
    assert.ok(loadTopicsBtn);

    await act(async () => {
      loadTopicsBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'TOPIC-001');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Subject Topics (3)'), 'Topic count header must render');
    assert.ok(html.includes('Tariffs and Trade'), 'Topic tag must render');
    assert.ok(html.includes('Energy Conservation'), 'Topic tag must render');
    assert.ok(html.includes('National Defense'), 'Topic tag must render');
  });

  await t.test('D-06.2: Click topic tag navigates to Documents search with topic query', async () => {
    const topicButtons = Array.from(rootContainer.querySelectorAll('button')).filter((b) =>
      b.textContent.includes('Tariffs and Trade')
    );
    assert.ok(topicButtons.length > 0, 'Topic button must exist');

    await act(async () => {
      topicButtons[0].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'DOC-001');
    assert.equal(lastGatewayCall.body.params.conditions.term, 'Tariffs and Trade');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Search Published Federal Register Documents'), 'Must transition to documents workflow');
  });

  // -------------------------------------------------------------
  // D-07: Issues Workflow Tests
  // -------------------------------------------------------------
  await t.test('D-07.1: Switch to Issues workflow and load current issue (ISSUE-002)', async () => {
    const issuesTab = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Issues')
    );
    assert.ok(issuesTab);

    await act(async () => {
      issuesTab.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const loadIssueBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.className.includes('bg-blue-600') && b.textContent.includes('Load Today\'s Issue')
    );
    assert.ok(loadIssueBtn);

    await act(async () => {
      loadIssueBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'ISSUE-002');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('Daily Issue Information'), 'Issue card title must render');
    assert.ok(html.includes('2026-09-28'), 'Issue date must render');
    assert.ok(html.includes('Vol. 91'), 'Volume must render');
    assert.ok(html.includes('No. 188'), 'Issue number must render');
    assert.ok(html.includes('52'), 'Document count must render');
    assert.ok(html.includes('Official Table of Contents'), 'TOC link must render');
  });

  await t.test('D-07.2: Lookup specific issue by date (ISSUE-001)', async () => {
    const dateModeBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.textContent === 'Lookup Issue by Date'
    );
    assert.ok(dateModeBtn);

    await act(async () => {
      dateModeBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });

    const dateInput = rootContainer.querySelector('input');
    assert.ok(dateInput);
    await triggerChange(dateInput, '2026-09-25');

    const submitBtn = Array.from(rootContainer.querySelectorAll('button')).find((b) =>
      b.className.includes('bg-blue-600') && b.textContent.includes('Lookup Issue Date')
    );
    assert.ok(submitBtn);

    await act(async () => {
      submitBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    assert.ok(lastGatewayCall);
    assert.equal(lastGatewayCall.body.operationId, 'ISSUE-001');
    assert.equal(lastGatewayCall.body.params.date, '2026-09-25');

    const html = rootContainer.innerHTML;
    assert.ok(html.includes('2026-09-25'), 'Historical issue date must render');
    assert.ok(html.includes('No. 187'), 'Historical issue number must render');
  });

  // Cleanup
  await act(async () => {
    if (reactRoot) reactRoot.unmount();
  });
});
