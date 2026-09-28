import test from 'node:test';
import assert from 'node:assert/strict';
import { EXPLORE_WORKFLOWS, DOCUMENT_TYPES } from '../src/data/exploreWorkflows.ts';
import canonicalRegistry from '../src/data/canonicalRegistry.json' with { type: 'json' };
import { STATIC_EXECUTOR_MAP, isRunnable } from '../src/lib/executor.ts';

test('Explore Workflows Presentation Metadata & Invariants', async (t) => {
  const canonicalOpIds = new Set(canonicalRegistry.map((op) => op.id));
  const runnableOpIds = new Set(Object.keys(STATIC_EXECUTOR_MAP));

  await t.test('All 6 canonical Explore workflows are declared', () => {
    assert.equal(EXPLORE_WORKFLOWS.length, 6, 'Must define exactly 6 human explore workflows');
    const workflowIds = EXPLORE_WORKFLOWS.map((wf) => wf.id);
    assert.deepEqual(workflowIds, [
      'documents',
      'public-inspection',
      'agencies',
      'topics',
      'issues',
      'analytics',
    ]);
  });

  await t.test('All operation IDs in exploreWorkflows belong strictly to canonical 54 registry', () => {
    for (const wf of EXPLORE_WORKFLOWS) {
      assert.ok(wf.canonicalOperationIds.length > 0, `Workflow ${wf.id} must map to at least one operation ID`);
      for (const opId of wf.canonicalOperationIds) {
        assert.ok(
          canonicalOpIds.has(opId),
          `Operation ID ${opId} in workflow ${wf.id} must exist in canonical 54 registry`
        );
      }
    }
  });

  await t.test('All operation IDs in exploreWorkflows are runnable in STATIC_EXECUTOR_MAP', () => {
    for (const wf of EXPLORE_WORKFLOWS) {
      for (const opId of wf.canonicalOperationIds) {
        assert.ok(
          runnableOpIds.has(opId),
          `Operation ID ${opId} in workflow ${wf.id} must be runnable in STATIC_EXECUTOR_MAP`
        );
        assert.ok(isRunnable(opId), `isRunnable(${opId}) must return true`);
      }
    }
  });

  await t.test('Workflow metadata does not duplicate or redefine canonical SDK contract fields', () => {
    for (const wf of EXPLORE_WORKFLOWS) {
      assert.equal(typeof wf.id, 'string');
      assert.equal(typeof wf.title, 'string');
      assert.equal(typeof wf.description, 'string');
      // Must not contain canonical metadata columns
      assert.equal(wf.path, undefined, 'Workflow definition must not redefine canonical accessor path');
      assert.equal(wf.tier, undefined, 'Workflow definition must not redefine canonical tier');
      assert.equal(wf.params, undefined, 'Workflow definition must not redefine params contract');
      assert.equal(wf.returns, undefined, 'Workflow definition must not redefine returns contract');
      assert.equal(wf.ordinal, undefined, 'Workflow definition must not redefine canonical ordinal');
    }
  });

  await t.test('Document types filter presets conform to canonical Federal Register types', () => {
    const validTypes = new Set(['', 'RULE', 'PRORULE', 'NOTICE', 'PRESDOCU']);
    for (const dt of DOCUMENT_TYPES) {
      assert.ok(validTypes.has(dt.value), `Document type preset ${dt.value} must be a canonical type`);
    }
  });
});
