import type { HelpResult, HelpData, ToolInfo, UsageGuidelines, ClientGuidance } from '../models';
import { createSuccess } from '../models';

/**
 * Get comprehensive help information for all manual test tools
 */
export function getHelp(): HelpResult {
  const tools: ToolInfo[] = [
    {
      name: 'manual_test_validate',
      description: 'Validate a test case YAML content for syntax and structure',
      usage: {
        example: '{ "yamlContent": "meta:\\n  id: TC-001\\n  title: Test" }',
        inputDescription: 'YAML content string to validate',
        outputDescription: 'Validation result with isValid boolean and error details'
      }
    },
    {
      name: 'manual_test_parse',
      description: 'Parse test case YAML and process variable substitutions',
      usage: {
        example: '{ "yamlContent": "...", "projectMeta": { "test_data": {...} } }',
        inputDescription: 'YAML content and optional project metadata for variable substitution',
        outputDescription: 'Parsed test case with resolved variables'
      }
    },
    {
      name: 'manual_test_list',
      description: 'List test cases from a directory with filtering and sorting options',
      usage: {
        example: '{ "dirPath": "./tests", "filter": { "priority": "high" }, "sortBy": "id" }',
        inputDescription: 'Directory path, optional filter criteria, and sort field',
        outputDescription: 'Array of test case metadata matching the criteria'
      }
    },
    {
      name: 'manual_test_create',
      description: 'Create a new test case file with given specifications',
      usage: {
        example: '{ "template": "login", "meta": { "title": "Login Test", "feature": "auth", "priority": "high" } }',
        inputDescription: 'Template type and test case metadata',
        outputDescription: 'Generated YAML content and test case ID'
      }
    },
    {
      name: 'manual_test_init',
      description: 'Initialize a manual test project structure',
      usage: {
        example: '{ "projectName": "MyApp", "baseUrl": "https://example.com" }',
        inputDescription: 'Project name, base URL, and optional configuration',
        outputDescription: 'Created project structure and configuration files'
      }
    },
    {
      name: 'manual_test_results_list',
      description: 'List test result directories with filtering and sorting options',
      usage: {
        example: '{ "dirPath": "./results", "filter": { "status": "failed" } }',
        inputDescription: 'Results directory path and optional filter criteria',
        outputDescription: 'Array of test result metadata'
      }
    },
    {
      name: 'manual_test_results_report',
      description: 'Generate test execution report from results directory',
      usage: {
        example: '{ "resultsDir": "./results", "outputPath": "./report.md", "format": "markdown" }',
        inputDescription: 'Results directory, output path, and report format',
        outputDescription: 'Generated report file and summary statistics'
      }
    },
    {
      name: 'manual_test_results_clean',
      description: 'Clean up test result directories based on specified criteria',
      usage: {
        example: '{ "resultsDir": "./results", "criteria": { "olderThanDays": 30 } }',
        inputDescription: 'Results directory and cleanup criteria',
        outputDescription: 'Cleanup summary with deleted files count'
      }
    }
  ];

  const guidelines: UsageGuidelines = {
    general: [
      'Always validate YAML content before parsing or processing',
      'Use consistent directory structures for test cases and results',
      'Apply appropriate filters to reduce processing overhead',
      'Follow template-based approach for consistent test case creation'
    ],
    errorHandling: [
      'Check the success field in all tool responses',
      'Handle validation errors by examining the errors array',
      'For file operations, ensure directories exist before operations',
      'Use dry-run mode for cleanup operations to preview changes'
    ]
  };

  const clientGuidance: ClientGuidance = {
    recommendedPatterns: [
      'Initialize project structure first with manual_test_init',
      'Create test cases using templates with manual_test_create',
      'Validate YAML before saving with manual_test_validate',
      'Use manual_test_list to discover existing test cases'
    ],
    outputHandling: [
      'Save YAML content from manual_test_create to .yml files',
      'Process validation errors to provide user feedback',
      'Use generated IDs from create operations for file naming',
      'Parse structured data from list operations for UI display'
    ]
  };

  const helpData: HelpData = {
    tools,
    guidelines,
    clientGuidance
  };

  return createSuccess(helpData);
}