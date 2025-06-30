#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { validateTestCase } from './tools/manual-test-validate';
import { parseTestCase } from './tools/manual-test-parse';
import { listTestCases } from './tools/manual-test-list';

/**
 * MCP Server for Manual Test Framework Operations
 */
class ManualTestsServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'manual-tests-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'manual_test_validate',
            description: 'Validate a test case YAML content for syntax and structure',
            inputSchema: {
              type: 'object',
              properties: {
                yamlContent: {
                  type: 'string',
                  description: 'YAML content of the test case to validate',
                },
              },
              required: ['yamlContent'],
            },
          },
          {
            name: 'manual_test_parse',
            description: 'Parse test case YAML and process variable substitutions',
            inputSchema: {
              type: 'object',
              properties: {
                yamlContent: {
                  type: 'string',
                  description: 'YAML content of the test case to parse',
                },
                projectMeta: {
                  type: 'object',
                  description: 'Project metadata for variable substitution (optional)',
                  properties: {
                    test_data: { type: 'object' },
                    environments: { type: 'object' },
                  },
                },
              },
              required: ['yamlContent'],
            },
          },
          {
            name: 'manual_test_list',
            description: 'List test cases from a directory with filtering and sorting options',
            inputSchema: {
              type: 'object',
              properties: {
                dirPath: {
                  type: 'string',
                  description: 'Path to the directory containing test case files',
                },
                filter: {
                  type: 'object',
                  description: 'Filter options (optional)',
                  properties: {
                    feature: { type: 'string' },
                    priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                    tags: { type: 'array', items: { type: 'string' } },
                    author: { type: 'string' },
                  },
                },
                sortBy: {
                  type: 'string',
                  description: 'Sort field (optional)',
                  enum: ['id', 'lastUpdated', 'priority', 'feature'],
                  default: 'id',
                },
              },
              required: ['dirPath'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'manual_test_validate':
            return await this.handleValidate(args);

          case 'manual_test_parse':
            return await this.handleParse(args);

          case 'manual_test_list':
            return await this.handleList(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private async handleValidate(args: any) {
    const { yamlContent } = args;
    
    if (typeof yamlContent !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'yamlContent must be a string');
    }

    const result = validateTestCase(yamlContent);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleParse(args: any) {
    const { yamlContent, projectMeta } = args;
    
    if (typeof yamlContent !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'yamlContent must be a string');
    }

    const result = parseTestCase(yamlContent, projectMeta);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleList(args: any) {
    const { dirPath, filter = {}, sortBy = 'id' } = args;
    
    if (typeof dirPath !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'dirPath must be a string');
    }

    const result = await listTestCases(dirPath, filter, sortBy);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
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

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Manual Tests MCP Server running on stdio');
  }
}

// Start the server
if (require.main === module) {
  const server = new ManualTestsServer();
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { ManualTestsServer };