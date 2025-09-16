# Architecture Guide

## Overview

The FAQsimple MCP Server is built using the Model Context Protocol (MCP) to provide AI assistants with access to FAQ content through a standardized interface. The architecture follows a layered approach with clear separation of concerns.

## Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Assistant (Claude, etc.)                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ MCP Protocol
┌─────────────────────────┴───────────────────────────────────────┐
│                 FAQsimple MCP Server                             │
├─────────────────────────────────────────────────────────────────┤
│  Tool Handlers          │  Resource Handlers                    │
│  - search_faqs          │  - faq://FAQ001                       │
│  - get_faq_content      │  - faq://FAQ002                       │
│  - list_faqs            │  - ...                                │
├─────────────────────────────────────────────────────────────────┤
│                    FAQsimple API Client                         │
├─────────────────────────────────────────────────────────────────┤
│  Caching Layer          │  Rate Limiting    │  Error Handling   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS/REST API
┌─────────────────────────┴───────────────────────────────────────┐
│                  FAQsimple API Service                          │
│                  api.faqsimple.io/v1                           │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### FAQsimpleMCPServer

The main server class that implements the MCP protocol specification:

- **Initialization**: Sets up tool and resource handlers, validates environment configuration
- **Health Checks**: Performs startup health checks to verify API connectivity
- **Error Management**: Provides comprehensive error handling with user-friendly messages
- **Protocol Compliance**: Implements MCP specification for tools and resources

### FAQsimpleAPI

The API client layer that manages external service communication:

- **Authentication**: Bearer token authentication with API key validation
- **Caching**: In-memory cache with configurable timeout (default 5 minutes)
- **Rate Limiting**: Automatic detection and handling of rate limits
- **Search Logic**: Multi-pass search with relevance scoring algorithm
- **Error Handling**: Network, authentication, and validation error categorization

### Tools and Resources

#### Tools
1. **search_faqs**: Full-text search across FAQ content with relevance scoring
2. **get_faq_content**: Retrieve complete FAQ by identifier
3. **list_faqs**: Enumerate all available FAQs with metadata

#### Resources
- **URI Schema**: `faq://FAQ001`, `faq://FAQ002`, etc.
- **Content**: Complete FAQ data including questions, answers, and metadata
- **Caching**: Resource content is cached for performance

## Data Flow

### Search Operation
```
1. AI Assistant → search_faqs("how to reset password")
2. MCP Server → FAQsimple API client
3. API Client → Check cache (if valid, return cached results)
4. API Client → External API call with rate limiting
5. API Client → Process response and apply relevance scoring
6. API Client → Cache results with timestamp
7. MCP Server → Format results for AI assistant
8. AI Assistant → Receives structured FAQ results
```

### Content Retrieval
```
1. AI Assistant → get_faq_content("FAQ001")
2. MCP Server → FAQsimple API client
3. API Client → Check cache (if valid, return cached content)
4. API Client → External API call to get specific FAQ
5. API Client → Cache FAQ content
6. MCP Server → Return formatted FAQ content
7. AI Assistant → Receives complete FAQ data
```

## Configuration Management

### Environment Variables
- **FAQSIMPLE_API_KEY**: Required authentication token (must start with "fs.")
- **FAQSIMPLE_API_BASE**: Optional API base URL override
- **CACHE_TIMEOUT**: Optional cache timeout in milliseconds
- **RATE_LIMIT_DELAY**: Optional delay between requests

### Validation
- API key format validation prevents placeholder keys
- Environment validation occurs during server initialization
- Configuration errors are reported with helpful guidance

## Performance Optimizations

### Caching Strategy
- **Memory-based**: Fast access without external dependencies
- **Timestamp Validation**: Automatic cache invalidation
- **Endpoint-specific**: Different cache keys for different API operations
- **Configurable Timeout**: Adjustable cache lifetime

### Rate Limiting
- **Header Tracking**: Monitors API response headers for rate limit information
- **Automatic Delays**: Respects rate limits to prevent throttling
- **Error Recovery**: Graceful handling of rate limit exceeded scenarios

### Search Optimization
- **Relevance Scoring**: Question matches weighted higher than answer matches
- **Multi-pass Search**: Comprehensive search across all FAQ content
- **Result Ranking**: Returns most relevant results first

## Error Handling Architecture

### Error Categories
1. **Network Errors**: Connection timeouts, DNS resolution failures
2. **Authentication Errors**: Invalid API keys, expired tokens
3. **Validation Errors**: Missing required parameters, invalid formats
4. **Rate Limiting**: API quota exceeded, temporary throttling
5. **Server Errors**: External API service unavailable

### Error Recovery
- **Automatic Retries**: For transient network issues
- **Graceful Degradation**: Fallback behaviors when possible
- **User Feedback**: Clear, actionable error messages
- **Logging**: Comprehensive error tracking for debugging

## Security Considerations

### API Key Management
- Environment variable storage only
- Format validation (must start with "fs.")
- No hardcoded credentials in source code
- Secure transmission via HTTPS

### Data Privacy
- No persistent storage of FAQ content
- Memory-only caching with automatic expiration
- No logging of sensitive information
- Secure API communication

## Scalability Design

### Horizontal Scaling
- Stateless server design enables multiple instances
- No shared state between server instances
- Cache is instance-local for simplicity

### Vertical Scaling
- Memory usage scales with cache size
- CPU usage minimal for most operations
- Network I/O is the primary bottleneck

### Future Considerations
- Redis caching for shared cache across instances
- Database integration for local FAQ storage
- WebSocket support for real-time updates