import * as yaml from 'js-yaml';

/**
 * Result types for YAML operations
 */
export type YamlParseResult<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: string };

export type YamlStringifyResult = 
  | { success: true; yaml: string }
  | { success: false; error: string };

export type YamlValidationResult<T = unknown> = 
  | { success: true; data: T; validationErrors: string[] }
  | { success: false; error: string; validationErrors?: string[] };

/**
 * Parse YAML safely with error handling
 */
export function parseYamlSafe<T = unknown>(yamlContent: string): YamlParseResult<T> {
  try {
    const data = yaml.load(yamlContent) as T;
    return { success: true, data };
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      return { success: false, error: `YAML syntax error: ${error.message}` };
    }
    const message = error instanceof Error ? error.message : 'Unknown parsing error';
    return { success: false, error: `YAML parse error: ${message}` };
  }
}

/**
 * Stringify object to YAML with error handling
 */
export function stringifyYaml(
  data: unknown, 
  options?: yaml.DumpOptions
): YamlStringifyResult {
  try {
    const defaultOptions: yaml.DumpOptions = {
      indent: 2,
      noRefs: true,
      sortKeys: false,
      ...options
    };
    
    const yamlString = yaml.dump(data, defaultOptions);
    return { success: true, yaml: yamlString };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown stringify error';
    return { success: false, error: `YAML stringify error: ${message}` };
  }
}

/**
 * Check if YAML string is valid
 */
export function isValidYaml(yamlContent: string): boolean {
  try {
    yaml.load(yamlContent);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract detailed error information from YAML
 */
export function extractYamlErrors(yamlContent: string): string[] {
  try {
    yaml.load(yamlContent);
    return [];
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      return [`YAML syntax error: ${error.message}`];
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return [`YAML parse error: ${message}`];
  }
}

/**
 * Parse YAML with custom validation
 */
export function parseYamlWithValidation<T = unknown>(
  yamlContent: string,
  validator: (data: unknown) => string[]
): YamlValidationResult<T> {
  // First parse YAML
  const parseResult = parseYamlSafe<T>(yamlContent);
  
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error
    };
  }
  
  // Then validate the parsed data
  try {
    const validationErrors = validator(parseResult.data);
    
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation failed: ${validationErrors.join(', ')}`,
        validationErrors
      };
    }
    
    return {
      success: true,
      data: parseResult.data,
      validationErrors: []
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown validation error';
    return {
      success: false,
      error: `Validation error: ${message}`
    };
  }
}