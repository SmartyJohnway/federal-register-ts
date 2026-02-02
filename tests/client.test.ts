// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\client.test.ts

import { Client, BadRequest, RecordNotFound, ServerError, ServiceUnavailable, GatewayTimeout, ResponseError } from '../src/client';

const mockFetch = jest.fn();



// @ts-ignore
global.fetch = mockFetch;

describe('Client', () => {
  const BASE_URI = "https://www.federalregister.gov/api/v1";

  beforeEach(() => {
    mockFetch.mockClear();
    // Reset base URI to default before each test
    Client.overrideBaseUri(BASE_URI);
  });

  describe('get', () => {
    it('should fetch data successfully for a 200 response', async () => {
      const mockData = { message: 'Success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const result = await (Client as any).get('/test');
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URI}/test`);
    });

    it('should handle query parameters correctly', async () => {
      const mockData = { message: 'Success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const queryParams = { param1: 'value1', param2: 'value2' };
      await (Client as any).get('/test', queryParams);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URI}/test?param1=value1&param2=value2`);
    });

    it('should handle array query parameters correctly', async () => {
      const mockData = { message: 'Success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const queryParams = { 'fields': ['field1', 'field2'] };
      await (Client as any).get('/test', queryParams);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URI}/test?fields%5B%5D=field1&fields%5B%5D=field2`);
    });

    it('should handle nested query parameters correctly', async () => {
      const mockData = { message: 'Success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const queryParams = { 'conditions': { 'publication_date': { 'gte': '2023-01-01' } } };
      await (Client as any).get('/test', queryParams);
      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URI}/test?conditions%5Bpublication_date%5D%5Bgte%5D=2023-01-01`);
    });

    it('should throw BadRequest for a 400 response', async () => {
      const mockError = { error: 'Invalid request' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockError),
      });

      try {
        await (Client as any).get('/test');
        fail('Expected Client.get to throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequest);
        expect(e.statusCode).toBe(400);
        expect(e.body).toEqual(mockError);
      }
    });

    it('should throw RecordNotFound for a 404 response', async () => {
      const mockError = { error: 'Not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(mockError),
      });

      try {
        await (Client as any).get('/test');
        fail('Expected Client.get to throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(RecordNotFound);
        expect(e.statusCode).toBe(404);
        expect(e.body).toEqual(mockError);
      }
    });

    it('should throw ServerError for a 500 response', async () => {
      const mockError = { error: 'Internal server error' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(mockError),
      });

      try {
        await (Client as any).get('/test');
        fail('Expected Client.get to throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(ServerError);
        expect(e.statusCode).toBe(500);
        expect(e.body).toEqual(mockError);
      }
    });

    it('should throw ServiceUnavailable for a 503 response', async () => {
      const mockError = { error: 'Service unavailable' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve(mockError),
      });

      try {
        await (Client as any).get('/test');
        fail('Expected Client.get to throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(ServiceUnavailable);
        expect(e.statusCode).toBe(503);
        expect(e.body).toEqual(mockError);
      }
    });

    it('should throw GatewayTimeout for a 504 response', async () => {
      const mockError = { error: 'Gateway timeout' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 504,
        json: () => Promise.resolve(mockError),
      });

      try {
        await (Client as any).get('/test');
        fail('Expected Client.get to throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(GatewayTimeout);
        expect(e.statusCode).toBe(504);
        expect(e.body).toEqual(mockError);
      }
    });

    it('should throw generic ResponseError for other non-200 responses', async () => {
      const mockError = { error: 'Unknown error' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 418,
        json: () => Promise.resolve(mockError),
      });

      try {
        await (Client as any).get('/test');
        fail('Expected Client.get to throw');
      } catch (e: any) {
        expect(e).toBeInstanceOf(ResponseError);
        expect(e.statusCode).toBe(418);
        expect(e.body).toEqual(mockError);
      }
    });
  });

  describe('overrideBaseUri', () => {
    it('should change the base URI for subsequent requests', async () => {
      const newUri = 'http://localhost:3000';
      Client.overrideBaseUri(newUri);

      const mockData = { message: 'Success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      await (Client as any).get('/test');
      expect(mockFetch).toHaveBeenCalledWith(`${newUri}/test`);
    });
  });
});
