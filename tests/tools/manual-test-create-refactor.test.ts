import { describe, it, expect, beforeEach } from 'vitest';
import { SequentialIdGenerator, TimestampIdGenerator, RandomIdGenerator } from '../../src/tools/generators/id-generator';
import { DefaultYamlGenerator, DefaultScenarioMerger } from '../../src/tools/generators/yaml-generator';
import { DefaultTemplateManager } from '../../src/tools/templates';
import { DefaultInputValidator } from '../../src/tools/validators/create-input-validator';
import type { CreateTestCaseInput } from '../../src/models';

describe('manual-test-create refactored components', () => {
  describe('IdGenerator strategies', () => {
    describe('SequentialIdGenerator', () => {
      let generator: SequentialIdGenerator;

      beforeEach(() => {
        generator = new SequentialIdGenerator();
        generator.reset();
      });

      it('should generate sequential IDs', () => {
        const id1 = generator.generateId('login');
        const id2 = generator.generateId('login');
        const id3 = generator.generateId('form');

        expect(id1).toBe('TC-LOGIN-001');
        expect(id2).toBe('TC-LOGIN-002');
        expect(id3).toBe('TC-FORM-003');
      });

      it('should normalize feature names', () => {
        const id1 = generator.generateId('user-management');
        const id2 = generator.generateId('api-integration');

        expect(id1).toBe('TC-USER_MANAGEMENT-001');
        expect(id2).toBe('TC-API_INTEGRATION-002');
      });

      it('should reset counter', () => {
        generator.generateId('test');
        generator.generateId('test');
        generator.reset();
        const id = generator.generateId('test');

        expect(id).toBe('TC-TEST-001');
      });
    });

    describe('TimestampIdGenerator', () => {
      it('should generate timestamp-based IDs', () => {
        const generator = new TimestampIdGenerator();
        const id = generator.generateId('login');

        expect(id).toMatch(/^TC-LOGIN-\d{6}$/);
      });

      it('should generate different IDs for same feature', async () => {
        const generator = new TimestampIdGenerator();
        const id1 = generator.generateId('login');
        // Small delay to ensure different timestamp
        await new Promise(resolve => setTimeout(resolve, 2));
        const id2 = generator.generateId('login');

        expect(id1).not.toBe(id2);
      });
    });

    describe('RandomIdGenerator', () => {
      it('should generate random IDs', () => {
        const generator = new RandomIdGenerator();
        const id = generator.generateId('login');

        expect(id).toMatch(/^TC-LOGIN-\d{3}$/);
      });

      it('should likely generate different IDs', () => {
        const generator = new RandomIdGenerator();
        const ids = new Set();
        
        // Generate 10 IDs and check they're mostly unique
        for (let i = 0; i < 10; i++) {
          ids.add(generator.generateId('test'));
        }

        expect(ids.size).toBeGreaterThan(5); // At least 50% unique
      });
    });
  });

  describe('ScenarioMerger', () => {
    let merger: DefaultScenarioMerger;

    beforeEach(() => {
      merger = new DefaultScenarioMerger();
    });

    it('should return template when no custom scenario', () => {
      const template = {
        given: ['template given'],
        when: ['template when'],
        then: ['template then']
      };

      const result = merger.merge(template);

      expect(result).toEqual(template);
    });

    it('should merge partial custom scenario', () => {
      const template = {
        given: ['template given'],
        when: ['template when'],
        then: ['template then']
      };

      const custom = {
        given: ['custom given']
      };

      const result = merger.merge(template, custom);

      expect(result).toEqual({
        given: ['custom given'],
        when: ['template when'],
        then: ['template then']
      });
    });

    it('should merge complete custom scenario', () => {
      const template = {
        given: ['template given'],
        when: ['template when'],
        then: ['template then']
      };

      const custom = {
        given: ['custom given'],
        when: ['custom when'],
        then: ['custom then']
      };

      const result = merger.merge(template, custom);

      expect(result).toEqual(custom);
    });
  });

  describe('YamlGenerator', () => {
    let generator: DefaultYamlGenerator;

    beforeEach(() => {
      generator = new DefaultYamlGenerator();
    });

    it('should generate complete YAML structure', () => {
      const input: CreateTestCaseInput = {
        template: 'login',
        meta: {
          title: 'Test Title',
          feature: 'test-feature',
          priority: 'high',
          tags: ['tag1', 'tag2'],
          author: 'tester'
        }
      };

      const template = {
        given: ['test given'],
        when: ['test when'],
        then: ['test then']
      };

      const yaml = generator.generateYaml(input, template, 'TC-TEST-001');

      expect(yaml).toContain('meta:');
      expect(yaml).toContain('id: TC-TEST-001');
      expect(yaml).toContain('title: Test Title');
      expect(yaml).toContain('feature: test-feature');
      expect(yaml).toContain('priority: high');
      expect(yaml).toContain('tags: [tag1, tag2]');
      expect(yaml).toContain('author: tester');
      expect(yaml).toContain('lastUpdated:');
      expect(yaml).toContain('scenario:');
      expect(yaml).toContain('given:');
      expect(yaml).toContain('- test given');
      expect(yaml).toContain('when:');
      expect(yaml).toContain('- test when');
      expect(yaml).toContain('then:');
      expect(yaml).toContain('- test then');
    });

    it('should handle optional meta fields', () => {
      const input: CreateTestCaseInput = {
        template: 'login',
        meta: {
          title: 'Test Title',
          feature: 'test-feature',
          priority: 'medium'
        }
      };

      const template = {
        given: ['test given'],
        when: ['test when'],
        then: ['test then']
      };

      const yaml = generator.generateYaml(input, template, 'TC-TEST-001');

      expect(yaml).toContain('title: Test Title');
      expect(yaml).toContain('priority: medium');
      expect(yaml).not.toContain('tags:');
      expect(yaml).not.toContain('author:');
    });
  });

  describe('TemplateManager', () => {
    let manager: DefaultTemplateManager;

    beforeEach(() => {
      const customTemplates = {
        custom: {
          given: ['custom given'],
          when: ['custom when'],
          then: ['custom then']
        }
      };
      manager = new DefaultTemplateManager(customTemplates);
    });

    it('should manage templates', () => {
      expect(manager.hasTemplate('custom')).toBe(true);
      expect(manager.hasTemplate('nonexistent')).toBe(false);
    });

    it('should return template', () => {
      const template = manager.getTemplate('custom');
      
      expect(template).toEqual({
        given: ['custom given'],
        when: ['custom when'],
        then: ['custom then']
      });
    });

    it('should list available templates', () => {
      const templates = manager.getAvailableTemplates();
      
      expect(templates).toEqual(['custom']);
    });
  });

  describe('InputValidator', () => {
    let validator: DefaultInputValidator;
    let templateManager: DefaultTemplateManager;

    beforeEach(() => {
      const templates = {
        test: {
          given: ['test'],
          when: ['test'],
          then: ['test']
        }
      };
      templateManager = new DefaultTemplateManager(templates);
      validator = new DefaultInputValidator(templateManager);
    });

    it('should validate valid input', () => {
      const input: CreateTestCaseInput = {
        template: 'test',
        meta: {
          title: 'Valid Title',
          feature: 'valid-feature',
          priority: 'high',
          tags: ['tag1'],
          author: 'author'
        }
      };

      const error = validator.validate(input);
      expect(error).toBeNull();
    });

    it('should validate template', () => {
      const input: CreateTestCaseInput = {
        template: 'invalid' as any,
        meta: {
          title: 'Title',
          feature: 'feature',
          priority: 'high'
        }
      };

      const error = validator.validate(input);
      expect(error).toContain('Invalid template');
    });

    it('should validate meta fields', () => {
      const inputs = [
        {
          template: 'test' as const,
          meta: { title: '', feature: 'feature', priority: 'high' as const }
        },
        {
          template: 'test' as const,
          meta: { title: 'title', feature: '', priority: 'high' as const }
        },
        {
          template: 'test' as const,
          meta: { title: 'title', feature: 'feature', priority: 'invalid' as any }
        }
      ];

      inputs.forEach(input => {
        const error = validator.validate(input);
        expect(error).not.toBeNull();
      });
    });

    it('should validate scenario arrays', () => {
      const input: CreateTestCaseInput = {
        template: 'test',
        meta: {
          title: 'Title',
          feature: 'feature',
          priority: 'high'
        },
        scenario: {
          given: ['invalid', 123 as any]
        }
      };

      const error = validator.validate(input);
      expect(error).toContain('scenario.given must be an array of strings');
    });
  });
});