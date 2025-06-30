import * as yaml from 'js-yaml';
import { z } from 'zod';

// Type definitions
export type Priority = 'high' | 'medium' | 'low';

export interface TestCase {
  meta: {
    id: string;
    title: string;
    feature?: string;
    priority: Priority;
    tags?: string[];
    author?: string;
    lastUpdated?: string | Date;
  };
  precondition?: string[];
  scenario: {
    given: string[];
    when: string[];
    then: string[];
  };
  notes?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  parsedData?: TestCase;
}

// Schema definitions
const MetaSchema = z.object({
  id: z.string().regex(/^TC-[A-Z-]+-\d+$/, 'ID format must be TC-[A-Z-]+-[NUMBER]'),
  title: z.string().min(1, 'Title is required'),
  feature: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Priority must be one of: high, medium, low' })
  }),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  lastUpdated: z.union([z.string(), z.date()]).optional()
});

const ScenarioSchema = z.object({
  given: z.array(z.string()).min(1, 'Given cannot be empty'),
  when: z.array(z.string()).min(1, 'When cannot be empty'),
  then: z.array(z.string()).min(1, 'Then cannot be empty')
});

const TestCaseSchema = z.object({
  meta: MetaSchema,
  precondition: z.array(z.string()).optional(),
  scenario: ScenarioSchema,
  notes: z.string().optional()
});

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