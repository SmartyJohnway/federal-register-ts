import type {
  DocumentSearchParams,
  PublicInspectionSearchParams,
  PublicInspectionAvailableOnParams,
  AgencyListParams,
  AgencyFindParams,
  AgencySuggestionsParams,
  TopicSuggestionsParams,
  IssueFindParams,
  DocumentFacetParams,
  PublicInspectionFacetParams,
  DocumentTypeCode,
} from 'federal-register-ts';

/**
 * Narrowly scoped, strictly typed request builders for Explore workflows.
 * Ensures the Explore UI always sends exact public SDK parameter structures
 * conforming to federal-register-ts@1.1.0 specifications.
 */

export interface DocumentSearchBuilderOptions {
  term?: string;
  type?: string;
  agency?: string;
  publicationDate?: string;
  perPage?: number;
}

export function buildDocumentSearchParams(opts: DocumentSearchBuilderOptions): DocumentSearchParams {
  const conditions: NonNullable<DocumentSearchParams['conditions']> = {};
  if (opts.term && opts.term.trim()) {
    conditions.term = opts.term.trim();
  }
  if (opts.type && opts.type.trim()) {
    conditions.types = [opts.type.trim() as DocumentTypeCode];
  }
  if (opts.agency && opts.agency.trim()) {
    conditions.agencies = [opts.agency.trim()];
  }
  if (opts.publicationDate && opts.publicationDate.trim()) {
    conditions.publicationDate = { is: opts.publicationDate.trim() };
  }

  const params: DocumentSearchParams = {
    perPage: opts.perPage ?? 10,
  };
  if (Object.keys(conditions).length > 0) {
    params.conditions = conditions;
  }
  return params;
}

export interface PublicInspectionSearchBuilderOptions {
  term?: string;
  perPage?: number;
}

export function buildPublicInspectionSearchParams(
  opts: PublicInspectionSearchBuilderOptions
): PublicInspectionSearchParams {
  const conditions: NonNullable<PublicInspectionSearchParams['conditions']> = {};
  if (opts.term && opts.term.trim()) {
    conditions.term = opts.term.trim();
  }
  const params: PublicInspectionSearchParams = {
    perPage: opts.perPage ?? 10,
  };
  if (Object.keys(conditions).length > 0) {
    params.conditions = conditions;
  }
  return params;
}

export function buildPublicInspectionAvailableOnParams(
  availableOn: string
): PublicInspectionAvailableOnParams {
  return {
    availableOn: availableOn.trim(),
  };
}

export function buildAgencyListParams(): AgencyListParams {
  return {};
}

export function buildAgencyFindParams(idOrSlug: string | number): AgencyFindParams {
  return {
    idOrSlug,
  };
}

export function buildAgencySuggestionsParams(term: string): AgencySuggestionsParams {
  return {
    term: term.trim(),
  };
}

export function buildTopicSuggestionsParams(term: string): TopicSuggestionsParams {
  return {
    term: term.trim(),
  };
}

export function buildIssueFindParams(publicationDate: string): IssueFindParams {
  return {
    publicationDate: publicationDate.trim(),
  };
}

export function buildDocumentFacetParams(term?: string): DocumentFacetParams {
  if (term && term.trim()) {
    return {
      conditions: {
        term: term.trim(),
      },
    };
  }
  return {};
}

export function buildPublicInspectionFacetParams(term?: string): PublicInspectionFacetParams {
  if (term && term.trim()) {
    return {
      conditions: {
        term: term.trim(),
      },
    };
  }
  return {};
}

export function formatExploreErrorMessage(_rawError?: unknown): string {
  return "We couldn't complete this Federal Register request. Please check your search inputs and try again.";
}
