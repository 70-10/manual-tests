// Input validation for project initialization

import type { InitProjectInput } from '../../models';

/**
 * Interface for input validation strategies
 */
export interface InitInputValidator {
  validate(input: InitProjectInput): string | null;
}

/**
 * URL validation helper
 */
class UrlValidator {
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Default input validator implementation
 */
export class DefaultInitInputValidator implements InitInputValidator {
  validate(input: InitProjectInput): string | null {
    // Project name validation
    const projectNameError = this.validateProjectName(input.projectName);
    if (projectNameError) return projectNameError;

    // Base URL validation
    const baseUrlError = this.validateBaseUrl(input.baseUrl);
    if (baseUrlError) return baseUrlError;

    // Environments validation
    const environmentsError = this.validateEnvironments(input.environments);
    if (environmentsError) return environmentsError;

    // Features validation
    const featuresError = this.validateFeatures(input.features);
    if (featuresError) return featuresError;

    return null;
  }

  private validateProjectName(projectName: string): string | null {
    if (!projectName || typeof projectName !== 'string') {
      return 'projectName is required and must be a string';
    }

    if (projectName.trim() === '') {
      return 'projectName cannot be empty';
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9._-]+$/.test(projectName)) {
      return 'projectName can only contain alphanumeric characters, dots, underscores, and hyphens';
    }

    return null;
  }

  private validateBaseUrl(baseUrl: string): string | null {
    if (!baseUrl || typeof baseUrl !== 'string') {
      return 'baseUrl is required and must be a string';
    }

    if (!UrlValidator.isValidUrl(baseUrl)) {
      return 'baseUrl must be a valid URL';
    }

    return null;
  }

  private validateEnvironments(environments?: { [key: string]: string }): string | null {
    if (!environments) {
      return null; // Optional field
    }

    if (typeof environments !== 'object' || Array.isArray(environments)) {
      return 'environments must be an object';
    }

    for (const [env, url] of Object.entries(environments)) {
      if (typeof url !== 'string') {
        return `environments.${env} must be a string`;
      }

      if (!UrlValidator.isValidUrl(url)) {
        return `environments.${env} must be a valid URL`;
      }
    }

    return null;
  }

  private validateFeatures(features?: Array<{ name: string; description: string }>): string | null {
    if (!features) {
      return null; // Optional field
    }

    if (!Array.isArray(features)) {
      return 'features must be an array';
    }

    for (let i = 0; i < features.length; i++) {
      const feature = features[i];

      if (typeof feature !== 'object' || feature === null) {
        return `features[${i}] must be an object`;
      }

      if (!feature.name || typeof feature.name !== 'string') {
        return `features[${i}].name is required and must be a string`;
      }

      if (!feature.description || typeof feature.description !== 'string') {
        return `features[${i}].description is required and must be a string`;
      }

      // Check for duplicate feature names
      const duplicateIndex = features.findIndex((f, idx) => idx !== i && f.name === feature.name);
      if (duplicateIndex !== -1) {
        return `Duplicate feature name: ${feature.name}`;
      }
    }

    return null;
  }
}

// Default validator instance
export const defaultInitInputValidator = new DefaultInitInputValidator();