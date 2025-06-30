// Test results management types

export interface TestResultMeta {
  testId: string;
  executionDate: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration?: number; // in milliseconds
  executor?: string;
  environment?: string;
  browser?: string;
}

export interface TestResultFile {
  meta: TestResultMeta;
  reportPath: string;
  screenshotPath?: string;
  logPath?: string;
  directoryPath: string;
  size: number; // in bytes
  lastModified: Date;
}

export interface ResultsListFilter {
  status?: 'passed' | 'failed' | 'skipped' | 'pending';
  testId?: string;
  executor?: string;
  environment?: string;
  dateFrom?: string; // YYYY-MM-DD format
  dateTo?: string; // YYYY-MM-DD format
}

export type ResultsSortField = 'executionDate' | 'testId' | 'status' | 'duration' | 'size';

export interface ResultsListInput {
  resultsDir: string;
  filter?: ResultsListFilter;
  sortBy?: ResultsSortField;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ResultsListSuccessResult {
  success: true;
  results: TestResultFile[];
  totalCount: number;
  filteredCount: number;
  warnings: string[];
}

export interface ResultsListErrorResult {
  success: false;
  error: string;
}

export type ResultsListResult = ResultsListSuccessResult | ResultsListErrorResult;

// Report generation types
export interface ReportGenerateInput {
  resultsDir: string;
  filter?: ResultsListFilter;
  format: 'html' | 'markdown' | 'json' | 'csv';
  outputPath: string;
  template?: string;
  includeScreenshots?: boolean;
  includeLogs?: boolean;
}

export interface ReportGenerateSuccessResult {
  success: true;
  outputPath: string;
  generatedFiles: string[];
  totalResults: number;
  summary: {
    passed: number;
    failed: number;
    skipped: number;
    pending: number;
  };
}

export interface ReportGenerateErrorResult {
  success: false;
  error: string;
}

export type ReportGenerateResult = ReportGenerateSuccessResult | ReportGenerateErrorResult;

// Clean up types
export interface CleanupInput {
  resultsDir: string;
  olderThanDays?: number;
  keepCount?: number; // Keep N most recent results
  status?: ('passed' | 'failed' | 'skipped' | 'pending')[]; // Only clean specific statuses
  dryRun?: boolean; // Don't actually delete, just report what would be deleted
}

export interface CleanupSuccessResult {
  success: true;
  deletedDirectories: string[];
  deletedFiles: string[];
  freedSpace: number; // in bytes
  keptResults: number;
  message: string;
}

export interface CleanupErrorResult {
  success: false;
  error: string;
}

export type CleanupResult = CleanupSuccessResult | CleanupErrorResult;