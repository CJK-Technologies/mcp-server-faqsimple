# Quick Start Guide

Get up and running with the FAQsimple MCP Server in minutes.

## Prerequisites

- **Node.js**: Version 16 or higher
- **npm**: Comes with Node.js
- **FAQsimple API Key**: Obtain from your FAQsimple account (must start with "fs.")

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/mcp-server-faqsimple.git
cd mcp-server-faqsimple
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and add your FAQsimple API key:

```env
FAQSIMPLE_API_KEY=fs.your-actual-api-key-here
```

## Running the Server

### Development Mode (Recommended for Testing)

```bash
npm run dev
```

This runs the server directly from TypeScript source using `tsx`.

### Production Mode

First build the project:

```bash
npm run build
```

Then start the compiled server:

```bash
npm start
```

## Verify Installation

### Health Check

The server performs automatic health checks on startup. Look for this output:

```
✓ Environment configuration valid
✓ FAQsimple API connection successful
✓ MCP Server ready on stdio
```

### Test Basic Functionality

If you see any errors during startup, check:
1. Your API key is valid and starts with "fs."
2. You have internet connectivity
3. The FAQsimple API service is available

## Connecting to AI Assistants

### Claude Desktop Configuration

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "faqsimple": {
      "command": "node",
      "args": ["/path/to/mcp-server-faqsimple/dist/index.js"],
      "env": {
        "FAQSIMPLE_API_KEY": "fs.your-actual-api-key-here"
      }
    }
  }
}
```

### Other MCP Clients

The server implements the standard MCP protocol and should work with any compliant client. Refer to your client's documentation for MCP server configuration.

## Basic Usage Examples

Once connected to an AI assistant, you can:

### Search FAQs
```
"Search for information about password reset"
```

The assistant will use the `search_faqs` tool to find relevant FAQ content.

### Get Specific FAQ
```
"Show me the content of FAQ001"
```

The assistant will use the `get_faq_content` tool to retrieve the complete FAQ.

### List All FAQs
```
"What FAQs are available?"
```

The assistant will use the `list_faqs` tool to show all accessible FAQs.

## Available Commands

### Development Commands
- `npm run dev` - Run server from TypeScript source
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled server

### Testing Commands
- `npm test` - Run the test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

### Code Quality Commands
- `npm run lint` - Check code style
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier

## Troubleshooting

### Common Issues

#### "Invalid API key format"
- Ensure your API key starts with "fs."
- Check for extra spaces or characters in your `.env` file

#### "API connection failed"
- Verify your API key is correct and active
- Check your internet connection
- Confirm the FAQsimple API service is operational

#### "Server won't start"
- Run `npm install` to ensure all dependencies are installed
- Check that you're using Node.js version 16 or higher
- Verify your `.env` file exists and contains the API key

#### "No FAQs found"
- Confirm your API key has access to FAQ content
- Check that your FAQsimple account has FAQs configured
- Verify the API is returning data with `npm run dev` and check the logs

### Getting Help

1. **Check the logs**: The server provides detailed error messages
2. **Run tests**: `npm test` to verify everything is working
3. **Review configuration**: Double-check your `.env` file
4. **API status**: Verify the FAQsimple API service is operational

## Next Steps

- Read the [Implementation Guide](./implementation.md) for detailed integration instructions
- Review the [Architecture Guide](./architecture.md) to understand the system design
- Explore the source code in `src/` to understand the implementation
- Run the test suite to see example usage: `npm test`

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FAQSIMPLE_API_KEY` | Yes | - | Your FAQsimple API key (must start with "fs.") |
| `FAQSIMPLE_API_BASE` | No | `https://api.faqsimple.io/v1` | API base URL |
| `CACHE_TIMEOUT` | No | `300000` | Cache timeout in milliseconds (5 minutes) |
| `RATE_LIMIT_DELAY` | No | `1000` | Delay between requests in milliseconds |

## Performance Tips

- The server uses intelligent caching to reduce API calls
- Search results are cached for 5 minutes by default
- Rate limiting is handled automatically
- Multiple concurrent requests are supported

## Security Notes

- Store your API key in environment variables only
- Never commit API keys to version control
- The server uses HTTPS for all external API communication
- No FAQ content is stored persistently (memory cache only)