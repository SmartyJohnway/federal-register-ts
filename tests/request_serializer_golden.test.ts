import {
  QuerySerializer,
  DocumentSearchParams,
  DocumentSearchCsvParams,
  ExecutiveOrderCsvSearchParams,
  DocumentSearchRssParams,
  DocumentFindParams,
  DocumentFindManyParams,
  DocumentCitationFindParams,
  DocumentCitationFindManyParams,
  DocumentFindCsvParams,
  DocumentAutocompleteParams,
  DocumentSearchDetailsParams,
  DocumentFacetParams,
  PublicInspectionSearchParams,
  PublicInspectionAvailableOnParams,
  PublicInspectionCurrentParams,
  PublicInspectionFindParams,
  PublicInspectionFindManyParams,
  PublicInspectionSearchCsvParams,
  PublicInspectionIssueDailyFacetParams,
  PublicInspectionIssueTypeFacetParams,
  AgencyListParams,
  AgencyFindParams,
  AgencyFindManyParams,
  AgencySuggestionsParams,
  TopicSuggestionsParams,
  SuggestedSearchSectionsParams,
  EffectiveDatesParams,
} from "../src/request";

describe("R0-07C / R2-02 P0 Request Serializer - Positive Wire Golden Tests", () => {
  test("G-01: Canonical full-text term is serialized ONLY as conditions[term]", () => {
    const params: DocumentSearchParams = {
      conditions: {
        term: "environmental policy",
      },
    };
    const entries = QuerySerializer.serializeDocumentSearchParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    expect(qs).toBe("conditions%5Bterm%5D=environmental%20policy");
    expect(entries).toEqual([{ key: "conditions[term]", value: "environmental policy" }]);
    expect(entries.some((e) => e.key === "term" || e.key === "q")).toBe(false);
  });

  test("G-02: Standards-based percent encoding preserves literal '+' and '&' as %2B and %26", () => {
    const params: DocumentSearchParams = {
      conditions: {
        term: "climate + clean & green",
      },
    };
    const entries = QuerySerializer.serializeDocumentSearchParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    // decodeURIComponent preserves the literal string
    expect(decodeURIComponent(qs)).toBe("conditions[term]=climate + clean & green");
    // Wire query string contains %2B and %26
    expect(qs).toContain("%2B");
    expect(qs).toContain("%26");
    expect(qs).toBe("conditions%5Bterm%5D=climate%20%2B%20clean%20%26%20green");
  });

  test("G-03: Single-value and multi-value semantic lists serialize as repeated bracket array", () => {
    const singleAgency: DocumentSearchParams = {
      conditions: {
        agencies: ["epa"],
      },
    };
    const singleEntries = QuerySerializer.serializeDocumentSearchParams(singleAgency);
    expect(QuerySerializer.toQueryString(singleEntries)).toBe("conditions%5Bagencies%5D%5B%5D=epa");

    const multiAgency: DocumentSearchParams = {
      conditions: {
        agencies: ["epa", "energy-department"],
      },
    };
    const multiEntries = QuerySerializer.serializeDocumentSearchParams(multiAgency);
    expect(QuerySerializer.toQueryString(multiEntries)).toBe(
      "conditions%5Bagencies%5D%5B%5D=epa&conditions%5Bagencies%5D%5B%5D=energy-department"
    );
  });

  test("G-04: Empty semantic array is omitted as no-op", () => {
    const params: DocumentSearchParams = {
      conditions: {
        term: "test",
        agencies: [],
        topics: [],
      },
    };
    const entries = QuerySerializer.serializeDocumentSearchParams(params);
    expect(QuerySerializer.toQueryString(entries)).toBe("conditions%5Bterm%5D=test");
  });

  test("G-05: Top-level repeated fields[] projection array", () => {
    const params: DocumentSearchParams = {
      fields: ["title", "abstract", "citation"],
    };
    const entries = QuerySerializer.serializeDocumentSearchParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    expect(qs).toBe("fields%5B%5D=title&fields%5B%5D=abstract&fields%5B%5D=citation");
  });

  test("G-06: Scalar order and 'date' compatibility normalization to 'newest'", () => {
    const canonicalOrder: DocumentSearchParams = { order: "oldest" };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(canonicalOrder))).toBe(
      "order=oldest"
    );

    const compatOrder: DocumentSearchParams = { order: "date" };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(compatOrder))).toBe(
      "order=newest"
    );
  });

  test("G-07: Boolean structured filters map to 1 or 0", () => {
    const params: DocumentSearchParams = {
      conditions: {
        significant: true,
        correction: false,
        acceptingComments: true,
      },
    };
    const qs = QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(params));
    expect(qs).toContain("conditions%5Bsignificant%5D=1");
    expect(qs).toContain("conditions%5Bcorrection%5D=0");
    expect(qs).toContain("conditions%5Baccepting_comments_on_regulations_dot_gov%5D=1");
  });

  test("G-08: DateCondition selector modes (is, year, gte, lte, gte+lte)", () => {
    // 1. is
    const isParams: DocumentSearchParams = {
      conditions: { publicationDate: { is: "2026-09-14" } },
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(isParams))).toBe(
      "conditions%5Bpublication_date%5D%5Bis%5D=2026-09-14"
    );

    // 2. year
    const yearParams: DocumentSearchParams = {
      conditions: { publicationDate: { year: 2026 } },
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(yearParams))).toBe(
      "conditions%5Bpublication_date%5D%5Byear%5D=2026"
    );

    // 3. gte
    const gteParams: DocumentSearchParams = {
      conditions: { publicationDate: { gte: "2026-01-01" } },
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(gteParams))).toBe(
      "conditions%5Bpublication_date%5D%5Bgte%5D=2026-01-01"
    );

    // 4. lte
    const lteParams: DocumentSearchParams = {
      conditions: { publicationDate: { lte: "2026-12-31" } },
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(lteParams))).toBe(
      "conditions%5Bpublication_date%5D%5Blte%5D=2026-12-31"
    );

    // 5. gte + lte range
    const rangeParams: DocumentSearchParams = {
      conditions: { publicationDate: { gte: "2026-01-01", lte: "2026-06-30" } },
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(rangeParams))).toBe(
      "conditions%5Bpublication_date%5D%5Bgte%5D=2026-01-01&conditions%5Bpublication_date%5D%5Blte%5D=2026-06-30"
    );
  });

  test("G-09: CFR condition (title only vs title + part vs title + part range)", () => {
    // Title only
    const titleOnly: DocumentSearchParams = {
      conditions: { cfr: { title: 40 } },
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(titleOnly))).toBe(
      "conditions%5Bcfr%5D%5Btitle%5D=40"
    );

    // Title + part integer
    const titlePartInt: DocumentSearchParams = {
      conditions: { cfr: { title: 40, part: 60 } },
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(titlePartInt))).toBe(
      "conditions%5Bcfr%5D%5Btitle%5D=40&conditions%5Bcfr%5D%5Bpart%5D=60"
    );

    // Title + part range string
    const titlePartRange: DocumentSearchParams = {
      conditions: { cfr: { title: 40, part: "1-50" } },
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(titlePartRange))).toBe(
      "conditions%5Bcfr%5D%5Btitle%5D=40&conditions%5Bcfr%5D%5Bpart%5D=1-50"
    );
  });

  test("G-10: Near condition (location only vs location + within)", () => {
    // Location only (omits within so upstream uses default 25)
    const locOnly: DocumentSearchParams = {
      conditions: { near: { location: "Seattle, WA" } },
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(locOnly))).toBe(
      "conditions%5Bnear%5D%5Blocation%5D=Seattle%2C%20WA"
    );

    // Location + within
    const locWithin: DocumentSearchParams = {
      conditions: { near: { location: "Seattle, WA", within: 50 } },
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(locWithin))).toBe(
      "conditions%5Bnear%5D%5Blocation%5D=Seattle%2C%20WA&conditions%5Bnear%5D%5Bwithin%5D=50"
    );
  });

  test("G-11: Page and perPage serialization", () => {
    const params: DocumentSearchParams = {
      page: 2,
      perPage: 100,
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(params))).toBe(
      "page=2&per_page=100"
    );
  });

  test("G-12: SearchTypeId (1..6) wire serialization", () => {
    for (const id of [1, 2, 3, 4, 5, 6] as const) {
      const params: DocumentSearchParams = {
        conditions: { searchTypeId: id },
      };
      expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(params))).toBe(
        `conditions%5Bsearch_type_id%5D=${id}`
      );
    }
  });

  test("G-13: metadataOnly and includePre1994Docs serialization", () => {
    const params: DocumentSearchParams = {
      metadataOnly: true,
      includePre1994Docs: true,
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeDocumentSearchParams(params))).toBe(
      "metadata_only=1&include_pre_1994_docs=true"
    );
  });

  test("G-14: Executive Order CSV scalar exception allows perPage up to 10000", () => {
    const eoCsvParams: ExecutiveOrderCsvSearchParams = {
      perPage: 5000,
      conditions: {
        presidentialDocumentType: "executive_order",
      },
    };
    const entries = QuerySerializer.serializeDocumentSearchCsvParams(eoCsvParams);
    const qs = QuerySerializer.toQueryString(entries);
    expect(qs).toBe("per_page=5000&conditions%5Bpresidential_document_type%5D=executive_order");
  });

  test("G-15: PublicInspection availableOn operation dispatch", () => {
    const params: PublicInspectionAvailableOnParams = {
      availableOn: "2026-09-14",
      fields: ["title", "document_number"],
    };
    const entries = QuerySerializer.serializePublicInspectionAvailableOnParams(params);
    const qs = QuerySerializer.toQueryString(entries);
    expect(qs).toBe(
      "conditions%5Bavailable_on%5D=2026-09-14&fields%5B%5D=title&fields%5B%5D=document_number"
    );
  });

  test("G-16: PublicInspection issue facet required condition serialization", () => {
    const dailyFacet: PublicInspectionIssueDailyFacetParams = {
      publicationDate: { gte: "2026-09-01" },
    };
    expect(
      QuerySerializer.toQueryString(QuerySerializer.serializePublicInspectionIssueDailyFacetParams(dailyFacet))
    ).toBe("conditions%5Bpublication_date%5D%5Bgte%5D=2026-09-01");

    const typeFacet: PublicInspectionIssueTypeFacetParams = {
      publicationDate: { is: "2026-09-14" },
    };
    expect(
      QuerySerializer.toQueryString(QuerySerializer.serializePublicInspectionIssueTypeFacetParams(typeFacet))
    ).toBe("conditions%5Bpublication_date%5D%5Bis%5D=2026-09-14");
  });

  test("G-17: Agency suggestions and Topic suggestions map term -> conditions[term]", () => {
    const agencySugg: AgencySuggestionsParams = {
      term: "environmental",
      fields: ["name", "slug"],
    };
    expect(
      QuerySerializer.toQueryString(QuerySerializer.serializeAgencySuggestionsParams(agencySugg))
    ).toBe("conditions%5Bterm%5D=environmental&fields%5B%5D=name&fields%5B%5D=slug");

    const topicSugg: TopicSuggestionsParams = {
      term: "energy",
      fields: ["name", "slug"],
    };
    expect(
      QuerySerializer.toQueryString(QuerySerializer.serializeTopicSuggestionsParams(topicSugg))
    ).toBe("conditions%5Bterm%5D=energy&fields%5B%5D=name&fields%5B%5D=slug");
  });

  test("G-18: SuggestedSearchSectionsParams maps to repeated conditions[sections][]", () => {
    const sectionsParam: SuggestedSearchSectionsParams = {
      sections: ["environment", "money"],
    };
    expect(
      QuerySerializer.toQueryString(QuerySerializer.serializeSuggestedSearchSectionsParams(sectionsParam))
    ).toBe("conditions%5Bsections%5D%5B%5D=environment&conditions%5Bsections%5D%5B%5D=money");
  });

  test("G-19: EffectiveDatesParams maps to start_date and end_date", () => {
    const params: EffectiveDatesParams = {
      startDate: "2026-01-01",
      endDate: "2026-03-31",
    };
    expect(QuerySerializer.toQueryString(QuerySerializer.serializeEffectiveDatesParams(params))).toBe(
      "start_date=2026-01-01&end_date=2026-03-31"
    );
  });

  test("G-20: Path-level multi-lookup comma joining without comma-query inheritance", () => {
    const findMany: DocumentFindManyParams = {
      documentNumbers: ["2026-0001", "2026-0002"],
      fields: ["title"],
    };
    const serialized = QuerySerializer.serializeDocumentFindMany(findMany);
    expect(serialized.pathSegment).toBe("2026-0001,2026-0002");
    expect(QuerySerializer.toQueryString(serialized.entries)).toBe("fields%5B%5D=title");

    const citationFindMany: DocumentCitationFindManyParams = {
      citations: [
        { volume: 88, page: 12345 },
        { volume: 88, page: 67890 },
      ],
    };
    const serializedCitations = QuerySerializer.serializeDocumentCitationFindMany(citationFindMany);
    expect(serializedCitations.pathSegment).toBe("88/12345,88/67890");
  });
});
