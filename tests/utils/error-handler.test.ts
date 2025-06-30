import { describe, it, expect } from 'vitest';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

import { wrapWithMcpError, createValidationError, createInternalError } from '../../src/utils/error-handler';

describe('Error Handler Utilities', () => {
  describe('wrapWithMcpError', () => {
    it('should wrap a function and catch generic errors', () => {
      const fn = () => {
        throw new Error('Test error');
      };

      expect(() => wrapWithMcpError(fn, 'Test operation failed')).toThrow(McpError);
      expect(() => wrapWithMcpError(fn, 'Test operation failed')).toThrow('Test operation failed: Test error');
    });

    it('should re-throw McpError without wrapping', () => {
      const originalError = new McpError(ErrorCode.InvalidParams, 'Original MCP error');
      const fn = () => {
        throw originalError;
      };

      expect(() => wrapWithMcpError(fn, 'Test operation failed')).toThrow(originalError);
    });

    it('should handle unknown errors', () => {
      const fn = () => {
        throw 'string error';
      };

      expect(() => wrapWithMcpError(fn, 'Test operation failed')).toThrow(McpError);
      expect(() => wrapWithMcpError(fn, 'Test operation failed')).toThrow('Test operation failed: Unknown error');
    });

    it('should return function result when no error occurs', () => {
      const fn = () => 'success';
      const result = wrapWithMcpError(fn, 'Test operation failed');

      expect(result).toBe('success');
    });
  });

  describe('createValidationError', () => {
    it('should create McpError with InvalidParams code', () => {
      const error = createValidationError('Field is required');

      expect(error).toBeInstanceOf(McpError);
      expect(error.code).toBe(ErrorCode.InvalidParams);
      expect(error.message).toContain('Field is required');
    });
  });

  describe('createInternalError', () => {
    it('should create McpError with InternalError code', () => {
      const error = createInternalError('Operation failed');

      expect(error).toBeInstanceOf(McpError);
      expect(error.code).toBe(ErrorCode.InternalError);
      expect(error.message).toContain('Operation failed');
    });

    it('should handle Error objects', () => {
      const originalError = new Error('Original error');
      const error = createInternalError('Operation failed', originalError);

      expect(error).toBeInstanceOf(McpError);
      expect(error.code).toBe(ErrorCode.InternalError);
      expect(error.message).toContain('Operation failed: Original error');
    });

    it('should handle unknown error types', () => {
      const error = createInternalError('Operation failed', 'string error');

      expect(error).toBeInstanceOf(McpError);
      expect(error.code).toBe(ErrorCode.InternalError);
      expect(error.message).toContain('Operation failed: Unknown error');
    });
  });
});