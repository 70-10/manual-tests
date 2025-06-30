import { describe, it, expect } from 'vitest';

import {
  Result,
  createSuccess,
  createError,
  isSuccess,
  isError,
  mapResult,
  chainResult
} from '../../src/models/result';

describe('Generic Result Type', () => {
  describe('Result type structure', () => {
    it('should create success result with data', () => {
      const data = { value: 'test', count: 42 };
      const result: Result<typeof data> = { success: true, data };

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
        expect(result.data.value).toBe('test');
        expect(result.data.count).toBe(42);
      }
    });

    it('should create error result with message', () => {
      const error = 'Operation failed';
      const result: Result<any> = { success: false, error };

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });
  });

  describe('createSuccess', () => {
    it('should create success result with data', () => {
      const data = { name: 'test', value: 123 };
      const result = createSuccess(data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should create success result with null data', () => {
      const result = createSuccess(null);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should create success result with undefined data', () => {
      const result = createSuccess(undefined);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });
  });

  describe('createError', () => {
    it('should create error result with string message', () => {
      const error = 'Something went wrong';
      const result = createError<any>(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should create error result with Error object', () => {
      const error = new Error('Test error');
      const result = createError<any>(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });

    it('should create error result with unknown error type', () => {
      const error = { code: 500, message: 'Server error' };
      const result = createError<any>(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('isSuccess', () => {
    it('should return true for success result', () => {
      const result = createSuccess('test data');
      expect(isSuccess(result)).toBe(true);
    });

    it('should return false for error result', () => {
      const result = createError<string>('test error');
      expect(isSuccess(result)).toBe(false);
    });
  });

  describe('isError', () => {
    it('should return false for success result', () => {
      const result = createSuccess('test data');
      expect(isError(result)).toBe(false);
    });

    it('should return true for error result', () => {
      const result = createError<string>('test error');
      expect(isError(result)).toBe(true);
    });
  });

  describe('mapResult', () => {
    it('should transform success result data', () => {
      const result = createSuccess(5);
      const mapped = mapResult(result, x => x * 2);

      expect(mapped.success).toBe(true);
      if (mapped.success) {
        expect(mapped.data).toBe(10);
      }
    });

    it('should pass through error result unchanged', () => {
      const result = createError<number>('calculation failed');
      const mapped = mapResult(result, x => x * 2);

      expect(mapped.success).toBe(false);
      if (!mapped.success) {
        expect(mapped.error).toBe('calculation failed');
      }
    });

    it('should handle transformation that throws error', () => {
      const result = createSuccess(5);
      const mapped = mapResult(result, () => {
        throw new Error('Transform failed');
      });

      expect(mapped.success).toBe(false);
      if (!mapped.success) {
        expect(mapped.error).toBe('Transform failed');
      }
    });
  });

  describe('chainResult', () => {
    it('should chain successful operations', () => {
      const result = createSuccess(5);
      const chained = chainResult(result, x => createSuccess(x * 2));

      expect(chained.success).toBe(true);
      if (chained.success) {
        expect(chained.data).toBe(10);
      }
    });

    it('should stop chaining on first error', () => {
      const result = createError<number>('initial error');
      const chained = chainResult(result, x => createSuccess(x * 2));

      expect(chained.success).toBe(false);
      if (!chained.success) {
        expect(chained.error).toBe('initial error');
      }
    });

    it('should propagate error from chained operation', () => {
      const result = createSuccess(5);
      const chained = chainResult(result, () => createError('chained error'));

      expect(chained.success).toBe(false);
      if (!chained.success) {
        expect(chained.error).toBe('chained error');
      }
    });

    it('should handle chained operation that throws', () => {
      const result = createSuccess(5);
      const chained = chainResult(result, () => {
        throw new Error('Chain failed');
      });

      expect(chained.success).toBe(false);
      if (!chained.success) {
        expect(chained.error).toBe('Chain failed');
      }
    });
  });

  describe('Type compatibility', () => {
    it('should be compatible with existing result patterns', () => {
      // Test compatibility with CreateResult pattern
      const createResult: Result<{ yamlContent: string; generatedId: string }> = createSuccess({
        yamlContent: 'test: content',
        generatedId: 'TC-TEST-001'
      });

      expect(createResult.success).toBe(true);

      // Test compatibility with ParseResult pattern
      const parseResult: Result<{ testCase: any; processedSteps: any; warnings: string[] }> = createSuccess({
        testCase: { meta: { id: 'TC-001' } },
        processedSteps: { given: [], when: [], then: [] },
        warnings: []
      });

      expect(parseResult.success).toBe(true);

      // Test compatibility with ListResult pattern
      const listResult: Result<{ testCases: any[]; totalCount: number; warnings: string[] }> = createSuccess({
        testCases: [],
        totalCount: 0,
        warnings: []
      });

      expect(listResult.success).toBe(true);
    });
  });
});