import { TestCase, ValidationResult } from '../models';
import { TestCaseSchema } from '../schemas/test-case-schema';
import { parseYamlSafe } from '../utils/yaml-utils';

// Re-export types for backward compatibility
export type { TestCase, ValidationResult, Priority } from '../models';

/**
 * Parse YAML content safely
 */
function parseYaml(yamlContent: string): { success: true; data: unknown } | { success: false; error: string } {
  const result = parseYamlSafe(yamlContent);
  
  if (!result.success) {
    // Adjust error message format for backward compatibility
    const error = result.error.startsWith('YAML syntax error') 
      ? result.error 
      : `Validation error: ${result.error}`;
    return { success: false, error };
  }
  
  return { success: true, data: result.data };
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