# Next Steps Development Plan - 2025-11-01

This document outlines the subsequent phases for the `fr-ts-microservices` project, following the completion of the initial scaffolding and testing structure.

---

### **Phase 1: Full Feature-Parity Implementation**

**Goal:** Transition from a scaffolded structure to a fully implemented, production-ready library that is 100% feature-equivalent to the original Ruby Gem.

**Tasks:**

1.  **Deep-Dive Logic Implementation:**
    -   **Description:** The current codebase is a well-structured scaffold. This task involves a thorough review of the original Ruby Gem's source code to implement the detailed internal logic of each method.
    -   **Known Gaps to Address:**
        -   **(COMPLETED)** **`PublicInspectionIssueFacet`:** The `specialFilings()` and `regularFilings()` methods in `src/facet.ts` have been implemented.
        -   **Complex Conditionals & Edge Cases:** Review all adapters for subtle conditional logic, error handling nuances, and edge cases that may not have been apparent during the initial scaffolding. For example, how the Ruby gem handles unexpected `nil` values or empty arrays from the API.
        -   **Private Helper Methods:** Identify any private helper methods in the Ruby Gem whose logic is critical for the public methods to function correctly, and ensure their functionality is replicated in the TypeScript classes.

---

### **Phase 1a: Optional Feature-Parity Tasks (Completed)**

**Goal:** Implement the remaining, non-critical features from the Ruby Gem to achieve 100% functional parity.

**Tasks (from `FINAL_GEM_COMPARISON.zh-TW.md`):**

1.  **(COMPLETED) Implement `DocumentImage` Adapter:**

2.  **(COMPLETED) Implement `DocumentSearchDetails` Adapter:**

3.  **(COMPLETED) Implement `PublicInspectionDocumentSearchDetails` Adapter:**

4.  **(COMPLETED) Enhance `HighlightedDocument`:**

5.  **(COMPLETED) Enhance `DocumentFrequencyFacet`:**

---

### **Phase 2: Execute Full Test Plan**

**Goal:** Verify the correctness and stability of the fully implemented library.

**Tasks:**

1.  **Run All Unit Tests:**
    -   **Command:** `npm test`
    -   **Description:** Execute the entire suite of scaffolded unit tests. This will be the first step to validate the logic implemented in Phase 1.
    -   **Objective:** Achieve a 100% pass rate. Any failures will indicate issues in the implementation that must be fixed before proceeding.

2.  **Enhance Test Coverage:**
    -   **Description:** As the deep-dive implementation is completed, add new unit tests to cover the specific logic and edge cases that were filled in. For example, add tests for the `specialFilings()` method once it's implemented.

---

### **Phase 3: Develop Aggregator Service**

**Goal:** Create a single, unified service that orchestrates the individual microservice adapters, providing a simple entry point for end-user applications.

**Tasks:**

1.  **Design the Aggregator API:**
    -   **Description:** Define the API interface for the aggregator. This might be a single function or class that takes a query and intelligently calls the appropriate underlying adapters (e.g., `Document.search`, `Agency.find`, `DocumentFacet.search`).

2.  **Implement the Aggregator Logic:**
    -   **Description:** Write the TypeScript code for the aggregator service. This service will import the adapters from `src/index.ts`.

---

### **Phase 4: Integration Testing**

**Goal:** Ensure all adapters and the aggregator service work correctly together.

**Tasks:**

1.  **Write Integration Tests:**
    -   **Description:** Create a new suite of integration tests that call the Aggregator Service with complex, real-world queries.
    -   **Objective:** Verify that a single query to the aggregator can correctly fetch data from multiple adapters and combine it in a logical way. These tests will likely make real (or carefully mocked) calls to the Federal Register API to validate against actual data.

---

### **Phase 5: Documentation**

**Goal:** Create comprehensive documentation for developers who will use this new library.

**Tasks:**

1.  **Usage Guide (`USAGE.md`):**
    -   **Description:** Create a new markdown file that explains how to use the new TypeScript library. It should include code examples for common use cases:
        -   Searching for documents.
        -   Finding a specific document by number.
        -   Fetching agencies.
        -   Performing a facet search.
        -   Using the Aggregator Service.

2.  **Migration Guide (`MIGRATION.md`):**
    -   **Description:** Create a detailed guide for your original project, explaining step-by-step how to replace the old, direct API calls with the new library.
    -   **Content:** Should include side-by-side code comparisons (old way vs. new way) and instructions on how to install and import the new library.
