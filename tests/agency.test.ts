// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\agency.test.ts

import { Agency, IAgencyAttributes } from '../src/agency';
import { Client } from '../src/client';

jest.mock('../src/client', () => {
  const originalModule = jest.requireActual('../src/client');

  return {
    __esModule: true, // <-- Important for ES Modules
    ...originalModule,
    Client: class extends originalModule.Client {
      static get = jest.fn();
    },
  };
});

const mockClientGet = Client.get as jest.Mock;

describe('Agency', () => {
  const mockAgencyAttributes: IAgencyAttributes = {
    id: 1,
    name: 'Test Agency',
    slug: 'test-agency',
    agency_url: 'http://example.com/agency',
    json_url: 'http://example.com/agency.json',
    logo: { small_url: 'http://example.com/logo_small.png', large_url: 'http://example.com/logo_large.png' },
  };

  beforeEach(() => {
    mockClientGet.mockClear();
  });

  it('should initialize correctly and expose attributes via getters', () => {
    const agency = new Agency(mockAgencyAttributes);
    expect(agency.id).toBe(mockAgencyAttributes.id);
    expect(agency.name).toBe(mockAgencyAttributes.name);
    expect(agency.slug).toBe(mockAgencyAttributes.slug);
    expect(agency.agency_url).toBe(mockAgencyAttributes.agency_url);
    expect(agency.json_url).toBe(mockAgencyAttributes.json_url);
  });

  describe('all', () => {
    it('should call Client.get and return an array of Agency instances', async () => {
      const mockResponse = [mockAgencyAttributes, { ...mockAgencyAttributes, id: 2, name: 'Another Agency' }];
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const agencies = await Agency.all();

      expect(mockClientGet).toHaveBeenCalledWith('/agencies.json', {});
      expect(agencies.length).toBe(2);
      expect(agencies[0]).toBeInstanceOf(Agency);
      expect(agencies[0].name).toBe(mockAgencyAttributes.name);
    });

    it('should include fields in query if provided', async () => {
      const mockResponse = [mockAgencyAttributes];
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const options = { fields: ['name', 'slug'] };
      await Agency.all(options);

      expect(mockClientGet).toHaveBeenCalledWith('/agencies.json', { fields: ['name', 'slug'] });
    });
  });

  describe('find', () => {
    it('should call Client.get with ID and return an Agency instance', async () => {
      mockClientGet.mockResolvedValueOnce(mockAgencyAttributes);

      const agencyId = 1;
      const agency = await Agency.find(agencyId);

      expect(mockClientGet).toHaveBeenCalledWith(`/agencies/${agencyId}.json`, {});
      expect(agency).toBeInstanceOf(Agency);
      expect((agency as Agency).id).toBe(agencyId);
    });

    it('should call Client.get with slug and return an Agency instance', async () => {
      mockClientGet.mockResolvedValueOnce(mockAgencyAttributes);

      const agencySlug = 'test-agency';
      const agency = await Agency.find(agencySlug);

      expect(mockClientGet).toHaveBeenCalledWith(`/agencies/${agencySlug}.json`, {});
      expect(agency).toBeInstanceOf(Agency);
      expect((agency as Agency).slug).toBe(agencySlug);
    });

    it('should include fields in query if provided', async () => {
      mockClientGet.mockResolvedValueOnce(mockAgencyAttributes);

      const agencyId = 1;
      const options = { fields: ['name', 'slug'] };
      await Agency.find(agencyId, options);

      expect(mockClientGet).toHaveBeenCalledWith(`/agencies/${agencyId}.json`, { fields: ['name', 'slug'] });
    });

    it('should return an array of agencies if API returns an array', async () => {
      const mockResponse = [mockAgencyAttributes, { ...mockAgencyAttributes, id: 2, name: 'Another Agency' }];
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const agencyId = 1;
      const agencies = await Agency.find(agencyId);

      expect(Array.isArray(agencies)).toBe(true);
      expect((agencies as Agency[]).length).toBe(2);
      expect((agencies as Agency[])[0]).toBeInstanceOf(Agency);
    });
  });

  describe('suggestions', () => {
    it('should call Client.get and return an array of Agency instances', async () => {
      const mockResponse = [mockAgencyAttributes];
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const args = { term: 'test' };
      const suggestions = await Agency.suggestions(args);

      expect(mockClientGet).toHaveBeenCalledWith('/agencies/suggestions', args);
      expect(suggestions.length).toBe(1);
      expect(suggestions[0]).toBeInstanceOf(Agency);
    });
  });

  describe('logoUrl', () => {
    it('should return the correct logo URL for a given size', () => {
      const agency = new Agency(mockAgencyAttributes);
      expect(agency.logoUrl('small')).toBe(mockAgencyAttributes.logo.small_url);
    });

    it('should return undefined if logo or size is not present', () => {
      const agency = new Agency({ ...mockAgencyAttributes, logo: undefined });
      expect(agency.logoUrl('small')).toBeUndefined();

      const agencyWithNoSize = new Agency({ ...mockAgencyAttributes, logo: { other_url: 'test' } });
      expect(agencyWithNoSize.logoUrl('small')).toBeUndefined();
    });
  });
});
