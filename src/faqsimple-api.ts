/**
 * FAQsimple API client for MCP server
 * Based on the official JavaScript examples with TypeScript enhancements
 */

import fetch from 'node-fetch';
import type { FAQListResponse, FAQContent, SearchResult, ServerConfig } from './types.js';

export class FAQsimpleAPI {
  private apiKey: string;
  private baseURL: string;
  private rateLimitRemaining: number = 100;
  private rateLimitReset: number | null = null;
  private rateLimitDelay: number;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout: number;

  constructor(config: ServerConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.faqsimple.com/v1';
    this.rateLimitDelay = config.rateLimitDelay || 1000;
    this.cacheTimeout = config.cacheTimeout || 300000; // 5 minutes

    if (!this.apiKey || !this.apiKey.startsWith('fs.')) {
      throw new Error('Invalid API key format. API key must start with "fs."');
    }
  }

  /**
   * Make authenticated API request with error handling and rate limiting
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseURL}/${endpoint}`);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'mcp-server-faqsimple/1.0.0'
    };

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers
      });

      // Update rate limit info
      this.rateLimitRemaining = parseInt(response.headers.get('x-ratelimit-remaining') || '0');
      this.rateLimitReset = parseInt(response.headers.get('x-ratelimit-reset') || '0');

      if (response.status === 429) {
        const resetTime = this.rateLimitReset ? new Date(this.rateLimitReset * 1000) : new Date();
        throw new Error(`Rate limit exceeded. Reset at: ${resetTime.toISOString()}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          throw new Error('Network error: Unable to connect to FAQsimple API');
        }
        throw error;
      }
      throw new Error(`Unexpected error: ${error}`);
    }
  }

  /**
   * Get data from cache or make API request
   */
  private async getCached<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * List all published FAQs
   */
  async listFAQs(): Promise<FAQListResponse> {
    return this.getCached('listfaqs', () => this.makeRequest<FAQListResponse>('listfaqs'));
  }

  /**
   * List FAQs with question text
   */
  async listFAQsAndQuestions(): Promise<FAQListResponse> {
    return this.getCached('listfaqsandquestions', () => 
      this.makeRequest<FAQListResponse>('listfaqsandquestions')
    );
  }

  /**
   * Get complete FAQ with Q&A data
   */
  async getFAQContent(faqNumber: string): Promise<FAQContent> {
    if (!faqNumber) {
      throw new Error('FAQ number is required');
    }
    
    return this.getCached(`faq_${faqNumber}`, () =>
      this.makeRequest<FAQContent>('getfaqplusqa', { faq_number: faqNumber })
    );
  }

  /**
   * Search for FAQ content across all FAQs
   */
  async searchFAQs(query: string): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    const faqsData = await this.listFAQsAndQuestions();
    const results: SearchResult[] = [];

    for (const faq of faqsData.faqs) {
      try {
        const faqContent = await this.getFAQContent(faq.faq_number);
        
        for (const question of faqContent.questions) {
          const questionText = question.question_text.toLowerCase();
          const queryLower = query.toLowerCase();
          
          // Check if query matches question
          if (questionText.includes(queryLower)) {
            for (const answer of question.answers) {
              results.push({
                faq_number: faq.faq_number,
                faq_name: faq.name,
                question: question.question_text,
                answer: answer.answer_text,
                relevance: this.calculateRelevance(query, question.question_text, answer.answer_text)
              });
            }
          } else {
            // Check if query matches any answer
            for (const answer of question.answers) {
              const answerText = answer.answer_text.toLowerCase();
              if (answerText.includes(queryLower)) {
                results.push({
                  faq_number: faq.faq_number,
                  faq_name: faq.name,
                  question: question.question_text,
                  answer: answer.answer_text,
                  relevance: this.calculateRelevance(query, question.question_text, answer.answer_text)
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error searching FAQ ${faq.faq_number}:`, error);
        // Continue with other FAQs
      }
    }

    // Sort by relevance and return top results
    results.sort((a, b) => b.relevance - a.relevance);
    return results.slice(0, 10); // Return top 10 results
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevance(query: string, questionText: string, answerText: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const questionWords = questionText.toLowerCase().split(/\s+/);
    const answerWords = answerText.toLowerCase().split(/\s+/);
    
    let questionMatches = 0;
    let answerMatches = 0;
    
    queryWords.forEach(queryWord => {
      if (questionWords.some(word => word.includes(queryWord))) {
        questionMatches++;
      }
      if (answerWords.some(word => word.includes(queryWord))) {
        answerMatches++;
      }
    });

    // Weight question matches higher than answer matches
    const questionScore = (questionMatches / queryWords.length) * 0.7;
    const answerScore = (answerMatches / queryWords.length) * 0.3;
    
    return questionScore + answerScore;
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus(): { remaining: number; resetTime: Date | null } {
    return {
      remaining: this.rateLimitRemaining,
      resetTime: this.rateLimitReset ? new Date(this.rateLimitReset * 1000) : null
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}