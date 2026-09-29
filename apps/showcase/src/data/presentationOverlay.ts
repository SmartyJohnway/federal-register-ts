/**
 * Non-authoritative Presentation Overlay for Federal Register SDK Showcase
 *
 * Provides developer-friendly UI hints, non-authoritative sample parameters,
 * and example values for interactive exploration and TypeScript code generation.
 *
 * Invariants:
 * - Overlay keys MUST be a subset of the 54 canonical operation IDs.
 * - MUST NOT redefine canonical truth (Tier, path, signatures, return contracts).
 */

export interface OperationPresentation {
  title: string;
  hint: string;
  sampleParams: Record<string, unknown> | null;
}

export const PRESENTATION_OVERLAYS: Record<string, OperationPresentation> = {
  // Tier A: Core Interactive (9 operations)
  'DOC-001': {
    title: 'Document Search',
    hint: 'Full-text query string (conditions.term) and structured filter combination.',
    sampleParams: {
      conditions: {
        term: 'trade policy',
        types: ['RULE', 'PRORULE'],
      },
      perPage: 5,
    },
  },
  'DOC-002': {
    title: 'Get Single Document',
    hint: 'Lookup official Federal Register document by its unique document number.',
    sampleParams: {
      documentNumber: '2024-00123',
    },
  },
  'DOC-006': {
    title: 'Document Autocomplete',
    hint: 'Fast prefix suggestions for search terms or agency titles.',
    sampleParams: {
      term: 'environmental',
    },
  },
  'PI-001': {
    title: 'Public Inspection Search',
    hint: 'Search unfiled / pre-publication public inspection documents.',
    sampleParams: {
      conditions: {
        term: 'customs',
      },
    },
  },
  'PI-003': {
    title: 'Current Public Inspection',
    hint: 'Retrieve today\'s live public inspection filing queue.',
    sampleParams: null,
  },
  'AGENCY-001': {
    title: 'List All Agencies',
    hint: 'Fetch complete directory of all federal issuing agencies.',
    sampleParams: null,
  },
  'AGENCY-002': {
    title: 'Get Single Agency',
    hint: 'Lookup agency details and sub-agencies by numeric ID or slug.',
    sampleParams: {
      idOrSlug: 112,
    },
  },
  'TOPIC-001': {
    title: 'Topic Catalog Thesaurus',
    hint: 'Fetch the complete topic classification thesaurus.',
    sampleParams: null,
  },
  'SUGGEST-001': {
    title: 'List Suggested Searches',
    hint: 'Retrieve curated search queries categorized by trending topics.',
    sampleParams: null,
  },

  // Tier B: Secondary / Facets / Specialized (33 operations)
  'DOC-003': {
    title: 'Batch Document Lookup',
    hint: 'Fetch multiple documents simultaneously with missing number tolerance.',
    sampleParams: {
      documentNumbers: ['2024-00123', '2024-00124'],
    },
  },
  'DOC-004': {
    title: 'Find by Citation',
    hint: 'Lookup document by volume and page citation (e.g. 89 FR 12345).',
    sampleParams: {
      citation: {
        volume: 89,
        page: 12345,
      },
    },
  },
  'DOC-005': {
    title: 'Batch Citation Lookup',
    hint: 'Lookup multiple volume/page citations in a single request.',
    sampleParams: {
      citations: [
        { volume: 89, page: 12345 },
        { volume: 89, page: 12346 },
      ],
    },
  },
  'DOC-007': {
    title: 'Document Search Details',
    hint: 'Inspect query suggestion metadata, available facets, and search filters.',
    sampleParams: {
      conditions: {
        term: 'tariff',
      },
    },
  },
  'DOC-FACET-001': {
    title: 'Agency Document Facet',
    hint: 'Count matching documents grouped by publishing agency.',
    sampleParams: {
      conditions: {
        term: 'maritime',
      },
    },
  },
  'DOC-FACET-002': {
    title: 'Topic Document Facet',
    hint: 'Count matching documents grouped by CFR topic catalog.',
    sampleParams: {
      conditions: {
        term: 'aviation',
      },
    },
  },
  'DOC-FACET-003': {
    title: 'Section Document Facet',
    hint: 'Group document counts by Federal Register issue section.',
    sampleParams: {
      conditions: {
        term: 'telecommunications',
      },
    },
  },
  'DOC-FACET-004': {
    title: 'Document Type Facet',
    hint: 'Count matching documents grouped by type (Rule, Proposed Rule, Notice).',
    sampleParams: {
      conditions: {
        term: 'commerce',
      },
    },
  },
  'DOC-FACET-005': {
    title: 'Document Subtype Facet',
    hint: 'Group document counts by Presidential subtype (Proclamation/EO).',
    sampleParams: {
      conditions: {
        term: 'energy',
      },
    },
  },
  'DOC-FACET-006': {
    title: 'Daily Publication Facet',
    hint: 'Histogram of publication counts broken down by day.',
    sampleParams: {
      conditions: {
        publicationDate: { gte: '2024-01-01', lte: '2024-01-31' },
      },
    },
  },
  'DOC-FACET-007': {
    title: 'Weekly Publication Facet',
    hint: 'Histogram of publication counts broken down by week.',
    sampleParams: {
      conditions: {
        publicationDate: { gte: '2024-01-01', lte: '2024-03-31' },
      },
    },
  },
  'DOC-FACET-008': {
    title: 'Monthly Publication Facet',
    hint: 'Histogram of publication counts broken down by month.',
    sampleParams: {
      conditions: {
        publicationDate: { gte: '2024-01-01', lte: '2024-12-31' },
      },
    },
  },
  'DOC-FACET-009': {
    title: 'Quarterly Publication Facet',
    hint: 'Histogram of publication counts broken down by calendar quarter.',
    sampleParams: {
      conditions: {
        publicationDate: { gte: '2023-01-01', lte: '2024-12-31' },
      },
    },
  },
  'DOC-FACET-010': {
    title: 'Yearly Publication Facet',
    hint: 'Histogram of publication counts broken down by year.',
    sampleParams: {
      conditions: {
        publicationDate: { gte: '2020-01-01', lte: '2024-12-31' },
      },
    },
  },
  'PI-002': {
    title: 'Public Inspection Available Dates',
    hint: 'List documents filed on exact issue date.',
    sampleParams: {
      availableOn: '2024-03-01',
    },
  },
  'PI-004': {
    title: 'Get Single Public Inspection Document',
    hint: 'Lookup single unfiled public inspection notice by document number.',
    sampleParams: {
      documentNumber: '2024-00123-PI',
    },
  },
  'PI-005': {
    title: 'Batch Public Inspection Lookup',
    hint: 'Fetch multiple unfiled public inspection notices simultaneously.',
    sampleParams: {
      documentNumbers: ['2024-00123-PI', '2024-00124-PI'],
    },
  },
  'PI-006': {
    title: 'Public Inspection Search Details',
    hint: 'Inspect search facet structure for public inspection filings.',
    sampleParams: {
      conditions: {
        term: 'customs',
      },
    },
  },
  'PI-FACET-001': {
    title: 'Public Inspection Type Facet',
    hint: 'Aggregate public inspection filing counts by document type.',
    sampleParams: null,
  },
  'PI-FACET-002': {
    title: 'Public Inspection Agency Facet',
    hint: 'Aggregate public inspection filing counts by agency ID.',
    sampleParams: null,
  },
  'PI-FACET-003': {
    title: 'Public Inspection Agencies Facet',
    hint: 'Aggregate multi-agency involvement by agency slug.',
    sampleParams: null,
  },
  'PI-ISSUE-FACET-001': {
    title: 'Public Inspection Issue Daily Facet',
    hint: 'Filing counts by date for specific public inspection issue docket.',
    sampleParams: {
      publicationDate: {
        gte: '2024-03-01',
      },
    },
  },
  'PI-ISSUE-FACET-002': {
    title: 'Public Inspection Issue Type Facet',
    hint: 'Filing counts by type for specific public inspection issue docket.',
    sampleParams: {
      publicationDate: {
        is: '2024-03-01',
      },
    },
  },
  'AGENCY-003': {
    title: 'Batch Agency Lookup',
    hint: 'Fetch multiple agencies by ID list.',
    sampleParams: {
      ids: [112, 113],
    },
  },
  'AGENCY-004': {
    title: 'Agency Search Suggestions',
    hint: 'Search suggestions matching agency name or abbreviation.',
    sampleParams: {
      term: 'commerce',
    },
  },
  'TOPIC-002': {
    title: 'Topic Search Suggestions',
    hint: 'Search suggestions matching CFR topic names.',
    sampleParams: {
      term: 'agriculture',
    },
  },
  'SECTION-001': {
    title: 'List All Sections',
    hint: 'Retrieve Federal Register publication sections.',
    sampleParams: null,
  },
  'SUGGEST-002': {
    title: 'List Suggested Searches by Section',
    hint: 'Retrieve suggested searches organized by issue section.',
    sampleParams: {
      sections: ['money'],
    },
  },
  'SUGGEST-003': {
    title: 'Get Single Suggested Search',
    hint: 'Fetch details and query parameters for a curated suggested search.',
    sampleParams: {
      slug: 'tariffs',
    },
  },
  'HOLIDAY-001': {
    title: 'List Federal Holidays',
    hint: 'Retrieve federal holiday calendar dates used for publication schedules.',
    sampleParams: null,
  },
  'EFFECTIVE-001': {
    title: 'Calculate Effective Dates',
    hint: 'Calculate legal effective dates based on publication dates and day offsets.',
    sampleParams: {
      startDate: '2024-03-01',
      endDate: '2024-03-31',
    },
  },
  'ISSUE-001': {
    title: 'Get Issue by Date',
    hint: 'Retrieve Federal Register daily issue table of contents for a specific date.',
    sampleParams: {
      publicationDate: '2024-03-01',
    },
  },
  'ISSUE-002': {
    title: 'Get Current Daily Issue',
    hint: 'Retrieve latest published Federal Register daily issue table of contents.',
    sampleParams: null,
  },

  // Tier C: Documented / Companion (12 operations - Non-runnable in Developer)
  'DOC-008': {
    title: 'Document CSV Stream',
    hint: 'Raw CSV export stream for document batches (Documented capability).',
    sampleParams: { documentNumbers: ['2024-00123'] },
  },
  'DOC-009': {
    title: 'Document RSS Feed',
    hint: 'RSS syndication XML feed for document searches (Documented capability).',
    sampleParams: { conditions: { term: 'trade' } },
  },
  'DOC-010': {
    title: 'Document Search CSV Stream',
    hint: 'Stream full search result sets in CSV table format (Documented capability).',
    sampleParams: { conditions: { term: 'trade' } },
  },
  'PI-007': {
    title: 'Current Public Inspection CSV',
    hint: 'Raw CSV stream of current public inspection filings (Documented capability).',
    sampleParams: null,
  },
  'PI-008': {
    title: 'Public Inspection Search CSV',
    hint: 'Stream public inspection search results in CSV format (Documented capability).',
    sampleParams: { conditions: { term: 'trade' } },
  },
  'PI-009': {
    title: 'Public Inspection Search RSS',
    hint: 'RSS syndication feed for public inspection notices (Documented capability).',
    sampleParams: { conditions: { term: 'trade' } },
  },
  'IMAGE-001': {
    title: 'Image Lookup',
    hint: 'Fetch raw image metadata or binary stream for diagrams (Documented capability).',
    sampleParams: { identifier: 'EP01MR24.000' },
  },
  'CATCOUNT-001': {
    title: 'Document Type Category Counts CSV',
    hint: 'Summary publication count statistics by type in CSV (Documented capability).',
    sampleParams: null,
  },
  'CATCOUNT-002': {
    title: 'Page Count Category Counts CSV',
    hint: 'Summary publication page volume statistics in CSV (Documented capability).',
    sampleParams: null,
  },
  'NOTIF-001': {
    title: 'Site Notifications Lookup',
    hint: 'Lookup site administrative notifications (Documented capability).',
    sampleParams: { identifier: '1' },
  },
  'DOCS-001': {
    title: 'OpenAPI Specification Fetch',
    hint: 'Fetch raw official OpenAPI 3.0 document definition (Documented capability).',
    sampleParams: null,
  },
  'CLIP-001': {
    title: 'User Clippings Feed',
    hint: 'User bookmarks / clipping feed integration (Documented capability).',
    sampleParams: null,
  },
};

export function getPresentationOverlay(operationId: string): OperationPresentation {
  return (
    PRESENTATION_OVERLAYS[operationId] || {
      title: operationId,
      hint: 'Canonical Federal Register SDK operation.',
      sampleParams: null,
    }
  );
}
