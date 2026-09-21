/**
 * Reusable mock transport for offline example execution and deterministic testing.
 * Implements a minimal fetch-compatible handler returning synthetic Federal Register responses.
 */

function createMockFetch(customHandlers = {}) {
  return async function mockFetch(input, init) {
    const urlString = typeof input === 'string' ? input : input.url;
    const url = new URL(urlString);
    const pathname = url.pathname;

    // Check custom handlers first
    if (customHandlers[pathname]) {
      const customResponse = await customHandlers[pathname](url, init);
      return new Response(JSON.stringify(customResponse.body), {
        status: customResponse.status || 200,
        headers: { 'Content-Type': 'application/json', ...(customResponse.headers || {}) }
      });
    }

    // Default synthetic responses
    if (pathname.endsWith('/documents')) {
      return new Response(JSON.stringify({
        count: 2,
        total_pages: 1,
        results: [
          {
            title: 'Energy Conservation Standards for Commercial Equipment',
            document_number: '2024-00101',
            publication_date: '2024-01-15',
            html_url: 'https://www.federalregister.gov/documents/2024/01/15/2024-00101'
          },
          {
            title: 'Renewable Fuel Standard Program Annual Standards',
            document_number: '2024-00102',
            publication_date: '2024-01-16',
            html_url: 'https://www.federalregister.gov/documents/2024/01/16/2024-00102'
          }
        ]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pathname.includes('/documents/2024-00101')) {
      return new Response(JSON.stringify({
        title: 'Energy Conservation Standards for Commercial Equipment',
        document_number: '2024-00101',
        publication_date: '2024-01-15',
        type: 'Rule',
        abstract: 'Final rule establishing updated standards.',
        html_url: 'https://www.federalregister.gov/documents/2024/01/15/2024-00101'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pathname.endsWith('/public-inspection-documents/current')) {
      return new Response(JSON.stringify({
        count: 1,
        results: [
          {
            title: 'Special Notice on Environmental Review Procedures',
            document_number: '2024-09999',
            filed_at: '2024-01-15 08:45:00',
            agency_names: ['Environmental Protection Agency']
          }
        ]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pathname.endsWith('/documents/facets/agency')) {
      return new Response(JSON.stringify({
        'environmental-protection-agency': {
          name: 'Environmental Protection Agency',
          count: 42,
          slug: 'environmental-protection-agency'
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generic fallback response
    return new Response(JSON.stringify({ status: 200, message: 'Mock response for ' + pathname }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
}

module.exports = { createMockFetch };
