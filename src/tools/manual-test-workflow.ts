import type { WorkflowResult, WorkflowData, Workflow, IntegrationPattern, UseCase } from '../models';
import { createSuccess } from '../models';

/**
 * Get workflow information and recommended usage patterns
 */
export function getWorkflow(): WorkflowResult {
  const workflows: Workflow[] = [
    {
      name: 'Project Setup Workflow',
      description: 'Initialize a new manual testing project with proper structure',
      steps: [
        {
          tool: 'manual_test_init',
          description: 'Initialize project structure and configuration',
          order: 1
        },
        {
          tool: 'manual_test_create',
          description: 'Create initial test cases using templates',
          order: 2
        },
        {
          tool: 'manual_test_validate',
          description: 'Validate created test cases',
          order: 3
        }
      ],
      recommendedOrder: ['manual_test_init', 'manual_test_create', 'manual_test_validate']
    },
    {
      name: 'Test Case Creation Workflow',
      description: 'Create and validate new test cases',
      steps: [
        {
          tool: 'manual_test_create',
          description: 'Generate test case from template',
          order: 1
        },
        {
          tool: 'manual_test_validate',
          description: 'Validate YAML structure and content',
          order: 2
        },
        {
          tool: 'manual_test_parse',
          description: 'Parse and resolve variables',
          order: 3,
          optional: true
        }
      ],
      recommendedOrder: ['manual_test_create', 'manual_test_validate', 'manual_test_parse']
    },
    {
      name: 'Results Management Workflow',
      description: 'Manage and analyze test execution results',
      steps: [
        {
          tool: 'manual_test_results_list',
          description: 'List available test results',
          order: 1
        },
        {
          tool: 'manual_test_results_report',
          description: 'Generate comprehensive reports',
          order: 2
        },
        {
          tool: 'manual_test_results_clean',
          description: 'Clean up old or unnecessary results',
          order: 3,
          optional: true
        }
      ],
      recommendedOrder: ['manual_test_results_list', 'manual_test_results_report', 'manual_test_results_clean']
    }
  ];

  const integrationPatterns: IntegrationPattern[] = [
    {
      name: 'Validation Chain',
      description: 'Chain validation and parsing for comprehensive test case checking',
      toolSequence: ['manual_test_validate', 'manual_test_parse'],
      example: 'Always validate YAML syntax before attempting to parse variables'
    },
    {
      name: 'Creation Pipeline',
      description: 'Complete pipeline from creation to validation',
      toolSequence: ['manual_test_create', 'manual_test_validate', 'manual_test_parse'],
      example: 'Create → Validate → Parse → Save workflow'
    },
    {
      name: 'Results Analysis',
      description: 'Comprehensive results processing and reporting',
      toolSequence: ['manual_test_results_list', 'manual_test_results_report'],
      example: 'List results first to understand available data before generating reports'
    },
    {
      name: 'Error Handling Pattern',
      description: 'Handle validation errors and retry workflow',
      toolSequence: ['manual_test_validate', 'manual_test_create', 'manual_test_validate'],
      example: 'If validation fails, recreate using template and validate again'
    }
  ];

  const commonUseCases: UseCase[] = [
    {
      title: 'Setting up a New Project',
      description: 'Complete setup for a new manual testing project with example test cases',
      steps: [
        'Initialize project structure with manual_test_init',
        'Create sample test cases using different templates',
        'Validate all created test cases',
        'Set up results directory structure'
      ],
      tools: ['manual_test_init', 'manual_test_create', 'manual_test_validate']
    },
    {
      title: 'Bulk Test Case Creation',
      description: 'Create multiple test cases efficiently using templates',
      steps: [
        'Use manual_test_list to understand existing test cases',
        'Create new test cases with manual_test_create using appropriate templates',
        'Validate each created test case',
        'Parse to ensure variable resolution works correctly'
      ],
      tools: ['manual_test_list', 'manual_test_create', 'manual_test_validate', 'manual_test_parse']
    },
    {
      title: 'Results Processing Example',
      description: 'Process test execution results and generate reports',
      steps: [
        'List all available test results',
        'Filter results by criteria (status, date, etc.)',
        'Generate reports in different formats',
        'Clean up old results to save space'
      ],
      tools: ['manual_test_results_list', 'manual_test_results_report', 'manual_test_results_clean']
    },
    {
      title: 'Quality Assurance Workflow',
      description: 'Ensure test case quality and consistency',
      steps: [
        'List existing test cases to audit',
        'Validate all test cases for structural correctness',
        'Parse test cases to check variable resolution',
        'Create standardized test cases using templates'
      ],
      tools: ['manual_test_list', 'manual_test_validate', 'manual_test_parse', 'manual_test_create']
    }
  ];

  const workflowData: WorkflowData = {
    workflows,
    integrationPatterns,
    commonUseCases
  };

  return createSuccess(workflowData);
}