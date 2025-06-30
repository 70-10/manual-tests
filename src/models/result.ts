/**
 * Generic Result type for unified success/error handling
 * Replaces individual *SuccessResult/*ErrorResult patterns
 */
export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Create a success result with data
 */
export function createSuccess<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Create an error result with message
 */
export function createError<T>(error: string | Error | unknown): Result<T> {
  if (typeof error === 'string') {
    return { success: false, error };
  }
  
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  
  return { success: false, error: 'Unknown error' };
}

/**
 * Type guard to check if result is success
 */
export function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if result is error
 */
export function isError<T>(result: Result<T>): result is { success: false; error: string } {
  return result.success === false;
}

/**
 * Transform data in a successful result, or pass through error
 */
export function mapResult<T, U>(
  result: Result<T>, 
  transform: (data: T) => U
): Result<U> {
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  try {
    const transformed = transform(result.data);
    return createSuccess(transformed);
  } catch (error) {
    return createError(error);
  }
}

/**
 * Chain operations that return Results (monadic bind)
 */
export function chainResult<T, U>(
  result: Result<T>,
  operation: (data: T) => Result<U>
): Result<U> {
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  try {
    return operation(result.data);
  } catch (error) {
    return createError(error);
  }
}