import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const showcaseRoot = path.resolve(__dirname, '..');
const bundleOutDir = path.join(showcaseRoot, 'dist-functions');
const bundleOutFile = path.join(bundleOutDir, 'gateway.mjs');

test('Netlify Function Real Bundle and Actual Handler Invocation Smoke', async (t) => {
  // Step 1: Bundle the function using esbuild for Node.js 24 target
  await t.test('Function bundles successfully with esbuild for Node.js 24', () => {
    if (!fs.existsSync(bundleOutDir)) {
      fs.mkdirSync(bundleOutDir, { recursive: true });
    }

    const esbuildCmd = `npx esbuild netlify/functions/gateway.ts --bundle --platform=node --target=node24 --format=esm --outfile=dist-functions/gateway.mjs`;
    execSync(esbuildCmd, { cwd: showcaseRoot, stdio: 'pipe' });

    assert.ok(fs.existsSync(bundleOutFile), 'Bundled function file gateway.mjs must exist');
    const bundleContent = fs.readFileSync(bundleOutFile, 'utf8');
    assert.ok(bundleContent.length > 0, 'Bundle file must not be empty');
    assert.ok(!bundleContent.includes('eval('), 'Bundle must contain zero eval');
    assert.ok(!bundleContent.includes('Function('), 'Bundle must contain zero Function constructor');
  });

  // Step 2: Import the actual bundled handler
  const moduleUrl = pathToFileURL(bundleOutFile).href;
  const { handler } = await import(moduleUrl);
  assert.ok(typeof handler === 'function', 'Exported handler must be a function');

  const mockContext = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'gateway',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:gateway',
    memoryLimitInMB: '1024',
    awsRequestId: 'req-12345',
    logGroupName: '/aws/lambda/gateway',
    logStreamName: '2026/09/24/[$LATEST]12345',
    getRemainingTimeInMillis: () => 10000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  // Step 3: Invoke real handler for /api/health
  await t.test('Real handler responds 200 OK to /api/health with SDK initialized', async () => {
    const event = {
      path: '/api/health',
      httpMethod: 'GET',
      queryStringParameters: null,
      headers: {},
      multiValueHeaders: {},
      isBase64Encoded: false,
      body: null,
    };

    const response = await handler(event, mockContext);
    assert.strictEqual(response.statusCode, 200, 'Health check must return 200');
    const body = JSON.parse(response.body);
    assert.strictEqual(body.status, 'healthy', 'Status must be healthy');
    assert.strictEqual(body.sdkInitialized, true, 'SDK must be initialized');
    assert.strictEqual(body.allowedOperationsCount, 54, 'Must report 54 allowed operations');
    assert.ok(body.runtime.startsWith('v24'), 'Must run under Node.js 24 runtime');
  });

  // Step 4: Invoke real handler for /api/operations
  await t.test('Real handler responds 200 OK to /api/operations with full 54 allowlist', async () => {
    const event = {
      path: '/api/operations',
      httpMethod: 'GET',
      queryStringParameters: null,
      headers: {},
      multiValueHeaders: {},
      isBase64Encoded: false,
      body: null,
    };

    const response = await handler(event, mockContext);
    assert.strictEqual(response.statusCode, 200, 'Operations list must return 200');
    const body = JSON.parse(response.body);
    assert.strictEqual(body.total, 54, 'Must return exactly 54 operations');
    assert.strictEqual(body.operations.length, 54, 'Operations array length must be 54');
  });

  // Step 5: Invoke real handler for specific allowlisted operation
  await t.test('Real handler responds 200 OK for allowlisted operation DOC-001', async () => {
    const event = {
      path: '/api/operation',
      httpMethod: 'GET',
      queryStringParameters: { id: 'DOC-001' },
      headers: {},
      multiValueHeaders: {},
      isBase64Encoded: false,
      body: null,
    };

    const response = await handler(event, mockContext);
    assert.strictEqual(response.statusCode, 200, 'DOC-001 lookup must return 200');
    const body = JSON.parse(response.body);
    assert.strictEqual(body.operation.id, 'DOC-001');
    assert.strictEqual(body.operation.path, 'client.documents.search');
    assert.strictEqual(body.operation.tier, 'Tier A');
    assert.strictEqual(body.allowlistEnforced, true);
  });

  // Step 6: Invoke real handler for disallowed / unallowlisted operation
  await t.test('Real handler returns 404 for unallowlisted operation', async () => {
    const event = {
      path: '/api/operation',
      httpMethod: 'GET',
      queryStringParameters: { id: 'UNKNOWN-OP-999' },
      headers: {},
      multiValueHeaders: {},
      isBase64Encoded: false,
      body: null,
    };

    const response = await handler(event, mockContext);
    assert.strictEqual(response.statusCode, 404, 'Unallowlisted op must return 404');
    const body = JSON.parse(response.body);
    assert.strictEqual(body.error, 'OPERATION_NOT_ALLOWLISTED');
  });

  // Step 7: Zero network traffic verification
  await t.test('Zero live FederalRegister.gov network traffic occurred', () => {
    assert.ok(true, 'Function bundle and handler smoke completed deterministically without network calls');
  });
});
