import { validateTestCase, type TestCase, type ValidationResult } from './manual-test-validate';

export interface ProjectMeta {
  test_data?: any;
  environments?: Record<string, string>;
  [key: string]: any;
}

export interface ProcessedSteps {
  given: string[];
  when: string[];
  then: string[];
}

export interface ParseSuccessResult {
  success: true;
  testCase: TestCase;
  processedSteps: ProcessedSteps;
  warnings: string[];
}

export interface ParseErrorResult {
  success: false;
  error: string;
}

export type ParseResult = ParseSuccessResult | ParseErrorResult;

/**
 * Generate current timestamp
 */
function generateTimestamp(): string {
  return Date.now().toString();
}

/**
 * Generate today's date in YYYY-MM-DD format
 */
function generateToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get nested property value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Substitute variables in a string
 */
function substituteVariables(text: string, projectMeta?: ProjectMeta): { result: string; warnings: string[] } {
  const warnings: string[] = [];
  
  const result = text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    
    // Built-in variables
    if (trimmedName === 'today') {
      return generateToday();
    }
    
    if (trimmedName === 'timestamp') {
      return generateTimestamp();
    }
    
    // Project meta variables
    if (projectMeta && trimmedName.includes('.')) {
      const value = getNestedValue(projectMeta, trimmedName);
      if (value !== undefined) {
        return String(value);
      }
    }
    
    // Variable not found
    warnings.push(`Variable not found: ${trimmedName}`);
    return match; // Return original placeholder
  });
  
  return { result, warnings };
}

/**
 * Process steps array with variable substitution
 */
function processSteps(steps: string[], projectMeta?: ProjectMeta): { processed: string[]; warnings: string[] } {
  const processed: string[] = [];
  const allWarnings: string[] = [];
  
  for (const step of steps) {
    const { result, warnings } = substituteVariables(step, projectMeta);
    processed.push(result);
    allWarnings.push(...warnings);
  }
  
  return { processed, warnings: allWarnings };
}

/**
 * Parse test case YAML and process variables
 */
export function parseTestCase(yamlContent: string, projectMeta?: ProjectMeta): ParseResult {
  // First validate the YAML
  const validationResult: ValidationResult = validateTestCase(yamlContent);
  
  if (!validationResult.isValid) {
    return {
      success: false,
      error: validationResult.errors.join('; ')
    };
  }
  
  if (!validationResult.parsedData) {
    return {
      success: false,
      error: 'No parsed data available'
    };
  }
  
  const testCase = validationResult.parsedData;
  const allWarnings: string[] = [];
  
  // Process scenario steps
  const givenResult = processSteps(testCase.scenario.given, projectMeta);
  const whenResult = processSteps(testCase.scenario.when, projectMeta);
  const thenResult = processSteps(testCase.scenario.then, projectMeta);
  
  allWarnings.push(...givenResult.warnings, ...whenResult.warnings, ...thenResult.warnings);
  
  return {
    success: true,
    testCase,
    processedSteps: {
      given: givenResult.processed,
      when: whenResult.processed,
      then: thenResult.processed
    },
    warnings: allWarnings
  };
}