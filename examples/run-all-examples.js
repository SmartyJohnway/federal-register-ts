/**
 * Test runner script to execute and verify all cookbook examples.
 */

const { execSync } = require('child_process');
const path = require('path');

const examples = [
  { name: 'CommonJS Search Documents', cmd: 'node examples/commonjs/search-documents.js' },
  { name: 'CommonJS Error Handling', cmd: 'node examples/commonjs/error-handling.js' },
  { name: 'Node.js ESM Search Documents', cmd: 'node examples/esm-interop/search-documents.mjs' },
  { name: 'Node.js ESM Public Inspection', cmd: 'node examples/esm-interop/public-inspection.mjs' },
];

console.log('=== Running Cookbook Examples ===\n');

let passed = 0;
let failed = 0;

for (const ex of examples) {
  process.stdout.write(`Running: ${ex.name}... `);
  try {
    const stdout = execSync(ex.cmd, { cwd: path.join(__dirname, '..'), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log('PASS');
    passed++;
  } catch (err) {
    console.log('FAIL');
    console.error(err.stdout || err.stderr || err.message);
    failed++;
  }
}

console.log(`\nCookbook Verification: ${passed}/${examples.length} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
