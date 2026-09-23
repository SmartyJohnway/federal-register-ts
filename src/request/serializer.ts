import {
  DocumentSearchParams,
  DocumentSearchCsvParams,
  ExecutiveOrderCsvSearchParams,
  DocumentSearchRssParams,
  DocumentFindParams,
  DocumentFindManyParams,
  DocumentCitationFindParams,
  DocumentCitationFindManyParams,
  FederalRegisterCitation,
  DocumentFindCsvParams,
  DocumentAutocompleteParams,
  DocumentSearchDetailsParams,
  DocumentFacetParams,
  PublicInspectionSearchParams,
  PublicInspectionAvailableOnParams,
  PublicInspectionCurrentParams,
  PublicInspectionCurrentCsvParams,
  PublicInspectionFindParams,
  PublicInspectionFindManyParams,
  PublicInspectionSearchCsvParams,
  PublicInspectionSearchRssParams,
  PublicInspectionSearchDetailsParams,
  PublicInspectionFacetParams,
  PublicInspectionIssueDailyFacetParams,
  PublicInspectionIssueTypeFacetParams,
  AgencyListParams,
  AgencyFindParams,
  AgencyFindManyParams,
  AgencySuggestionsParams,
  TopicSuggestionsParams,
  SuggestedSearchSectionsParams,
  SuggestedSearchFindParams,
  EffectiveDatesParams,
  IssueFindParams,
  ImageFindParams,
  SiteNotificationFindParams,
  DocumentSearchConditions,
  PublicInspectionSearchConditions,
  DateCondition,
  CfrCondition,
  NearCondition,
  DocumentField,
  PublicInspectionField,
  AgencyField,
  TopicField,
} from "./types";

import {
  RequestValidationError,
  DOCUMENT_FIELDS,
  PUBLIC_INSPECTION_FIELDS,
  AGENCY_FIELDS,
  TOPIC_FIELDS,
  validatePageNumber,
  validatePerPage,
  validateExecutiveOrderCsvPerPage,
  validatePositiveInteger,
  validateIsoDateString,
  validateNonBlankString,
  validateSearchTypeId,
  normalizeAndValidateOrder,
  validateFields,
  validateDateCondition,
  validateCfrCondition,
  validateNearCondition,
  validateEffectiveDatesRange,
  validateNonEmptyArray,
  validateJsonpCallback,
  validateUnknownKeys,
  validateRequiredParams,
  validateDocumentTypeCodes,
  validateBooleanQuery,
  validateTrueOnlyFlag,
  validateOrdinaryBoolean,
  validateStringArray,
  validateStringArrayFilter,
  DOCUMENT_SEARCH_PARAMS_KEYS,
  DOCUMENT_SEARCH_CONDITIONS_KEYS,
  EXECUTIVE_ORDER_CSV_SEARCH_PARAMS_KEYS,
  EXECUTIVE_ORDER_CSV_CONDITIONS_KEYS,
  DOCUMENT_SEARCH_RSS_PARAMS_KEYS,
  DOCUMENT_FIND_PARAMS_KEYS,
  DOCUMENT_FIND_MANY_PARAMS_KEYS,
  DOCUMENT_CITATION_FIND_PARAMS_KEYS,
  DOCUMENT_CITATION_FIND_MANY_PARAMS_KEYS,
  DOCUMENT_FIND_CSV_PARAMS_KEYS,
  DOCUMENT_AUTOCOMPLETE_PARAMS_KEYS,
  DOCUMENT_SEARCH_DETAILS_PARAMS_KEYS,
  DOCUMENT_FACET_PARAMS_KEYS,
  PUBLIC_INSPECTION_SEARCH_PARAMS_KEYS,
  PUBLIC_INSPECTION_SEARCH_CONDITIONS_KEYS,
  PUBLIC_INSPECTION_AVAILABLE_ON_PARAMS_KEYS,
  PUBLIC_INSPECTION_CURRENT_PARAMS_KEYS,
  PUBLIC_INSPECTION_CURRENT_CSV_PARAMS_KEYS,
  PUBLIC_INSPECTION_FIND_PARAMS_KEYS,
  PUBLIC_INSPECTION_FIND_MANY_PARAMS_KEYS,
  PUBLIC_INSPECTION_SEARCH_CSV_PARAMS_KEYS,
  PUBLIC_INSPECTION_SEARCH_RSS_PARAMS_KEYS,
  PUBLIC_INSPECTION_SEARCH_DETAILS_PARAMS_KEYS,
  PUBLIC_INSPECTION_FACET_PARAMS_KEYS,
  PUBLIC_INSPECTION_ISSUE_DAILY_FACET_PARAMS_KEYS,
  PUBLIC_INSPECTION_ISSUE_TYPE_FACET_PARAMS_KEYS,
  AGENCY_LIST_PARAMS_KEYS,
  AGENCY_FIND_PARAMS_KEYS,
  AGENCY_FIND_MANY_PARAMS_KEYS,
  AGENCY_SUGGESTIONS_PARAMS_KEYS,
  TOPIC_SUGGESTIONS_PARAMS_KEYS,
  SUGGESTED_SEARCH_SECTIONS_PARAMS_KEYS,
  SUGGESTED_SEARCH_FIND_PARAMS_KEYS,
  EFFECTIVE_DATES_PARAMS_KEYS,
  ISSUE_FIND_PARAMS_KEYS,
  IMAGE_FIND_PARAMS_KEYS,
  SITE_NOTIFICATION_FIND_PARAMS_KEYS,
} from "./validation";

export interface SerializedQueryEntry {
  key: string;
  value: string;
}

export class QuerySerializer {
  public static appendEntry(
    entries: SerializedQueryEntry[],
    key: string,
    val: any
  ): void {
    if (val === undefined) return;
    if (val === null) {
      throw new RequestValidationError("Null value rejected for query parameter '" + key + "'.", key, val);
    }
    if (Array.isArray(val)) {
      if (val.length === 0) return;
      for (let i = 0; i < val.length; i++) {
        const item = val[i];
        if (item === null || item === undefined) {
          throw new RequestValidationError(
            "Null or undefined array element rejected at index " + i + " for key '" + key + "'.",
            key,
            val
          );
        }
        if (typeof item === "object") {
          throw new RequestValidationError(
            "Complex nested object inside array rejected for key '" + key + "'.",
            key,
            item
          );
        }
        entries.push({ key: key + "[]", value: String(item) });
      }
    } else if (typeof val === "boolean") {
      entries.push({ key, value: val ? "1" : "0" });
    } else if (typeof val === "object") {
      for (const [subKey, subVal] of Object.entries(val)) {
        if (subVal !== undefined) {
          QuerySerializer.appendEntry(entries, key + "[" + subKey + "]", subVal);
        }
      }
    } else {
      entries.push({ key, value: String(val) });
    }
  }

  public static toQueryString(entries: readonly SerializedQueryEntry[]): string {
    if (entries.length === 0) return "";
    return entries
      .map((entry) => {
        const encodedKey = encodeURIComponent(entry.key);
        const encodedVal = encodeURIComponent(entry.value);
        return encodedKey + "=" + encodedVal;
      })
      .join("&");
  }

  public static serializeDocumentConditions(
    conditions: DocumentSearchConditions,
    entries: SerializedQueryEntry[]
  ): void {
    validateRequiredParams(conditions, "DocumentSearchConditions");
    validateUnknownKeys(conditions, DOCUMENT_SEARCH_CONDITIONS_KEYS, "DocumentSearchConditions");
    const raw = conditions as Record<string, any>;
    for (const [k, v] of Object.entries(raw)) {
      if (v === null) {
        throw new RequestValidationError(`Null value rejected for condition '${k}'.`, k, v);
      }
    }
    if ("q" in raw) {
      throw new RequestValidationError("Top-level or condition 'q' parameter is forbidden. Canonical term is 'term'.", "q");
    }

    if (conditions.term !== undefined) {
      if (typeof conditions.term !== "string") {
        throw new RequestValidationError("conditions.term must be a string.", "term", conditions.term);
      }
      entries.push({ key: "conditions[term]", value: conditions.term });
    }

    if (conditions.regulationIdNumber !== undefined) {
      validateNonBlankString(conditions.regulationIdNumber, "regulationIdNumber");
      entries.push({ key: "conditions[regulation_id_number]", value: conditions.regulationIdNumber });
    }

    if (conditions.agencies !== undefined) {
      validateStringArrayFilter(conditions.agencies, "agencies");
      QuerySerializer.appendEntry(entries, "conditions[agencies]", conditions.agencies);
    }

    if (conditions.agencyIds !== undefined) {
      if (Array.isArray(conditions.agencyIds)) {
        conditions.agencyIds.forEach((id) => validatePositiveInteger(id, "agencyIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[agency_ids]", conditions.agencyIds);
    }

    if (conditions.citingDocumentNumbers !== undefined) {
      validateStringArrayFilter(conditions.citingDocumentNumbers, "citingDocumentNumbers");
      QuerySerializer.appendEntry(entries, "conditions[citing_document_numbers]", conditions.citingDocumentNumbers);
    }

    if (conditions.documentNumbers !== undefined) {
      validateStringArrayFilter(conditions.documentNumbers, "documentNumbers");
      QuerySerializer.appendEntry(entries, "conditions[document_numbers]", conditions.documentNumbers);
    }

    if (conditions.executiveOrderNumbers !== undefined) {
      validateStringArrayFilter(conditions.executiveOrderNumbers, "executiveOrderNumbers");
      QuerySerializer.appendEntry(entries, "conditions[executive_order_numbers]", conditions.executiveOrderNumbers);
    }

    if (conditions.presidents !== undefined) {
      validateStringArrayFilter(conditions.presidents, "presidents");
      QuerySerializer.appendEntry(entries, "conditions[president]", conditions.presidents);
    }

    if (conditions.sections !== undefined) {
      validateStringArrayFilter(conditions.sections, "sections");
      QuerySerializer.appendEntry(entries, "conditions[sections]", conditions.sections);
    }

    if (conditions.sectionIds !== undefined) {
      if (Array.isArray(conditions.sectionIds)) {
        conditions.sectionIds.forEach((id) => validatePositiveInteger(id, "sectionIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[section_ids]", conditions.sectionIds);
    }

    if (conditions.volume !== undefined) {
      validatePositiveInteger(conditions.volume, "volume");
      entries.push({ key: "conditions[volume]", value: String(conditions.volume) });
    }

    if (conditions.topics !== undefined) {
      validateStringArrayFilter(conditions.topics, "topics");
      QuerySerializer.appendEntry(entries, "conditions[topics]", conditions.topics);
    }

    if (conditions.topicIds !== undefined) {
      if (Array.isArray(conditions.topicIds)) {
        conditions.topicIds.forEach((id) => validatePositiveInteger(id, "topicIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[topic_ids]", conditions.topicIds);
    }

    if (conditions.types !== undefined) {
      validateDocumentTypeCodes(conditions.types, "conditions.types");
      QuerySerializer.appendEntry(entries, "conditions[type]", conditions.types);
    }

    if (conditions.noticeTypes !== undefined) {
      validateStringArrayFilter(conditions.noticeTypes, "noticeTypes");
      QuerySerializer.appendEntry(entries, "conditions[notice_type]", conditions.noticeTypes);
    }

    if (conditions.noticeTypeIds !== undefined) {
      if (Array.isArray(conditions.noticeTypeIds)) {
        conditions.noticeTypeIds.forEach((id) => validatePositiveInteger(id, "noticeTypeIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[notice_type_id]", conditions.noticeTypeIds);
    }

    if (conditions.presidentialDocumentTypes !== undefined) {
      validateStringArrayFilter(conditions.presidentialDocumentTypes, "presidentialDocumentTypes");
      QuerySerializer.appendEntry(entries, "conditions[presidential_document_type]", conditions.presidentialDocumentTypes);
    }

    if (conditions.presidentialDocumentTypeIds !== undefined) {
      if (Array.isArray(conditions.presidentialDocumentTypeIds)) {
        conditions.presidentialDocumentTypeIds.forEach((id) => validatePositiveInteger(id, "presidentialDocumentTypeIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[presidential_document_type_id]", conditions.presidentialDocumentTypeIds);
    }

    if (conditions.smallEntities !== undefined) {
      validateStringArrayFilter(conditions.smallEntities, "smallEntities");
      QuerySerializer.appendEntry(entries, "conditions[small_entities]", conditions.smallEntities);
    }

    if (conditions.smallEntityIds !== undefined) {
      if (Array.isArray(conditions.smallEntityIds)) {
        conditions.smallEntityIds.forEach((id) => validatePositiveInteger(id, "smallEntityIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[small_entity_ids]", conditions.smallEntityIds);
    }

    if (conditions.docketId !== undefined) {
      validateNonBlankString(conditions.docketId, "docketId");
      entries.push({ key: "conditions[docket_id]", value: conditions.docketId });
    }

    if (conditions.significant !== undefined) {
      validateBooleanQuery(conditions.significant, "conditions.significant");
      QuerySerializer.appendEntry(entries, "conditions[significant]", conditions.significant);
    }

    if (conditions.acceptingComments !== undefined) {
      validateBooleanQuery(conditions.acceptingComments, "conditions.acceptingComments");
      QuerySerializer.appendEntry(entries, "conditions[accepting_comments_on_regulations_dot_gov]", conditions.acceptingComments);
    }

    if (conditions.correction !== undefined) {
      validateBooleanQuery(conditions.correction, "conditions.correction");
      QuerySerializer.appendEntry(entries, "conditions[correction]", conditions.correction);
    }

    if (conditions.near !== undefined) {
      const near = validateNearCondition(conditions.near, "conditions.near");
      entries.push({ key: "conditions[near][location]", value: near.location });
      if (near.within !== undefined) {
        entries.push({ key: "conditions[near][within]", value: String(near.within) });
      }
    }

    if (conditions.publicationDate !== undefined) {
      QuerySerializer.serializeDateCondition("publication_date", conditions.publicationDate, entries);
    }

    if (conditions.signingDate !== undefined) {
      QuerySerializer.serializeDateCondition("signing_date", conditions.signingDate, entries);
    }

    if (conditions.effectiveDate !== undefined) {
      QuerySerializer.serializeDateCondition("effective_date", conditions.effectiveDate, entries);
    }

    if (conditions.commentDate !== undefined) {
      QuerySerializer.serializeDateCondition("comment_date", conditions.commentDate, entries);
    }

    if (conditions.cfr !== undefined) {
      const cfr = validateCfrCondition(conditions.cfr, "conditions.cfr");
      entries.push({ key: "conditions[cfr][title]", value: String(cfr.title) });
      if (cfr.part !== undefined) {
        entries.push({ key: "conditions[cfr][part]", value: String(cfr.part) });
      }
    }

    if (conditions.searchTypeId !== undefined) {
      const stId = validateSearchTypeId(conditions.searchTypeId, "searchTypeId");
      entries.push({ key: "conditions[search_type_id]", value: String(stId) });
    }
  }

  public static serializeDateCondition(
    wireFieldName: string,
    cond: DateCondition,
    entries: SerializedQueryEntry[]
  ): void {
    validateDateCondition(cond, "conditions." + wireFieldName);
    if (cond.is !== undefined) {
      entries.push({ key: "conditions[" + wireFieldName + "][is]", value: cond.is });
    } else if (cond.year !== undefined) {
      entries.push({ key: "conditions[" + wireFieldName + "][year]", value: String(cond.year) });
    } else {
      if (cond.gte !== undefined) {
        entries.push({ key: "conditions[" + wireFieldName + "][gte]", value: cond.gte });
      }
      if (cond.lte !== undefined) {
        entries.push({ key: "conditions[" + wireFieldName + "][lte]", value: cond.lte });
      }
    }
  }

  public static serializeDocumentSearchParams(params: DocumentSearchParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "DocumentSearchParams");
    validateUnknownKeys(params, DOCUMENT_SEARCH_PARAMS_KEYS, "DocumentSearchParams", true);
    const raw = params as Record<string, any>;
    if ("term" in raw || "q" in raw) {
      throw new RequestValidationError("Top-level term or q is forbidden on DocumentSearchParams. Full-text search belongs in conditions.term.", "term");
    }

    const entries: SerializedQueryEntry[] = [];

    if (params.page !== undefined) {
      validatePageNumber(params.page, "page");
      entries.push({ key: "page", value: String(params.page) });
    }

    if (params.perPage !== undefined) {
      validatePerPage(params.perPage, "perPage");
      entries.push({ key: "per_page", value: String(params.perPage) });
    }

    if (params.order !== undefined) {
      const order = normalizeAndValidateOrder(params.order, "order");
      entries.push({ key: "order", value: order });
    }

    if (params.fields !== undefined) {
      validateFields<DocumentField>(params.fields, DOCUMENT_FIELDS, "Document");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }

    if (params.metadataOnly !== undefined) {
      validateTrueOnlyFlag(params.metadataOnly, "metadataOnly");
      entries.push({ key: "metadata_only", value: "1" });
    }

    if (params.includePre1994Docs !== undefined) {
      validateTrueOnlyFlag(params.includePre1994Docs, "includePre1994Docs");
      entries.push({ key: "include_pre_1994_docs", value: "true" });
    }

    if (params.conditions !== undefined) {
      QuerySerializer.serializeDocumentConditions(params.conditions, entries);
    }

    return entries;
  }

  public static serializeDocumentSearchCsvParams(params: DocumentSearchCsvParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "DocumentSearchCsvParams");
    const raw = params as Record<string, any>;
    if ("metadataOnly" in raw && raw.metadataOnly !== undefined) {
      throw new RequestValidationError("metadataOnly is invalid for Document CSV search requests.", "metadataOnly");
    }

    const isEoBranch =
      params.conditions &&
      "presidentialDocumentType" in params.conditions &&
      (params.conditions as any).presidentialDocumentType === "executive_order";

    if (isEoBranch) {
      validateUnknownKeys(params, EXECUTIVE_ORDER_CSV_SEARCH_PARAMS_KEYS, "ExecutiveOrderCsvSearchParams");
      validateUnknownKeys(params.conditions, EXECUTIVE_ORDER_CSV_CONDITIONS_KEYS, "ExecutiveOrderCsvConditions");
    } else {
      validateUnknownKeys(params, DOCUMENT_SEARCH_PARAMS_KEYS, "DocumentSearchCsvParams");
    }

    const entries: SerializedQueryEntry[] = [];

    if (params.page !== undefined) {
      validatePageNumber(params.page, "page");
      entries.push({ key: "page", value: String(params.page) });
    }

    if (params.perPage !== undefined) {
      if (isEoBranch) {
        validateExecutiveOrderCsvPerPage(params.perPage, "perPage");
      } else {
        validatePerPage(params.perPage, "perPage");
      }
      entries.push({ key: "per_page", value: String(params.perPage) });
    }

    if (params.order !== undefined) {
      const order = normalizeAndValidateOrder(params.order, "order");
      entries.push({ key: "order", value: order });
    }

    if (params.fields !== undefined) {
      validateFields<DocumentField>(params.fields, DOCUMENT_FIELDS, "Document");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }

    if (params.includePre1994Docs !== undefined) {
      validateTrueOnlyFlag(params.includePre1994Docs, "includePre1994Docs");
      entries.push({ key: "include_pre_1994_docs", value: "true" });
    }

    if (params.conditions !== undefined) {
      if (isEoBranch) {
        entries.push({ key: "conditions[presidential_document_type]", value: "executive_order" });
        const { presidentialDocumentType, ...restConditions } = params.conditions as any;
        QuerySerializer.serializeDocumentConditions(restConditions, entries);
      } else {
        QuerySerializer.serializeDocumentConditions(params.conditions as DocumentSearchConditions, entries);
      }
    }

    return entries;
  }

  public static serializeDocumentSearchRssParams(params: DocumentSearchRssParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "DocumentSearchRssParams");
    validateUnknownKeys(params, DOCUMENT_SEARCH_RSS_PARAMS_KEYS, "DocumentSearchRssParams");
    const entries: SerializedQueryEntry[] = [];
    if (params.includePre1994Docs !== undefined) {
      validateTrueOnlyFlag(params.includePre1994Docs, "includePre1994Docs");
      entries.push({ key: "include_pre_1994_docs", value: "true" });
    }
    if (params.conditions !== undefined) {
      QuerySerializer.serializeDocumentConditions(params.conditions, entries);
    }
    return entries;
  }

  public static serializeDocumentFindQuery(params: DocumentFindParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "DocumentFindParams");
    validateUnknownKeys(params, DOCUMENT_FIND_PARAMS_KEYS, "DocumentFindParams", true);
    validateNonBlankString(params.documentNumber, "documentNumber");
    const entries: SerializedQueryEntry[] = [];
    if (params.publicationDate !== undefined) {
      validateIsoDateString(params.publicationDate, "publicationDate");
      entries.push({ key: "publication_date", value: params.publicationDate });
    }
    if (params.fields !== undefined) {
      validateFields<DocumentField>(params.fields, DOCUMENT_FIELDS, "Document");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return entries;
  }

  public static serializeDocumentFindMany(params: DocumentFindManyParams): {
    pathSegment: string;
    entries: SerializedQueryEntry[];
  } {
    validateRequiredParams(params, "DocumentFindManyParams");
    validateUnknownKeys(params, DOCUMENT_FIND_MANY_PARAMS_KEYS, "DocumentFindManyParams", true);
    const docNumbers = validateNonEmptyArray<string>(params.documentNumbers, "documentNumbers");
    docNumbers.forEach((d) => validateNonBlankString(d, "documentNumber"));
    const pathSegment = docNumbers.join(",");
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<DocumentField>(params.fields, DOCUMENT_FIELDS, "Document");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return { pathSegment, entries };
  }

  public static serializeDocumentCitationFind(params: DocumentCitationFindParams): {
    volume: number;
    page: number;
    entries: SerializedQueryEntry[];
  } {
    validateRequiredParams(params, "DocumentCitationFindParams");
    validateUnknownKeys(params, DOCUMENT_CITATION_FIND_PARAMS_KEYS, "DocumentCitationFindParams", true);
    validateRequiredParams(params.citation, "DocumentCitationFindParams.citation");
    validatePositiveInteger(params.citation.volume, "citation.volume");
    validatePositiveInteger(params.citation.page, "citation.page");
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<DocumentField>(params.fields, DOCUMENT_FIELDS, "Document");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return {
      volume: params.citation.volume,
      page: params.citation.page,
      entries,
    };
  }

  public static serializeDocumentCitationFindMany(params: DocumentCitationFindManyParams): {
    pathSegment: string;
    entries: SerializedQueryEntry[];
  } {
    validateRequiredParams(params, "DocumentCitationFindManyParams");
    validateUnknownKeys(params, DOCUMENT_CITATION_FIND_MANY_PARAMS_KEYS, "DocumentCitationFindManyParams", true);
    const citations = validateNonEmptyArray<FederalRegisterCitation>(params.citations, "citations");
    const formatted = citations.map((c) => {
      validatePositiveInteger(c.volume, "citation.volume");
      validatePositiveInteger(c.page, "citation.page");
      return c.volume + "/" + c.page;
    });
    const pathSegment = formatted.join(",");
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<DocumentField>(params.fields, DOCUMENT_FIELDS, "Document");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return { pathSegment, entries };
  }

  public static serializeDocumentFindCsv(params: DocumentFindCsvParams): {
    pathSegment: string;
    entries: SerializedQueryEntry[];
  } {
    validateRequiredParams(params, "DocumentFindCsvParams");
    validateUnknownKeys(params, DOCUMENT_FIND_CSV_PARAMS_KEYS, "DocumentFindCsvParams");
    const docNumbers = validateNonEmptyArray<string>(params.documentNumbers, "documentNumbers");
    docNumbers.forEach((d) => validateNonBlankString(d, "documentNumber"));
    const pathSegment = docNumbers.join(",");
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<DocumentField>(params.fields, DOCUMENT_FIELDS, "Document");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return { pathSegment, entries };
  }

  public static serializeDocumentAutocompleteParams(params: DocumentAutocompleteParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "DocumentAutocompleteParams");
    validateUnknownKeys(params, DOCUMENT_AUTOCOMPLETE_PARAMS_KEYS, "DocumentAutocompleteParams", true);
    if (typeof params.term !== "string") {
      throw new RequestValidationError("Autocomplete 'term' must be a string.", "term", params.term);
    }
    return [{ key: "conditions[term]", value: params.term }];
  }

  public static serializeDocumentSearchDetailsParams(params: DocumentSearchDetailsParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "DocumentSearchDetailsParams");
    validateUnknownKeys(params, DOCUMENT_SEARCH_DETAILS_PARAMS_KEYS, "DocumentSearchDetailsParams", true);
    const entries: SerializedQueryEntry[] = [];
    if (params.omitSpellingSuggestions !== undefined) {
      validateOrdinaryBoolean(params.omitSpellingSuggestions, "omitSpellingSuggestions");
      entries.push({
        key: "omit_spelling_suggestions",
        value: params.omitSpellingSuggestions ? "1" : "0",
      });
    }
    if (params.conditions !== undefined) {
      QuerySerializer.serializeDocumentConditions(params.conditions, entries);
    }
    return entries;
  }

  public static serializeDocumentFacetParams(params: DocumentFacetParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "DocumentFacetParams");
    validateUnknownKeys(params, DOCUMENT_FACET_PARAMS_KEYS, "DocumentFacetParams", true);
    const entries: SerializedQueryEntry[] = [];
    if (params.conditions !== undefined) {
      QuerySerializer.serializeDocumentConditions(params.conditions, entries);
    }
    return entries;
  }
  public static serializePublicInspectionConditions(
    conditions: PublicInspectionSearchConditions,
    entries: SerializedQueryEntry[]
  ): void {
    validateRequiredParams(conditions, "PublicInspectionSearchConditions");
    validateUnknownKeys(conditions, PUBLIC_INSPECTION_SEARCH_CONDITIONS_KEYS, "PublicInspectionSearchConditions");
    const raw = conditions as Record<string, any>;
    for (const [k, v] of Object.entries(raw)) {
      if (v === null) {
        throw new RequestValidationError(`Null value rejected for condition '${k}'.`, k, v);
      }
    }
    if ("availableOn" in raw || "available_on" in raw) {
      throw new RequestValidationError(
        "availableOn is not an ordinary search condition. It belongs exclusively to fr.publicInspection.availableOn().",
        "availableOn"
      );
    }
    if ("q" in raw) {
      throw new RequestValidationError("Top-level or condition 'q' parameter is forbidden. Canonical term is 'term'.", "q");
    }

    if (conditions.term !== undefined) {
      entries.push({ key: "conditions[term]", value: conditions.term });
    }

    if (conditions.agencies !== undefined) {
      validateStringArrayFilter(conditions.agencies, "agencies");
      QuerySerializer.appendEntry(entries, "conditions[agencies]", conditions.agencies);
    }

    if (conditions.agencyIds !== undefined) {
      if (Array.isArray(conditions.agencyIds)) {
        conditions.agencyIds.forEach((id) => validatePositiveInteger(id, "agencyIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[agency_ids]", conditions.agencyIds);
    }

    if (conditions.types !== undefined) {
      validateStringArrayFilter(conditions.types, "types");
      QuerySerializer.appendEntry(entries, "conditions[type]", conditions.types);
    }

    if (conditions.docketId !== undefined) {
      validateNonBlankString(conditions.docketId, "docketId");
      entries.push({ key: "conditions[docket_id]", value: conditions.docketId });
    }

    if (conditions.documentNumbers !== undefined) {
      validateStringArrayFilter(conditions.documentNumbers, "documentNumbers");
      QuerySerializer.appendEntry(entries, "conditions[document_numbers]", conditions.documentNumbers);
    }

    if (conditions.specialFiling !== undefined) {
      validateBooleanQuery(conditions.specialFiling, "conditions.specialFiling");
      QuerySerializer.appendEntry(entries, "conditions[special_filing]", conditions.specialFiling);
    }

    if (conditions.filedAt !== undefined) {
      QuerySerializer.serializeDateCondition("filed_at", conditions.filedAt, entries);
    }

    if (conditions.searchTypeId !== undefined) {
      const stId = validateSearchTypeId(conditions.searchTypeId, "searchTypeId");
      entries.push({ key: "conditions[search_type_id]", value: String(stId) });
    }
  }

  public static serializePublicInspectionSearchParams(params: PublicInspectionSearchParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "PublicInspectionSearchParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_SEARCH_PARAMS_KEYS, "PublicInspectionSearchParams", true);
    const raw = params as Record<string, any>;
    if ("term" in raw || "q" in raw) {
      throw new RequestValidationError("Top-level term or q is forbidden on PublicInspectionSearchParams.", "term");
    }
    if ("availableOn" in raw || "available_on" in raw) {
      throw new RequestValidationError(
        "availableOn cannot be supplied to ordinary PublicInspectionSearchParams. Use fr.publicInspection.availableOn().",
        "availableOn"
      );
    }

    const entries: SerializedQueryEntry[] = [];

    if (params.page !== undefined) {
      validatePageNumber(params.page, "page");
      entries.push({ key: "page", value: String(params.page) });
    }

    if (params.perPage !== undefined) {
      validatePerPage(params.perPage, "perPage");
      entries.push({ key: "per_page", value: String(params.perPage) });
    }

    if (params.fields !== undefined) {
      validateFields<PublicInspectionField>(params.fields, PUBLIC_INSPECTION_FIELDS, "PublicInspection");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }

    if (params.metadataOnly !== undefined) {
      validateTrueOnlyFlag(params.metadataOnly, "metadataOnly");
      entries.push({ key: "metadata_only", value: "1" });
    }

    if (params.conditions !== undefined) {
      QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
    }

    return entries;
  }

  public static serializePublicInspectionAvailableOnParams(params: PublicInspectionAvailableOnParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "PublicInspectionAvailableOnParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_AVAILABLE_ON_PARAMS_KEYS, "PublicInspectionAvailableOnParams", true);
    validateIsoDateString(params.availableOn, "availableOn");
    const entries: SerializedQueryEntry[] = [
      { key: "conditions[available_on]", value: params.availableOn },
    ];
    if (params.fields !== undefined) {
      validateFields<PublicInspectionField>(params.fields, PUBLIC_INSPECTION_FIELDS, "PublicInspection");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return entries;
  }

  public static serializePublicInspectionCurrentParams(params: PublicInspectionCurrentParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "PublicInspectionCurrentParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_CURRENT_PARAMS_KEYS, "PublicInspectionCurrentParams", true);
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<PublicInspectionField>(params.fields, PUBLIC_INSPECTION_FIELDS, "PublicInspection");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return entries;
  }

  public static serializePublicInspectionCurrentCsvParams(params: PublicInspectionCurrentCsvParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "PublicInspectionCurrentCsvParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_CURRENT_CSV_PARAMS_KEYS, "PublicInspectionCurrentCsvParams");
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<PublicInspectionField>(params.fields, PUBLIC_INSPECTION_FIELDS, "PublicInspection");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return entries;
  }

  public static serializePublicInspectionFindQuery(params: PublicInspectionFindParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "PublicInspectionFindParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_FIND_PARAMS_KEYS, "PublicInspectionFindParams", true);
    validateNonBlankString(params.documentNumber, "documentNumber");
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<PublicInspectionField>(params.fields, PUBLIC_INSPECTION_FIELDS, "PublicInspection");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return entries;
  }

  public static serializePublicInspectionFindMany(params: PublicInspectionFindManyParams): {
    pathSegment: string;
    entries: SerializedQueryEntry[];
  } {
    validateRequiredParams(params, "PublicInspectionFindManyParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_FIND_MANY_PARAMS_KEYS, "PublicInspectionFindManyParams", true);
    const docNumbers = validateNonEmptyArray<string>(params.documentNumbers, "documentNumbers");
    docNumbers.forEach((d) => validateNonBlankString(d, "documentNumber"));
    const pathSegment = docNumbers.join(",");
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<PublicInspectionField>(params.fields, PUBLIC_INSPECTION_FIELDS, "PublicInspection");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return { pathSegment, entries };
  }

  public static serializePublicInspectionSearchCsvParams(params: PublicInspectionSearchCsvParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "PublicInspectionSearchCsvParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_SEARCH_CSV_PARAMS_KEYS, "PublicInspectionSearchCsvParams");
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<PublicInspectionField>(params.fields, PUBLIC_INSPECTION_FIELDS, "PublicInspection");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    if (params.conditions !== undefined) {
      QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
    }
    return entries;
  }

  public static serializePublicInspectionSearchConditionsOnly(params: {
    conditions?: PublicInspectionSearchConditions;
  }): SerializedQueryEntry[] {
    validateRequiredParams(params, "PublicInspectionSearchRssParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_SEARCH_RSS_PARAMS_KEYS, "PublicInspectionSearchRssParams");
    const entries: SerializedQueryEntry[] = [];
    if (params.conditions !== undefined) {
      QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
    }
    return entries;
  }

  public static serializePublicInspectionSearchDetailsParams(params: PublicInspectionSearchDetailsParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "PublicInspectionSearchDetailsParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_SEARCH_DETAILS_PARAMS_KEYS, "PublicInspectionSearchDetailsParams", true);
    const entries: SerializedQueryEntry[] = [];
    if (params.conditions !== undefined) {
      QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
    }
    return entries;
  }

  public static serializePublicInspectionFacetParams(params: PublicInspectionFacetParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "PublicInspectionFacetParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_FACET_PARAMS_KEYS, "PublicInspectionFacetParams", true);
    const entries: SerializedQueryEntry[] = [];
    if (params.conditions !== undefined) {
      QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
    }
    return entries;
  }

  public static serializePublicInspectionIssueDailyFacetParams(
    params: PublicInspectionIssueDailyFacetParams
  ): SerializedQueryEntry[] {
    validateRequiredParams(params, "PublicInspectionIssueDailyFacetParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_ISSUE_DAILY_FACET_PARAMS_KEYS, "PublicInspectionIssueDailyFacetParams", true);
    if (!params.publicationDate || !params.publicationDate.gte) {
      throw new RequestValidationError(
        "PublicInspectionIssueDailyFacetParams requires publicationDate.gte condition.",
        "publicationDate.gte"
      );
    }
    validateIsoDateString(params.publicationDate.gte, "publicationDate.gte");
    return [{ key: "conditions[publication_date][gte]", value: params.publicationDate.gte }];
  }

  public static serializePublicInspectionIssueTypeFacetParams(
    params: PublicInspectionIssueTypeFacetParams
  ): SerializedQueryEntry[] {
    validateRequiredParams(params, "PublicInspectionIssueTypeFacetParams");
    validateUnknownKeys(params, PUBLIC_INSPECTION_ISSUE_TYPE_FACET_PARAMS_KEYS, "PublicInspectionIssueTypeFacetParams", true);
    if (!params.publicationDate || !params.publicationDate.is) {
      throw new RequestValidationError(
        "PublicInspectionIssueTypeFacetParams requires publicationDate.is condition.",
        "publicationDate.is"
      );
    }
    validateIsoDateString(params.publicationDate.is, "publicationDate.is");
    return [{ key: "conditions[publication_date][is]", value: params.publicationDate.is }];
  }

  public static serializeAgencyListParams(params: AgencyListParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "AgencyListParams");
    validateUnknownKeys(params, AGENCY_LIST_PARAMS_KEYS, "AgencyListParams", true);
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<AgencyField>(params.fields, AGENCY_FIELDS, "Agency");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return entries;
  }

  public static serializeAgencyFind(params: AgencyFindParams): {
    pathSegment: string;
    entries: SerializedQueryEntry[];
  } {
    validateRequiredParams(params, "AgencyFindParams");
    validateUnknownKeys(params, AGENCY_FIND_PARAMS_KEYS, "AgencyFindParams", true);
    let pathSegment: string;
    if (typeof params.idOrSlug === "number") {
      validatePositiveInteger(params.idOrSlug, "idOrSlug");
      pathSegment = String(params.idOrSlug);
    } else {
      validateNonBlankString(params.idOrSlug, "idOrSlug");
      pathSegment = params.idOrSlug;
    }
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<AgencyField>(params.fields, AGENCY_FIELDS, "Agency");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return { pathSegment, entries };
  }

  public static serializeAgencyFindMany(params: AgencyFindManyParams): {
    pathSegment: string;
    entries: SerializedQueryEntry[];
  } {
    validateRequiredParams(params, "AgencyFindManyParams");
    validateUnknownKeys(params, AGENCY_FIND_MANY_PARAMS_KEYS, "AgencyFindManyParams", true);
    const ids = validateNonEmptyArray<number>(params.ids, "ids");
    ids.forEach((id) => validatePositiveInteger(id, "id"));
    const pathSegment = ids.join(",");
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<AgencyField>(params.fields, AGENCY_FIELDS, "Agency");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return { pathSegment, entries };
  }

  public static serializeAgencySuggestionsParams(params: AgencySuggestionsParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "AgencySuggestionsParams");
    validateUnknownKeys(params, AGENCY_SUGGESTIONS_PARAMS_KEYS, "AgencySuggestionsParams", true);
    if (typeof params.term !== "string") {
      throw new RequestValidationError("Agency suggestions 'term' must be a string.", "term", params.term);
    }
    const entries: SerializedQueryEntry[] = [{ key: "conditions[term]", value: params.term }];
    if (params.fields !== undefined) {
      validateFields<AgencyField>(params.fields, AGENCY_FIELDS, "Agency");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return entries;
  }

  public static serializeTopicSuggestionsParams(params: TopicSuggestionsParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "TopicSuggestionsParams");
    validateUnknownKeys(params, TOPIC_SUGGESTIONS_PARAMS_KEYS, "TopicSuggestionsParams", true);
    if (typeof params.term !== "string") {
      throw new RequestValidationError("Topic suggestions 'term' must be a string.", "term", params.term);
    }
    const entries: SerializedQueryEntry[] = [{ key: "conditions[term]", value: params.term }];
    if (params.fields !== undefined) {
      validateFields<TopicField>(params.fields, TOPIC_FIELDS, "Topic");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return entries;
  }

  public static serializeSuggestedSearchSectionsParams(params: SuggestedSearchSectionsParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "SuggestedSearchSectionsParams");
    validateUnknownKeys(params, SUGGESTED_SEARCH_SECTIONS_PARAMS_KEYS, "SuggestedSearchSectionsParams", true);
    if (!Array.isArray(params.sections) || params.sections.length === 0) {
      throw new RequestValidationError("SuggestedSearchSectionsParams requires a non-empty sections array.", "sections");
    }
    const entries: SerializedQueryEntry[] = [];
    QuerySerializer.appendEntry(entries, "conditions[sections]", params.sections);
    return entries;
  }

  public static serializeSuggestedSearchFind(params: SuggestedSearchFindParams): string {
    validateRequiredParams(params, "SuggestedSearchFindParams");
    validateUnknownKeys(params, SUGGESTED_SEARCH_FIND_PARAMS_KEYS, "SuggestedSearchFindParams", true);
    return validateNonBlankString(params.slug, "slug");
  }

  public static serializeEffectiveDatesParams(params: EffectiveDatesParams): SerializedQueryEntry[] {
    validateRequiredParams(params, "EffectiveDatesParams");
    validateUnknownKeys(params, EFFECTIVE_DATES_PARAMS_KEYS, "EffectiveDatesParams", true);
    validateEffectiveDatesRange(params.startDate, params.endDate);
    return [
      { key: "start_date", value: params.startDate },
      { key: "end_date", value: params.endDate },
    ];
  }

  public static serializeIssueFind(params: IssueFindParams): string {
    validateRequiredParams(params, "IssueFindParams");
    validateUnknownKeys(params, ISSUE_FIND_PARAMS_KEYS, "IssueFindParams", true);
    return validateIsoDateString(params.publicationDate, "publicationDate");
  }

  public static serializeImageFind(params: ImageFindParams): string {
    validateRequiredParams(params, "ImageFindParams");
    validateUnknownKeys(params, IMAGE_FIND_PARAMS_KEYS, "ImageFindParams", true);
    return validateNonBlankString(params.identifier, "identifier");
  }

  public static serializeSiteNotificationFind(params: SiteNotificationFindParams): string {
    validateRequiredParams(params, "SiteNotificationFindParams");
    validateUnknownKeys(params, SITE_NOTIFICATION_FIND_PARAMS_KEYS, "SiteNotificationFindParams", true);
    return validateNonBlankString(params.identifier, "identifier");
  }

  public static serializeJsonpCallback(callback: any, entries: SerializedQueryEntry[]): void {
    const validCb = validateJsonpCallback(callback, "callback");
    entries.push({ key: "callback", value: validCb });
  }
}
