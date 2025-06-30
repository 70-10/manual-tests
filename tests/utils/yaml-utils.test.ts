import { describe, it, expect } from 'vitest';

import {
  parseYamlSafe,
  stringifyYaml,
  isValidYaml,
  extractYamlErrors,
  parseYamlWithValidation,
  YamlParseResult
} from '../../src/utils/yaml-utils';

describe('YAML Utils', () => {
  describe('parseYamlSafe', () => {
    it('should parse valid YAML', () => {
      const yaml = 'name: test\nvalue: 123';
      const result = parseYamlSafe(yaml);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'test', value: 123 });
      }
    });

    it('should handle invalid YAML syntax', () => {
      const yaml = 'name: test\n  invalid: [unclosed';
      const result = parseYamlSafe(yaml);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('YAML syntax error');
      }
    });

    it('should handle empty YAML', () => {
      const result = parseYamlSafe('');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it('should handle YAML with only whitespace', () => {
      const result = parseYamlSafe('   \n  \t  ');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe('stringifyYaml', () => {
    it('should stringify object to YAML', () => {
      const data = { name: 'test', value: 123, nested: { key: 'value' } };
      const result = stringifyYaml(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.yaml).toContain('name: test');
        expect(result.yaml).toContain('value: 123');
        expect(result.yaml).toContain('nested:');
        expect(result.yaml).toContain('  key: value');
      }
    });

    it('should handle arrays in YAML', () => {
      const data = { items: ['item1', 'item2', 'item3'] };
      const result = stringifyYaml(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.yaml).toContain('items:');
        expect(result.yaml).toContain('- item1');
        expect(result.yaml).toContain('- item2');
        expect(result.yaml).toContain('- item3');
      }
    });

    it('should handle null and undefined values', () => {
      const data = { nullValue: null, undefinedValue: undefined, normalValue: 'test' };
      const result = stringifyYaml(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.yaml).toContain('nullValue: null');
        expect(result.yaml).not.toContain('undefinedValue');
        expect(result.yaml).toContain('normalValue: test');
      }
    });

    it('should use custom options when provided', () => {
      const data = { name: 'test', value: 123 };
      const result = stringifyYaml(data, {
        indent: 4,
        flowLevel: 1
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // YAML with different indentation
        expect(result.yaml).toContain('name: test');
      }
    });

    it('should handle unstringifiable objects', () => {
      const circular: any = {};
      circular.self = circular;
      
      const result = stringifyYaml(circular);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('YAML stringify error');
      }
    });
  });

  describe('isValidYaml', () => {
    it('should return true for valid YAML', () => {
      const validYaml = 'name: test\nvalue: 123';
      expect(isValidYaml(validYaml)).toBe(true);
    });

    it('should return false for invalid YAML', () => {
      const invalidYaml = 'name: test\n  invalid: [unclosed';
      expect(isValidYaml(invalidYaml)).toBe(false);
    });

    it('should return true for empty string', () => {
      expect(isValidYaml('')).toBe(true);
    });
  });

  describe('extractYamlErrors', () => {
    it('should extract error details from YAML exception', () => {
      const invalidYaml = 'name: test\n  invalid: [unclosed bracket';
      const errors = extractYamlErrors(invalidYaml);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('YAML syntax error');
    });

    it('should return empty array for valid YAML', () => {
      const validYaml = 'name: test\nvalue: 123';
      const errors = extractYamlErrors(validYaml);

      expect(errors).toHaveLength(0);
    });

    it('should handle multiple error conditions', () => {
      const invalidYaml = 'name: test\n  invalid: [unclosed\n  another: {broken';
      const errors = extractYamlErrors(invalidYaml);

      expect(errors.length).toBeGreaterThan(0);
      errors.forEach(error => {
        expect(error).toContain('YAML syntax error');
      });
    });
  });

  describe('parseYamlWithValidation', () => {
    it('should parse and validate YAML structure', () => {
      const yaml = 'name: test\nvalue: 123\ntags: [tag1, tag2]';
      const validator = (data: any) => {
        if (!data.name || typeof data.name !== 'string') {
          return ['name is required and must be string'];
        }
        if (!data.value || typeof data.value !== 'number') {
          return ['value is required and must be number'];
        }
        return [];
      };

      const result = parseYamlWithValidation(yaml, validator);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'test', value: 123, tags: ['tag1', 'tag2'] });
        expect(result.validationErrors).toHaveLength(0);
      }
    });

    it('should return validation errors when validation fails', () => {
      const yaml = 'name: test';
      const validator = (data: any) => {
        const errors = [];
        if (!data.value) errors.push('value is required');
        if (!data.tags) errors.push('tags is required');
        return errors;
      };

      const result = parseYamlWithValidation(yaml, validator);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Validation failed');
        expect(result.validationErrors).toContain('value is required');
        expect(result.validationErrors).toContain('tags is required');
      }
    });

    it('should handle YAML parse errors in validation', () => {
      const invalidYaml = 'name: test\n  invalid: [unclosed';
      const validator = () => [];

      const result = parseYamlWithValidation(invalidYaml, validator);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('YAML syntax error');
      }
    });

    it('should handle validator that throws error', () => {
      const yaml = 'name: test';
      const validator = () => {
        throw new Error('Validator crashed');
      };

      const result = parseYamlWithValidation(yaml, validator);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Validation error: Validator crashed');
      }
    });
  });

  describe('Integration with existing patterns', () => {
    it('should be compatible with test case YAML format', () => {
      const testCaseYaml = `meta:
  id: TC-TEST-001
  title: Test Case
  feature: Test Feature
  priority: high
  tags: [test]
  author: test
  lastUpdated: 2025-06-30
precondition:
  - Test precondition
scenario:
  given:
    - Given step
  when:
    - When step
  then:
    - Then step`;

      const parseResult = parseYamlSafe(testCaseYaml);
      expect(parseResult.success).toBe(true);

      if (parseResult.success) {
        const stringifyResult = stringifyYaml(parseResult.data);
        expect(stringifyResult.success).toBe(true);
        
        if (stringifyResult.success) {
          expect(stringifyResult.yaml).toContain('meta:');
          expect(stringifyResult.yaml).toContain('id: TC-TEST-001');
          expect(stringifyResult.yaml).toContain('scenario:');
        }
      }
    });
  });
});