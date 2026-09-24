import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import { FederalRegisterClient } from 'federal-register-ts';
import canonicalRegistry from '../../src/data/canonicalRegistry.json';

// Instantiate FederalRegisterClient to verify Node.js 24 runtime compatibility
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
}

// Explicit static allowlist mapping operation ID to operation metadata
// Strictly avoids dynamic traversal, eval, or Function constructors
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
    },
  ])
);

export const handler: Handler = async (
  event: HandlerEvent,
  _context: HandlerContext
): Promise<HandlerResponse> => {
  const { path, queryStringParameters } = event;

  const headers = {
    'Content-Type': 'application/json',
    'X-SDK-Version': '1.1.0',
    'X-Runtime': 'Node.js 24',
    'Access-Control-Allow-Origin': '*',
  };

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

  // Default response
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      name: 'federal-register-ts-showcase-gateway',
      version: '1.1.0',
      nodeVersion: process.version,
      allowlistOperations: STATIC_OPERATION_ALLOWLIST.size,
      documentation: 'Static Allowlist Gateway for Federal Register SDK Showcase',
    }),
  };
};
