import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import { FederalRegisterClient } from 'federal-register-ts';
import canonicalRegistry from '../../src/data/canonicalRegistry.json';
import { executeOperation, isRunnable } from '../../src/lib/executor';

// Instantiate FederalRegisterClient for live Node.js 24 runtime execution
const sdkClient = new FederalRegisterClient();

export interface OperationDescriptor {
  id: string;
  namespace: string;
  path: string;
  method: string;
  tier: string;
  paramReq: string;
  params: string;
  returns: string;
  trade: boolean;
  desc: string;
  runnable: boolean;
}

// Explicit static allowlist mapping operation ID to operation metadata
export const STATIC_OPERATION_ALLOWLIST: ReadonlyMap<string, OperationDescriptor> = new Map(
  canonicalRegistry.map((item) => [
    item.id,
    {
      id: item.id,
      namespace: item.ns,
      path: item.path,
      method: item.method,
      tier: item.tier,
      paramReq: item.paramReq,
      params: item.params,
      returns: item.returns,
      trade: item.trade,
      desc: item.desc,
      runnable: isRunnable(item.id),
    },
  ])
);

export const handler: Handler = async (
  event: HandlerEvent,
  _context: HandlerContext
): Promise<HandlerResponse> => {
  const { path, httpMethod, queryStringParameters, body } = event;

  const headers = {
    'Content-Type': 'application/json',
    'X-SDK-Version': '1.1.0',
    'X-Runtime': 'Node.js 24',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Route: /api/health
  if (path.endsWith('/health') || queryStringParameters?.action === 'health') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'healthy',
        runtime: process.version,
        sdkInitialized: Boolean(sdkClient),
        allowedOperationsCount: STATIC_OPERATION_ALLOWLIST.size,
        runnableOperationsCount: Array.from(STATIC_OPERATION_ALLOWLIST.values()).filter((o) => o.runnable).length,
        timestamp: new Date().toISOString(),
      }),
    };
  }

  // Route: /api/operations (List all allowlisted operations)
  if (path.endsWith('/operations') || queryStringParameters?.action === 'operations') {
    const list = Array.from(STATIC_OPERATION_ALLOWLIST.values());
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        total: list.length,
        operations: list,
      }),
    };
  }

  // Route: POST /api/execute or ?action=execute (Safe Developer Execution Gateway)
  if (
    httpMethod === 'POST' ||
    path.endsWith('/execute') ||
    queryStringParameters?.action === 'execute'
  ) {
    let payload: { operationId?: string; params?: any } = {};
    if (body) {
      try {
        payload = JSON.parse(body);
      } catch {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'INVALID_JSON',
            message: 'Request body must be valid JSON',
          }),
        };
      }
    }

    const operationId = payload.operationId || queryStringParameters?.operationId || queryStringParameters?.id;
    if (!operationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'MISSING_OPERATION_ID',
          message: 'operationId is required for execution',
        }),
      };
    }

    const op = STATIC_OPERATION_ALLOWLIST.get(operationId);
    if (!op) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'OPERATION_NOT_FOUND',
          message: `Operation '${operationId}' is not found in the canonical allowlist`,
        }),
      };
    }

    if (!isRunnable(operationId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'OPERATION_NOT_RUNNABLE',
          message: `Operation '${operationId}' is Tier C (Documented Only) and cannot be executed via Developer Gateway`,
        }),
      };
    }

    const startTime = performance.now();
    try {
      const result = await executeOperation(sdkClient, operationId, payload.params);
      const elapsedMs = Math.round(performance.now() - startTime);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          operationId,
          elapsedMs,
          data: result,
          timestamp: new Date().toISOString(),
        }),
      };
    } catch (err: any) {
      const elapsedMs = Math.round(performance.now() - startTime);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'EXECUTION_ERROR',
          operationId,
          elapsedMs,
          message: err?.message || 'Unknown SDK execution error',
        }),
      };
    }
  }

  // Route: /api/operation?id=DOC-001 (Lookup specific operation safely)
  const operationId = queryStringParameters?.id;
  if (operationId) {
    const op = STATIC_OPERATION_ALLOWLIST.get(operationId);
    if (!op) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'OPERATION_NOT_ALLOWLISTED',
          message: `Operation ${operationId} is not present in the static allowlist`,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        operation: op,
        serverBoundary: 'Netlify Functions Node.js 24',
        allowlistEnforced: true,
      }),
    };
  }

  // Default gateway info response
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      name: 'federal-register-ts-showcase-gateway',
      version: '1.1.0',
      nodeVersion: process.version,
      allowlistOperations: STATIC_OPERATION_ALLOWLIST.size,
      runnableOperations: Array.from(STATIC_OPERATION_ALLOWLIST.values()).filter((o) => o.runnable).length,
      documentation: 'Static Allowlist Gateway for Federal Register SDK Showcase',
    }),
  };
};
