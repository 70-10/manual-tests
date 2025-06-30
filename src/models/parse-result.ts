import { TestCase } from './test-case';

export interface ProjectMeta {
  test_data?: Record<string, any>;
  environments?: Record<string, string>;
  [key: string]: any;
}

export interface ProcessedSteps {
  given: string[];
  when: string[];
  then: string[];
}

export interface ParseSuccessResult {
  success: true;
  testCase: TestCase;
  processedSteps: ProcessedSteps;
  warnings: string[];
}

export interface ParseErrorResult {
  success: false;
  error: string;
}

export type ParseResult = ParseSuccessResult | ParseErrorResult;