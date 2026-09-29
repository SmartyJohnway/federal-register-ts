export type TradeWorkflowId =
  | 'section-232'
  | 'steel-aluminum'
  | 'commerce-monitoring'
  | 'presidential-documents'
  | 'public-inspection'
  | 'faceted-research';

export interface CanonicalOpReference {
  operationId: string;
  path: string;
  tier: string;
  description: string;
}

export interface TradeWorkflowDefinition {
  id: TradeWorkflowId;
  title: string;
  shortTitle: string;
  badge: string;
  researchQuestion: string;
  whatIsSearched: string;
  canonicalOperations: CanonicalOpReference[];
  defaultParamsDescription: string;
  disclaimer: string;
  r4MigrationRelevance: {
    legacyHandyApproach: string;
    canonicalSdkApproach: string;
    r4Responsibility: 'DIRECT_CANONICAL_SDK' | 'HANDY_CONSUMER_ADAPTER' | 'HANDY_DOMAIN_LOGIC';
    action: string;
  };
}

export const TRADE_WORKFLOWS: Record<TradeWorkflowId, TradeWorkflowDefinition> = {
  'section-232': {
    id: 'section-232',
    title: 'Section 232 Trade Remedies Research',
    shortTitle: 'Section 232',
    badge: 'National Security Remedies',
    researchQuestion: 'Find Federal Register materials related to Section 232 national security trade actions and product exclusion procedures.',
    whatIsSearched: 'Official presidential proclamations, Commerce Department investigation findings, and exclusion process notices regarding national security trade actions under Section 232 of the Trade Expansion Act of 1962.',
    canonicalOperations: [
      {
        operationId: 'DOC-001',
        path: 'client.documents.search',
        tier: 'Tier A',
        description: 'Full-text and structured conditions document search',
      },
    ],
    defaultParamsDescription: 'Searches documents with conditions[term]="Section 232". Supports optional document type, publication date, and pagination filters.',
    disclaimer: 'Federal Register research example — verify the underlying official document before relying on it for legal or tariff decisions. Section 232 exclusion status must be verified against official Commerce Department dockets.',
    r4MigrationRelevance: {
      legacyHandyApproach: 'Handy previously relied on ad-hoc query string assembly in src/lib/frTsApi2.ts with manual parameter decoding.',
      canonicalSdkApproach: 'Directly invoke client.documents.search with structured conditions using typed RequestBuilder.',
      r4Responsibility: 'DIRECT_CANONICAL_SDK',
      action: 'Replace embedded query formatting in frTsApi2.ts with canonical SDK documents.search.',
    },
  },

  'steel-aluminum': {
    id: 'steel-aluminum',
    title: 'Steel & Aluminum Trade Measure Notices',
    shortTitle: 'Steel / Aluminum',
    badge: 'Commodity Measures',
    researchQuestion: 'Find Federal Register notices relevant to steel or aluminum trade measures, quotas, tariff adjustments, and derivative articles.',
    whatIsSearched: 'Rule changes, notices of investigation, and presidential proclamations covering raw and derivative steel or aluminum products published in the Federal Register.',
    canonicalOperations: [
      {
        operationId: 'DOC-001',
        path: 'client.documents.search',
        tier: 'Tier A',
        description: 'Full-text and structured conditions document search',
      },
      {
        operationId: 'DOC-FACET-001',
        path: 'client.documents.facets.agency',
        tier: 'Tier B',
        description: 'Count documents matching term conditions grouped by issuing agency',
      },
    ],
    defaultParamsDescription: 'Configurable presets for Steel (term: "steel"), Aluminum (term: "aluminum"), or Combined (term: "steel aluminum").',
    disclaimer: 'Federal Register research example — verify the underlying official document before relying on it for legal or tariff decisions. Does not compute HTS tariff rates or classification determinations.',
    r4MigrationRelevance: {
      legacyHandyApproach: 'Handy commodity monitors used custom regex parsing on raw document bodies.',
      canonicalSdkApproach: 'Use canonical client.documents.search with structured term conditions, optionally coupled with client.documents.facets.agency for agency aggregation.',
      r4Responsibility: 'HANDY_CONSUMER_ADAPTER',
      action: 'Wrap SDK search in Handy React Query hooks, keeping HTS duty compounding strictly in Handy domain layer.',
    },
  },

  'commerce-monitoring': {
    id: 'commerce-monitoring',
    title: 'Department of Commerce Regulatory Monitoring',
    shortTitle: 'Commerce Monitoring',
    badge: 'Agency Regulatory Scope',
    researchQuestion: 'Monitor Federal Register regulatory and investigatory notices issued by the Department of Commerce and International Trade Administration.',
    whatIsSearched: 'Antidumping and countervailing duty (AD/CVD) orders, preliminary/final determinations, administrative reviews, and export regulations published by Commerce Department agencies.',
    canonicalOperations: [
      {
        operationId: 'DOC-001',
        path: 'client.documents.search',
        tier: 'Tier A',
        description: 'Full-text document search with conditions[agencies]=["commerce-department"]',
      },
    ],
    defaultParamsDescription: 'Searches documents with conditions[term]="antidumping" and conditions[agencies]=["commerce-department"].',
    disclaimer: 'Federal Register research example — verify the underlying official document before relying on it for legal or tariff decisions. AD/CVD case margins must be confirmed on ACCESS or official ITA dockets.',
    r4MigrationRelevance: {
      legacyHandyApproach: 'Handy netlify/functions/fr-ts-search.ts maintained custom agency matching and query normalization.',
      canonicalSdkApproach: 'Pass canonical agency slug "commerce-department" or "international-trade-administration" in conditions.agencies.',
      r4Responsibility: 'DIRECT_CANONICAL_SDK',
      action: 'Deprecate netlify/functions/fr-ts-search.ts; invoke client.documents.search with verified agency conditions.',
    },
  },

  'presidential-documents': {
    id: 'presidential-documents',
    title: 'Presidential Trade Actions & Proclamations',
    shortTitle: 'Presidential Documents',
    badge: 'Executive Actions',
    researchQuestion: 'Find presidential documents (Proclamations and Executive Orders) establishing, modifying, or amending trade and tariff policies.',
    whatIsSearched: 'Official presidential proclamations and executive orders published under Title 3 of the Code of Federal Regulations and the Federal Register.',
    canonicalOperations: [
      {
        operationId: 'DOC-001',
        path: 'client.documents.search',
        tier: 'Tier A',
        description: 'Full-text search constrained by conditions[types]=["PRESDOCU"]',
      },
    ],
    defaultParamsDescription: 'Searches documents with conditions[term]="trade" and exact SDK DocumentTypeCode conditions[types]=["PRESDOCU"].',
    disclaimer: 'Federal Register research example — verify the underlying official document before relying on it for legal or tariff decisions. Single search queries do not guarantee exhaustive coverage of all historic executive actions.',
    r4MigrationRelevance: {
      legacyHandyApproach: 'Handy used client-side filtering on document title prefixes (e.g. "Proclamation...") to identify presidential orders.',
      canonicalSdkApproach: 'Filter via exact SDK DocumentTypeCode "PRESDOCU", offloading type classification to official upstream indexing.',
      r4Responsibility: 'DIRECT_CANONICAL_SDK',
      action: 'Replace client-side title regex in Handy with conditions.types = ["PRESDOCU"].',
    },
  },

  'public-inspection': {
    id: 'public-inspection',
    title: 'Public Inspection Trade Early Warning',
    shortTitle: 'Public Inspection',
    badge: 'Pre-Publication Preview',
    researchQuestion: 'Look for not-yet-published Public Inspection material relevant to upcoming trade, customs, or tariff actions scheduled for publication.',
    whatIsSearched: 'Pre-publication trade notices on public inspection at the Office of the Federal Register before official publication in the next Federal Register issue.',
    canonicalOperations: [
      {
        operationId: 'PI-003',
        path: 'client.publicInspection.current',
        tier: 'Tier A',
        description: 'List all documents currently on public inspection',
      },
      {
        operationId: 'PI-001',
        path: 'client.publicInspection.search',
        tier: 'Tier A',
        description: 'Search public inspection documents with conditions[term]',
      },
    ],
    defaultParamsDescription: 'Fetches current public inspection items or searches pre-publication documents matching trade keywords.',
    disclaimer: 'Federal Register research example — verify the underlying official document before relying on it for legal or tariff decisions. Public Inspection filings are draft previews subject to editorial changes prior to official publication.',
    r4MigrationRelevance: {
      legacyHandyApproach: 'Handy used custom scrapers and microservices in netlify/functions/fr-ts-microservices/ to pull early inspection lists.',
      canonicalSdkApproach: 'Use canonical client.publicInspection.current or client.publicInspection.search with term conditions.',
      r4Responsibility: 'DIRECT_CANONICAL_SDK',
      action: 'Retire custom PI scrapers in Handy; adopt canonical SDK publicInspection endpoints.',
    },
  },

  'faceted-research': {
    id: 'faceted-research',
    title: 'Faceted Trade Research & Dimension Breakdown',
    shortTitle: 'Faceted Breakdown',
    badge: 'Multi-Dimension Analysis',
    researchQuestion: 'Summarize a trade-related Federal Register search across key regulatory dimensions (issuing agencies, document types, and publication years).',
    whatIsSearched: 'Aggregate count distribution of trade-related documents across issuing agencies, document types (Rule, Proposed Rule, Notice, Presidential Document), and publication years.',
    canonicalOperations: [
      {
        operationId: 'DOC-FACET-001',
        path: 'client.documents.facets.agency',
        tier: 'Tier B',
        description: 'Facet documents matching query term by issuing agency',
      },
      {
        operationId: 'DOC-FACET-004',
        path: 'client.documents.facets.type',
        tier: 'Tier B',
        description: 'Facet documents matching query term by document type',
      },
      {
        operationId: 'DOC-FACET-010',
        path: 'client.documents.facets.yearly',
        tier: 'Tier B',
        description: 'Facet documents matching query term by publication year',
      },
    ],
    defaultParamsDescription: 'Fetches document facet counts for term="tariff" across Agency, Document Type, and Publication Year dimensions.',
    disclaimer: 'Federal Register research example — verify the underlying official document before relying on it for legal or tariff decisions. Descriptive counts reflect indexed Federal Register notices and do not represent economic trade volume or tariff revenue.',
    r4MigrationRelevance: {
      legacyHandyApproach: 'Handy executed full document searches and calculated facet breakdowns manually in browser memory.',
      canonicalSdkApproach: 'Execute server-side facet endpoints via client.documents.facets.agency and related methods for instantaneous aggregation.',
      r4Responsibility: 'DIRECT_CANONICAL_SDK',
      action: 'Replace in-memory aggregation in Handy analytics views with canonical facet API calls.',
    },
  },
};

export const R4_RESPONSIBILITY_BREAKDOWN = [
  {
    category: 'Canonical SDK Core (federal-register-ts@1.1.0)',
    role: 'Owns all 54 canonical endpoints, serialization, validation, rate limiting, error taxonomy, and exact TypeScript models.',
    scope: 'Single source of truth for FederalRegister.gov API communication.',
  },
  {
    category: 'Consumer Adapter (Handy Showcase / Gateway Adapter)',
    role: 'Translates UI state to SDK request parameters, wraps async execution in React Query / state hooks, formats human-friendly error messages.',
    scope: 'UI integration layer between React components and SDK client.',
  },
  {
    category: 'Handy Domain Logic (Tariff Engine)',
    role: 'HTS classification matching, compound duty calculations, AD/CVD case margin tracking, user portfolio alerts, export control compliance.',
    scope: 'Strictly downstream domain logic; zero coupling to SDK core.',
  },
  {
    category: 'Embedded Duplication to Retire in R4',
    role: 'Legacy netlify/functions/fr-ts-microservices/**, redundant custom Document/Agency classes, ad-hoc JSONP handlers.',
    scope: 'Deprecated in favor of standardized federal-register-ts client.',
  },
  {
    category: 'Requires Fresh R4 Preflight',
    role: 'Live audit of active Handy call sites and dependency trees at R4-00 activation time.',
    scope: 'Ensures no breaking schema drift before performing final cutover.',
  },
];
