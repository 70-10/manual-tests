import { validateTestCase, type TestCase, type ValidationResult } from './manual-test-validate';

export interface ProjectMeta {
  test_data?: Record<string, any>;
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

// Variable substitution strategies
interface VariableResolver {
  canResolve(variableName: string): boolean;
  resolve(variableName: string, projectMeta?: ProjectMeta): string | undefined;
}

/**
 * Built-in date/time variable resolver
 */
class BuiltInVariableResolver implements VariableResolver {
  canResolve(variableName: string): boolean {
    return variableName === 'today' || variableName === 'timestamp';
  }

  resolve(variableName: string): string | undefined {
    switch (variableName) {
      case 'today':
        return new Date().toISOString().split('T')[0];
      case 'timestamp':
        return Date.now().toString();
      default:
        return undefined;
    }
  }
}

/**
 * Project metadata variable resolver
 */
class ProjectMetaVariableResolver implements VariableResolver {
  canResolve(variableName: string): boolean {
    return variableName.includes('.');
  }

  resolve(variableName: string, projectMeta?: ProjectMeta): string | undefined {
    if (!projectMeta) return undefined;
    
    const value = this.getNestedValue(projectMeta, variableName);
    return value !== undefined ? String(value) : undefined;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

/**
 * Variable resolver factory
 */
class VariableResolverRegistry {
  private resolvers: VariableResolver[] = [
    new BuiltInVariableResolver(),
    new ProjectMetaVariableResolver()
  ];

  resolve(variableName: string, projectMeta?: ProjectMeta): string | undefined {
    for (const resolver of this.resolvers) {
      if (resolver.canResolve(variableName)) {
        const result = resolver.resolve(variableName, projectMeta);
        if (result !== undefined) {
          return result;
        }
      }
    }
    return undefined;
  }
}

/**
 * Variable substitution service
 */
class VariableSubstitutionService {
  private registry = new VariableResolverRegistry();

  substitute(text: string, projectMeta?: ProjectMeta): { result: string; warnings: string[] } {
    const warnings: string[] = [];
    
    const result = text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmedName = variableName.trim();
      const resolved = this.registry.resolve(trimmedName, projectMeta);
      
      if (resolved !== undefined) {
        return resolved;
      }
      
      // Variable not found
      warnings.push(`Variable not found: ${trimmedName}`);
      return match; // Return original placeholder
    });
    
    return { result, warnings };
  }
}

// Global instance
const substitutionService = new VariableSubstitutionService();

/**
 * Substitute variables in a string
 */
function substituteVariables(text: string, projectMeta?: ProjectMeta): { result: string; warnings: string[] } {
  return substitutionService.substitute(text, projectMeta);
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
 * Create error result
 */
function createErrorResult(error: string): ParseErrorResult {
  return { success: false, error };
}

/**
 * Create success result
 */
function createSuccessResult(
  testCase: TestCase,
  processedSteps: ProcessedSteps,
  warnings: string[]
): ParseSuccessResult {
  return {
    success: true,
    testCase,
    processedSteps,
    warnings
  };
}

/**
 * Parse test case YAML and process variables
 */
export function parseTestCase(yamlContent: string, projectMeta?: ProjectMeta): ParseResult {
  try {
    // Validate YAML structure
    const validationResult = validateTestCase(yamlContent);
    
    if (!validationResult.isValid) {
      return createErrorResult(validationResult.errors.join('; '));
    }
    
    if (!validationResult.parsedData) {
      return createErrorResult('No parsed data available');
    }
    
    const testCase = validationResult.parsedData;
    const allWarnings: string[] = [];
    
    // Process scenario steps with error handling
    const givenResult = processSteps(testCase.scenario.given, projectMeta);
    const whenResult = processSteps(testCase.scenario.when, projectMeta);
    const thenResult = processSteps(testCase.scenario.then, projectMeta);
    
    allWarnings.push(
      ...givenResult.warnings,
      ...whenResult.warnings,
      ...thenResult.warnings
    );
    
    const processedSteps: ProcessedSteps = {
      given: givenResult.processed,
      when: whenResult.processed,
      then: thenResult.processed
    };
    
    return createSuccessResult(testCase, processedSteps, allWarnings);
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during parsing';
    return createErrorResult(`Parse error: ${message}`);
  }
}