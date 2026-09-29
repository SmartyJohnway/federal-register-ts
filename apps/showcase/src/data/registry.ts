import canonicalRaw from './canonicalRegistry.json';
import type { CanonicalOperation, NamespaceMetadata, OperationTier } from '../types/registry';

export const CANONICAL_OPERATIONS: CanonicalOperation[] = canonicalRaw as CanonicalOperation[];

export const TOTAL_OPERATIONS_COUNT = CANONICAL_OPERATIONS.length; // 54

// Root namespaces mapped from accessor path: client.<rootNamespace>...
export const ROOT_NAMESPACES = Array.from(
  new Set(CANONICAL_OPERATIONS.map((op) => op.path.split('.')[1]))
).sort(); // 14 namespaces

export const TIER_COUNTS: Record<OperationTier, number> = {
  'Tier A': CANONICAL_OPERATIONS.filter((op) => op.tier === 'Tier A').length,
  'Tier B': CANONICAL_OPERATIONS.filter((op) => op.tier === 'Tier B').length,
  'Tier C': CANONICAL_OPERATIONS.filter((op) => op.tier === 'Tier C').length,
};

export const TRADE_RELEVANT_OPERATIONS = CANONICAL_OPERATIONS.filter(
  (op) => op.trade
);

export function getOperationsByTier(tier: OperationTier): CanonicalOperation[] {
  return CANONICAL_OPERATIONS.filter((op) => op.tier === tier);
}

export function getOperationsByNamespace(namespace: string): CanonicalOperation[] {
  return CANONICAL_OPERATIONS.filter((op) => op.path.split('.')[1] === namespace);
}

export function getOperationById(id: string): CanonicalOperation | undefined {
  return CANONICAL_OPERATIONS.find((op) => op.id === id);
}

export function getNamespaceMetadata(): NamespaceMetadata[] {
  return ROOT_NAMESPACES.map((ns) => {
    const ops = getOperationsByNamespace(ns);
    return {
      namespace: ns,
      totalOperations: ops.length,
      tierA: ops.filter((o) => o.tier === 'Tier A').length,
      tierB: ops.filter((o) => o.tier === 'Tier B').length,
      tierC: ops.filter((o) => o.tier === 'Tier C').length,
      tradeRelevantCount: ops.filter((o) => o.trade).length,
    };
  });
}
