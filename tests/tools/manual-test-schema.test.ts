import { describe, it, expect } from 'vitest';
import { getSchema } from '../../src/tools/manual-test-schema';
import type { SchemaResult } from '../../src/models';

describe('manual-test-schema', () => {
  describe('getSchema', () => {
    describe('basic schema information', () => {
      it('should return success with schema information', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.testCaseSchema).toBeDefined();
          expect(result.data.testResultSchema).toBeDefined();
          expect(result.data.projectConfigSchema).toBeDefined();
        }
      });

      it('should include variable substitution rules', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variableSubstitution).toBeDefined();
          expect(result.data.variableSubstitution.syntax).toBeDefined();
          expect(result.data.variableSubstitution.rules).toBeDefined();
          expect(Array.isArray(result.data.variableSubstitution.rules)).toBe(true);
        }
      });

      it('should include format specifications', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.formats).toBeDefined();
          expect(result.data.formats.yaml).toBeDefined();
          expect(result.data.formats.json).toBeDefined();
        }
      });
    });

    describe('test case schema details', () => {
      it('should include required fields structure', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          const testCaseSchema = result.data.testCaseSchema;
          expect(testCaseSchema.required).toBeDefined();
          expect(Array.isArray(testCaseSchema.required)).toBe(true);
          expect(testCaseSchema.required).toContain('meta');
          expect(testCaseSchema.required).toContain('scenario');
        }
      });

      it('should include meta field specifications', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          const testCaseSchema = result.data.testCaseSchema;
          expect(testCaseSchema.properties.meta).toBeDefined();
          expect(testCaseSchema.properties.meta.required).toBeDefined();
          expect(testCaseSchema.properties.meta.required).toContain('id');
          expect(testCaseSchema.properties.meta.required).toContain('title');
          expect(testCaseSchema.properties.meta.required).toContain('feature');
          expect(testCaseSchema.properties.meta.required).toContain('priority');
        }
      });

      it('should include scenario field specifications', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          const testCaseSchema = result.data.testCaseSchema;
          expect(testCaseSchema.properties.scenario).toBeDefined();
          expect(testCaseSchema.properties.scenario.properties.given).toBeDefined();
          expect(testCaseSchema.properties.scenario.properties.when).toBeDefined();
          expect(testCaseSchema.properties.scenario.properties.then).toBeDefined();
        }
      });

      it('should include optional fields specifications', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          const testCaseSchema = result.data.testCaseSchema;
          expect(testCaseSchema.optional).toBeDefined();
          expect(Array.isArray(testCaseSchema.optional)).toBe(true);
          expect(testCaseSchema.optional).toContain('precondition');
          expect(testCaseSchema.optional).toContain('postcondition');
        }
      });
    });

    describe('test result schema details', () => {
      it('should include result structure', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          const resultSchema = result.data.testResultSchema;
          expect(resultSchema.required).toBeDefined();
          expect(resultSchema.required).toContain('testId');
          expect(resultSchema.required).toContain('status');
          expect(resultSchema.required).toContain('executedAt');
        }
      });

      it('should include status value constraints', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          const resultSchema = result.data.testResultSchema;
          expect(resultSchema.properties.status.enum).toBeDefined();
          expect(resultSchema.properties.status.enum).toContain('passed');
          expect(resultSchema.properties.status.enum).toContain('failed');
          expect(resultSchema.properties.status.enum).toContain('skipped');
          expect(resultSchema.properties.status.enum).toContain('pending');
        }
      });
    });

    describe('variable substitution specifications', () => {
      it('should include syntax patterns', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          const varSub = result.data.variableSubstitution;
          expect(varSub.syntax.basic).toBeDefined();
          expect(varSub.syntax.nested).toBeDefined();
          expect(varSub.syntax.environment).toBeDefined();
        }
      });

      it('should include substitution rules', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          const varSub = result.data.variableSubstitution;
          varSub.rules.forEach(rule => {
            expect(rule.pattern).toBeDefined();
            expect(rule.description).toBeDefined();
            expect(rule.example).toBeDefined();
          });
        }
      });

      it('should include examples', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          const varSub = result.data.variableSubstitution;
          expect(varSub.examples).toBeDefined();
          expect(Array.isArray(varSub.examples)).toBe(true);
          expect(varSub.examples.length).toBeGreaterThan(0);
        }
      });
    });

    describe('format specifications', () => {
      it('should include YAML format details', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          const formats = result.data.formats;
          expect(formats.yaml.conventions).toBeDefined();
          expect(formats.yaml.indentation).toBeDefined();
          expect(formats.yaml.listFormat).toBeDefined();
        }
      });

      it('should include JSON format details', () => {
        const result = getSchema();

        expect(result.success).toBe(true);
        if (result.success) {
          const formats = result.data.formats;
          expect(formats.json.structure).toBeDefined();
          expect(formats.json.naming).toBeDefined();
        }
      });
    });
  });
});