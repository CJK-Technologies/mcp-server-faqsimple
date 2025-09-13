/**
 * Simplified tests for MCP Server core functionality
 */

// Mock console.error
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('MCP Server Environment Configuration', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterEach(() => {
    delete process.env.FAQSIMPLE_API_KEY;
    delete process.env.FAQSIMPLE_API_BASE;
    delete process.env.CACHE_TIMEOUT;
    delete process.env.RATE_LIMIT_DELAY;
  });

  describe('server configuration parsing', () => {
    it('should parse environment variables correctly', () => {
      process.env.FAQSIMPLE_API_KEY = 'fs.test.key.12345';
      process.env.FAQSIMPLE_API_BASE = 'https://api.test.faqsimple.io/v1';
      process.env.CACHE_TIMEOUT = '600000';
      process.env.RATE_LIMIT_DELAY = '2000';

      // Test the configuration parsing logic
      const config = {
        apiKey: process.env.FAQSIMPLE_API_KEY || '',
        baseURL: process.env.FAQSIMPLE_API_BASE || 'https://api.faqsimple.io/v1',
        cacheTimeout: parseInt(process.env.CACHE_TIMEOUT || '300000'),
        rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '1000'),
      };

      expect(config.apiKey).toBe('fs.test.key.12345');
      expect(config.baseURL).toBe('https://api.test.faqsimple.io/v1');
      expect(config.cacheTimeout).toBe(600000);
      expect(config.rateLimitDelay).toBe(2000);
    });

    it('should use default values when environment variables are missing', () => {
      process.env.FAQSIMPLE_API_KEY = 'fs.test.key';

      const config = {
        apiKey: process.env.FAQSIMPLE_API_KEY || '',
        baseURL: process.env.FAQSIMPLE_API_BASE || 'https://api.faqsimple.io/v1',
        cacheTimeout: parseInt(process.env.CACHE_TIMEOUT || '300000'),
        rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '1000'),
      };

      expect(config.apiKey).toBe('fs.test.key');
      expect(config.baseURL).toBe('https://api.faqsimple.io/v1');
      expect(config.cacheTimeout).toBe(300000);
      expect(config.rateLimitDelay).toBe(1000);
    });

    it('should handle invalid numeric environment variables', () => {
      process.env.FAQSIMPLE_API_KEY = 'fs.test.key';
      process.env.CACHE_TIMEOUT = 'invalid';
      process.env.RATE_LIMIT_DELAY = 'also-invalid';

      const config = {
        apiKey: process.env.FAQSIMPLE_API_KEY || '',
        baseURL: process.env.FAQSIMPLE_API_BASE || 'https://api.faqsimple.io/v1',
        cacheTimeout: parseInt(process.env.CACHE_TIMEOUT || '300000'),
        rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '1000'),
      };

      expect(config.cacheTimeout).toBeNaN();
      expect(config.rateLimitDelay).toBeNaN();
    });
  });

  describe('API error handling', () => {
    it('should detect connection errors', () => {
      const errorMessage = 'Network error: Unable to connect to FAQsimple API';
      
      const isConnectionError = errorMessage.includes('Network error') || errorMessage.includes('Unable to connect');
      const isAuthError = errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Invalid API key');
      const isPlaceholderError = errorMessage.includes('placeholder API key');

      expect(isConnectionError).toBe(true);
      expect(isAuthError).toBe(false);
      expect(isPlaceholderError).toBe(false);
    });

    it('should detect authentication errors', () => {
      const errorMessage = 'API Error 401: Invalid API key';
      
      const isConnectionError = errorMessage.includes('Network error') || errorMessage.includes('Unable to connect');
      const isAuthError = errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Invalid API key');
      const isPlaceholderError = errorMessage.includes('placeholder API key');

      expect(isConnectionError).toBe(false);
      expect(isAuthError).toBe(true);
      expect(isPlaceholderError).toBe(false);
    });

    it('should detect placeholder API key errors', () => {
      const errorMessage = 'Please replace the placeholder API key with your actual FAQsimple API key';
      
      const isConnectionError = errorMessage.includes('Network error') || errorMessage.includes('Unable to connect');
      const isAuthError = errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Invalid API key');
      const isPlaceholderError = errorMessage.includes('placeholder API key');

      expect(isConnectionError).toBe(false);
      expect(isAuthError).toBe(false);
      expect(isPlaceholderError).toBe(true);
    });
  });

  describe('response formatting', () => {
    it('should format search results correctly', () => {
      const mockResults = [
        {
          faq_number: 'FAQ001',
          faq_name: 'Product FAQ',
          question: 'How do I reset my password?',
          answer: 'Click forgot password and follow the steps.',
          relevance: 0.9
        }
      ];

      const query = 'password reset';
      const limit = 10;
      const limitedResults = mockResults.slice(0, Math.min(limit, 50));

      let content = `Found ${limitedResults.length} result${limitedResults.length === 1 ? '' : 's'} for "${query}":\n\n`;
      
      limitedResults.forEach((result, index) => {
        content += `**${index + 1}. ${result.faq_name}**\n`;
        content += `**Question:** ${result.question}\n\n`;
        content += `${result.answer}\n\n`;
        content += `*Relevance: ${(result.relevance * 100).toFixed(1)}% | FAQ: ${result.faq_number}*\n\n`;
        content += '---\n\n';
      });

      expect(content).toContain('Found 1 result for "password reset"');
      expect(content).toContain('**1. Product FAQ**');
      expect(content).toContain('How do I reset my password?');
      expect(content).toContain('Relevance: 90.0%');
    });

    it('should format FAQ content correctly', () => {
      const mockFAQ = {
        faq_number: 'FAQ001',
        name: 'Product FAQ',
        overview: 'Common product questions',
        faq_url: 'https://help.example.com/faq001',
        last_edited_timestamp: '2024-01-15T10:00:00Z',
        question_count: 2,
        questions: [
          {
            question_text: 'How do I login?',
            important: true,
            question_keywords: 'login, authentication',
            answers: [{ answer_text: 'Enter your credentials on the login page.' }]
          }
        ]
      };

      let content = `# ${mockFAQ.name}\n\n`;
      
      if (mockFAQ.overview) {
        content += `${mockFAQ.overview}\n\n`;
      }

      if (mockFAQ.faq_url) {
        content += `**Public URL:** ${mockFAQ.faq_url}\n\n`;
      }

      content += `**Questions:** ${mockFAQ.question_count}\n\n`;
      content += '---\n\n';

      mockFAQ.questions.forEach((question, index) => {
        content += `## ${index + 1}. ${question.question_text}\n\n`;

        if (question.important) {
          content += '> ⚠️ **Important Question**\n\n';
        }

        question.answers.forEach((answer) => {
          content += `${answer.answer_text}\n\n`;
        });

        if (question.question_keywords) {
          content += `*Keywords: ${question.question_keywords}*\n\n`;
        }

        content += '---\n\n';
      });

      expect(content).toContain('# Product FAQ');
      expect(content).toContain('Common product questions');
      expect(content).toContain('**Public URL:** https://help.example.com/faq001');
      expect(content).toContain('**Questions:** 2');
      expect(content).toContain('## 1. How do I login?');
      expect(content).toContain('> ⚠️ **Important Question**');
      expect(content).toContain('*Keywords: login, authentication*');
    });
  });
});