import type {
  DocumentSearchParams,
  PublicInspectionSearchParams,
  DocumentFacetParams,
  DocumentTypeCode,
} from 'federal-register-ts';

/**
 * Narrowly scoped, strictly typed request builders for Trade research workflows (R3-10E).
 * Directly imports exact public SDK request types from federal-register-ts@1.1.0.
 */

// E-W1: Section 232 Search
export interface Section232SearchOptions {
  term?: string;
  type?: DocumentTypeCode;
  publicationDate?: string;
  perPage?: number;
}

export function buildSection232SearchParams(opts: Section232SearchOptions = {}): DocumentSearchParams {
  const conditions: NonNullable<DocumentSearchParams['conditions']> = {};
  conditions.term = opts.term && opts.term.trim() ? opts.term.trim() : 'Section 232';
  if (opts.type) {
    conditions.types = [opts.type];
  }
  if (opts.publicationDate && opts.publicationDate.trim()) {
    conditions.publicationDate = { is: opts.publicationDate.trim() };
  }
  return {
    conditions,
    perPage: opts.perPage ?? 10,
  };
}

// E-W2: Steel / Aluminum Search
export interface SteelAluminumSearchOptions {
  preset: 'steel' | 'aluminum' | 'combined' | 'custom';
  customTerm?: string;
  perPage?: number;
}

export function buildSteelAluminumSearchParams(opts: SteelAluminumSearchOptions): DocumentSearchParams {
  let term = 'steel';
  if (opts.preset === 'aluminum') {
    term = 'aluminum';
  } else if (opts.preset === 'combined') {
    term = 'steel aluminum';
  } else if (opts.preset === 'custom' && opts.customTerm?.trim()) {
    term = opts.customTerm.trim();
  }

  return {
    conditions: {
      term,
    },
    perPage: opts.perPage ?? 10,
  };
}

// E-W3: Commerce Monitoring
export interface CommerceMonitoringOptions {
  term?: string;
  agency?: string;
  perPage?: number;
}

export function buildCommerceMonitoringParams(opts: CommerceMonitoringOptions = {}): DocumentSearchParams {
  const conditions: NonNullable<DocumentSearchParams['conditions']> = {};
  conditions.term = opts.term && opts.term.trim() ? opts.term.trim() : 'antidumping';
  const agencySlug = opts.agency && opts.agency.trim() ? opts.agency.trim() : 'commerce-department';
  conditions.agencies = [agencySlug];

  return {
    conditions,
    perPage: opts.perPage ?? 10,
  };
}

// E-W4: Presidential Documents Research
export interface PresidentialTradeOptions {
  term?: string;
  publicationDate?: string;
  perPage?: number;
}

export function buildPresidentialTradeParams(opts: PresidentialTradeOptions = {}): DocumentSearchParams {
  const conditions: NonNullable<DocumentSearchParams['conditions']> = {
    types: ['PRESDOCU'],
  };
  conditions.term = opts.term && opts.term.trim() ? opts.term.trim() : 'trade';
  if (opts.publicationDate && opts.publicationDate.trim()) {
    conditions.publicationDate = { is: opts.publicationDate.trim() };
  }
  return {
    conditions,
    perPage: opts.perPage ?? 10,
  };
}

// E-W5: Public Inspection Early Warning
export interface PublicInspectionTradeOptions {
  term?: string;
  perPage?: number;
}

export function buildPublicInspectionTradeSearchParams(
  opts: PublicInspectionTradeOptions = {}
): PublicInspectionSearchParams {
  const conditions: NonNullable<PublicInspectionSearchParams['conditions']> = {};
  conditions.term = opts.term && opts.term.trim() ? opts.term.trim() : 'trade';
  return {
    conditions,
    perPage: opts.perPage ?? 10,
  };
}

// E-W6: Faceted Trade Research
export interface FacetedTradeOptions {
  dimension: 'agency' | 'docType' | 'yearly';
  term?: string;
}

export function buildFacetedTradeParams(opts: FacetedTradeOptions): DocumentFacetParams {
  const term = opts.term && opts.term.trim() ? opts.term.trim() : 'tariff';
  return {
    conditions: {
      term,
    },
  };
}

/**
 * Generate copyable TypeScript snippet from actual canonical params used.
 */
export function generateTradeSnippet(
  _workflowId: string,
  params: any,
  operationPath: string
): string {
  const paramsStr = params ? JSON.stringify(params, null, 2) : '{}';

  return `import { FederalRegisterClient } from 'federal-register-ts';

// 1. Instantiate the official Federal Register SDK client
const client = new FederalRegisterClient();

// 2. Execute ${operationPath} with exact typed parameters
async function runTradeResearch() {
  try {
    const response = await ${operationPath}(${paramsStr});
    console.log('Official Federal Register response received:', response);
    return response;
  } catch (error) {
    console.error('Federal Register research request failed:', error);
    throw error;
  }
}

runTradeResearch();
`;
}
