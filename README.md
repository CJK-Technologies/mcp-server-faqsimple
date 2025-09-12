# MCP Server for FAQsimple

[![npm version](https://badge.fury.io/js/mcp-server-faqsimple.svg)](https://badge.fury.io/js/mcp-server-faqsimple)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

> **Enable AI assistants to access and reference your FAQ content through the Model Context Protocol (MCP)**

This MCP server provides AI assistants like Claude with seamless access to your FAQsimple knowledge base, allowing them to search, retrieve, and cite authoritative FAQ content in their responses.

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher  
- A FAQsimple account with API credentials

### Installation

#### Option 1: NPX (Recommended)

The easiest way to get started:

```bash
npx mcp-server-faqsimple
```

#### Option 2: Global Installation

```bash
npm install -g mcp-server-faqsimple
```

#### Option 3: Local Installation

```bash
npm install mcp-server-faqsimple
```

### Configuration

#### 1. Get Your API Key

Request an API key from your FAQsimple dashboard or support.

#### 2. Configure Claude Desktop

Add the server to your Claude Desktop configuration file:

**macOS/Linux:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "faqsimple": {
      "command": "npx",
      "args": ["mcp-server-faqsimple"],
      "env": {
        "FAQSIMPLE_API_KEY": "fs.your.api.key.here"
      }
    }
  }
}
```

#### 3. Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FAQSIMPLE_API_KEY` | ✅ Yes | - | Your FAQsimple API key (starts with `fs.`) |
| `FAQSIMPLE_API_BASE` | No | `https://api.faqsimple.com/v1` | API base URL |
| `CACHE_TIMEOUT` | No | `300000` | Cache timeout in milliseconds (5 minutes) |
| `RATE_LIMIT_DELAY` | No | `1000` | Delay between requests in milliseconds |

## 🛠️ Features

### 🔍 **Intelligent Search**
- Search across all accessible FAQs simultaneously
- Relevance scoring with question/answer weighting
- Fuzzy matching for better results

### 📚 **Complete FAQ Access**
- Retrieve full FAQ content with formatted markdown
- Access all questions, answers, and metadata
- Preserve original formatting and structure

### ⚡ **Performance Optimized**
- Built-in caching to reduce API calls
- Rate limiting compliance
- Efficient batch operations

### 🔒 **Secure & Reliable**
- Environment variable-based configuration
- Comprehensive error handling
- API key validation

## 📖 Usage Examples

### Basic Search

```
You: Can you help me find information about password resets in our FAQ?

Claude: I'll search through your FAQ content for password reset information.

[Claude uses the search_faqs tool automatically]

Based on your FAQ content, here's what I found about password resets:

**1. Product Support FAQ**
**Question:** How do I reset my password?

To reset your password:

1. Go to the **login page**
2. Click "Forgot Password"  
3. Enter your email address
4. Check your email for reset instructions

*Note: Reset links expire after 24 hours.*

This information comes directly from your authoritative FAQ source (FAQ001).
```

### Get Specific FAQ

```
You: Show me all content from FAQ001

Claude: [Uses get_faq_content tool with FAQ001]

# Product Support FAQ

This FAQ covers common questions about our product features and troubleshooting.

**Public URL:** https://help.yourcompany.com/faq001
**Last Updated:** 2024-01-15T10:30:00Z
**Questions:** 15

## 1. How do I reset my password?
[Full content with all Q&As...]
```

### List Available FAQs

```
You: What FAQs do you have access to?

Claude: [Uses list_faqs tool]

I have access to 3 FAQs:

**Product Support FAQ** (FAQ001)
Covers common questions about product features and troubleshooting
URL: https://help.yourcompany.com/faq001

**Billing & Subscriptions** (FAQ002)  
Information about billing, payments, and subscription management
URL: https://help.yourcompany.com/faq002

**API Documentation FAQ** (FAQ003)
Technical questions about API integration and development
URL: https://help.yourcompany.com/faq003
```

## 🔧 Available Tools

The MCP server provides three main tools:

### `search_faqs`
Search for FAQ content by question or keyword across all accessible FAQs.

**Parameters:**
- `query` (string, required): Search query
- `limit` (number, optional): Maximum results (1-50, default: 10)

### `get_faq_content` 
Get complete FAQ content including all questions and answers.

**Parameters:**
- `faq_number` (string, required): FAQ number (e.g., "FAQ001")

### `list_faqs`
List all accessible FAQs with basic information.

**Parameters:** None

## 📁 Resources

The server exposes FAQ content as MCP resources:

- **URI Format:** `faq://FAQ001`, `faq://FAQ002`, etc.
- **MIME Type:** `text/markdown`
- **Content:** Complete FAQ content in markdown format

## 🏗️ Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/CJK-Technologies/mcp-server-faqsimple.git
cd mcp-server-faqsimple

# Install dependencies
npm install

# Set your API key
export FAQSIMPLE_API_KEY="fs.your.api.key.here"

# Run in development mode
npm run dev
```

### Building

```bash
# Build TypeScript
npm run build

# Run built version
npm start
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- **Bug Reports:** [GitHub Issues](https://github.com/CJK-Technologies/mcp-server-faqsimple/issues)
- **Feature Requests:** [GitHub Discussions](https://github.com/CJK-Technologies/mcp-server-faqsimple/discussions)
- **Documentation:** [FAQ Documentation](https://docs.faqsimple.com)

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## 🌟 Related Projects

- [FAQsimple API Documentation](https://docs.faqsimple.com/api)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/desktop)

---

**Built with ❤️ for the FAQsimple and MCP communities**

*This is an open-source project. It keeps your specific API endpoints, auth, and business logic private while providing a solid foundation for MCP integration.*
