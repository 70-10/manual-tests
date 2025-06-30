// Test results report generation types

export interface ReportGenerationInput {
  resultsDir: string;
  outputPath: string;
  format?: 'markdown' | 'html' | 'json';
  includeScreenshots?: boolean;
  includeSummary?: boolean;
  title?: string;
  description?: string;
}

export interface TestResultSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  pending: number;
  passRate: number;
  executionTime?: number; // total execution time in milliseconds
}

export interface ReportSection {
  title: string;
  content: string;
  type: 'summary' | 'test-detail' | 'screenshot' | 'error';
}

export interface GeneratedReport {
  title: string;
  generatedAt: string;
  summary: TestResultSummary;
  sections: ReportSection[];
  format: 'markdown' | 'html' | 'json';
}

export interface ReportSuccessResult {
  success: true;
  reportPath: string;
  report: GeneratedReport;
  message: string;
}

export interface ReportErrorResult {
  success: false;
  error: string;
}

export type ReportResult = ReportSuccessResult | ReportErrorResult;