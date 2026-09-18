import {
  QuerySerializer,
  RequestValidationError,
  DocumentSearchParams,
  DocumentSearchCsvParams,
  ExecutiveOrderCsvSearchParams,
  PublicInspectionSearchParams,
  PublicInspectionIssueDailyFacetParams,
  PublicInspectionIssueTypeFacetParams,
  EffectiveDatesParams,
} from "../src/request";

describe("R0-07C / R2-02 P0 Request Serializer - Negative & Rejection Contract Tests", () => {
  test("R-01: Rejection of top-level term or q", () => {
    const withTopTerm = { term: "energy" } as any;
    expect(() => QuerySerializer.serializeDocumentSearchParams(withTopTerm)).toThrow(RequestValidationError);

    const withTopQ = { q: "energy" } as any;
    expect(() => QuerySerializer.serializeDocumentSearchParams(withTopQ)).toThrow(RequestValidationError);

    const withCondQ = { conditions: { q: "energy" } } as any;
    expect(() => QuerySerializer.serializeDocumentSearchParams(withCondQ)).toThrow(RequestValidationError);
  });

  test("R-02: Rejection of array order", () => {
    const withArrayOrder = { order: ["newest"] } as any;
    expect(() => QuerySerializer.serializeDocumentSearchParams(withArrayOrder)).toThrow(RequestValidationError);
  });

  test("R-03: Rejection of unknown order string", () => {
    const withUnknownOrder = { order: "arbitrary_sort" } as any;
    expect(() => QuerySerializer.serializeDocumentSearchParams(withUnknownOrder)).toThrow(RequestValidationError);
  });

  test("R-04: Rejection of comma-separated string for fields projection", () => {
    const withCommaFields = { fields: "title,abstract" } as any;
    expect(() => QuerySerializer.serializeDocumentSearchParams(withCommaFields)).toThrow(RequestValidationError);
  });

  test("R-05: Rejection of unknown Document projection fields", () => {
    const withUnknownField = { fields: ["title", "unsupported_index_field"] } as any;
    expect(() => QuerySerializer.serializeDocumentSearchParams(withUnknownField)).toThrow(RequestValidationError);
  });

  test("R-06: Rejection of unknown PublicInspection projection fields", () => {
    const withUnknownField: any = { fields: ["title", "invalid_pi_field"] };
    expect(() => QuerySerializer.serializePublicInspectionSearchParams(withUnknownField)).toThrow(
      RequestValidationError
    );
  });

  test("R-07: Rejection of null request member or nullish array element", () => {
    const withNull = { conditions: { term: null } } as any;
    expect(() => QuerySerializer.serializeDocumentSearchParams(withNull)).toThrow(RequestValidationError);

    const withNullInArray = { conditions: { agencies: ["epa", null] } } as any;
    expect(() => QuerySerializer.serializeDocumentSearchParams(withNullInArray)).toThrow(RequestValidationError);
  });

  test("R-08: Rejection of invalid page (0, 51, negative, float)", () => {
    expect(() => QuerySerializer.serializeDocumentSearchParams({ page: 0 } as any)).toThrow(RequestValidationError);
    expect(() => QuerySerializer.serializeDocumentSearchParams({ page: 51 } as any)).toThrow(RequestValidationError);
    expect(() => QuerySerializer.serializeDocumentSearchParams({ page: -1 } as any)).toThrow(RequestValidationError);
    expect(() => QuerySerializer.serializeDocumentSearchParams({ page: 2.5 } as any)).toThrow(RequestValidationError);
  });

  test("R-09: Rejection of invalid perPage (< 2, > 2000, float)", () => {
    expect(() => QuerySerializer.serializeDocumentSearchParams({ perPage: 1 } as any)).toThrow(
      RequestValidationError
    );
    expect(() => QuerySerializer.serializeDocumentSearchParams({ perPage: 2001 } as any)).toThrow(
      RequestValidationError
    );
    expect(() => QuerySerializer.serializeDocumentSearchParams({ perPage: 20.5 } as any)).toThrow(
      RequestValidationError
    );
  });

  test("R-10: Rejection of invalid ExecutiveOrderCsvSearchParams perPage (> 10000 or < 2)", () => {
    const invalidHigh: any = {
      perPage: 10001,
      conditions: { presidentialDocumentType: "executive_order" },
    };
    expect(() => QuerySerializer.serializeDocumentSearchCsvParams(invalidHigh)).toThrow(RequestValidationError);

    const invalidLow: any = {
      perPage: 1,
      conditions: { presidentialDocumentType: "executive_order" },
    };
    expect(() => QuerySerializer.serializeDocumentSearchCsvParams(invalidLow)).toThrow(RequestValidationError);
  });

  test("R-11: Rejection of invalid ISO date string and semantic calendar dates", () => {
    const invalidFormat: any = {
      conditions: { publicationDate: { is: "2026/09/14" } },
    };
    expect(() => QuerySerializer.serializeDocumentSearchParams(invalidFormat)).toThrow(RequestValidationError);

    const invalidMonth: any = {
      conditions: { publicationDate: { is: "2026-13-01" } },
    };
    expect(() => QuerySerializer.serializeDocumentSearchParams(invalidMonth)).toThrow(RequestValidationError);

    // Semantic calendar rejection: Feb 30 does not exist
    const feb30: any = {
      conditions: { publicationDate: { is: "2026-02-30" } },
    };
    expect(() => QuerySerializer.serializeDocumentSearchParams(feb30)).toThrow(RequestValidationError);

    // Semantic calendar rejection: April 31 does not exist (30 days in April)
    const apr31: any = {
      conditions: { publicationDate: { is: "2026-04-31" } },
    };
    expect(() => QuerySerializer.serializeDocumentSearchParams(apr31)).toThrow(RequestValidationError);

    // Semantic calendar rejection: 2025 is not a leap year (Feb 29 rejected)
    const nonLeapFeb29: any = {
      conditions: { publicationDate: { is: "2025-02-29" } },
    };
    expect(() => QuerySerializer.serializeDocumentSearchParams(nonLeapFeb29)).toThrow(RequestValidationError);

    // Semantic calendar acceptance: 2024 is a leap year (Feb 29 accepted)
    const leapFeb29: DocumentSearchParams = {
      conditions: { publicationDate: { is: "2024-02-29" } },
    };
    expect(() => QuerySerializer.serializeDocumentSearchParams(leapFeb29)).not.toThrow();
  });

  test("R-12: Rejection of conflicting DateCondition selector modes", () => {
    const conflicting: any = {
      conditions: {
        publicationDate: { is: "2026-09-14", year: 2026 },
      },
    };
    expect(() => QuerySerializer.serializeDocumentSearchParams(conflicting)).toThrow(RequestValidationError);

    const conflictingRange: any = {
      conditions: {
        publicationDate: { is: "2026-09-14", gte: "2026-01-01" },
      },
    };
    expect(() => QuerySerializer.serializeDocumentSearchParams(conflictingRange)).toThrow(RequestValidationError);
  });

  test("R-13: Rejection of invalid CFR title (< 1, > 50) and invalid part range", () => {
    const invalidTitleLow: any = { conditions: { cfr: { title: 0 } } };
    expect(() => QuerySerializer.serializeDocumentSearchParams(invalidTitleLow)).toThrow(RequestValidationError);

    const invalidTitleHigh: any = { conditions: { cfr: { title: 51 } } };
    expect(() => QuerySerializer.serializeDocumentSearchParams(invalidTitleHigh)).toThrow(RequestValidationError);

    const invalidRangeInverted: any = { conditions: { cfr: { title: 40, part: "50-10" } } };
    expect(() => QuerySerializer.serializeDocumentSearchParams(invalidRangeInverted)).toThrow(RequestValidationError);

    const invalidRangeSyntax: any = { conditions: { cfr: { title: 40, part: "abc-def" } } };
    expect(() => QuerySerializer.serializeDocumentSearchParams(invalidRangeSyntax)).toThrow(RequestValidationError);
  });

  test("R-14: Rejection of blank Near.location and invalid within (< 1 or > 200)", () => {
    const blankLoc: any = { conditions: { near: { location: "   " } } };
    expect(() => QuerySerializer.serializeDocumentSearchParams(blankLoc)).toThrow(RequestValidationError);

    const withinLow: any = { conditions: { near: { location: "DC", within: 0 } } };
    expect(() => QuerySerializer.serializeDocumentSearchParams(withinLow)).toThrow(RequestValidationError);

    const withinHigh: any = { conditions: { near: { location: "DC", within: 201 } } };
    expect(() => QuerySerializer.serializeDocumentSearchParams(withinHigh)).toThrow(RequestValidationError);
  });

  test("R-15: Rejection of SearchTypeId outside 1..6", () => {
    const invalidSt: any = { conditions: { searchTypeId: 7 } };
    expect(() => QuerySerializer.serializeDocumentSearchParams(invalidSt)).toThrow(RequestValidationError);

    const invalidStZero: any = { conditions: { searchTypeId: 0 } };
    expect(() => QuerySerializer.serializeDocumentSearchParams(invalidStZero)).toThrow(RequestValidationError);
  });

  test("R-16: Rejection of availableOn inside ordinary PublicInspectionSearchParams", () => {
    const invalidPi: any = {
      availableOn: "2026-09-14",
    };
    expect(() => QuerySerializer.serializePublicInspectionSearchParams(invalidPi)).toThrow(RequestValidationError);

    const invalidPiCond: any = {
      conditions: {
        availableOn: "2026-09-14",
      },
    };
    expect(() => QuerySerializer.serializePublicInspectionSearchParams(invalidPiCond)).toThrow(RequestValidationError);
  });

  test("R-17: Rejection of metadataOnly in CSV search requests", () => {
    const invalidCsv: any = {
      metadataOnly: true,
      conditions: { term: "test" },
    };
    expect(() => QuerySerializer.serializeDocumentSearchCsvParams(invalidCsv)).toThrow(RequestValidationError);
  });

  test("R-18: Rejection of blank required path identifiers", () => {
    expect(() => QuerySerializer.serializeDocumentFindQuery({ documentNumber: "   " } as any)).toThrow(
      RequestValidationError
    );
    expect(() => QuerySerializer.serializePublicInspectionFindQuery({ documentNumber: "" } as any)).toThrow(
      RequestValidationError
    );
    expect(() => QuerySerializer.serializeSuggestedSearchFind({ slug: "  " })).toThrow(RequestValidationError);
    expect(() => QuerySerializer.serializeImageFind({ identifier: "" })).toThrow(RequestValidationError);
    expect(() => QuerySerializer.serializeSiteNotificationFind({ identifier: "  " })).toThrow(RequestValidationError);
  });

  test("R-19: Rejection of EffectiveDates range exceeding 120 days", () => {
    const exceedingRange: EffectiveDatesParams = {
      startDate: "2026-01-01",
      endDate: "2026-06-01", // ~151 days
    };
    expect(() => QuerySerializer.serializeEffectiveDatesParams(exceedingRange)).toThrow(RequestValidationError);
  });

  test("R-20: Rejection of missing required conditions on PI issue daily and type facets", () => {
    const missingDaily: any = {};
    expect(() => QuerySerializer.serializePublicInspectionIssueDailyFacetParams(missingDaily)).toThrow(
      RequestValidationError
    );

    const missingType: any = {};
    expect(() => QuerySerializer.serializePublicInspectionIssueTypeFacetParams(missingType)).toThrow(
      RequestValidationError
    );
  });
});
