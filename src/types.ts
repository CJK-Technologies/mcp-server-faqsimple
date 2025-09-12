/**
 * Types for FAQsimple API responses and MCP server
 */

export interface FAQListItem {
  faq_number: string;
  name: string;
  overview?: string;
  faq_url?: string;
}

export interface FAQListResponse {
  total_count: number;
  faqs: FAQListItem[];
}

export interface FAQAnswer {
  answer_text: string;
  answer_keywords?: string;
}

export interface FAQQuestion {
  question_text: string;
  question_keywords?: string;
  important?: boolean;
  answers: FAQAnswer[];
}

export interface FAQContent {
  faq_number: string;
  name: string;
  overview?: string;
  faq_url?: string;
  last_edited_timestamp?: string;
  question_count: number;
  questions: FAQQuestion[];
}

export interface SearchResult {
  faq_number: string;
  faq_name: string;
  question: string;
  answer: string;
  relevance: number;
}

export interface ServerConfig {
  apiKey: string;
  baseURL?: string;
  rateLimitDelay?: number;
  cacheTimeout?: number;
}