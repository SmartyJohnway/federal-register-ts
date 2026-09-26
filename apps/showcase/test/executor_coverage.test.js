import test from 'node:test';
import assert from 'node:assert/strict';
import canonicalRegistry from '../src/data/canonicalRegistry.json' with { type: 'json' };
import { STATIC_EXECUTOR_MAP, RUNNABLE_OPERATION_COUNT, isRunnable } from '../src/lib/executor.ts';
import { PRESENTATION_OVERLAYS } from '../src/data/presentationOverlay.ts';

test('Executor Map and Overlay Coverage Invariants', async (t) => {
  const canonicalIds = new Set(canonicalRegistry.map((item) => item.id));
  const tierAOps = canonicalRegistry.filter((item) => item.tier === 'Tier A');
  const tierBOps = canonicalRegistry.filter((item) => item.tier === 'Tier B');
  const tierCOps = canonicalRegistry.filter((item) => item.tier === 'Tier C');

  await t.test('Canonical total count invariant is exactly 54', () => {
    assert.equal(canonicalRegistry.length, 54);
    assert.equal(canonicalIds.size, 54);
  });

  await t.test('Tier distribution invariant is 9 Tier A, 33 Tier B, 12 Tier C', () => {
    assert.equal(tierAOps.length, 9);
    assert.equal(tierBOps.length, 33);
    assert.equal(tierCOps.length, 12);
  });

  await t.test('Executor map contains exactly 42 runnable operations (9 Tier A + 33 Tier B)', () => {
    assert.equal(RUNNABLE_OPERATION_COUNT, 42);
    assert.equal(Object.keys(STATIC_EXECUTOR_MAP).length, 42);

    for (const op of tierAOps) {
      assert.ok(isRunnable(op.id), `Tier A operation ${op.id} must be runnable in executor map`);
      assert.equal(typeof STATIC_EXECUTOR_MAP[op.id], 'function');
    }

    for (const op of tierBOps) {
      assert.ok(isRunnable(op.id), `Tier B operation ${op.id} must be runnable in executor map`);
      assert.equal(typeof STATIC_EXECUTOR_MAP[op.id], 'function');
    }
  });

  await t.test('Executor map contains ZERO Tier C operations (Tier C are Documented Only)', () => {
    for (const op of tierCOps) {
      assert.equal(isRunnable(op.id), false, `Tier C operation ${op.id} must NOT be in executor map`);
      assert.equal(STATIC_EXECUTOR_MAP[op.id], undefined);
    }
  });

  await t.test('All executor map keys belong strictly to canonical 54 operation IDs', () => {
    for (const opId of Object.keys(STATIC_EXECUTOR_MAP)) {
      assert.ok(canonicalIds.has(opId), `Executor map key ${opId} must exist in canonical registry`);
    }
  });

  await t.test('Presentation overlay keys are strictly a subset of canonical 54 operation IDs', () => {
    const overlayKeys = Object.keys(PRESENTATION_OVERLAYS);
    assert.ok(overlayKeys.length <= 54, 'Overlay keys count cannot exceed 54');
    for (const key of overlayKeys) {
      assert.ok(canonicalIds.has(key), `Overlay key ${key} must exist in canonical registry`);
    }
  });
});
