"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuerySerializer = void 0;
const validation_1 = require("./validation");
class QuerySerializer {
    static appendEntry(entries, key, val) {
        if (val === undefined)
            return;
        if (val === null) {
            throw new validation_1.RequestValidationError("Null value rejected for query parameter '" + key + "'.", key, val);
        }
        if (Array.isArray(val)) {
            if (val.length === 0)
                return;
            for (let i = 0; i < val.length; i++) {
                const item = val[i];
                if (item === null || item === undefined) {
                    throw new validation_1.RequestValidationError("Null or undefined array element rejected at index " + i + " for key '" + key + "'.", key, val);
                }
                if (typeof item === "object") {
                    throw new validation_1.RequestValidationError("Complex nested object inside array rejected for key '" + key + "'.", key, item);
                }
                entries.push({ key: key + "[]", value: String(item) });
            }
        }
        else if (typeof val === "boolean") {
            entries.push({ key, value: val ? "1" : "0" });
        }
        else if (typeof val === "object") {
            for (const [subKey, subVal] of Object.entries(val)) {
                if (subVal !== undefined) {
                    QuerySerializer.appendEntry(entries, key + "[" + subKey + "]", subVal);
                }
            }
        }
        else {
            entries.push({ key, value: String(val) });
        }
    }
    static toQueryString(entries) {
        if (entries.length === 0)
            return "";
        return entries
            .map((entry) => {
            const encodedKey = encodeURIComponent(entry.key);
            const encodedVal = encodeURIComponent(entry.value);
            return encodedKey + "=" + encodedVal;
        })
            .join("&");
    }
    static serializeDocumentConditions(conditions, entries) {
        (0, validation_1.validateRequiredParams)(conditions, "DocumentSearchConditions");
        (0, validation_1.validateUnknownKeys)(conditions, validation_1.DOCUMENT_SEARCH_CONDITIONS_KEYS, "DocumentSearchConditions");
        const raw = conditions;
        for (const [k, v] of Object.entries(raw)) {
            if (v === null) {
                throw new validation_1.RequestValidationError(`Null value rejected for condition '${k}'.`, k, v);
            }
        }
        if ("q" in raw) {
            throw new validation_1.RequestValidationError("Top-level or condition 'q' parameter is forbidden. Canonical term is 'term'.", "q");
        }
        if (conditions.term !== undefined) {
            if (typeof conditions.term !== "string") {
                throw new validation_1.RequestValidationError("conditions.term must be a string.", "term", conditions.term);
            }
            entries.push({ key: "conditions[term]", value: conditions.term });
        }
        if (conditions.regulationIdNumber !== undefined) {
            (0, validation_1.validateNonBlankString)(conditions.regulationIdNumber, "regulationIdNumber");
            entries.push({ key: "conditions[regulation_id_number]", value: conditions.regulationIdNumber });
        }
        if (conditions.agencies !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.agencies, "agencies");
            QuerySerializer.appendEntry(entries, "conditions[agencies]", conditions.agencies);
        }
        if (conditions.agencyIds !== undefined) {
            if (Array.isArray(conditions.agencyIds)) {
                conditions.agencyIds.forEach((id) => (0, validation_1.validatePositiveInteger)(id, "agencyIds"));
            }
            QuerySerializer.appendEntry(entries, "conditions[agency_ids]", conditions.agencyIds);
        }
        if (conditions.citingDocumentNumbers !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.citingDocumentNumbers, "citingDocumentNumbers");
            QuerySerializer.appendEntry(entries, "conditions[citing_document_numbers]", conditions.citingDocumentNumbers);
        }
        if (conditions.documentNumbers !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.documentNumbers, "documentNumbers");
            QuerySerializer.appendEntry(entries, "conditions[document_numbers]", conditions.documentNumbers);
        }
        if (conditions.executiveOrderNumbers !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.executiveOrderNumbers, "executiveOrderNumbers");
            QuerySerializer.appendEntry(entries, "conditions[executive_order_numbers]", conditions.executiveOrderNumbers);
        }
        if (conditions.presidents !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.presidents, "presidents");
            QuerySerializer.appendEntry(entries, "conditions[president]", conditions.presidents);
        }
        if (conditions.sections !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.sections, "sections");
            QuerySerializer.appendEntry(entries, "conditions[sections]", conditions.sections);
        }
        if (conditions.sectionIds !== undefined) {
            if (Array.isArray(conditions.sectionIds)) {
                conditions.sectionIds.forEach((id) => (0, validation_1.validatePositiveInteger)(id, "sectionIds"));
            }
            QuerySerializer.appendEntry(entries, "conditions[section_ids]", conditions.sectionIds);
        }
        if (conditions.volume !== undefined) {
            (0, validation_1.validatePositiveInteger)(conditions.volume, "volume");
            entries.push({ key: "conditions[volume]", value: String(conditions.volume) });
        }
        if (conditions.topics !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.topics, "topics");
            QuerySerializer.appendEntry(entries, "conditions[topics]", conditions.topics);
        }
        if (conditions.topicIds !== undefined) {
            if (Array.isArray(conditions.topicIds)) {
                conditions.topicIds.forEach((id) => (0, validation_1.validatePositiveInteger)(id, "topicIds"));
            }
            QuerySerializer.appendEntry(entries, "conditions[topic_ids]", conditions.topicIds);
        }
        if (conditions.types !== undefined) {
            (0, validation_1.validateDocumentTypeCodes)(conditions.types, "conditions.types");
            QuerySerializer.appendEntry(entries, "conditions[type]", conditions.types);
        }
        if (conditions.noticeTypes !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.noticeTypes, "noticeTypes");
            QuerySerializer.appendEntry(entries, "conditions[notice_type]", conditions.noticeTypes);
        }
        if (conditions.noticeTypeIds !== undefined) {
            if (Array.isArray(conditions.noticeTypeIds)) {
                conditions.noticeTypeIds.forEach((id) => (0, validation_1.validatePositiveInteger)(id, "noticeTypeIds"));
            }
            QuerySerializer.appendEntry(entries, "conditions[notice_type_id]", conditions.noticeTypeIds);
        }
        if (conditions.presidentialDocumentTypes !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.presidentialDocumentTypes, "presidentialDocumentTypes");
            QuerySerializer.appendEntry(entries, "conditions[presidential_document_type]", conditions.presidentialDocumentTypes);
        }
        if (conditions.presidentialDocumentTypeIds !== undefined) {
            if (Array.isArray(conditions.presidentialDocumentTypeIds)) {
                conditions.presidentialDocumentTypeIds.forEach((id) => (0, validation_1.validatePositiveInteger)(id, "presidentialDocumentTypeIds"));
            }
            QuerySerializer.appendEntry(entries, "conditions[presidential_document_type_id]", conditions.presidentialDocumentTypeIds);
        }
        if (conditions.smallEntities !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.smallEntities, "smallEntities");
            QuerySerializer.appendEntry(entries, "conditions[small_entities]", conditions.smallEntities);
        }
        if (conditions.smallEntityIds !== undefined) {
            if (Array.isArray(conditions.smallEntityIds)) {
                conditions.smallEntityIds.forEach((id) => (0, validation_1.validatePositiveInteger)(id, "smallEntityIds"));
            }
            QuerySerializer.appendEntry(entries, "conditions[small_entity_ids]", conditions.smallEntityIds);
        }
        if (conditions.docketId !== undefined) {
            (0, validation_1.validateNonBlankString)(conditions.docketId, "docketId");
            entries.push({ key: "conditions[docket_id]", value: conditions.docketId });
        }
        if (conditions.significant !== undefined) {
            (0, validation_1.validateBooleanQuery)(conditions.significant, "conditions.significant");
            QuerySerializer.appendEntry(entries, "conditions[significant]", conditions.significant);
        }
        if (conditions.acceptingComments !== undefined) {
            (0, validation_1.validateBooleanQuery)(conditions.acceptingComments, "conditions.acceptingComments");
            QuerySerializer.appendEntry(entries, "conditions[accepting_comments_on_regulations_dot_gov]", conditions.acceptingComments);
        }
        if (conditions.correction !== undefined) {
            (0, validation_1.validateBooleanQuery)(conditions.correction, "conditions.correction");
            QuerySerializer.appendEntry(entries, "conditions[correction]", conditions.correction);
        }
        if (conditions.near !== undefined) {
            const near = (0, validation_1.validateNearCondition)(conditions.near, "conditions.near");
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
            const cfr = (0, validation_1.validateCfrCondition)(conditions.cfr, "conditions.cfr");
            entries.push({ key: "conditions[cfr][title]", value: String(cfr.title) });
            if (cfr.part !== undefined) {
                entries.push({ key: "conditions[cfr][part]", value: String(cfr.part) });
            }
        }
        if (conditions.searchTypeId !== undefined) {
            const stId = (0, validation_1.validateSearchTypeId)(conditions.searchTypeId, "searchTypeId");
            entries.push({ key: "conditions[search_type_id]", value: String(stId) });
        }
    }
    static serializeDateCondition(wireFieldName, cond, entries) {
        (0, validation_1.validateDateCondition)(cond, "conditions." + wireFieldName);
        if (cond.is !== undefined) {
            entries.push({ key: "conditions[" + wireFieldName + "][is]", value: cond.is });
        }
        else if (cond.year !== undefined) {
            entries.push({ key: "conditions[" + wireFieldName + "][year]", value: String(cond.year) });
        }
        else {
            if (cond.gte !== undefined) {
                entries.push({ key: "conditions[" + wireFieldName + "][gte]", value: cond.gte });
            }
            if (cond.lte !== undefined) {
                entries.push({ key: "conditions[" + wireFieldName + "][lte]", value: cond.lte });
            }
        }
    }
    static serializeDocumentSearchParams(params) {
        (0, validation_1.validateRequiredParams)(params, "DocumentSearchParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.DOCUMENT_SEARCH_PARAMS_KEYS, "DocumentSearchParams", true);
        const raw = params;
        if ("term" in raw || "q" in raw) {
            throw new validation_1.RequestValidationError("Top-level term or q is forbidden on DocumentSearchParams. Full-text search belongs in conditions.term.", "term");
        }
        const entries = [];
        if (params.page !== undefined) {
            (0, validation_1.validatePageNumber)(params.page, "page");
            entries.push({ key: "page", value: String(params.page) });
        }
        if (params.perPage !== undefined) {
            (0, validation_1.validatePerPage)(params.perPage, "perPage");
            entries.push({ key: "per_page", value: String(params.perPage) });
        }
        if (params.order !== undefined) {
            const order = (0, validation_1.normalizeAndValidateOrder)(params.order, "order");
            entries.push({ key: "order", value: order });
        }
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.DOCUMENT_FIELDS, "Document");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        if (params.metadataOnly !== undefined) {
            (0, validation_1.validateTrueOnlyFlag)(params.metadataOnly, "metadataOnly");
            entries.push({ key: "metadata_only", value: "1" });
        }
        if (params.includePre1994Docs !== undefined) {
            (0, validation_1.validateTrueOnlyFlag)(params.includePre1994Docs, "includePre1994Docs");
            entries.push({ key: "include_pre_1994_docs", value: "true" });
        }
        if (params.conditions !== undefined) {
            QuerySerializer.serializeDocumentConditions(params.conditions, entries);
        }
        return entries;
    }
    static serializeDocumentSearchCsvParams(params) {
        (0, validation_1.validateRequiredParams)(params, "DocumentSearchCsvParams");
        const raw = params;
        if ("metadataOnly" in raw && raw.metadataOnly !== undefined) {
            throw new validation_1.RequestValidationError("metadataOnly is invalid for Document CSV search requests.", "metadataOnly");
        }
        const isEoBranch = params.conditions &&
            "presidentialDocumentType" in params.conditions &&
            params.conditions.presidentialDocumentType === "executive_order";
        if (isEoBranch) {
            (0, validation_1.validateUnknownKeys)(params, validation_1.EXECUTIVE_ORDER_CSV_SEARCH_PARAMS_KEYS, "ExecutiveOrderCsvSearchParams");
            (0, validation_1.validateUnknownKeys)(params.conditions, validation_1.EXECUTIVE_ORDER_CSV_CONDITIONS_KEYS, "ExecutiveOrderCsvConditions");
        }
        else {
            (0, validation_1.validateUnknownKeys)(params, validation_1.DOCUMENT_SEARCH_PARAMS_KEYS, "DocumentSearchCsvParams");
        }
        const entries = [];
        if (params.page !== undefined) {
            (0, validation_1.validatePageNumber)(params.page, "page");
            entries.push({ key: "page", value: String(params.page) });
        }
        if (params.perPage !== undefined) {
            if (isEoBranch) {
                (0, validation_1.validateExecutiveOrderCsvPerPage)(params.perPage, "perPage");
            }
            else {
                (0, validation_1.validatePerPage)(params.perPage, "perPage");
            }
            entries.push({ key: "per_page", value: String(params.perPage) });
        }
        if (params.order !== undefined) {
            const order = (0, validation_1.normalizeAndValidateOrder)(params.order, "order");
            entries.push({ key: "order", value: order });
        }
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.DOCUMENT_FIELDS, "Document");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        if (params.includePre1994Docs !== undefined) {
            (0, validation_1.validateTrueOnlyFlag)(params.includePre1994Docs, "includePre1994Docs");
            entries.push({ key: "include_pre_1994_docs", value: "true" });
        }
        if (params.conditions !== undefined) {
            if (isEoBranch) {
                entries.push({ key: "conditions[presidential_document_type]", value: "executive_order" });
                const { presidentialDocumentType, ...restConditions } = params.conditions;
                QuerySerializer.serializeDocumentConditions(restConditions, entries);
            }
            else {
                QuerySerializer.serializeDocumentConditions(params.conditions, entries);
            }
        }
        return entries;
    }
    static serializeDocumentSearchRssParams(params) {
        (0, validation_1.validateRequiredParams)(params, "DocumentSearchRssParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.DOCUMENT_SEARCH_RSS_PARAMS_KEYS, "DocumentSearchRssParams");
        const entries = [];
        if (params.includePre1994Docs !== undefined) {
            (0, validation_1.validateTrueOnlyFlag)(params.includePre1994Docs, "includePre1994Docs");
            entries.push({ key: "include_pre_1994_docs", value: "true" });
        }
        if (params.conditions !== undefined) {
            QuerySerializer.serializeDocumentConditions(params.conditions, entries);
        }
        return entries;
    }
    static serializeDocumentFindQuery(params) {
        (0, validation_1.validateRequiredParams)(params, "DocumentFindParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.DOCUMENT_FIND_PARAMS_KEYS, "DocumentFindParams", true);
        (0, validation_1.validateNonBlankString)(params.documentNumber, "documentNumber");
        const entries = [];
        if (params.publicationDate !== undefined) {
            (0, validation_1.validateIsoDateString)(params.publicationDate, "publicationDate");
            entries.push({ key: "publication_date", value: params.publicationDate });
        }
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.DOCUMENT_FIELDS, "Document");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return entries;
    }
    static serializeDocumentFindMany(params) {
        (0, validation_1.validateRequiredParams)(params, "DocumentFindManyParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.DOCUMENT_FIND_MANY_PARAMS_KEYS, "DocumentFindManyParams", true);
        const docNumbers = (0, validation_1.validateNonEmptyArray)(params.documentNumbers, "documentNumbers");
        docNumbers.forEach((d) => (0, validation_1.validateNonBlankString)(d, "documentNumber"));
        const pathSegment = docNumbers.join(",");
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.DOCUMENT_FIELDS, "Document");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return { pathSegment, entries };
    }
    static serializeDocumentCitationFind(params) {
        (0, validation_1.validateRequiredParams)(params, "DocumentCitationFindParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.DOCUMENT_CITATION_FIND_PARAMS_KEYS, "DocumentCitationFindParams", true);
        (0, validation_1.validateRequiredParams)(params.citation, "DocumentCitationFindParams.citation");
        (0, validation_1.validatePositiveInteger)(params.citation.volume, "citation.volume");
        (0, validation_1.validatePositiveInteger)(params.citation.page, "citation.page");
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.DOCUMENT_FIELDS, "Document");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return {
            volume: params.citation.volume,
            page: params.citation.page,
            entries,
        };
    }
    static serializeDocumentCitationFindMany(params) {
        (0, validation_1.validateRequiredParams)(params, "DocumentCitationFindManyParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.DOCUMENT_CITATION_FIND_MANY_PARAMS_KEYS, "DocumentCitationFindManyParams", true);
        const citations = (0, validation_1.validateNonEmptyArray)(params.citations, "citations");
        const formatted = citations.map((c) => {
            (0, validation_1.validatePositiveInteger)(c.volume, "citation.volume");
            (0, validation_1.validatePositiveInteger)(c.page, "citation.page");
            return c.volume + "/" + c.page;
        });
        const pathSegment = formatted.join(",");
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.DOCUMENT_FIELDS, "Document");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return { pathSegment, entries };
    }
    static serializeDocumentFindCsv(params) {
        (0, validation_1.validateRequiredParams)(params, "DocumentFindCsvParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.DOCUMENT_FIND_CSV_PARAMS_KEYS, "DocumentFindCsvParams");
        const docNumbers = (0, validation_1.validateNonEmptyArray)(params.documentNumbers, "documentNumbers");
        docNumbers.forEach((d) => (0, validation_1.validateNonBlankString)(d, "documentNumber"));
        const pathSegment = docNumbers.join(",");
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.DOCUMENT_FIELDS, "Document");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return { pathSegment, entries };
    }
    static serializeDocumentAutocompleteParams(params) {
        (0, validation_1.validateRequiredParams)(params, "DocumentAutocompleteParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.DOCUMENT_AUTOCOMPLETE_PARAMS_KEYS, "DocumentAutocompleteParams", true);
        if (typeof params.term !== "string") {
            throw new validation_1.RequestValidationError("Autocomplete 'term' must be a string.", "term", params.term);
        }
        return [{ key: "conditions[term]", value: params.term }];
    }
    static serializeDocumentSearchDetailsParams(params) {
        (0, validation_1.validateRequiredParams)(params, "DocumentSearchDetailsParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.DOCUMENT_SEARCH_DETAILS_PARAMS_KEYS, "DocumentSearchDetailsParams", true);
        const entries = [];
        if (params.omitSpellingSuggestions !== undefined) {
            (0, validation_1.validateOrdinaryBoolean)(params.omitSpellingSuggestions, "omitSpellingSuggestions");
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
    static serializeDocumentFacetParams(params) {
        (0, validation_1.validateRequiredParams)(params, "DocumentFacetParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.DOCUMENT_FACET_PARAMS_KEYS, "DocumentFacetParams", true);
        const entries = [];
        if (params.conditions !== undefined) {
            QuerySerializer.serializeDocumentConditions(params.conditions, entries);
        }
        return entries;
    }
    static serializePublicInspectionConditions(conditions, entries) {
        (0, validation_1.validateRequiredParams)(conditions, "PublicInspectionSearchConditions");
        (0, validation_1.validateUnknownKeys)(conditions, validation_1.PUBLIC_INSPECTION_SEARCH_CONDITIONS_KEYS, "PublicInspectionSearchConditions");
        const raw = conditions;
        for (const [k, v] of Object.entries(raw)) {
            if (v === null) {
                throw new validation_1.RequestValidationError(`Null value rejected for condition '${k}'.`, k, v);
            }
        }
        if ("availableOn" in raw || "available_on" in raw) {
            throw new validation_1.RequestValidationError("availableOn is not an ordinary search condition. It belongs exclusively to fr.publicInspection.availableOn().", "availableOn");
        }
        if ("q" in raw) {
            throw new validation_1.RequestValidationError("Top-level or condition 'q' parameter is forbidden. Canonical term is 'term'.", "q");
        }
        if (conditions.term !== undefined) {
            entries.push({ key: "conditions[term]", value: conditions.term });
        }
        if (conditions.agencies !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.agencies, "agencies");
            QuerySerializer.appendEntry(entries, "conditions[agencies]", conditions.agencies);
        }
        if (conditions.agencyIds !== undefined) {
            if (Array.isArray(conditions.agencyIds)) {
                conditions.agencyIds.forEach((id) => (0, validation_1.validatePositiveInteger)(id, "agencyIds"));
            }
            QuerySerializer.appendEntry(entries, "conditions[agency_ids]", conditions.agencyIds);
        }
        if (conditions.types !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.types, "types");
            QuerySerializer.appendEntry(entries, "conditions[type]", conditions.types);
        }
        if (conditions.docketId !== undefined) {
            (0, validation_1.validateNonBlankString)(conditions.docketId, "docketId");
            entries.push({ key: "conditions[docket_id]", value: conditions.docketId });
        }
        if (conditions.documentNumbers !== undefined) {
            (0, validation_1.validateStringArrayFilter)(conditions.documentNumbers, "documentNumbers");
            QuerySerializer.appendEntry(entries, "conditions[document_numbers]", conditions.documentNumbers);
        }
        if (conditions.specialFiling !== undefined) {
            (0, validation_1.validateBooleanQuery)(conditions.specialFiling, "conditions.specialFiling");
            QuerySerializer.appendEntry(entries, "conditions[special_filing]", conditions.specialFiling);
        }
        if (conditions.filedAt !== undefined) {
            QuerySerializer.serializeDateCondition("filed_at", conditions.filedAt, entries);
        }
        if (conditions.searchTypeId !== undefined) {
            const stId = (0, validation_1.validateSearchTypeId)(conditions.searchTypeId, "searchTypeId");
            entries.push({ key: "conditions[search_type_id]", value: String(stId) });
        }
    }
    static serializePublicInspectionSearchParams(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionSearchParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_SEARCH_PARAMS_KEYS, "PublicInspectionSearchParams", true);
        const raw = params;
        if ("term" in raw || "q" in raw) {
            throw new validation_1.RequestValidationError("Top-level term or q is forbidden on PublicInspectionSearchParams.", "term");
        }
        if ("availableOn" in raw || "available_on" in raw) {
            throw new validation_1.RequestValidationError("availableOn cannot be supplied to ordinary PublicInspectionSearchParams. Use fr.publicInspection.availableOn().", "availableOn");
        }
        const entries = [];
        if (params.page !== undefined) {
            (0, validation_1.validatePageNumber)(params.page, "page");
            entries.push({ key: "page", value: String(params.page) });
        }
        if (params.perPage !== undefined) {
            (0, validation_1.validatePerPage)(params.perPage, "perPage");
            entries.push({ key: "per_page", value: String(params.perPage) });
        }
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.PUBLIC_INSPECTION_FIELDS, "PublicInspection");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        if (params.metadataOnly !== undefined) {
            (0, validation_1.validateTrueOnlyFlag)(params.metadataOnly, "metadataOnly");
            entries.push({ key: "metadata_only", value: "1" });
        }
        if (params.conditions !== undefined) {
            QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
        }
        return entries;
    }
    static serializePublicInspectionAvailableOnParams(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionAvailableOnParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_AVAILABLE_ON_PARAMS_KEYS, "PublicInspectionAvailableOnParams", true);
        (0, validation_1.validateIsoDateString)(params.availableOn, "availableOn");
        const entries = [
            { key: "conditions[available_on]", value: params.availableOn },
        ];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.PUBLIC_INSPECTION_FIELDS, "PublicInspection");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return entries;
    }
    static serializePublicInspectionCurrentParams(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionCurrentParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_CURRENT_PARAMS_KEYS, "PublicInspectionCurrentParams", true);
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.PUBLIC_INSPECTION_FIELDS, "PublicInspection");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return entries;
    }
    static serializePublicInspectionCurrentCsvParams(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionCurrentCsvParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_CURRENT_CSV_PARAMS_KEYS, "PublicInspectionCurrentCsvParams");
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.PUBLIC_INSPECTION_FIELDS, "PublicInspection");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return entries;
    }
    static serializePublicInspectionFindQuery(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionFindParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_FIND_PARAMS_KEYS, "PublicInspectionFindParams", true);
        (0, validation_1.validateNonBlankString)(params.documentNumber, "documentNumber");
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.PUBLIC_INSPECTION_FIELDS, "PublicInspection");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return entries;
    }
    static serializePublicInspectionFindMany(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionFindManyParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_FIND_MANY_PARAMS_KEYS, "PublicInspectionFindManyParams", true);
        const docNumbers = (0, validation_1.validateNonEmptyArray)(params.documentNumbers, "documentNumbers");
        docNumbers.forEach((d) => (0, validation_1.validateNonBlankString)(d, "documentNumber"));
        const pathSegment = docNumbers.join(",");
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.PUBLIC_INSPECTION_FIELDS, "PublicInspection");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return { pathSegment, entries };
    }
    static serializePublicInspectionSearchCsvParams(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionSearchCsvParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_SEARCH_CSV_PARAMS_KEYS, "PublicInspectionSearchCsvParams");
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.PUBLIC_INSPECTION_FIELDS, "PublicInspection");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        if (params.conditions !== undefined) {
            QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
        }
        return entries;
    }
    static serializePublicInspectionSearchConditionsOnly(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionSearchRssParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_SEARCH_RSS_PARAMS_KEYS, "PublicInspectionSearchRssParams");
        const entries = [];
        if (params.conditions !== undefined) {
            QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
        }
        return entries;
    }
    static serializePublicInspectionSearchDetailsParams(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionSearchDetailsParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_SEARCH_DETAILS_PARAMS_KEYS, "PublicInspectionSearchDetailsParams", true);
        const entries = [];
        if (params.conditions !== undefined) {
            QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
        }
        return entries;
    }
    static serializePublicInspectionFacetParams(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionFacetParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_FACET_PARAMS_KEYS, "PublicInspectionFacetParams", true);
        const entries = [];
        if (params.conditions !== undefined) {
            QuerySerializer.serializePublicInspectionConditions(params.conditions, entries);
        }
        return entries;
    }
    static serializePublicInspectionIssueDailyFacetParams(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionIssueDailyFacetParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_ISSUE_DAILY_FACET_PARAMS_KEYS, "PublicInspectionIssueDailyFacetParams", true);
        if (!params.publicationDate || !params.publicationDate.gte) {
            throw new validation_1.RequestValidationError("PublicInspectionIssueDailyFacetParams requires publicationDate.gte condition.", "publicationDate.gte");
        }
        (0, validation_1.validateIsoDateString)(params.publicationDate.gte, "publicationDate.gte");
        return [{ key: "conditions[publication_date][gte]", value: params.publicationDate.gte }];
    }
    static serializePublicInspectionIssueTypeFacetParams(params) {
        (0, validation_1.validateRequiredParams)(params, "PublicInspectionIssueTypeFacetParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.PUBLIC_INSPECTION_ISSUE_TYPE_FACET_PARAMS_KEYS, "PublicInspectionIssueTypeFacetParams", true);
        if (!params.publicationDate || !params.publicationDate.is) {
            throw new validation_1.RequestValidationError("PublicInspectionIssueTypeFacetParams requires publicationDate.is condition.", "publicationDate.is");
        }
        (0, validation_1.validateIsoDateString)(params.publicationDate.is, "publicationDate.is");
        return [{ key: "conditions[publication_date][is]", value: params.publicationDate.is }];
    }
    static serializeAgencyListParams(params) {
        (0, validation_1.validateRequiredParams)(params, "AgencyListParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.AGENCY_LIST_PARAMS_KEYS, "AgencyListParams", true);
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.AGENCY_FIELDS, "Agency");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return entries;
    }
    static serializeAgencyFind(params) {
        (0, validation_1.validateRequiredParams)(params, "AgencyFindParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.AGENCY_FIND_PARAMS_KEYS, "AgencyFindParams", true);
        let pathSegment;
        if (typeof params.idOrSlug === "number") {
            (0, validation_1.validatePositiveInteger)(params.idOrSlug, "idOrSlug");
            pathSegment = String(params.idOrSlug);
        }
        else {
            (0, validation_1.validateNonBlankString)(params.idOrSlug, "idOrSlug");
            pathSegment = params.idOrSlug;
        }
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.AGENCY_FIELDS, "Agency");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return { pathSegment, entries };
    }
    static serializeAgencyFindMany(params) {
        (0, validation_1.validateRequiredParams)(params, "AgencyFindManyParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.AGENCY_FIND_MANY_PARAMS_KEYS, "AgencyFindManyParams", true);
        const ids = (0, validation_1.validateNonEmptyArray)(params.ids, "ids");
        ids.forEach((id) => (0, validation_1.validatePositiveInteger)(id, "id"));
        const pathSegment = ids.join(",");
        const entries = [];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.AGENCY_FIELDS, "Agency");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return { pathSegment, entries };
    }
    static serializeAgencySuggestionsParams(params) {
        (0, validation_1.validateRequiredParams)(params, "AgencySuggestionsParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.AGENCY_SUGGESTIONS_PARAMS_KEYS, "AgencySuggestionsParams", true);
        if (typeof params.term !== "string") {
            throw new validation_1.RequestValidationError("Agency suggestions 'term' must be a string.", "term", params.term);
        }
        const entries = [{ key: "conditions[term]", value: params.term }];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.AGENCY_FIELDS, "Agency");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return entries;
    }
    static serializeTopicSuggestionsParams(params) {
        (0, validation_1.validateRequiredParams)(params, "TopicSuggestionsParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.TOPIC_SUGGESTIONS_PARAMS_KEYS, "TopicSuggestionsParams", true);
        if (typeof params.term !== "string") {
            throw new validation_1.RequestValidationError("Topic suggestions 'term' must be a string.", "term", params.term);
        }
        const entries = [{ key: "conditions[term]", value: params.term }];
        if (params.fields !== undefined) {
            (0, validation_1.validateFields)(params.fields, validation_1.TOPIC_FIELDS, "Topic");
            QuerySerializer.appendEntry(entries, "fields", params.fields);
        }
        return entries;
    }
    static serializeSuggestedSearchSectionsParams(params) {
        (0, validation_1.validateRequiredParams)(params, "SuggestedSearchSectionsParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.SUGGESTED_SEARCH_SECTIONS_PARAMS_KEYS, "SuggestedSearchSectionsParams", true);
        if (!Array.isArray(params.sections) || params.sections.length === 0) {
            throw new validation_1.RequestValidationError("SuggestedSearchSectionsParams requires a non-empty sections array.", "sections");
        }
        const entries = [];
        QuerySerializer.appendEntry(entries, "conditions[sections]", params.sections);
        return entries;
    }
    static serializeSuggestedSearchFind(params) {
        (0, validation_1.validateRequiredParams)(params, "SuggestedSearchFindParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.SUGGESTED_SEARCH_FIND_PARAMS_KEYS, "SuggestedSearchFindParams", true);
        return (0, validation_1.validateNonBlankString)(params.slug, "slug");
    }
    static serializeEffectiveDatesParams(params) {
        (0, validation_1.validateRequiredParams)(params, "EffectiveDatesParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.EFFECTIVE_DATES_PARAMS_KEYS, "EffectiveDatesParams", true);
        (0, validation_1.validateEffectiveDatesRange)(params.startDate, params.endDate);
        return [
            { key: "start_date", value: params.startDate },
            { key: "end_date", value: params.endDate },
        ];
    }
    static serializeIssueFind(params) {
        (0, validation_1.validateRequiredParams)(params, "IssueFindParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.ISSUE_FIND_PARAMS_KEYS, "IssueFindParams", true);
        return (0, validation_1.validateIsoDateString)(params.publicationDate, "publicationDate");
    }
    static serializeImageFind(params) {
        (0, validation_1.validateRequiredParams)(params, "ImageFindParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.IMAGE_FIND_PARAMS_KEYS, "ImageFindParams", true);
        return (0, validation_1.validateNonBlankString)(params.identifier, "identifier");
    }
    static serializeSiteNotificationFind(params) {
        (0, validation_1.validateRequiredParams)(params, "SiteNotificationFindParams");
        (0, validation_1.validateUnknownKeys)(params, validation_1.SITE_NOTIFICATION_FIND_PARAMS_KEYS, "SiteNotificationFindParams", true);
        return (0, validation_1.validateNonBlankString)(params.identifier, "identifier");
    }
    static serializeJsonpCallback(callback, entries) {
        const validCb = (0, validation_1.validateJsonpCallback)(callback, "callback");
        entries.push({ key: "callback", value: validCb });
    }
}
exports.QuerySerializer = QuerySerializer;
//# sourceMappingURL=serializer.js.map