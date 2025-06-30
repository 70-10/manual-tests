import type { CreateTestCaseInput, CreateResult } from '../models';
import { templateManager } from './templates';
import { defaultIdGenerator } from './generators/id-generator';
import { defaultYamlGenerator } from './generators/yaml-generator';
import { DefaultInputValidator } from './validators/create-input-validator';

// Create validator instance with template manager
const inputValidator = new DefaultInputValidator(templateManager);

/**
 * Create a new test case based on template and input
 */
export function createTestCase(input: CreateTestCaseInput): CreateResult {
  try {
    // Validate input
    const validationError = inputValidator.validate(input);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Get template
    const template = templateManager.getTemplate(input.template);
    if (!template) {
      return {
        success: false,
        error: `Template not found: ${input.template}`
      };
    }

    // Generate unique ID
    const generatedId = defaultIdGenerator.generateId(input.meta.feature);

    // Generate YAML content
    const yamlContent = defaultYamlGenerator.generateYaml(input, template, generatedId);

    return {
      success: true,
      yamlContent,
      generatedId
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during test case creation';
    return {
      success: false,
      error: `Creation error: ${message}`
    };
  }
}

// Re-export types and utilities for convenience
export type { CreateTestCaseInput, CreateResult } from '../models';
export { templateManager, defaultIdGenerator, defaultYamlGenerator };