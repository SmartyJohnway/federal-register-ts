# Progress Log - 2025-11-01_27_enhance_frequency_facet

**Date:** 2025-11-01

**Action:** Completing the final feature parity task.

**Task:** Enhance the `DocumentFrequencyFacet`'s `chart_url` method.

-   **Details:** The current `chart_url` method uses `URLSearchParams` which does not correctly handle nested objects for query parameters. This will be fixed by refactoring the recursive `buildParams` helper function out of `client.ts` and into `utilities.ts`, and then updating both `client.ts` and `frequency.ts` to use this shared utility.

**Next Steps:**
- Refactor `buildParams` from `client.ts` to `utilities.ts`.
- Update `client.ts` to use the utility.
- Update `frequency.ts` to use the utility.
- Add a test case for `chart_url` to `tests/facets.test.ts`.
- Run all tests.
