# Compatibility & Runtime Support Matrix

This document defines the normative compatibility profile for `federal-register-ts`.

All compatibility claims are backed by reproducible execution evidence verified during R3-01 and R3-02 test matrices.

---

## 1. Node.js Support Matrix

| Node.js Major | Release Status | Support Status in SDK | Notes |
|---|---|---|---|
| **Node.js 24** | Current Active LTS | **SUPPORTED_BLOCKING** | Verified across Linux (Ubuntu), macOS, and Windows. Part of mandatory blocking CI matrix. |
| **Node.js 22** | Maintenance LTS | **SUPPORTED_BLOCKING** | Verified across Linux (Ubuntu), macOS, and Windows. Part of mandatory blocking CI matrix. |
| **Node.js 20** | Maintenance LTS (Approaching EOL) | **TECHNICALLY_PASSES_EOL_OBSERVATION** | Tests execute cleanly; not a blocking guarantee for future development. |
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
- Verified interoperability with Node.js ESM applications using `import { FederalRegisterClient } from 'federal-register-ts'`.
- Node.js ESM resolves named exports from CommonJS entry points seamlessly via standard Node.js module resolution.

### Native ESM & Browser Disclaimers
- **No Native ESM Claim:** The package does not currently publish a separate native ESM build or `exports` map. Native ESM dual-packaging is deferred to future governance checkpoints.
- **No Browser Support Claim:** The SDK is designed for server-side Node.js runtimes. It is not bundled or tested for direct in-browser execution (e.g. cross-origin cookie credentials, Webpack/Vite bundler polyfills are not certified).

---

## 4. Platform Matrix

The test suite and build verification run on:
- **Ubuntu Linux** (`ubuntu-latest`)
- **macOS** (`macos-latest`)
- **Microsoft Windows** (`windows-latest`)
