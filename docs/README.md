# Documentation Catalog & Index

This catalog indexes and classifies all documentation in the `docs/` directory of `federal-register-ts`.

---

## 1. Normative Public Documentation (`NORMATIVE_PUBLIC`)

These documents define the active, authoritative public contract and developer guides for using the SDK:

| Document | Description | Target Audience |
|---|---|---|
| [`API_REFERENCE.md`](API_REFERENCE.md) | Complete normative API reference covering all 14 namespaces and 54 canonical operations. | SDK Users & Developers |
| [`CAPABILITIES.md`](CAPABILITIES.md) | Comprehensive 120-capability matrix mapping frozen IDs, families, types, and uncertainty guards. | Auditors & Integrators |
| [`SEARCH.md`](SEARCH.md) | Authoritative search semantics guide (`conditions[term]`, logical OR/AND rules, pagination, serialization). | Search Engineers |
| [`COMPATIBILITY.md`](COMPATIBILITY.md) | Runtime support matrix (Node 22/24 blocking, Node 20 EOL, TS 5.0.4..7.0.2 points, CJS/ESM interop). | System Architects |
| [`USAGE.md`](USAGE.md) | Practical, step-by-step developer usage guide with verified code examples. | Developers |

---

## 2. Historical & Non-Normative Documentation (`HISTORICAL_NON_NORMATIVE`)

The following files represent historical research, legacy porting plans, or pre-revival artifacts. They are preserved for provenance and historical reference only. **They do not reflect the current canonical SDK API contract.**

| Document | Historical Role | Canonical Successor |
|---|---|---|
| `BACKEND_MIGRATION_PLAN.zh-TW.md` | Legacy pre-revival backend migration notes. | Canonical Governance AGENTS.md / Canonical Governance PROJECT.md |
| `FINAL_GEM_COMPARISON.zh-TW.md` | Ruby gem parity comparison notes from initial port. | [`CAPABILITIES.md`](CAPABILITIES.md) |
| `FRONTEND_ENHANCEMENT_PLAN.zh-TW.md` | Legacy frontend UI planning notes. | Non-normative |
| `MIGRATION.md` / `MIGRATION.zh-TW.md` | Initial migration guide from direct `fetch` calls. | [`USAGE.md`](USAGE.md) |
| `PROJECT_GUIDE.zh-TW.md` | Historical architecture overview. | [`API_REFERENCE.md`](API_REFERENCE.md) |
| `USAGE.zh-TW.md` | Historical pre-revival Traditional Chinese usage guide. | [`USAGE.md`](USAGE.md) |
| `next_steps_plan_20251101.md` | Pre-revival milestone checklist. | Governance ROADMAP |
| `ruby_gem_analysis_summary_20251031.md`| Ruby Gem source analysis. | R0-01 / R0-02 archaeology |
| `verification_summary_20251101.md` | Pre-revival verification notes. | R2 verification suites |
| `noteformyself.md` | Developer scratchpad notes. | Non-normative |

---

## 3. Internal Reference Schema (`INTERNAL_REFERENCE`)

| Directory / File | Description |
|---|---|
| `schema/` | Upstream JSON schema extracts used during initial type scaffolding. |
