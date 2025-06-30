import * as yaml from 'js-yaml';
import { TestCase, ValidationResult } from '../models';
import { TestCaseSchema } from '../schemas/test-case-schema';

// Re-export types for backward compatibility
export type { TestCase, ValidationResult, Priority } from '../models';

/**
 * Parse YAML content safely
 */
function parseYaml(yamlContent: string): { success: true; data: unknown } | { success: false; error: string } {
  try {
    const data = yaml.load(yamlContent);
    return { success: true, data };
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      return { success: false, error: `YAML syntax error: ${error.message}` };
    }
    const message = error instanceof Error ? error.message : 'Unknown parsing error';
    return { success: false, error: `Validation error: ${message}` };
  }
}

/**
 * Validate parsed data against schema
 */
function validateSchema(data: unknown): { success: true; data: TestCase } | { success: false; errors: string[] } {
  const validation = TestCaseSchema.safeParse(data);
  
  if (validation.success) {
    return { success: true, data: validation.data };
  }
  
  const errors = validation.error.errors.map(error => {
    const path = error.path.join('.');
    return `${path}: ${error.message}`;
  });
  
  return { success: false, errors };
}

/**
 * Create initial validation result
 */
function createValidationResult(): ValidationResult {
  return {
    isValid: true,
    errors: [],
    warnings: []
  };
}

/**
 * Validate a test case YAML content
 */
export function validateTestCase(yamlContent: string): ValidationResult {
  const result = createValidationResult();

  // Parse YAML
  const parseResult = parseYaml(yamlContent);
  if (!parseResult.success) {
    result.isValid = false;
    result.errors.push(parseResult.error);
    return result;
  }

  // Validate schema
  const schemaResult = validateSchema(parseResult.data);
  if (!schemaResult.success) {
    result.isValid = false;
    result.errors.push(...schemaResult.errors);
    return result;
  }

  // Success
  result.parsedData = schemaResult.data;
  return result;
}