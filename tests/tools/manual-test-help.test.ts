import { describe, it, expect } from 'vitest';
import { getHelp } from '../../src/tools/manual-test-help';
import type { HelpResult } from '../../src/models';

describe('manual-test-help', () => {
  describe('getHelp', () => {
    describe('basic help information', () => {
      it('should return success with help information', () => {
        const result = getHelp();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.tools).toBeDefined();
          expect(Array.isArray(result.data.tools)).toBe(true);
          expect(result.data.tools.length).toBeGreaterThan(0);
        }
      });

      it('should include all 8 existing tools', () => {
        const result = getHelp();

        expect(result.success).toBe(true);
        if (result.success) {
          const toolNames = result.data.tools.map(tool => tool.name);
          expect(toolNames).toContain('manual_test_validate');
          expect(toolNames).toContain('manual_test_parse');
          expect(toolNames).toContain('manual_test_list');
          expect(toolNames).toContain('manual_test_create');
          expect(toolNames).toContain('manual_test_init');
          expect(toolNames).toContain('manual_test_results_list');
          expect(toolNames).toContain('manual_test_results_report');
          expect(toolNames).toContain('manual_test_results_clean');
        }
      });

      it('should include tool descriptions', () => {
        const result = getHelp();

        expect(result.success).toBe(true);
        if (result.success) {
          result.data.tools.forEach(tool => {
            expect(tool.name).toBeDefined();
            expect(tool.description).toBeDefined();
            expect(tool.description.length).toBeGreaterThan(0);
          });
        }
      });

      it('should include usage examples', () => {
        const result = getHelp();

        expect(result.success).toBe(true);
        if (result.success) {
          result.data.tools.forEach(tool => {
            expect(tool.usage).toBeDefined();
            expect(tool.usage.example).toBeDefined();
            expect(tool.usage.inputDescription).toBeDefined();
            expect(tool.usage.outputDescription).toBeDefined();
          });
        }
      });

      it('should include error handling guidelines', () => {
        const result = getHelp();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.guidelines).toBeDefined();
          expect(result.data.guidelines.errorHandling).toBeDefined();
          expect(Array.isArray(result.data.guidelines.errorHandling)).toBe(true);
          expect(result.data.guidelines.errorHandling.length).toBeGreaterThan(0);
        }
      });

      it('should include general usage guidelines', () => {
        const result = getHelp();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.guidelines.general).toBeDefined();
          expect(Array.isArray(result.data.guidelines.general)).toBe(true);
          expect(result.data.guidelines.general.length).toBeGreaterThan(0);
        }
      });
    });

    describe('tool-specific help', () => {
      it('should provide detailed help for validation tool', () => {
        const result = getHelp();

        expect(result.success).toBe(true);
        if (result.success) {
          const validateTool = result.data.tools.find(tool => tool.name === 'manual_test_validate');
          expect(validateTool).toBeDefined();
          expect(validateTool?.usage.example).toContain('yamlContent');
        }
      });

      it('should provide detailed help for creation tool', () => {
        const result = getHelp();

        expect(result.success).toBe(true);
        if (result.success) {
          const createTool = result.data.tools.find(tool => tool.name === 'manual_test_create');
          expect(createTool).toBeDefined();
          expect(createTool?.usage.example).toContain('template');
          expect(createTool?.usage.example).toContain('meta');
        }
      });
    });

    describe('client guidance', () => {
      it('should include recommended usage patterns', () => {
        const result = getHelp();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.clientGuidance).toBeDefined();
          expect(result.data.clientGuidance.recommendedPatterns).toBeDefined();
          expect(Array.isArray(result.data.clientGuidance.recommendedPatterns)).toBe(true);
        }
      });

      it('should include output handling suggestions', () => {
        const result = getHelp();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.clientGuidance.outputHandling).toBeDefined();
          expect(Array.isArray(result.data.clientGuidance.outputHandling)).toBe(true);
        }
      });
    });
  });
});