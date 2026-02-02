// d:\HTSUSjohnway-SEP10\federal_register-master\ts_microservices_implementation\tests\topic.test.ts

import { Topic, ITopicAttributes } from '../src/topic';
import { Client } from '../src/client';

// Mock Client.get method
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

describe('Topic', () => {
  const mockTopicAttributes: ITopicAttributes = {
    name: 'Test Topic',
    slug: 'test-topic',
    url: 'http://example.com/topic',
  };

  beforeEach(() => {
    mockClientGet.mockClear();
  });

  it('should initialize correctly and expose attributes via getters', () => {
    const topic = new Topic(mockTopicAttributes);
    expect(topic.name).toBe(mockTopicAttributes.name);
    expect(topic.slug).toBe(mockTopicAttributes.slug);
    expect(topic.url).toBe(mockTopicAttributes.url);
  });

  describe('suggestions', () => {
    it('should call Client.get and return an array of Topic instances', async () => {
      const mockResponse = [mockTopicAttributes, { ...mockTopicAttributes, slug: 'another-topic', name: 'Another Topic' }];
      mockClientGet.mockResolvedValueOnce(mockResponse);

      const args = { term: 'test' };
      const suggestions = await Topic.suggestions(args);

      expect(mockClientGet).toHaveBeenCalledWith('/topics/suggestions', args);
      expect(suggestions.length).toBe(2);
      expect(suggestions[0]).toBeInstanceOf(Topic);
      expect(suggestions[0].name).toBe(mockTopicAttributes.name);
    });
  });
});
