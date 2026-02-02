# Progress Log - 2025-11-01_23_enhance_highlighted_document

**Date:** 2025-11-01

**Action:** Begin implementation of optional features to achieve 100% feature parity with the Ruby Gem.

**Task:** Enhance `HighlightedDocument` adapter.

-   **Details:** Add memoization (caching) to the `photoCredit` getter in `src/highlighted_document.ts` so the `PhotoCredit` object is only instantiated once, perfectly matching the Ruby Gem's `||=` behavior.

**Next Steps:**
- Modify the `highlighted_document.ts` file.
- Add a test case to `tests/highlighted_document.test.ts` to verify the memoization.
