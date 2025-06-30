// Input validation for test case creation

import type { CreateTestCaseInput } from '../../models';
import type { TemplateManager } from '../templates';

/**
 * Interface for input validation strategies
 */
export interface InputValidator {
  validate(input: CreateTestCaseInput): string | null;
}

/**
 * Default input validator implementation
 */
export class DefaultInputValidator implements InputValidator {
  private templateManager: TemplateManager;

  constructor(templateManager: TemplateManager) {
    this.templateManager = templateManager;
  }

  validate(input: CreateTestCaseInput): string | null {
    // Template validation
    const templateError = this.validateTemplate(input.template);
    if (templateError) return templateError;

    // Meta validation
    const metaError = this.validateMeta(input.meta);
    if (metaError) return metaError;

    // Scenario validation (optional)
    const scenarioError = this.validateScenario(input.scenario);
    if (scenarioError) return scenarioError;

    return null;
  }

  private validateTemplate(template: string): string | null {
    if (!template || typeof template !== 'string') {
      return 'template is required and must be a string';
    }

    if (!this.templateManager.hasTemplate(template)) {
      const availableTemplates = this.templateManager.getAvailableTemplates();
      return `Invalid template: ${template}. Must be one of: ${availableTemplates.join(', ')}`;
    }

    return null;
  }

  private validateMeta(meta: CreateTestCaseInput['meta']): string | null {
    if (!meta) {
      return 'meta is required';
    }

    // Title validation
    if (!meta.title || typeof meta.title !== 'string' || meta.title.trim() === '') {
      return 'meta.title is required and cannot be empty';
    }

    // Feature validation
    if (!meta.feature || typeof meta.feature !== 'string' || meta.feature.trim() === '') {
      return 'meta.feature is required and cannot be empty';
    }

    // Priority validation
    if (!meta.priority || !['high', 'medium', 'low'].includes(meta.priority)) {
      return 'meta.priority must be one of: high, medium, low';
    }

    // Tags validation (optional)
    if (meta.tags && (!Array.isArray(meta.tags) || meta.tags.some(tag => typeof tag !== 'string'))) {
      return 'meta.tags must be an array of strings';
    }

    // Author validation (optional)
    if (meta.author && typeof meta.author !== 'string') {
      return 'meta.author must be a string';
    }

    return null;
  }

  private validateScenario(scenario?: CreateTestCaseInput['scenario']): string | null {
    if (!scenario) {
      return null; // Scenario is optional
    }

    // Given validation
    if (scenario.given && (!Array.isArray(scenario.given) || scenario.given.some(step => typeof step !== 'string'))) {
      return 'scenario.given must be an array of strings';
    }

    // When validation
    if (scenario.when && (!Array.isArray(scenario.when) || scenario.when.some(step => typeof step !== 'string'))) {
      return 'scenario.when must be an array of strings';
    }

    // Then validation
    if (scenario.then && (!Array.isArray(scenario.then) || scenario.then.some(step => typeof step !== 'string'))) {
      return 'scenario.then must be an array of strings';
    }

    return null;
  }
}