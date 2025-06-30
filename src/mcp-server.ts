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
import { createTestCase } from './tools/manual-test-create';
import { initProject } from './tools/manual-test-init';
import { listTestResults } from './tools/manual-test-results-list';
import { generateTestReport } from './tools/manual-test-results-report';
import { cleanTestResults } from './tools/manual-test-results-clean';

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
          {
            name: 'manual_test_create',
            description: 'Create a new test case file with given specifications',
            inputSchema: {
              type: 'object',
              properties: {
                template: {
                  type: 'string',
                  enum: ['login', 'form', 'navigation', 'api'],
                  description: 'Template type to use',
                },
                meta: {
                  type: 'object',
                  description: 'Test case metadata',
                  properties: {
                    title: { type: 'string' },
                    feature: { type: 'string' },
                    priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                    tags: { type: 'array', items: { type: 'string' } },
                    author: { type: 'string' },
                  },
                  required: ['title', 'feature', 'priority'],
                },
                scenario: {
                  type: 'object',
                  description: 'Test scenario (optional)',
                  properties: {
                    given: { type: 'array', items: { type: 'string' } },
                    when: { type: 'array', items: { type: 'string' } },
                    then: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
              required: ['template', 'meta'],
            },
          },
          {
            name: 'manual_test_init',
            description: 'Initialize a manual test project structure',
            inputSchema: {
              type: 'object',
              properties: {
                projectName: {
                  type: 'string',
                  description: 'Project name',
                },
                baseUrl: {
                  type: 'string',
                  description: 'Base URL for the project',
                },
                environments: {
                  type: 'object',
                  description: 'Environment configurations (optional)',
                },
                features: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                    },
                    required: ['name', 'description'],
                  },
                  description: 'List of features to test (optional)',
                },
                testDataTemplate: {
                  type: 'boolean',
                  description: 'Generate test data template (optional)',
                },
                mcpConfig: {
                  type: 'boolean',
                  description: 'Generate MCP configuration (optional)',
                },
                force: {
                  type: 'boolean',
                  description: 'Overwrite existing files (optional)',
                },
              },
              required: ['projectName', 'baseUrl'],
            },
          },
          {
            name: 'manual_test_results_list',
            description: 'List test result directories with filtering and sorting options',
            inputSchema: {
              type: 'object',
              properties: {
                dirPath: {
                  type: 'string',
                  description: 'Path to the test results directory',
                },
                filter: {
                  type: 'object',
                  description: 'Filter options (optional)',
                  properties: {
                    testId: { type: 'string' },
                    status: { type: 'string', enum: ['passed', 'failed', 'pending'] },
                    dateFrom: { type: 'string' },
                    dateTo: { type: 'string' },
                  },
                },
                sortBy: {
                  type: 'string',
                  description: 'Sort field (optional)',
                  enum: ['date', 'testId', 'status'],
                  default: 'date',
                },
              },
              required: ['dirPath'],
            },
          },
          {
            name: 'manual_test_results_report',
            description: 'Generate test execution report from results directory',
            inputSchema: {
              type: 'object',
              properties: {
                resultsDir: {
                  type: 'string',
                  description: 'Path to the test results directory',
                },
                outputPath: {
                  type: 'string',
                  description: 'Path where the report will be saved',
                },
                format: {
                  type: 'string',
                  enum: ['markdown', 'html', 'json'],
                  description: 'Report output format (optional)',
                  default: 'markdown',
                },
                includeScreenshots: {
                  type: 'boolean',
                  description: 'Include screenshot references (optional)',
                  default: false,
                },
                includeSummary: {
                  type: 'boolean',
                  description: 'Include summary section (optional)',
                  default: true,
                },
                title: {
                  type: 'string',
                  description: 'Custom report title (optional)',
                },
                description: {
                  type: 'string',
                  description: 'Report description (optional)',
                },
              },
              required: ['resultsDir', 'outputPath'],
            },
          },
          {
            name: 'manual_test_results_clean',
            description: 'Clean up test result directories based on specified criteria',
            inputSchema: {
              type: 'object',
              properties: {
                resultsDir: {
                  type: 'string',
                  description: 'Path to the test results directory',
                },
                criteria: {
                  type: 'object',
                  description: 'Cleanup criteria',
                  properties: {
                    olderThanDays: {
                      type: 'number',
                      description: 'Clean results older than N days',
                    },
                    beforeDate: {
                      type: 'string',
                      description: 'Clean results before date (YYYY-MM-DD)',
                    },
                    includeStatuses: {
                      type: 'array',
                      items: {
                        type: 'string',
                        enum: ['passed', 'failed', 'skipped', 'pending'],
                      },
                      description: 'Clean results with specific statuses',
                    },
                    largerThanMB: {
                      type: 'number',
                      description: 'Clean results larger than N MB',
                    },
                    keepMostRecent: {
                      type: 'number',
                      description: 'Keep only most recent N results',
                    },
                  },
                },
                dryRun: {
                  type: 'boolean',
                  description: 'Preview mode - do not actually delete (optional)',
                  default: false,
                },
                force: {
                  type: 'boolean',
                  description: 'Skip confirmation prompts (optional)',
                  default: false,
                },
              },
              required: ['resultsDir', 'criteria'],
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

          case 'manual_test_create':
            return await this.handleCreate(args);

          case 'manual_test_init':
            return await this.handleInit(args);

          case 'manual_test_results_list':
            return await this.handleResultsList(args);

          case 'manual_test_results_report':
            return await this.handleReportGeneration(args);

          case 'manual_test_results_clean':
            return await this.handleResultsCleanup(args);

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

  private async handleCreate(args: any) {
    const { template, meta, scenario } = args;
    
    // Validate required parameters
    if (!template) {
      throw new McpError(ErrorCode.InvalidParams, 'template is required');
    }
    if (!meta) {
      throw new McpError(ErrorCode.InvalidParams, 'meta is required');
    }

    const result = createTestCase({
      template,
      meta,
      scenario,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleInit(args: any) {
    const { 
      projectName, 
      baseUrl, 
      environments, 
      features, 
      testDataTemplate = false, 
      mcpConfig = false, 
      force = false 
    } = args;
    
    // Validate required parameters
    if (!projectName) {
      throw new McpError(ErrorCode.InvalidParams, 'projectName is required');
    }
    if (!baseUrl) {
      throw new McpError(ErrorCode.InvalidParams, 'baseUrl is required');
    }

    const result = await initProject({
      projectName,
      baseUrl,
      environments,
      features,
      testDataTemplate,
      mcpConfig,
      force,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleResultsList(args: any) {
    const { dirPath, filter = {}, sortBy = 'date' } = args;
    
    if (typeof dirPath !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'dirPath must be a string');
    }

    const result = await listTestResults({
      resultsDir: dirPath,
      filter,
      sortBy,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleReportGeneration(args: any) {
    const {
      resultsDir,
      outputPath,
      format = 'markdown',
      includeScreenshots = false,
      includeSummary = true,
      title,
      description
    } = args;
    
    // Validate required parameters
    if (!resultsDir || typeof resultsDir !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'resultsDir is required and must be a string');
    }
    if (!outputPath || typeof outputPath !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'outputPath is required and must be a string');
    }

    const result = await generateTestReport({
      resultsDir,
      outputPath,
      format,
      includeScreenshots,
      includeSummary,
      title,
      description,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleResultsCleanup(args: any) {
    const {
      resultsDir,
      criteria,
      dryRun = false,
      force = false
    } = args;
    
    // Validate required parameters
    if (!resultsDir || typeof resultsDir !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'resultsDir is required and must be a string');
    }
    if (!criteria || typeof criteria !== 'object') {
      throw new McpError(ErrorCode.InvalidParams, 'criteria is required and must be an object');
    }

    const result = await cleanTestResults({
      resultsDir,
      criteria,
      dryRun,
      force,
    });
    
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