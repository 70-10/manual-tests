import { TestCase, Priority } from './test-case';

export interface TestCaseFile {
  meta: TestCase['meta'];
  scenario: TestCase['scenario'];
  precondition?: TestCase['precondition'];
  notes?: TestCase['notes'];
  fileName: string;
  filePath: string;
  lastModified?: Date;
}

export interface ListFilter {
  feature?: string;
  priority?: Priority;
  tags?: string[];
  author?: string;
}

export type SortField = 'id' | 'lastUpdated' | 'priority' | 'feature';

export interface ListSuccessResult {
  success: true;
  testCases: TestCaseFile[];
  totalCount: number;
  warnings: string[];
}

export interface ListErrorResult {
  success: false;
  error: string;
}

export type ListResult = ListSuccessResult | ListErrorResult;