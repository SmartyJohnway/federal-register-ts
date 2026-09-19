# Contributing to federal-register-ts

Thank you for your interest in contributing to `federal-register-ts`!

---

## 1. Project Overview & Affiliation Disclaimer

`federal-register-ts` is an **independent, open-source TypeScript SDK** for the FederalRegister.gov API.

> **Disclaimer:** This project is independent and is **not** affiliated with, maintained by, or endorsed by the National Archives and Records Administration (NARA), the Office of the Federal Register (OFR), or the United States Government.

---

## 2. Development Setup

### Prerequisites
- Node.js 22 LTS or Node.js 24 LTS (Node.js 20 also runs cleanly)
- npm 9+

### Initial Setup
```bash
# 1. Clone the repository
git clone https://github.com/SmartyJohnway/federal-register-ts.git
cd federal-register-ts

# 2. Install dependencies cleanly
npm ci

# 3. Build the TypeScript source to dist/
npm run build

# 4. Run the test suite
npm test

# 5. Verify type definitions
npm run typecheck
```

---

## 3. Pull Request Guidelines

1. **Branching:** Create feature or fix branches from `main`.
2. **Deterministic Builds:** Ensure `npm run build` and `npm run typecheck` pass with zero diagnostics.
3. **Automated Tests:** All unit tests must pass via `npm run test:ci`. Any new functionality or bug fix must include corresponding unit tests.
4. **Search Correctness (P0):**
   - Full-text queries must always be serialized inside `conditions[term]`.
   - Never assume cross-field filters share the same Boolean grammar as same-field multi-values.
5. **No Production Probing in CI:** Tests must use mocked responses or local fixtures. Automated tests must **never** execute live HTTP requests against production `federalregister.gov` endpoints.

---

## 4. Reporting Documentation & API Drift

If you observe a discrepancy between the SDK behavior, official FederalRegister.gov API responses, or the documentation:
1. Please open an issue on GitHub: [Issues Tracker](https://github.com/SmartyJohnway/federal-register-ts/issues).
2. Include the exact API endpoint, sample parameters, and observed response payload.
3. Avoid including sensitive personal or confidential information in issue reports.
