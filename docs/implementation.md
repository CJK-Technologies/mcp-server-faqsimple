# Implementation Guide

This guide provides detailed instructions for implementing, customizing, and extending the FAQsimple MCP Server.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Core Components](#core-components)
3. [Adding New Tools](#adding-new-tools)
4. [Customizing Search Logic](#customizing-search-logic)
5. [Error Handling](#error-handling)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Integration Examples](#integration-examples)

## Development Setup

### Local Development Environment

```bash
# Clone and install
git clone https://github.com/your-org/mcp-server-faqsimple.git
cd mcp-server-faqsimple
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API key

# Start development server
npm run dev
```

### Development Tools

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and style enforcement
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **tsx**: TypeScript execution for development

## Core Components

### FAQsimpleMCPServer Class

The main server implementation in `src/index.ts`:

```typescript
export class FAQsimpleMCPServer {
  private api: FAQsimpleAPI;

  constructor() {
    // Validate environment
    this.validateEnvironment();

    // Initialize API client
    this.api = new FAQsimpleAPI(/* config */);

    // Set up MCP handlers
    this.setupToolHandlers();
    this.setupResourceHandlers();
  }
}
```

#### Key Methods

- `validateEnvironment()`: Checks required environment variables
- `setupToolHandlers()`: Registers MCP tools (search_faqs, get_faq_content, list_faqs)
- `setupResourceHandlers()`: Handles FAQ URI resources (faq://FAQ001)
- `performHealthCheck()`: Validates API connectivity on startup

### FAQsimpleAPI Class

The API client in `src/faqsimple-api.ts`:

```typescript
export class FAQsimpleAPI {
  private cache = new Map<string, CacheEntry>();
  private lastRequestTime = 0;

  async searchFAQs(query: string): Promise<SearchResult[]>
  async getFAQContent(faqNumber: string): Promise<FAQContent>
  async listFAQs(): Promise<FAQSummary[]>
}
```

#### Key Features

- **Caching**: In-memory cache with configurable timeout
- **Rate Limiting**: Automatic request throttling
- **Error Handling**: Comprehensive error categorization
- **Search Logic**: Relevance scoring algorithm

## Adding New Tools

### Step 1: Define the Tool

Add to the tool handlers in `src/index.ts`:

```typescript
this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // existing tools...
    {
      name: "your_new_tool",
      description: "Description of what your tool does",
      inputSchema: {
        type: "object",
        properties: {
          parameter1: {
            type: "string",
            description: "Description of parameter1"
          }
        },
        required: ["parameter1"]
      }
    }
  ]
}));
```

### Step 2: Implement the Handler

```typescript
this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    // existing cases...
    case "your_new_tool":
      return await this.handleYourNewTool(args);
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
});
```

### Step 3: Add the Implementation Method

```typescript
private async handleYourNewTool(args: any): Promise<CallToolResult> {
  try {
    // Validate arguments
    if (!args.parameter1) {
      throw new McpError(ErrorCode.InvalidParams, "parameter1 is required");
    }

    // Call API method
    const result = await this.api.yourNewAPIMethod(args.parameter1);

    return {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, `Tool failed: ${error.message}`);
  }
}
```

### Step 4: Add API Method

In `src/faqsimple-api.ts`:

```typescript
async yourNewAPIMethod(parameter: string): Promise<YourResultType> {
  const cacheKey = `your_method_${parameter}`;

  // Check cache
  const cached = this.getFromCache(cacheKey);
  if (cached) return cached;

  // Make API call
  await this.respectRateLimit();

  const response = await fetch(`${this.baseUrl}/your-endpoint`, {
    method: 'POST',
    headers: this.getHeaders(),
    body: JSON.stringify({ parameter })
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response.json();

  // Cache result
  this.setCache(cacheKey, data);

  return data;
}
```

## Customizing Search Logic

### Modifying Relevance Scoring

The search algorithm in `src/faqsimple-api.ts` can be customized:

```typescript
private calculateRelevance(faq: any, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Question matching (weighted higher)
  if (faq.question?.toLowerCase().includes(queryLower)) {
    score += 0.7; // Adjust this weight
  }

  // Answer matching
  if (faq.answer?.toLowerCase().includes(queryLower)) {
    score += 0.3; // Adjust this weight
  }

  // Add custom scoring logic:

  // Exact phrase matching bonus
  if (faq.question?.toLowerCase() === queryLower) {
    score += 0.5;
  }

  // Tag matching (if available)
  if (faq.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
    score += 0.2;
  }

  // Category matching
  if (faq.category?.toLowerCase().includes(queryLower)) {
    score += 0.1;
  }

  return score;
}
```

### Adding Search Filters

Extend the search method to support filters:

```typescript
async searchFAQs(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  // ... existing code ...

  let results = faqs.map(faq => ({
    ...faq,
    relevance: this.calculateRelevance(faq, query)
  })).filter(faq => faq.relevance > 0);

  // Apply filters
  if (options.category) {
    results = results.filter(faq => faq.category === options.category);
  }

  if (options.minRelevance) {
    results = results.filter(faq => faq.relevance >= options.minRelevance);
  }

  if (options.maxResults) {
    results = results.slice(0, options.maxResults);
  }

  return results.sort((a, b) => b.relevance - a.relevance);
}
```

## Error Handling

### Custom Error Types

Define specific error types in `src/types.ts`:

```typescript
export enum FAQsimpleErrorCode {
  API_KEY_INVALID = 'API_KEY_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  FAQ_NOT_FOUND = 'FAQ_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export class FAQsimpleError extends Error {
  constructor(
    public code: FAQsimpleErrorCode,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FAQsimpleError';
  }
}
```

### Error Handler Implementation

```typescript
private handleApiError(error: any): never {
  if (error.response?.status === 401) {
    throw new FAQsimpleError(
      FAQsimpleErrorCode.API_KEY_INVALID,
      'Invalid API key. Please check your FAQSIMPLE_API_KEY environment variable.'
    );
  }

  if (error.response?.status === 429) {
    throw new FAQsimpleError(
      FAQsimpleErrorCode.RATE_LIMIT_EXCEEDED,
      'Rate limit exceeded. Please try again later.'
    );
  }

  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    throw new FAQsimpleError(
      FAQsimpleErrorCode.NETWORK_ERROR,
      'Network error: Unable to connect to FAQsimple API.'
    );
  }

  throw new FAQsimpleError(
    FAQsimpleErrorCode.API_ERROR,
    `API error: ${error.message}`,
    error
  );
}
```

## Testing

### Test Structure

Tests are located in `src/__tests__/` with the following structure:

```
src/__tests__/
├── faqsimple-api.test.ts    # API client tests
├── index.test.ts            # MCP server tests
└── integration.test.ts      # End-to-end tests
```

### Unit Testing Example

```typescript
// src/__tests__/faqsimple-api.test.ts
import { FAQsimpleAPI } from '../faqsimple-api';

describe('FAQsimpleAPI', () => {
  let api: FAQsimpleAPI;

  beforeEach(() => {
    api = new FAQsimpleAPI({
      apiKey: 'fs.test-key',
      baseUrl: 'https://api.example.com'
    });
  });

  describe('searchFAQs', () => {
    it('should return relevant results', async () => {
      // Mock fetch response
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { id: 'FAQ001', question: 'How to reset password?', answer: 'Click reset...' }
        ])
      });

      const results = await api.searchFAQs('password');

      expect(results).toHaveLength(1);
      expect(results[0].relevance).toBeGreaterThan(0);
    });
  });
});
```

### Integration Testing

```typescript
// src/__tests__/integration.test.ts
import { FAQsimpleMCPServer } from '../index';

describe('Integration Tests', () => {
  let server: FAQsimpleMCPServer;

  beforeAll(() => {
    process.env.FAQSIMPLE_API_KEY = 'fs.test-key';
    server = new FAQsimpleMCPServer();
  });

  it('should handle search_faqs tool call', async () => {
    const result = await server.handleToolCall({
      name: 'search_faqs',
      arguments: { query: 'test query' }
    });

    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- faqsimple-api.test.ts

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## Deployment

### Production Build

```bash
# Build the project
npm run build

# The compiled JavaScript will be in /dist
ls dist/
```

### Environment Configuration

For production deployment:

```env
# Required
FAQSIMPLE_API_KEY=fs.your-production-api-key

# Optional optimizations
CACHE_TIMEOUT=300000        # 5 minutes
RATE_LIMIT_DELAY=500       # 500ms between requests
FAQSIMPLE_API_BASE=https://api.faqsimple.io/v1
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Set environment
ENV NODE_ENV=production

# Run the server
CMD ["node", "dist/index.js"]
```

### Process Management

For production, use a process manager:

```bash
# Using PM2
npm install -g pm2
pm2 start dist/index.js --name faqsimple-mcp

# Using systemd (create service file)
sudo nano /etc/systemd/system/faqsimple-mcp.service
```

## Integration Examples

### Claude Desktop Integration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "faqsimple": {
      "command": "node",
      "args": ["/path/to/mcp-server-faqsimple/dist/index.js"],
      "env": {
        "FAQSIMPLE_API_KEY": "fs.your-api-key"
      }
    }
  }
}
```

### Custom MCP Client Integration

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/path/to/dist/index.js'],
  env: {
    FAQSIMPLE_API_KEY: 'fs.your-api-key'
  }
});

const client = new Client({
  name: 'my-app',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);

// Use the tools
const searchResult = await client.callTool({
  name: 'search_faqs',
  arguments: { query: 'password reset' }
});
```

### Web Service Integration

```typescript
import express from 'express';
import { FAQsimpleMCPServer } from './dist/index.js';

const app = express();
const mcpServer = new FAQsimpleMCPServer();

app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await mcpServer.handleToolCall({
      name: 'search_faqs',
      arguments: { query }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

## Best Practices

### Performance Optimization

1. **Caching Strategy**: Use appropriate cache timeouts based on FAQ update frequency
2. **Rate Limiting**: Respect API limits to avoid throttling
3. **Error Recovery**: Implement retry logic for transient failures
4. **Resource Management**: Clean up resources properly

### Security

1. **API Key Management**: Store keys in environment variables only
2. **Input Validation**: Validate all inputs before processing
3. **Error Messages**: Don't expose sensitive information in error messages
4. **HTTPS**: Always use secure connections for API calls

### Maintainability

1. **Type Safety**: Use TypeScript strictly with no `any` types
2. **Error Handling**: Provide meaningful error messages
3. **Testing**: Maintain high test coverage
4. **Documentation**: Keep documentation up to date
5. **Code Style**: Use consistent formatting and linting

### Monitoring

1. **Health Checks**: Implement startup and runtime health checks
2. **Logging**: Log important events and errors
3. **Metrics**: Track API usage and performance
4. **Alerts**: Set up alerts for failures and rate limits