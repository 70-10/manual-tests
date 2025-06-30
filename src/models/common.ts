// Common result patterns used across the application

export interface BaseSuccessResult<T> {
  success: true;
  data: T;
  warnings?: string[];
}

export interface BaseErrorResult {
  success: false;
  error: string;
}

export type BaseResult<T> = BaseSuccessResult<T> | BaseErrorResult;

// Common file processing result
export type FileProcessResult<T> = 
  | { success: true; data: T; warnings: string[] }
  | { success: false; error: string };