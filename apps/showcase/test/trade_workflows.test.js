import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TRADE_WORKFLOWS,
  R4_RESPONSIBILITY_BREAKDOWN,
} from '../src/data/tradeWorkflows.ts';
import {
  generateTradeSnippet,
} from '../src/lib/tradeRequestBuilders.ts';

describe('R3-10E Trade Workflows Invariants & Anatomy', () => {
  const workflowKeys = Object.keys(TRADE_WORKFLOWS);

  it('contains exactly 6 defined trade workflows', () => {
    assert.equal(workflowKeys.length, 6);
    assert.deepEqual(workflowKeys.sort(), [
      'commerce-monitoring',
      'faceted-research',
      'presidential-documents',
      'public-inspection',
      'section-232',
      'steel-aluminum',
    ]);
  });

  it('each workflow satisfies the 7-layer anatomy requirement', () => {
    for (const key of workflowKeys) {
      const w = TRADE_WORKFLOWS[key];
      // 1. Research question
      assert.ok(w.researchQuestion && w.researchQuestion.trim().length > 10, `${key} missing researchQuestion`);
      // 2. What is being searched
      assert.ok(w.whatIsSearched && w.whatIsSearched.trim().length > 10, `${key} missing whatIsSearched`);
      // 3. Canonical SDK operation(s)
      assert.ok(Array.isArray(w.canonicalOperations) && w.canonicalOperations.length > 0, `${key} missing canonicalOperations`);
      for (const op of w.canonicalOperations) {
        assert.ok(op.operationId, `${key} op missing operationId`);
        assert.ok(op.path, `${key} op missing path`);
        assert.ok(op.tier, `${key} op missing tier`);
      }
      // 4. Conditions / default params description
      assert.ok(w.defaultParamsDescription && w.defaultParamsDescription.length > 5, `${key} missing defaultParamsDescription`);
      // 5. Disclaimer / policy boundary
      assert.ok(w.disclaimer && w.disclaimer.includes('Federal Register research example'), `${key} disclaimer must state research example`);
      assert.ok(w.disclaimer.includes('verify'), `${key} disclaimer must require verification`);
      // 6. R4 migration relevance
      assert.ok(w.r4MigrationRelevance, `${key} missing r4MigrationRelevance`);
      assert.ok(w.r4MigrationRelevance.legacyHandyApproach, `${key} missing legacyHandyApproach`);
      assert.ok(w.r4MigrationRelevance.canonicalSdkApproach, `${key} missing canonicalSdkApproach`);
      assert.ok(w.r4MigrationRelevance.action, `${key} missing action`);
    }
  });

  it('prohibits hard-coded tariff rate or legal determination claims', () => {
    for (const key of workflowKeys) {
      const w = TRADE_WORKFLOWS[key];
      const text = `${w.title} ${w.researchQuestion} ${w.whatIsSearched} ${w.disclaimer}`.toLowerCase();
      assert.ok(!text.includes('guaranteed rate'), `${key} must not promise guaranteed tariff rate`);
      assert.ok(!text.includes('final tariff calculation'), `${key} must not claim tariff calculation engine`);
      assert.ok(!text.includes('binding legal advice'), `${key} must not claim binding legal advice`);
    }
  });

  it('R4 responsibility breakdown covers all 5 architectural divisions', () => {
    assert.equal(R4_RESPONSIBILITY_BREAKDOWN.length, 5);
    const categories = R4_RESPONSIBILITY_BREAKDOWN.map((item) => item.category);
    assert.ok(categories.some((c) => c.includes('Canonical SDK Core')));
    assert.ok(categories.some((c) => c.includes('Consumer Adapter')));
    assert.ok(categories.some((c) => c.includes('Handy Domain Logic')));
    assert.ok(categories.some((c) => c.includes('Embedded Duplication to Retire')));
    assert.ok(categories.some((c) => c.includes('Requires Fresh R4 Preflight')));
  });

  it('generateTradeSnippet dynamically creates executable code corresponding to parameters', () => {
    const snippet = generateTradeSnippet(
      'section-232',
      { conditions: { term: 'Section 232' }, perPage: 10 },
      'client.documents.search'
    );
    assert.ok(snippet.includes("import { FederalRegisterClient } from 'federal-register-ts';"));
    assert.ok(snippet.includes('client.documents.search'));
    assert.ok(snippet.includes('"term": "Section 232"'));
    assert.ok(snippet.includes('"perPage": 10'));
  });
});
