import type { FederalRegisterClient } from 'federal-register-ts';

export type OperationExecutorFn = (client: FederalRegisterClient, params?: any) => Promise<any>;

/**
 * Static 42-operation Executor Map
 * 
 * Invariants:
 * - Exactly 42 runnable operations (9 Tier A + 33 Tier B).
 * - Zero Tier C operations (Tier C are Documented Only).
 * - Strictly avoids eval, Function constructors, or dynamic property indexing (e.g. client[ns][method]).
 * - Every single binding is statically typed and declared.
 */
export const STATIC_EXECUTOR_MAP: Readonly<Record<string, OperationExecutorFn>> = {
  // --- Tier A (9 operations) ---
  'DOC-001': (client, p) => client.documents.search(p),
  'DOC-002': (client, p) => client.documents.find(p),
  'DOC-006': (client, p) => client.documents.autocomplete(p),
  'PI-001': (client, p) => client.publicInspection.search(p),
  'PI-003': (client, p) => client.publicInspection.current(p),
  'AGENCY-001': (client, p) => client.agencies.list(p),
  'AGENCY-002': (client, p) => client.agencies.find(p),
  'TOPIC-001': (client) => client.topics.list(),
  'SUGGEST-001': (client) => client.suggestedSearches.list(),

  // --- Tier B (33 operations) ---
  // Documents
  'DOC-003': (client, p) => client.documents.findMany(p),
  'DOC-004': (client, p) => client.documents.findByCitation(p),
  'DOC-005': (client, p) => client.documents.findManyByCitation(p),
  'DOC-007': (client, p) => client.documents.searchDetails(p),

  // Document Facets
  'DOC-FACET-001': (client, p) => client.documents.facets.agency(p),
  'DOC-FACET-002': (client, p) => client.documents.facets.topic(p),
  'DOC-FACET-003': (client, p) => client.documents.facets.section(p),
  'DOC-FACET-004': (client, p) => client.documents.facets.type(p),
  'DOC-FACET-005': (client, p) => client.documents.facets.subtype(p),
  'DOC-FACET-006': (client, p) => client.documents.facets.daily(p),
  'DOC-FACET-007': (client, p) => client.documents.facets.weekly(p),
  'DOC-FACET-008': (client, p) => client.documents.facets.monthly(p),
  'DOC-FACET-009': (client, p) => client.documents.facets.quarterly(p),
  'DOC-FACET-010': (client, p) => client.documents.facets.yearly(p),

  // Public Inspection
  'PI-002': (client, p) => client.publicInspection.availableOn(p),
  'PI-004': (client, p) => client.publicInspection.find(p),
  'PI-005': (client, p) => client.publicInspection.findMany(p),
  'PI-006': (client, p) => client.publicInspection.searchDetails(p),

  // Public Inspection Facets
  'PI-FACET-001': (client, p) => client.publicInspection.facets.type(p),
  'PI-FACET-002': (client, p) => client.publicInspection.facets.agency(p),
  'PI-FACET-003': (client, p) => client.publicInspection.facets.agencies(p),

  // Public Inspection Issue Facets
  'PI-ISSUE-FACET-001': (client, p) => client.publicInspection.issues.facets.daily(p),
  'PI-ISSUE-FACET-002': (client, p) => client.publicInspection.issues.facets.type(p),

  // Agencies
  'AGENCY-003': (client, p) => client.agencies.findMany(p),
  'AGENCY-004': (client, p) => client.agencies.suggestions(p),

  // Topics
  'TOPIC-002': (client, p) => client.topics.suggestions(p),

  // Sections
  'SECTION-001': (client) => client.sections.list(),

  // Suggested Searches
  'SUGGEST-002': (client, p) => client.suggestedSearches.listBySections(p),
  'SUGGEST-003': (client, p) => client.suggestedSearches.find(p),

  // Holidays
  'HOLIDAY-001': (client) => client.holidays.list(),

  // Effective Dates
  'EFFECTIVE-001': (client, p) => client.effectiveDates.calculate(p),

  // Issues
  'ISSUE-001': (client, p) => client.issues.find(p),
  'ISSUE-002': (client) => client.issues.current(),
};

export const RUNNABLE_OPERATION_COUNT = Object.keys(STATIC_EXECUTOR_MAP).length; // Exactly 42

export function isRunnable(operationId: string): boolean {
  return Boolean(STATIC_EXECUTOR_MAP[operationId]);
}

export function getRunnableOperationIds(): string[] {
  return Object.keys(STATIC_EXECUTOR_MAP);
}

export async function executeOperation(
  client: FederalRegisterClient,
  operationId: string,
  params?: any
): Promise<any> {
  const executor = STATIC_EXECUTOR_MAP[operationId];
  if (!executor) {
    throw new Error(
      `Operation '${operationId}' is not runnable. Only Tier A (9) and Tier B (33) operations are supported in the Developer Workbench.`
    );
  }
  return await executor(client, params);
}
