import { Result } from './result';

/**
 * Schema property definition
 */
export interface SchemaProperty {
  type: string;
  description?: string;
  required?: string[];
  properties?: Record<string, SchemaProperty>;
  enum?: string[];
  items?: SchemaProperty;
  optional?: string[];
}

/**
 * Test case schema structure
 */
export interface TestCaseSchemaInfo {
  required: string[];
  optional: string[];
  properties: {
    meta: SchemaProperty;
    scenario: SchemaProperty;
    precondition?: SchemaProperty;
    postcondition?: SchemaProperty;
  };
}

/**
 * Test result schema structure
 */
export interface TestResultSchemaInfo {
  required: string[];
  properties: {
    testId: SchemaProperty;
    status: SchemaProperty;
    executedAt: SchemaProperty;
    executedBy?: SchemaProperty;
    duration?: SchemaProperty;
    notes?: SchemaProperty;
    attachments?: SchemaProperty;
  };
}

/**
 * Project configuration schema
 */
export interface ProjectConfigSchemaInfo {
  required: string[];
  properties: {
    projectName: SchemaProperty;
    baseUrl: SchemaProperty;
    environments?: SchemaProperty;
    testData?: SchemaProperty;
  };
}

/**
 * Variable substitution syntax patterns
 */
export interface VariableSubstitutionSyntax {
  basic: string;
  nested: string;
  environment: string;
}

/**
 * Variable substitution rule
 */
export interface VariableSubstitutionRule {
  pattern: string;
  description: string;
  example: string;
}

/**
 * Variable substitution specification
 */
export interface VariableSubstitution {
  syntax: VariableSubstitutionSyntax;
  rules: VariableSubstitutionRule[];
  examples: string[];
}

/**
 * Format specifications for YAML and JSON
 */
export interface FormatSpecifications {
  yaml: {
    conventions: string[];
    indentation: string;
    listFormat: string;
    commentStyle: string;
  };
  json: {
    structure: string[];
    naming: string;
    escaping: string;
  };
}

/**
 * Schema information data structure
 */
export interface SchemaData {
  testCaseSchema: TestCaseSchemaInfo;
  testResultSchema: TestResultSchemaInfo;
  projectConfigSchema: ProjectConfigSchemaInfo;
  variableSubstitution: VariableSubstitution;
  formats: FormatSpecifications;
}

/**
 * Result type for schema operations
 */
export type SchemaResult = Result<SchemaData>;