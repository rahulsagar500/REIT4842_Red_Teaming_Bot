// src/utils/__tests__/csrfLoader.test.ts
import { fetchWithCSRF } from "../csrfLoader";

// Mock Global fetch
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

describe('fetchWithCSRF', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: '',
        });
    });

    test('adds CSRF token from cookie to headers', async () => {
        document.cookie = 'XSRF-TOKEN=test-csrf-token';
        
        mockFetch.mockResolvedValue(new Response(JSON.stringify({ success: true}), {
            status: 200,
            headers: { 'Content-Type': 'applications/json' },
        }));

        await fetchWithCSRF('api/test');

        expect(mockFetch).toHaveBeenLastCalledWith('/api/test', expect.objectContaining({
            headers: expect.any(Headers),
            credentials: 'include',
        }));
        
        const headerArg = mockFetch.mock.calls[0][1]?.headers;
        expect(headerArg.get('X-CSRFToken')).toBe('test-csrf-token');
    });

    test('does not add CSRF token if not in cookie', async () => {
        document.cookie = '';
        
        mockFetch.mockResolvedValue(new Response(null, { status: 200 }));

        await fetchWithCSRF('api/no-token');
        
        const headerArg = mockFetch.mock.calls[0][1]?.headers;
        expect(headerArg.get('X-CSRFToken')).toBeNull();
    });

    test('merges custom headers with CSRF token', async () => {
        document.cookie = 'XSRF-TOKEN=merge-test';
        
        mockFetch.mockResolvedValue(new Response(null, { status: 200 }));

        const customHeaders = new Headers({ Authorization: 'Bearer 123' });
        await fetchWithCSRF('api/merge', { headers: customHeaders });
        
        const headerArg = mockFetch.mock.calls[0][1]?.headers;
        expect(headerArg.get('Authorization')).toBe('Bearer 123');
        expect(headerArg.get('X-CSRFToken')).toBe('merge-test');
    });
});

