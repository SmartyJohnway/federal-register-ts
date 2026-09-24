export type OperationTier = 'Tier A' | 'Tier B' | 'Tier C';

export interface CanonicalOperation {
  ordinal: number;
  id: string;
  ns: string;
  path: string;
  method: string;
  paramReq: 'Required' | 'Optional' | 'None';
  params: string;
  returns: string;
  tier: OperationTier;
  trade: boolean;
  desc: string;
}

export interface NamespaceMetadata {
  namespace: string;
  totalOperations: number;
  tierA: number;
  tierB: number;
  tierC: number;
  tradeRelevantCount: number;
}
