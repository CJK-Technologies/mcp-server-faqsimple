/**
 * Tests for type definitions
 */

import type { 
  FAQListItem, 
  FAQListResponse, 
  FAQAnswer, 
  FAQQuestion, 
  FAQContent, 
  SearchResult, 
  ServerConfig 
} from '../types';

describe('Type Definitions', () => {
  it('should define FAQListItem interface', () => {
    const item: FAQListItem = {
      faq_number: 'FAQ001',
      name: 'Test FAQ'
    };
    
    expect(item.faq_number).toBe('FAQ001');
    expect(item.name).toBe('Test FAQ');
  });

  it('should define FAQListResponse interface', () => {
    const response: FAQListResponse = {
      total_count: 1,
      faqs: [{
        faq_number: 'FAQ001',
        name: 'Test FAQ'
      }]
    };
    
    expect(response.total_count).toBe(1);
    expect(response.faqs).toHaveLength(1);
  });

  it('should define FAQAnswer interface', () => {
    const answer: FAQAnswer = {
      answer_text: 'This is an answer'
    };
    
    expect(answer.answer_text).toBe('This is an answer');
  });

  it('should define FAQQuestion interface', () => {
    const question: FAQQuestion = {
      question_text: 'What is this?',
      answers: [{
        answer_text: 'This is an answer'
      }]
    };
    
    expect(question.question_text).toBe('What is this?');
    expect(question.answers).toHaveLength(1);
  });

  it('should define FAQContent interface', () => {
    const content: FAQContent = {
      faq_number: 'FAQ001',
      name: 'Test FAQ',
      question_count: 1,
      questions: [{
        question_text: 'What is this?',
        answers: [{
          answer_text: 'This is an answer'
        }]
      }]
    };
    
    expect(content.faq_number).toBe('FAQ001');
    expect(content.name).toBe('Test FAQ');
    expect(content.question_count).toBe(1);
  });

  it('should define SearchResult interface', () => {
    const result: SearchResult = {
      faq_number: 'FAQ001',
      faq_name: 'Test FAQ',
      question: 'What is this?',
      answer: 'This is an answer',
      relevance: 0.8
    };
    
    expect(result.faq_number).toBe('FAQ001');
    expect(result.relevance).toBe(0.8);
  });

  it('should define ServerConfig interface', () => {
    const config: ServerConfig = {
      apiKey: 'fs.test.key'
    };
    
    expect(config.apiKey).toBe('fs.test.key');
  });
});