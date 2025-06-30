import * as yaml from 'js-yaml';
import { z } from 'zod';

// Zod schema for test case validation
const TestCaseSchema = z.object({
  meta: z.object({
    id: z.string().regex(/^TC-[A-Z-]+-\d+$/, 'ID format must be TC-[A-Z-]+-[NUMBER]'),
    title: z.string().min(1, 'Title is required'),
    feature: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low'], {
      errorMap: () => ({ message: 'Priority must be one of: high, medium, low' })
    }),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    lastUpdated: z.union([z.string(), z.date()]).optional()
  }),
  precondition: z.array(z.string()).optional(),
  scenario: z.object({
    given: z.array(z.string()).min(1, 'Given cannot be empty'),
    when: z.array(z.string()).min(1, 'When cannot be empty'), 
    then: z.array(z.string()).min(1, 'Then cannot be empty')
  }),
  notes: z.string().optional()
});

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  parsedData?: any;
}

export function validateTestCase(yamlContent: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // Parse YAML
    const parsedData = yaml.load(yamlContent);
    result.parsedData = parsedData;

    // Validate schema
    const validation = TestCaseSchema.safeParse(parsedData);
    
    if (!validation.success) {
      result.isValid = false;
      validation.error.errors.forEach(error => {
        const path = error.path.join('.');
        result.errors.push(`${path}: ${error.message}`);
      });
    }

  } catch (error) {
    result.isValid = false;
    if (error instanceof yaml.YAMLException) {
      result.errors.push(`YAML syntax error: ${error.message}`);
    } else {
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return result;
}