/**
 * CommonJS Example: Error Handling
 * Demonstrates:
 * - Differentiating client-side RequestValidationError from HTTP/API errors
 * - Error hierarchy inheritance checks
 */

const {
  FederalRegisterClient,
  FederalRegisterError,
  RequestValidationError,
  FederalRegisterHttpError
} = require('federal-register-ts');
const { createMockFetch } = require('../mock-transport');

async function main() {
  const mockFetch = createMockFetch();
  const client = new FederalRegisterClient({ fetch: mockFetch });

  console.log('1. Demonstrating client-side parameter validation error...');
  try {
    // page must be an integer between 1 and 50
    await client.documents.search({
      page: 999
    });
  } catch (err) {
    if (err instanceof RequestValidationError) {
      console.log('Caught expected RequestValidationError:');
      console.log(`- Message: ${err.message}`);
      console.log(`- Field: ${err.field}`);
      console.log(`- Invalid Value: ${err.value}`);
      console.log(`- Is instance of Error: ${err instanceof Error}`);
    } else {
      throw err;
    }
  }

  console.log('\n2. Demonstrating HTTP error handling...');
  const errorMockFetch = createMockFetch({
    '/api/v1/documents': async () => ({
      status: 400,
      body: {
        status: 400,
        message: 'Invalid search parameter supplied'
      }
    })
  });

  const errorClient = new FederalRegisterClient({ fetch: errorMockFetch });
  try {
    await errorClient.documents.search();
  } catch (err) {
    if (err instanceof FederalRegisterHttpError) {
      console.log('Caught expected FederalRegisterHttpError:');
      console.log(`- HTTP Status: ${err.status}`);
      console.log(`- Message: ${err.message}`);
      console.log(`- Body:`, err.body);
      console.log(`- Is instance of FederalRegisterError: ${err instanceof FederalRegisterError}`);
    } else {
      throw err;
    }
  }

  console.log('\nAll error scenarios verified successfully.');
}

main().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});
