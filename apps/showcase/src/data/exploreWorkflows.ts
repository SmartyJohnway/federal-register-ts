/**
 * Explore Workflows Presentation Configuration
 * 
 * Non-authoritative human-oriented workflow definitions.
 * Maps high-level user tasks to canonical SDK operation IDs.
 * 
 * Invariants:
 * - Every operation ID referenced here MUST exist in canonicalRegistry.json.
 * - Every executable operation ID MUST exist in STATIC_EXECUTOR_MAP.
 * - Does NOT redefine SDK contracts, types, or return shapes.
 */

export type ExploreWorkflowId =
  | 'documents'
  | 'public-inspection'
  | 'agencies'
  | 'topics'
  | 'issues'
  | 'analytics';

export interface WorkflowDefinition {
  id: ExploreWorkflowId;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  canonicalOperationIds: string[];
  iconName: string;
}

export const EXPLORE_WORKFLOWS: readonly WorkflowDefinition[] = [
  {
    id: 'documents',
    title: 'Search Documents',
    shortTitle: 'Documents',
    tagline: 'Search Official Federal Register Publications',
    description: 'Find Final Rules, Proposed Rules, Presidential Documents, and Notices with structured filters.',
    canonicalOperationIds: ['DOC-001', 'DOC-002'],
    iconName: 'Search',
  },
  {
    id: 'public-inspection',
    title: 'Public Inspection',
    shortTitle: 'Public Inspection',
    tagline: 'Preview Upcoming Publications Before Official Release',
    description: 'Browse filed draft regulations and preliminary notices scheduled for upcoming Federal Register issues.',
    canonicalOperationIds: ['PI-001', 'PI-002', 'PI-003'],
    iconName: 'Eye',
  },
  {
    id: 'agencies',
    title: 'Browse Agencies',
    shortTitle: 'Agencies',
    tagline: 'Directory of Federal Publishing Agencies',
    description: 'Discover federal departments, sub-agencies, commissions, and their regulatory document counts.',
    canonicalOperationIds: ['AGENCY-001', 'AGENCY-002', 'AGENCY-004'],
    iconName: 'Building2',
  },
  {
    id: 'topics',
    title: 'Browse Topics',
    shortTitle: 'Topics',
    tagline: 'Explore Regulatory Topic Classifications',
    description: 'Browse canonical subject categories from Agriculture and Commerce to Energy and Transportation.',
    canonicalOperationIds: ['TOPIC-001', 'TOPIC-002'],
    iconName: 'Tag',
  },
  {
    id: 'issues',
    title: 'Explore Issues',
    shortTitle: 'Issues',
    tagline: 'Daily Federal Register Issues & TOCs',
    description: 'Inspect daily issue volumes, page ranges, and table of contents by publication date.',
    canonicalOperationIds: ['ISSUE-001', 'ISSUE-002'],
    iconName: 'Calendar',
  },
  {
    id: 'analytics',
    title: 'Analyze Results',
    shortTitle: 'Analysis & Facets',
    tagline: 'Faceted Distributions & Regulatory Metrics',
    description: 'Aggregate document frequency by publishing agency, document type, and historical timeline.',
    canonicalOperationIds: ['DOC-FACET-001', 'DOC-FACET-004', 'DOC-FACET-010', 'PI-FACET-001'],
    iconName: 'BarChart3',
  },
] as const;

export const DOCUMENT_TYPES = [
  { value: '', label: 'All Document Types' },
  { value: 'RULE', label: 'Final Rule' },
  { value: 'PRORULE', label: 'Proposed Rule' },
  { value: 'NOTICE', label: 'Notice' },
  { value: 'PRESDOCU', label: 'Presidential Document' },
] as const;

export const DATE_PRESETS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'last-7-days', label: 'Last 7 Days' },
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'custom', label: 'Specific Date...' },
] as const;
