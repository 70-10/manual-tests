// Test results cleanup types

export interface CleanupCriteria {
  // Date-based cleanup
  olderThanDays?: number;
  beforeDate?: string; // YYYY-MM-DD format
  
  // Status-based cleanup
  includeStatuses?: Array<'passed' | 'failed' | 'skipped' | 'pending'>;
  
  // Size-based cleanup
  largerThanMB?: number;
  
  // Count-based cleanup (keep only N most recent)
  keepMostRecent?: number;
}

export interface CleanupInput {
  resultsDir: string;
  criteria: CleanupCriteria;
  dryRun?: boolean; // Preview mode - don't actually delete
  force?: boolean;  // Skip confirmation prompts
}

export interface CleanedItem {
  path: string;
  type: 'directory' | 'file';
  size: number; // in bytes
  testId?: string;
  executionDate?: string;
  status?: string;
  reason: string; // why it was cleaned
}

export interface CleanupSummary {
  totalItemsScanned: number;
  totalItemsCleaned: number;
  totalSizeFreed: number; // in bytes
  cleanedItems: CleanedItem[];
  skippedItems: string[];
  errors: string[];
}

export interface CleanupSuccessResult {
  success: true;
  summary: CleanupSummary;
  message: string;
}

export interface CleanupErrorResult {
  success: false;
  error: string;
}

export type CleanupResult = CleanupSuccessResult | CleanupErrorResult;