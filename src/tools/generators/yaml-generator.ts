// YAML content generation for test cases

import type { CreateTestCaseInput } from '../../models';
import type { TestCaseTemplate } from '../templates';

/**
 * Interface for YAML generation strategies
 */
export interface YamlGenerator {
  generateYaml(input: CreateTestCaseInput, template: TestCaseTemplate, generatedId: string): string;
}

/**
 * Scenario merger interface
 */
export interface ScenarioMerger {
  merge(template: TestCaseTemplate, custom?: CreateTestCaseInput['scenario']): TestCaseTemplate;
}

/**
 * Default scenario merger implementation
 */
export class DefaultScenarioMerger implements ScenarioMerger {
  merge(template: TestCaseTemplate, custom?: CreateTestCaseInput['scenario']): TestCaseTemplate {
    if (!custom) {
      return template;
    }

    return {
      given: custom.given || template.given,
      when: custom.when || template.when,
      then: custom.then || template.then
    };
  }
}

/**
 * Default YAML generator implementation
 */
export class DefaultYamlGenerator implements YamlGenerator {
  private scenarioMerger: ScenarioMerger;

  constructor(scenarioMerger: ScenarioMerger = new DefaultScenarioMerger()) {
    this.scenarioMerger = scenarioMerger;
  }

  generateYaml(input: CreateTestCaseInput, template: TestCaseTemplate, generatedId: string): string {
    const scenario = this.scenarioMerger.merge(template, input.scenario);
    
    const lines: string[] = [];
    
    // Meta section
    this.addMetaSection(lines, input, generatedId);
    lines.push('');
    
    // Scenario section
    this.addScenarioSection(lines, scenario);
    
    return lines.join('\n');
  }

  private addMetaSection(lines: string[], input: CreateTestCaseInput, generatedId: string): void {
    lines.push('meta:');
    lines.push(`  id: ${generatedId}`);
    lines.push(`  title: ${input.meta.title}`);
    lines.push(`  feature: ${input.meta.feature}`);
    lines.push(`  priority: ${input.meta.priority}`);
    
    if (input.meta.tags && input.meta.tags.length > 0) {
      lines.push(`  tags: [${input.meta.tags.join(', ')}]`);
    }
    
    if (input.meta.author) {
      lines.push(`  author: ${input.meta.author}`);
    }
    
    lines.push(`  lastUpdated: ${this.getCurrentDate()}`);
  }

  private addScenarioSection(lines: string[], scenario: TestCaseTemplate): void {
    lines.push('scenario:');
    
    // Given
    lines.push('  given:');
    scenario.given.forEach(step => {
      lines.push(`    - ${step}`);
    });
    lines.push('');
    
    // When
    lines.push('  when:');
    scenario.when.forEach(step => {
      lines.push(`    - ${step}`);
    });
    lines.push('');
    
    // Then
    lines.push('  then:');
    scenario.then.forEach(step => {
      lines.push(`    - ${step}`);
    });
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}

// Default generator instance
export const defaultYamlGenerator = new DefaultYamlGenerator();