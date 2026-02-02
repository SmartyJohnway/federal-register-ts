// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\facets\document\frequency.test.ts

import { Frequency } from '../../../src/facets/document/frequency';
import { Client } from '../../../src/client';

describe('Frequency Facet', () => {
  const BASE_URI = "https://www.federalregister.gov/api/v1";

  beforeEach(() => {
    // Reset base URI to default before each test
    Client.overrideBaseUri(BASE_URI);
  });

  describe('chartUrl', () => {
    it('should generate a correct URL for simple parameters', () => {
      const args = { year: 2023, month: 10 };
      const expectedUrl = `${BASE_URI}/documents/facets/frequency.png?year=2023&month=10`;
      expect(Frequency.chartUrl(args)).toBe(expectedUrl);
    });

    it('should generate a correct URL for nested hash parameters', () => {
      const args = { conditions: { publication_date: { gte: '2023-01-01' } } };
      const expectedUrl = `${BASE_URI}/documents/facets/frequency.png?conditions%5Bpublication_date%5D%5Bgte%5D=2023-01-01`;
      expect(Frequency.chartUrl(args)).toBe(expectedUrl);
    });

    it('should generate a correct URL for array parameters', () => {
      const args = { agencies: ['1', '2'] };
      const expectedUrl = `${BASE_URI}/documents/facets/frequency.png?agencies%5B%5D=1&agencies%5B%5D=2`;
      expect(Frequency.chartUrl(args)).toBe(expectedUrl);
    });

    it('should generate a correct URL for mixed complex parameters', () => {
      const args = {
        conditions: { publication_date: { gte: '2023-01-01' } },
        agencies: ['1', '2'],
        term: 'test',
      };
      const expectedUrl = `${BASE_URI}/documents/facets/frequency.png?conditions%5Bpublication_date%5D%5Bgte%5D=2023-01-01&agencies%5B%5D=1&agencies%5B%5D=2&term=test`;
      expect(Frequency.chartUrl(args)).toBe(expectedUrl);
    });

    it('should generate a URL without query parameters if args are empty', () => {
      const args = {};
      const expectedUrl = `${BASE_URI}/documents/facets/frequency.png`;
      expect(Frequency.chartUrl(args)).toBe(expectedUrl);
    });
  });
});
