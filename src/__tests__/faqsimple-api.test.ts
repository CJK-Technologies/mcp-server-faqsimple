/**
 * Tests for FAQsimple API client
 */

import { FAQsimpleAPI } from '../faqsimple-api';

// Mock node-fetch
jest.mock('node-fetch', () => jest.fn());

const mockFetch = require('node-fetch') as jest.MockedFunction<any>;

describe('FAQsimpleAPI', () => {
  let api: FAQsimpleAPI;

  beforeEach(() => {
    api = new FAQsimpleAPI({
      apiKey: 'fs.test.key.12345',
      baseURL: 'https://api.test.faqsimple.com/v1',
      cacheTimeout: 1000,
    });
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with valid API key', () => {
      expect(api).toBeDefined();
    });

    it('should throw error with invalid API key', () => {
      expect(() => {
        new FAQsimpleAPI({ apiKey: 'invalid-key' });
      }).toThrow('Invalid API key format. API key must start with "fs."');
    });

    it('should throw error with placeholder API key', () => {
      expect(() => {
        new FAQsimpleAPI({ apiKey: 'fs.your.api.key.here' });
      }).toThrow('Please replace the placeholder API key with your actual FAQsimple API key');
    });

    it('should use default base URL when not provided', () => {
      const defaultApi = new FAQsimpleAPI({ apiKey: 'fs.test.key' });
      expect(defaultApi).toBeDefined();
    });
  });

  describe('rate limit status', () => {
    it('should return initial rate limit status', () => {
      const status = api.getRateLimitStatus();
      expect(status.remaining).toBe(100);
      expect(status.resetTime).toBeNull();
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      api.clearCache();
      // No error should be thrown
    });
  });

  describe('listFAQs', () => {
    it('should make API request and return FAQ list', async () => {
      const mockResponse = {
        total_count: 2,
        faqs: [
          { faq_number: 'FAQ001', name: 'Test FAQ 1' },
          { faq_number: 'FAQ002', name: 'Test FAQ 2' }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('50')
        },
        json: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const result = await api.listFAQs();
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.faqsimple.com/v1/listfaqs',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fs.test.key.12345'
          })
        })
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: {
          get: jest.fn().mockReturnValue('0')
        },
        json: jest.fn().mockResolvedValue({ message: 'Invalid API key' })
      } as any);

      await expect(api.listFAQs()).rejects.toThrow('API Error 401: Invalid API key');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      await expect(api.listFAQs()).rejects.toThrow('Network error: Unable to connect to FAQsimple API');
    });

    it('should handle rate limit exceeded', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'x-ratelimit-remaining') return '0';
            if (header === 'x-ratelimit-reset') return '1640995200';
            return null;
          })
        },
        json: jest.fn().mockResolvedValue({})
      } as any);

      await expect(api.listFAQs()).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('getFAQContent', () => {
    it('should throw error when FAQ number is missing', async () => {
      await expect(api.getFAQContent('')).rejects.toThrow('FAQ number is required');
    });

    it('should make API request with FAQ number', async () => {
      const mockResponse = {
        faq_number: 'FAQ001',
        name: 'Test FAQ',
        question_count: 1,
        questions: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('49')
        },
        json: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const result = await api.getFAQContent('FAQ001');
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.faqsimple.com/v1/getfaqplusqa?faq_number=FAQ001',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('healthCheck', () => {
    it('should return success status when API is accessible', async () => {
      const mockResponse = {
        total_count: 1,
        faqs: [{ faq_number: 'FAQ001', name: 'Test FAQ' }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('50')
        },
        json: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const health = await api.healthCheck();
      
      expect(health.status).toBe('ok');
      expect(health.message).toBe('Connection and authentication successful');
    });

    it('should return connection error for network failures', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      const health = await api.healthCheck();
      
      expect(health.status).toBe('connection_error');
      expect(health.message).toContain('Unable to connect to');
      expect(health.message).toContain('Please ensure you have a valid connection');
    });

    it('should return auth error for 401 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: {
          get: jest.fn().mockReturnValue('0')
        },
        json: jest.fn().mockResolvedValue({ message: 'Invalid API key' })
      } as any);

      const health = await api.healthCheck();
      
      expect(health.status).toBe('auth_error');
      expect(health.message).toBe('Your API Key seems invalid, please contact FAQsimple support (support@faqsimple.com) for assistance if needed.');
    });

    it('should return auth error for 403 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: {
          get: jest.fn().mockReturnValue('0')
        },
        json: jest.fn().mockResolvedValue({ message: 'Forbidden' })
      } as any);

      const health = await api.healthCheck();
      
      expect(health.status).toBe('auth_error');
      expect(health.message).toBe('Your API Key seems invalid, please contact FAQsimple support (support@faqsimple.com) for assistance if needed.');
    });
  });

  describe('searchFAQs', () => {
    it('should return empty array for empty query', async () => {
      const result = await api.searchFAQs('');
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace query', async () => {
      const result = await api.searchFAQs('   ');
      expect(result).toEqual([]);
    });
  });
});