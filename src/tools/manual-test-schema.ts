import type { 
  SchemaResult, 
  SchemaData, 
  TestCaseSchemaInfo, 
  TestResultSchemaInfo, 
  ProjectConfigSchemaInfo,
  VariableSubstitution,
  FormatSpecifications 
} from '../models';
import { createSuccess } from '../models';

/**
 * Get detailed schema information for YAML/JSON structures and variable substitution
 */
export function getSchema(): SchemaResult {
  const testCaseSchema: TestCaseSchemaInfo = {
    required: ['meta', 'scenario'],
    optional: ['precondition', 'postcondition', 'notes'],
    properties: {
      meta: {
        type: 'object',
        description: 'Test case metadata',
        required: ['id', 'title', 'feature', 'priority'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique test case identifier (e.g., TC-LOGIN-001)'
          },
          title: {
            type: 'string',
            description: 'Human-readable test case title'
          },
          feature: {
            type: 'string',
            description: 'Feature or component being tested'
          },
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'Test priority level'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional tags for categorization'
          },
          author: {
            type: 'string',
            description: 'Test case author'
          },
          lastUpdated: {
            type: 'string',
            description: 'Last modification date (YYYY-MM-DD)'
          }
        }
      },
      scenario: {
        type: 'object',
        description: 'Test scenario in Given-When-Then format',
        properties: {
          given: {
            type: 'array',
            items: { type: 'string' },
            description: 'Preconditions and initial context'
          },
          when: {
            type: 'array',
            items: { type: 'string' },
            description: 'Actions performed during the test'
          },
          then: {
            type: 'array',
            items: { type: 'string' },
            description: 'Expected outcomes and assertions'
          }
        }
      },
      precondition: {
        type: 'array',
        items: { type: 'string' },
        description: 'Prerequisites before test execution'
      },
      postcondition: {
        type: 'array',
        items: { type: 'string' },
        description: 'Cleanup or verification after test execution'
      }
    }
  };

  const testResultSchema: TestResultSchemaInfo = {
    required: ['testId', 'status', 'executedAt'],
    properties: {
      testId: {
        type: 'string',
        description: 'Reference to the test case ID'
      },
      status: {
        type: 'string',
        enum: ['passed', 'failed', 'skipped', 'pending'],
        description: 'Test execution result'
      },
      executedAt: {
        type: 'string',
        description: 'Execution timestamp (ISO 8601 format)'
      },
      executedBy: {
        type: 'string',
        description: 'Person who executed the test'
      },
      duration: {
        type: 'number',
        description: 'Execution time in milliseconds'
      },
      notes: {
        type: 'string',
        description: 'Additional notes or observations'
      },
      attachments: {
        type: 'array',
        items: { type: 'string' },
        description: 'Paths to screenshots or other evidence'
      }
    }
  };

  const projectConfigSchema: ProjectConfigSchemaInfo = {
    required: ['projectName', 'baseUrl'],
    properties: {
      projectName: {
        type: 'string',
        description: 'Name of the testing project'
      },
      baseUrl: {
        type: 'string',
        description: 'Base URL for the application under test'
      },
      environments: {
        type: 'object',
        description: 'Environment-specific configuration',
        properties: {
          dev: { type: 'object' },
          staging: { type: 'object' },
          production: { type: 'object' }
        }
      },
      testData: {
        type: 'object',
        description: 'Shared test data for variable substitution'
      }
    }
  };

  const variableSubstitution: VariableSubstitution = {
    syntax: {
      basic: '${variable_name}',
      nested: '${object.property}',
      environment: '${env.VARIABLE_NAME}'
    },
    rules: [
      {
        pattern: '${variable_name}',
        description: 'Basic variable substitution from test_data',
        example: '${user.email} → "test@example.com"'
      },
      {
        pattern: '${env.VARIABLE}',
        description: 'Environment variable substitution',
        example: '${env.BASE_URL} → "https://staging.example.com"'
      },
      {
        pattern: '${object.property}',
        description: 'Nested object property access',
        example: '${credentials.admin.username} → "admin_user"'
      },
      {
        pattern: '${array[index]}',
        description: 'Array element access by index',
        example: '${users[0].name} → "John Doe"'
      }
    ],
    examples: [
      'Navigate to ${env.BASE_URL}/login',
      'Enter username: ${credentials.user.email}',
      'Click on "${buttons.submit}" button',
      'Verify URL contains "${expected.paths.dashboard}"'
    ]
  };

  const formats: FormatSpecifications = {
    yaml: {
      conventions: [
        'Use 2-space indentation',
        'Use lowercase with underscores for keys',
        'Quote strings containing special characters',
        'Use consistent list formatting'
      ],
      indentation: '2 spaces',
      listFormat: 'Use dash (-) for array items',
      commentStyle: 'Use # for comments, place on separate lines'
    },
    json: {
      structure: [
        'Follow strict JSON syntax',
        'Use double quotes for strings',
        'No trailing commas',
        'Consistent property ordering'
      ],
      naming: 'camelCase for property names',
      escaping: 'Use backslash escaping for special characters'
    }
  };

  const schemaData: SchemaData = {
    testCaseSchema,
    testResultSchema,
    projectConfigSchema,
    variableSubstitution,
    formats
  };

  return createSuccess(schemaData);
}