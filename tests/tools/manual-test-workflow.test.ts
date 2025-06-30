import { describe, it, expect } from 'vitest';
import { getWorkflow } from '../../src/tools/manual-test-workflow';
import type { WorkflowResult } from '../../src/models';

describe('manual-test-workflow', () => {
  describe('getWorkflow', () => {
    describe('basic workflow information', () => {
      it('should return success with workflow information', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.workflows).toBeDefined();
          expect(Array.isArray(result.data.workflows)).toBe(true);
          expect(result.data.workflows.length).toBeGreaterThan(0);
        }
      });

      it('should include common use cases', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.commonUseCases).toBeDefined();
          expect(Array.isArray(result.data.commonUseCases)).toBe(true);
          expect(result.data.commonUseCases.length).toBeGreaterThan(0);
        }
      });

      it('should include tool integration patterns', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.integrationPatterns).toBeDefined();
          expect(Array.isArray(result.data.integrationPatterns)).toBe(true);
          expect(result.data.integrationPatterns.length).toBeGreaterThan(0);
        }
      });
    });

    describe('workflow details', () => {
      it('should include workflow names and descriptions', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          result.data.workflows.forEach(workflow => {
            expect(workflow.name).toBeDefined();
            expect(workflow.description).toBeDefined();
            expect(workflow.steps).toBeDefined();
            expect(Array.isArray(workflow.steps)).toBe(true);
          });
        }
      });

      it('should include step-by-step instructions', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          result.data.workflows.forEach(workflow => {
            workflow.steps.forEach(step => {
              expect(step.tool).toBeDefined();
              expect(step.description).toBeDefined();
              expect(step.order).toBeDefined();
              expect(typeof step.order).toBe('number');
            });
          });
        }
      });

      it('should include recommended sequences', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          result.data.workflows.forEach(workflow => {
            expect(workflow.recommendedOrder).toBeDefined();
            expect(Array.isArray(workflow.recommendedOrder)).toBe(true);
          });
        }
      });
    });

    describe('use case scenarios', () => {
      it('should include project setup workflow', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          const setupWorkflow = result.data.workflows.find(w => w.name.includes('Setup') || w.name.includes('Project'));
          expect(setupWorkflow).toBeDefined();
          expect(setupWorkflow?.steps.some(step => step.tool === 'manual_test_init')).toBe(true);
        }
      });

      it('should include test case creation workflow', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          const creationWorkflow = result.data.workflows.find(w => w.name.includes('Creation') || w.name.includes('Case'));
          expect(creationWorkflow).toBeDefined();
          expect(creationWorkflow?.steps.some(step => step.tool === 'manual_test_create')).toBe(true);
          expect(creationWorkflow?.steps.some(step => step.tool === 'manual_test_validate')).toBe(true);
        }
      });

      it('should include results management workflow', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          const resultsWorkflow = result.data.workflows.find(w => w.name.includes('Results') || w.name.includes('Management'));
          expect(resultsWorkflow).toBeDefined();
          expect(resultsWorkflow?.steps.some(step => step.tool === 'manual_test_results_list')).toBe(true);
        }
      });
    });

    describe('integration patterns', () => {
      it('should provide tool chaining examples', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          result.data.integrationPatterns.forEach(pattern => {
            expect(pattern.name).toBeDefined();
            expect(pattern.description).toBeDefined();
            expect(pattern.toolSequence).toBeDefined();
            expect(Array.isArray(pattern.toolSequence)).toBe(true);
          });
        }
      });

      it('should include error handling workflows', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          const errorHandlingPattern = result.data.integrationPatterns.find(p => 
            p.name.includes('error') || p.description.includes('error')
          );
          expect(errorHandlingPattern).toBeDefined();
        }
      });
    });

    describe('common use cases', () => {
      it('should include typical scenarios with descriptions', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          result.data.commonUseCases.forEach(useCase => {
            expect(useCase.title).toBeDefined();
            expect(useCase.description).toBeDefined();
            expect(useCase.steps).toBeDefined();
            expect(Array.isArray(useCase.steps)).toBe(true);
          });
        }
      });

      it('should provide practical examples', () => {
        const result = getWorkflow();

        expect(result.success).toBe(true);
        if (result.success) {
          const practicalExample = result.data.commonUseCases.find(uc => 
            uc.title.includes('example') || uc.description.includes('example')
          );
          expect(practicalExample).toBeDefined();
        }
      });
    });
  });
});