# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup and structure

## [1.0.1] - 2024-01-15

### Changed
- **API Base URL**: Updated default API base URL from `https://api.faqsimple.com/v1` to `https://api.faqsimple.io/v1`
- Updated environment configuration and documentation to reflect new API endpoint

## [1.0.0] - 2024-01-15

### Added
- **MCP Server Implementation**: Complete Model Context Protocol server for FAQsimple integration
- **FAQsimple API Client**: TypeScript client with comprehensive error handling and rate limiting
- **Search Functionality**: 
  - Cross-FAQ search with relevance scoring
  - Question and answer text matching
  - Configurable result limits (1-50 results)
- **FAQ Content Access**: 
  - Complete FAQ retrieval with all questions and answers
  - Markdown formatted output with proper structure
  - Metadata inclusion (last updated, public URLs, keywords)
- **Resource Management**: 
  - MCP resource exposure for FAQ content
  - URI-based FAQ access (`faq://FAQ001`)
  - Markdown MIME type support
- **Caching System**: 
  - Configurable cache timeout (default 5 minutes)
  - Automatic cache invalidation
  - Performance optimization for repeated requests
- **Rate Limiting**: 
  - API rate limit compliance
  - Configurable request delays
  - Rate limit status reporting
- **Environment Configuration**: 
  - Environment variable-based setup
  - Secure API key management
  - Flexible API endpoint configuration
- **Error Handling**: 
  - Comprehensive error catching and reporting
  - User-friendly error messages
  - Graceful degradation on API failures
- **TypeScript Support**: 
  - Full TypeScript implementation
  - Type definitions for all API responses
  - Enhanced developer experience
- **Development Tools**: 
  - ESLint configuration for code quality
  - Prettier for code formatting
  - Jest testing framework setup
  - Development and build scripts

### Security
- **API Key Validation**: Ensures proper FAQsimple API key format
- **Environment Variable Usage**: Prevents hardcoded secrets
- **Input Validation**: Validates all user inputs and parameters

### Documentation
- **Comprehensive README**: Professional documentation with badges, usage examples, and setup instructions
- **Contributing Guidelines**: Detailed contribution process and code standards
- **Apache 2.0 License**: Open source license for community use
- **TypeScript Docs**: JSDoc comments throughout codebase

### Tools
- `search_faqs` - Search across all accessible FAQs with configurable limits
- `get_faq_content` - Retrieve complete FAQ content by FAQ number
- `list_faqs` - List all accessible FAQs with basic information

### Performance
- **Optimized Search**: Efficient relevance scoring algorithm
- **Batch Operations**: Support for multiple FAQ searches
- **Memory Management**: Proper cleanup and resource management

[Unreleased]: https://github.com/CJK-Technologies/mcp-server-faqsimple/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/CJK-Technologies/mcp-server-faqsimple/releases/tag/v1.0.0