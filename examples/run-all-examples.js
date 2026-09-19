/**
 * Test runner script to execute and verify all cookbook examples.
 *
 * Implements isolated consumer verification semantics:
 * 1. Packs a candidate tarball to OS temp directory.
 * 2. Creates a standalone temporary consumer workspace outside the repository.
 * 3. Installs the exact candidate tarball via `npm install <tarball>`.
 * 4. Executes CJS and ESM examples against the installed package.
 * 5. Cleans up temporary artifacts and reports summary.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fr-ts-cookbook-'));
let passed = 0;
let failed = 0;

console.log('=== Running Cookbook Examples in Isolated Consumer Workspace ===\n');

try {
  // 1. Build if dist is missing
  if (!fs.existsSync(path.join(repoRoot, 'dist', 'index.js'))) {
    console.log('Building SDK dist assets...');
    execSync('npm run build', { cwd: repoRoot, stdio: 'pipe' });
  }

  // 2. Pack tarball into temp directory
  console.log('Packing candidate tarball...');
  const packJson = execSync('npm pack --json', { cwd: repoRoot, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  const packData = JSON.parse(packJson);
  const tarballName = packData[0].filename;
  const tarballSrc = path.join(repoRoot, tarballName);
  const tarballDest = path.join(tempDir, tarballName);
  fs.copyFileSync(tarballSrc, tarballDest);
  try { fs.unlinkSync(tarballSrc); } catch (_) {}

  // 3. Setup temporary consumer project
  console.log(`Setting up temporary consumer workspace...`);
  fs.writeFileSync(
    path.join(tempDir, 'package.json'),
    JSON.stringify({ name: 'isolated-cookbook-consumer', version: '1.0.0', private: true }, null, 2),
    'utf8'
  );

  // Copy mock transport & examples to temp workspace
  fs.copyFileSync(path.join(__dirname, 'mock-transport.js'), path.join(tempDir, 'mock-transport.js'));
  
  // Copy commonjs
  fs.mkdirSync(path.join(tempDir, 'commonjs'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, 'commonjs', 'search-documents.js'), path.join(tempDir, 'commonjs', 'search-documents.js'));
  fs.copyFileSync(path.join(__dirname, 'commonjs', 'error-handling.js'), path.join(tempDir, 'commonjs', 'error-handling.js'));
  
  // Copy esm
  fs.mkdirSync(path.join(tempDir, 'esm-interop'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, 'esm-interop', 'search-documents.mjs'), path.join(tempDir, 'esm-interop', 'search-documents.mjs'));
  fs.copyFileSync(path.join(__dirname, 'esm-interop', 'public-inspection.mjs'), path.join(tempDir, 'esm-interop', 'public-inspection.mjs'));

  // Install candidate tarball
  console.log('Installing candidate tarball in isolated consumer...');
  execSync(`npm install "${tarballDest}" --no-audit --no-fund`, { cwd: tempDir, stdio: 'pipe' });

  // 4. Run verification matrix
  const tests = [
    { name: 'CommonJS Search Documents', cmd: 'node commonjs/search-documents.js', cwd: tempDir },
    { name: 'CommonJS Error Handling', cmd: 'node commonjs/error-handling.js', cwd: tempDir },
    { name: 'Node.js ESM Search Documents', cmd: 'node esm-interop/search-documents.mjs', cwd: tempDir },
    { name: 'Node.js ESM Public Inspection', cmd: 'node esm-interop/public-inspection.mjs', cwd: tempDir }
  ];

  for (const t of tests) {
    process.stdout.write(`Running: ${t.name}... `);
    try {
      execSync(t.cmd, { cwd: t.cwd, stdio: 'pipe', encoding: 'utf8' });
      console.log('PASS');
      passed++;
    } catch (err) {
      console.log('FAIL');
      console.error(err.stdout || err.stderr || err.message);
      failed++;
    }
  }

} catch (setupErr) {
  console.error('Cookbook execution setup error:', setupErr.message);
  failed++;
} finally {
  // Cleanup temp consumer workspace
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (_) {}
}

console.log(`\nCookbook Verification: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
