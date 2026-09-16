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
      QuerySerializer.appendEntry(entries, "conditions[agencies]", conditions.agencies);
    }

    if (conditions.agencyIds !== undefined) {
      if (Array.isArray(conditions.agencyIds)) {
        conditions.agencyIds.forEach((id) => validatePositiveInteger(id, "agencyIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[agency_ids]", conditions.agencyIds);
    }

    if (conditions.citingDocumentNumbers !== undefined) {
      QuerySerializer.appendEntry(entries, "conditions[citing_document_numbers]", conditions.citingDocumentNumbers);
    }

    if (conditions.documentNumbers !== undefined) {
      QuerySerializer.appendEntry(entries, "conditions[document_numbers]", conditions.documentNumbers);
    }

    if (conditions.executiveOrderNumbers !== undefined) {
      QuerySerializer.appendEntry(entries, "conditions[executive_order_numbers]", conditions.executiveOrderNumbers);
    }

    if (conditions.presidents !== undefined) {
      QuerySerializer.appendEntry(entries, "conditions[president]", conditions.presidents);
    }

    if (conditions.sections !== undefined) {
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
      QuerySerializer.appendEntry(entries, "conditions[topics]", conditions.topics);
    }

    if (conditions.topicIds !== undefined) {
      if (Array.isArray(conditions.topicIds)) {
        conditions.topicIds.forEach((id) => validatePositiveInteger(id, "topicIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[topic_ids]", conditions.topicIds);
    }

    if (conditions.types !== undefined) {
      QuerySerializer.appendEntry(entries, "conditions[type]", conditions.types);
    }

    if (conditions.noticeTypes !== undefined) {
      QuerySerializer.appendEntry(entries, "conditions[notice_type]", conditions.noticeTypes);
    }

    if (conditions.noticeTypeIds !== undefined) {
      if (Array.isArray(conditions.noticeTypeIds)) {
        conditions.noticeTypeIds.forEach((id) => validatePositiveInteger(id, "noticeTypeIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[notice_type_id]", conditions.noticeTypeIds);
    }

    if (conditions.presidentialDocumentTypes !== undefined) {
      QuerySerializer.appendEntry(entries, "conditions[presidential_document_type]", conditions.presidentialDocumentTypes);
    }

    if (conditions.presidentialDocumentTypeIds !== undefined) {
      if (Array.isArray(conditions.presidentialDocumentTypeIds)) {
        conditions.presidentialDocumentTypeIds.forEach((id) => validatePositiveInteger(id, "presidentialDocumentTypeIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[presidential_document_type_id]", conditions.presidentialDocumentTypeIds);
    }

    if (conditions.smallEntities !== undefined) {
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
      QuerySerializer.appendEntry(entries, "conditions[significant]", conditions.significant);
    }

    if (conditions.acceptingComments !== undefined) {
      QuerySerializer.appendEntry(entries, "conditions[accepting_comments_on_regulations_dot_gov]", conditions.acceptingComments);
    }

    if (conditions.correction !== undefined) {
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

    if (params.metadataOnly === true) {
      entries.push({ key: "metadata_only", value: "1" });
    }

    if (params.includePre1994Docs === true) {
      entries.push({ key: "include_pre_1994_docs", value: "true" });
    }

    if (params.conditions !== undefined) {
      QuerySerializer.serializeDocumentConditions(params.conditions, entries);
    }

    return entries;
  }

  public static serializeDocumentSearchCsvParams(params: DocumentSearchCsvParams): SerializedQueryEntry[] {
    const raw = params as Record<string, any>;
    if ("metadataOnly" in raw && raw.metadataOnly !== undefined) {
      throw new RequestValidationError("metadataOnly is invalid for Document CSV search requests.", "metadataOnly");
    }

    const isEoBranch =
      params.conditions &&
      "presidentialDocumentType" in params.conditions &&
      (params.conditions as any).presidentialDocumentType === "executive_order";

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

    if (params.includePre1994Docs === true) {
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
    const entries: SerializedQueryEntry[] = [];
    if (params.includePre1994Docs === true) {
      entries.push({ key: "include_pre_1994_docs", value: "true" });
    }
    if (params.conditions !== undefined) {
      QuerySerializer.serializeDocumentConditions(params.conditions, entries);
    }
    return entries;
  }

  public static serializeDocumentFindQuery(params: DocumentFindParams): SerializedQueryEntry[] {
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
    if (typeof params.term !== "string") {
      throw new RequestValidationError("Autocomplete 'term' must be a string.", "term", params.term);
    }
    return [{ key: "conditions[term]", value: params.term }];
  }

  public static serializeDocumentSearchDetailsParams(params: DocumentSearchDetailsParams): SerializedQueryEntry[] {
    const entries: SerializedQueryEntry[] = [];
    if (params.omitSpellingSuggestions !== undefined) {
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
      QuerySerializer.appendEntry(entries, "conditions[agencies]", conditions.agencies);
    }

    if (conditions.agencyIds !== undefined) {
      if (Array.isArray(conditions.agencyIds)) {
        conditions.agencyIds.forEach((id) => validatePositiveInteger(id, "agencyIds"));
      }
      QuerySerializer.appendEntry(entries, "conditions[agency_ids]", conditions.agencyIds);
    }

    if (conditions.types !== undefined) {
      QuerySerializer.appendEntry(entries, "conditions[type]", conditions.types);
    }

    if (conditions.docketId !== undefined) {
      validateNonBlankString(conditions.docketId, "docketId");
      entries.push({ key: "conditions[docket_id]", value: conditions.docketId });
    }

    if (conditions.documentNumbers !== undefined) {
      QuerySerializer.appendEntry(entries, "conditions[document_numbers]", conditions.documentNumbers);
    }

    if (conditions.specialFiling !== undefined) {
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

    if (params.metadataOnly === true) {
      entries.push({ key: "metadata_only", value: "1" });
    }

    if (params.conditions !== undefined) {
      QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
    }

    return entries;
  }

  public static serializePublicInspectionAvailableOnParams(params: PublicInspectionAvailableOnParams): SerializedQueryEntry[] {
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
    const entries: SerializedQueryEntry[] = [];
    if (params.fields !== undefined) {
      validateFields<PublicInspectionField>(params.fields, PUBLIC_INSPECTION_FIELDS, "PublicInspection");
      QuerySerializer.appendEntry(entries, "fields", params.fields);
    }
    return entries;
  }

  public static serializePublicInspectionFindQuery(params: PublicInspectionFindParams): SerializedQueryEntry[] {
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
    const entries: SerializedQueryEntry[] = [];
    if (params.conditions !== undefined) {
      QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
    }
    return entries;
  }

  public static serializePublicInspectionFacetParams(params: PublicInspectionFacetParams): SerializedQueryEntry[] {
    const entries: SerializedQueryEntry[] = [];
    if (params.conditions !== undefined) {
      QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
    }
    return entries;
  }

  public static serializePublicInspectionIssueDailyFacetParams(
    params: PublicInspectionIssueDailyFacetParams
  ): SerializedQueryEntry[] {
    if (!params || !params.publicationDate || !params.publicationDate.gte) {
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
    if (!params || !params.publicationDate || !params.publicationDate.is) {
      throw new RequestValidationError(
        "PublicInspectionIssueTypeFacetParams requires publicationDate.is condition.",
        "publicationDate.is"
      );
    }
    validateIsoDateString(params.publicationDate.is, "publicationDate.is");
    return [{ key: "conditions[publication_date][is]", value: params.publicationDate.is }];
  }

  public static serializeAgencyListParams(params: AgencyListParams): SerializedQueryEntry[] {
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
    if (!Array.isArray(params.sections) || params.sections.length === 0) {
      throw new RequestValidationError("SuggestedSearchSectionsParams requires a non-empty sections array.", "sections");
    }
    const entries: SerializedQueryEntry[] = [];
    QuerySerializer.appendEntry(entries, "conditions[sections]", params.sections);
    return entries;
  }

  public static serializeSuggestedSearchFind(params: SuggestedSearchFindParams): string {
    return validateNonBlankString(params.slug, "slug");
  }

  public static serializeEffectiveDatesParams(params: EffectiveDatesParams): SerializedQueryEntry[] {
    validateEffectiveDatesRange(params.startDate, params.endDate);
    return [
      { key: "start_date", value: params.startDate },
      { key: "end_date", value: params.endDate },
    ];
  }

  public static serializeIssueFind(params: IssueFindParams): string {
    return validateIsoDateString(params.publicationDate, "publicationDate");
  }

  public static serializeImageFind(params: ImageFindParams): string {
    return validateNonBlankString(params.identifier, "identifier");
  }

  public static serializeSiteNotificationFind(params: SiteNotificationFindParams): string {
    return validateNonBlankString(params.identifier, "identifier");
  }
}
