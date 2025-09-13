#!/usr/bin/env node

/**
 * MCP Server for FAQsimple
 * 
 * This server enables AI assistants to access and reference FAQ content
 * through the Model Context Protocol (MCP).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { FAQsimpleAPI } from './faqsimple-api';
import type { ServerConfig } from './types';

class FAQsimpleMCPServer {
  private server: Server;
  private faqAPI: FAQsimpleAPI;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-server-faqsimple',
        version: '1.0.0',
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupErrorHandling();

    // Initialize API client
    const config: ServerConfig = {
      apiKey: process.env.FAQSIMPLE_API_KEY || '',
      baseURL: process.env.FAQSIMPLE_API_BASE || 'https://api.faqsimple.com/v1',
      cacheTimeout: parseInt(process.env.CACHE_TIMEOUT || '300000'),
      rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '1000'),
    };

    if (!config.apiKey) {
      throw new Error('FAQSIMPLE_API_KEY environment variable is required');
    }

    this.faqAPI = new FAQsimpleAPI(config);
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_faqs',
            description: 'Search for FAQ content by question or keyword across all accessible FAQs',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for FAQ content',
                  minLength: 1,
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 10)',
                  minimum: 1,
                  maximum: 50,
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_faq_content',
            description: 'Get complete FAQ content including all questions and answers by FAQ number',
            inputSchema: {
              type: 'object',
              properties: {
                faq_number: {
                  type: 'string',
                  description: 'FAQ number (e.g., FAQ001)',
                  pattern: '^FAQ\\d+$',
                },
              },
              required: ['faq_number'],
            },
          },
          {
            name: 'list_faqs',
            description: 'List all accessible FAQs with basic information',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_faqs': {
            const query = args?.query as string;
            const limit = (args?.limit as number) || 10;

            if (!query) {
              throw new McpError(ErrorCode.InvalidParams, 'Query parameter is required');
            }

            const results = await this.faqAPI.searchFAQs(query);
            const limitedResults = results.slice(0, Math.min(limit, 50));

            if (limitedResults.length === 0) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `No results found for query: "${query}"`,
                  },
                ],
              };
            }

            let content = `Found ${limitedResults.length} result${limitedResults.length === 1 ? '' : 's'} for "${query}":\n\n`;
            
            limitedResults.forEach((result, index) => {
              content += `**${index + 1}. ${result.faq_name}**\n`;
              content += `**Question:** ${result.question}\n\n`;
              content += `${result.answer}\n\n`;
              content += `*Relevance: ${(result.relevance * 100).toFixed(1)}% | FAQ: ${result.faq_number}*\n\n`;
              content += '---\n\n';
            });

            return {
              content: [
                {
                  type: 'text',
                  text: content,
                },
              ],
            };
          }

          case 'get_faq_content': {
            const faqNumber = args?.faq_number as string;

            if (!faqNumber) {
              throw new McpError(ErrorCode.InvalidParams, 'faq_number parameter is required');
            }

            const faqData = await this.faqAPI.getFAQContent(faqNumber);

            let content = `# ${faqData.name}\n\n`;
            
            if (faqData.overview) {
              content += `${faqData.overview}\n\n`;
            }

            if (faqData.faq_url) {
              content += `**Public URL:** ${faqData.faq_url}\n\n`;
            }

            if (faqData.last_edited_timestamp) {
              content += `**Last Updated:** ${faqData.last_edited_timestamp}\n\n`;
            }

            content += `**Questions:** ${faqData.question_count}\n\n`;
            content += '---\n\n';

            faqData.questions.forEach((question, index) => {
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

            return {
              content: [
                {
                  type: 'text',
                  text: content,
                },
              ],
            };
          }

          case 'list_faqs': {
            const faqsData = await this.faqAPI.listFAQs();

            let content = `Found ${faqsData.total_count} FAQ${faqsData.total_count === 1 ? '' : 's'}:\n\n`;

            faqsData.faqs.forEach((faq) => {
              content += `**${faq.name}** (${faq.faq_number})\n`;
              
              if (faq.overview) {
                content += `${faq.overview}\n`;
              }

              if (faq.faq_url) {
                content += `URL: ${faq.faq_url}\n`;
              }

              content += '\n';
            });

            const rateLimitStatus = this.faqAPI.getRateLimitStatus();
            content += `\n*API Rate Limit: ${rateLimitStatus.remaining} requests remaining*`;

            return {
              content: [
                {
                  type: 'text',
                  text: content,
                },
              ],
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error in tool ${name}:`, errorMessage);
        
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${errorMessage}`
        );
      }
    });
  }

  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      try {
        const faqsData = await this.faqAPI.listFAQs();
        
        return {
          resources: faqsData.faqs.map((faq) => ({
            uri: `faq://${faq.faq_number}`,
            name: faq.name,
            description: faq.overview || `FAQ content for ${faq.name}`,
            mimeType: 'text/markdown',
          })),
        };
      } catch (error) {
        console.error('Error listing resources:', error);
        return { resources: [] };
      }
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri.toString();

      if (!uri.startsWith('faq://')) {
        throw new McpError(ErrorCode.InvalidParams, `Unsupported URI scheme: ${uri}`);
      }

      try {
        const faqNumber = uri.replace('faq://', '');
        const faqData = await this.faqAPI.getFAQContent(faqNumber);

        let content = `# ${faqData.name}\n\n`;
        
        if (faqData.overview) {
          content += `${faqData.overview}\n\n`;
        }

        if (faqData.faq_url) {
          content += `**Public URL:** ${faqData.faq_url}\n\n`;
        }

        content += `**Last Updated:** ${faqData.last_edited_timestamp || 'Unknown'}\n\n`;
        content += '---\n\n';

        faqData.questions.forEach((question) => {
          content += `## ${question.question_text}\n\n`;

          question.answers.forEach((answer) => {
            content += `${answer.answer_text}\n\n`;
          });

          if (question.question_keywords) {
            content += `*Keywords: ${question.question_keywords}*\n\n`;
          }

          content += '---\n\n';
        });

        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: content,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new McpError(ErrorCode.InternalError, `Failed to read resource: ${errorMessage}`);
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('FAQsimple MCP server running on stdio');
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const server = new FAQsimpleMCPServer();
    await server.run();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}