import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Wraps a function with MCP error handling
 * Re-throws McpError instances as-is, wraps other errors in McpError
 */
export function wrapWithMcpError<T>(
  fn: () => T,
  message: string
): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new McpError(ErrorCode.InternalError, `${message}: ${errorMessage}`);
  }
}

/**
 * Creates a validation error (InvalidParams)
 */
export function createValidationError(message: string): McpError {
  return new McpError(ErrorCode.InvalidParams, message);
}

/**
 * Creates an internal error with optional cause
 */
export function createInternalError(message: string, cause?: unknown): McpError {
  if (cause === undefined) {
    return new McpError(ErrorCode.InternalError, message);
  }
  
  const causeMessage = cause instanceof Error ? cause.message : 'Unknown error';
  return new McpError(ErrorCode.InternalError, `${message}: ${causeMessage}`);
}