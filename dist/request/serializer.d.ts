import { DocumentSearchParams, DocumentSearchCsvParams, DocumentSearchRssParams, DocumentFindParams, DocumentFindManyParams, DocumentCitationFindParams, DocumentCitationFindManyParams, DocumentFindCsvParams, DocumentAutocompleteParams, DocumentSearchDetailsParams, DocumentFacetParams, PublicInspectionSearchParams, PublicInspectionAvailableOnParams, PublicInspectionCurrentParams, PublicInspectionCurrentCsvParams, PublicInspectionFindParams, PublicInspectionFindManyParams, PublicInspectionSearchCsvParams, PublicInspectionSearchDetailsParams, PublicInspectionFacetParams, PublicInspectionIssueDailyFacetParams, PublicInspectionIssueTypeFacetParams, AgencyListParams, AgencyFindParams, AgencyFindManyParams, AgencySuggestionsParams, TopicSuggestionsParams, SuggestedSearchSectionsParams, SuggestedSearchFindParams, EffectiveDatesParams, IssueFindParams, ImageFindParams, SiteNotificationFindParams, DocumentSearchConditions, PublicInspectionSearchConditions, DateCondition } from "./types";
export interface SerializedQueryEntry {
    key: string;
    value: string;
}
export declare class QuerySerializer {
    static appendEntry(entries: SerializedQueryEntry[], key: string, val: any): void;
    static toQueryString(entries: readonly SerializedQueryEntry[]): string;
    static serializeDocumentConditions(conditions: DocumentSearchConditions, entries: SerializedQueryEntry[]): void;
    static serializeDateCondition(wireFieldName: string, cond: DateCondition, entries: SerializedQueryEntry[]): void;
    static serializeDocumentSearchParams(params: DocumentSearchParams): SerializedQueryEntry[];
    static serializeDocumentSearchCsvParams(params: DocumentSearchCsvParams): SerializedQueryEntry[];
    static serializeDocumentSearchRssParams(params: DocumentSearchRssParams): SerializedQueryEntry[];
    static serializeDocumentFindQuery(params: DocumentFindParams): SerializedQueryEntry[];
    static serializeDocumentFindMany(params: DocumentFindManyParams): {
        pathSegment: string;
        entries: SerializedQueryEntry[];
    };
    static serializeDocumentCitationFind(params: DocumentCitationFindParams): {
        volume: number;
        page: number;
        entries: SerializedQueryEntry[];
    };
    static serializeDocumentCitationFindMany(params: DocumentCitationFindManyParams): {
        pathSegment: string;
        entries: SerializedQueryEntry[];
    };
    static serializeDocumentFindCsv(params: DocumentFindCsvParams): {
        pathSegment: string;
        entries: SerializedQueryEntry[];
    };
    static serializeDocumentAutocompleteParams(params: DocumentAutocompleteParams): SerializedQueryEntry[];
    static serializeDocumentSearchDetailsParams(params: DocumentSearchDetailsParams): SerializedQueryEntry[];
    static serializeDocumentFacetParams(params: DocumentFacetParams): SerializedQueryEntry[];
    static serializePublicInspectionConditions(conditions: PublicInspectionSearchConditions, entries: SerializedQueryEntry[]): void;
    static serializePublicInspectionSearchParams(params: PublicInspectionSearchParams): SerializedQueryEntry[];
    static serializePublicInspectionAvailableOnParams(params: PublicInspectionAvailableOnParams): SerializedQueryEntry[];
    static serializePublicInspectionCurrentParams(params: PublicInspectionCurrentParams): SerializedQueryEntry[];
    static serializePublicInspectionCurrentCsvParams(params: PublicInspectionCurrentCsvParams): SerializedQueryEntry[];
    static serializePublicInspectionFindQuery(params: PublicInspectionFindParams): SerializedQueryEntry[];
    static serializePublicInspectionFindMany(params: PublicInspectionFindManyParams): {
        pathSegment: string;
        entries: SerializedQueryEntry[];
    };
    static serializePublicInspectionSearchCsvParams(params: PublicInspectionSearchCsvParams): SerializedQueryEntry[];
    static serializePublicInspectionSearchConditionsOnly(params: {
        conditions?: PublicInspectionSearchConditions;
    }): SerializedQueryEntry[];
    static serializePublicInspectionSearchDetailsParams(params: PublicInspectionSearchDetailsParams): SerializedQueryEntry[];
    static serializePublicInspectionFacetParams(params: PublicInspectionFacetParams): SerializedQueryEntry[];
    static serializePublicInspectionIssueDailyFacetParams(params: PublicInspectionIssueDailyFacetParams): SerializedQueryEntry[];
    static serializePublicInspectionIssueTypeFacetParams(params: PublicInspectionIssueTypeFacetParams): SerializedQueryEntry[];
    static serializeAgencyListParams(params: AgencyListParams): SerializedQueryEntry[];
    static serializeAgencyFind(params: AgencyFindParams): {
        pathSegment: string;
        entries: SerializedQueryEntry[];
    };
    static serializeAgencyFindMany(params: AgencyFindManyParams): {
        pathSegment: string;
        entries: SerializedQueryEntry[];
    };
    static serializeAgencySuggestionsParams(params: AgencySuggestionsParams): SerializedQueryEntry[];
    static serializeTopicSuggestionsParams(params: TopicSuggestionsParams): SerializedQueryEntry[];
    static serializeSuggestedSearchSectionsParams(params: SuggestedSearchSectionsParams): SerializedQueryEntry[];
    static serializeSuggestedSearchFind(params: SuggestedSearchFindParams): string;
    static serializeEffectiveDatesParams(params: EffectiveDatesParams): SerializedQueryEntry[];
    static serializeIssueFind(params: IssueFindParams): string;
    static serializeImageFind(params: ImageFindParams): string;
    static serializeSiteNotificationFind(params: SiteNotificationFindParams): string;
    static serializeJsonpCallback(callback: any, entries: SerializedQueryEntry[]): void;
}
//# sourceMappingURL=serializer.d.ts.map