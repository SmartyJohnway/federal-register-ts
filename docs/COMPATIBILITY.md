# Compatibility & Runtime Support Matrix

This document defines the normative compatibility profile for `federal-register-ts`.

All compatibility claims are backed by reproducible execution evidence verified during R3-01 and R3-02 test matrices.

---

## 1. Node.js Support Matrix

| Node.js Major | Release Status | Support Status in SDK | Notes |
|---|---|---|---|
| **Node.js 24** | Current Active LTS | **SUPPORTED_BLOCKING** | Verified on `ubuntu-latest` in mandatory blocking CI matrix. |
| **Node.js 22** | Maintenance LTS | **SUPPORTED_BLOCKING** | Verified on `ubuntu-latest` in mandatory blocking CI matrix. |
| **Node.js 20** | End of Life (EOL 2026-04-30) | **EOL_HISTORICAL_TECHNICAL_PASS** | Tests execute cleanly; historical observation only, not a supported prerequisite or blocking guarantee. |
| **Node.js < 20** | End of Life (EOL) | **UNSUPPORTED** | Not tested; lacks native global Fetch API and modern JavaScript runtime features. |

---

## 2. TypeScript Compiler Support

The SDK has been verified against exact TypeScript compiler versions to ensure stable declaration file parsing, strict type checking, and zero compiler regressions:

| Exact Compiler Version | Status | Evidence Verification |
|---|---|---|
| `5.0.4` | VERIFIED | Baseline compiler version. Clean `tsc --noEmit`. |
| `5.2.2` | VERIFIED | Clean `tsc --noEmit`. |
| `5.4.5` | VERIFIED | Clean `tsc --noEmit`. |
| `5.6.3` | VERIFIED | Clean `tsc --noEmit`. |
| `5.9.3` | VERIFIED | Clean `tsc --noEmit`. |
| `6.0.3` | VERIFIED | Forward compatibility checkpoint. Clean `tsc --noEmit`. |
| `7.0.2` | VERIFIED | Forward compatibility checkpoint. Clean `tsc --noEmit`. |

> **Note on TypeScript 7:** Compatibility has been verified against the exact compiler point `7.0.2`. The project does **not** assume continuous unverified compatibility across arbitrary unreleased versions, nor has the SDK build configuration been mutated to force a compiler bump.

---

## 3. Module System & Runtime Environments

### CommonJS (CJS) Package Topology
- `federal-register-ts` is distributed as a **CommonJS** package (`"main": "dist/index.js"`, `"types": "dist/index.d.ts"`).
- CommonJS applications consume the package directly via `require('federal-register-ts')`.

### Node.js ECMAScript Modules (ESM) Interoperability
- The verified interoperability pattern for Node.js ESM applications is default import followed by destructuring:
  ```javascript
  import federalRegisterPkg from 'federal-register-ts';
  const { FederalRegisterClient } = federalRegisterPkg;
  ```
- Compiling TypeScript named imports (`import { FederalRegisterClient } from 'federal-register-ts'`) via `tsc` transpiles to CommonJS requires under common configurations and does not constitute runtime proof of named export resolution in native Node.js ESM without synthetic module maps or cjs-module-lexer heuristics.

### Native ESM & Browser Disclaimers
- **No Native ESM Claim:** The package does not currently publish a separate native ESM build or `exports` map. Native ESM dual-packaging is deferred to future governance checkpoints.
- **No Browser Support Claim:** The SDK is designed for server-side Node.js runtimes. It is not bundled or tested for direct in-browser execution (e.g. cross-origin cookie credentials, Webpack/Vite bundler polyfills are not certified).

---

## 4. Platform Matrix

- **Blocking CI Verification:** Verified on Ubuntu Linux (`ubuntu-latest`) across Node 22 and 24.
- **Local Development Environments:** Local development and testing have occurred in developer environments (including Windows), but formal blocking CI evidence is currently established on `ubuntu-latest`. Windows and macOS are not part of the formal blocking automated CI matrix.
