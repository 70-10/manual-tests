import * as fs from 'fs-extra';
import * as path from 'path';
import type { 
  ResultsListInput, 
  ResultsListResult, 
  TestResultFile, 
  TestResultMeta, 
  ResultsListFilter,
  ResultsSortField 
} from '../models';

/**
 * Validate input parameters
 */
function validateInput(input: ResultsListInput): string | null {
  if (!input.resultsDir || typeof input.resultsDir !== 'string') {
    return 'resultsDir is required and must be a string';
  }

  // Validate date format if provided
  if (input.filter?.dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(input.filter.dateFrom)) {
    return 'Invalid date format for dateFrom. Use YYYY-MM-DD format';
  }

  if (input.filter?.dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(input.filter.dateTo)) {
    return 'Invalid date format for dateTo. Use YYYY-MM-DD format';
  }

  // Validate sort field
  const validSortFields: ResultsSortField[] = ['executionDate', 'testId', 'status', 'duration', 'size'];
  if (input.sortBy && !validSortFields.includes(input.sortBy)) {
    return `Invalid sort field: ${input.sortBy}. Must be one of: ${validSortFields.join(', ')}`;
  }

  return null;
}

/**
 * Parse report.md file to extract metadata
 */
async function parseReportMeta(reportPath: string): Promise<Partial<TestResultMeta>> {
  try {
    const content = await fs.readFile(reportPath, 'utf-8');
    const meta: Partial<TestResultMeta> = {};

    // Extract metadata using regex patterns
    const patterns = {
      testId: /- テストID:\s*(.+)/,
      executionDate: /- 実行日:\s*(.+)/,
      status: /- ステータス:\s*(passed|failed|skipped|pending)/,
      duration: /- 実行時間:\s*(\d+)ms/,
      executor: /- 実行者:\s*(.+)/,
      environment: /- 環境:\s*(.+)/,
      browser: /- ブラウザ:\s*(.+)/
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        if (key === 'duration') {
          meta[key as keyof TestResultMeta] = parseInt(match[1], 10) as any;
        } else {
          meta[key as keyof TestResultMeta] = match[1].trim() as any;
        }
      }
    }

    return meta;
  } catch (error) {
    return {};
  }
}

/**
 * Get directory info (size, modification time)
 */
async function getDirectoryInfo(dirPath: string): Promise<{ size: number; lastModified: Date }> {
  let totalSize = 0;
  let latestModified = new Date(0);

  try {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      
      totalSize += stats.size;
      if (stats.mtime > latestModified) {
        latestModified = stats.mtime;
      }
    }
  } catch (error) {
    // Return defaults if error
  }

  return { size: totalSize, lastModified: latestModified };
}

/**
 * Check if result matches filter criteria
 */
function matchesFilter(result: TestResultFile, filter: ResultsListFilter): boolean {
  if (filter.status && result.meta.status !== filter.status) {
    return false;
  }

  if (filter.testId && result.meta.testId !== filter.testId) {
    return false;
  }

  if (filter.executor && result.meta.executor !== filter.executor) {
    return false;
  }

  if (filter.environment && result.meta.environment !== filter.environment) {
    return false;
  }

  if (filter.dateFrom && result.meta.executionDate < filter.dateFrom) {
    return false;
  }

  if (filter.dateTo && result.meta.executionDate > filter.dateTo) {
    return false;
  }

  return true;
}

/**
 * Sort results based on criteria
 */
function sortResults(results: TestResultFile[], sortBy: ResultsSortField, sortOrder: 'asc' | 'desc' = 'desc'): TestResultFile[] {
  return results.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'executionDate':
        aValue = a.meta.executionDate;
        bValue = b.meta.executionDate;
        break;
      case 'testId':
        aValue = a.meta.testId;
        bValue = b.meta.testId;
        break;
      case 'status':
        aValue = a.meta.status;
        bValue = b.meta.status;
        break;
      case 'duration':
        aValue = a.meta.duration || 0;
        bValue = b.meta.duration || 0;
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      default:
        aValue = a.meta.executionDate;
        bValue = b.meta.executionDate;
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

/**
 * List test results from directory
 */
export async function listTestResults(input: ResultsListInput): Promise<ResultsListResult> {
  try {
    // Validate input
    const validationError = validateInput(input);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Check if directory exists
    if (!(await fs.pathExists(input.resultsDir))) {
      return {
        success: false,
        error: `Results directory does not exist: ${input.resultsDir}`
      };
    }

    const results: TestResultFile[] = [];
    const warnings: string[] = [];

    // Read all subdirectories
    const entries = await fs.readdir(input.resultsDir, { withFileTypes: true });
    const resultDirs = entries.filter(entry => entry.isDirectory());

    for (const dir of resultDirs) {
      const dirPath = path.join(input.resultsDir, dir.name);
      const reportPath = path.join(dirPath, 'report.md');
      
      // Skip if no report.md
      if (!(await fs.pathExists(reportPath))) {
        warnings.push(`No report.md found in ${dir.name}`);
        continue;
      }

      // Parse metadata from report
      const parsedMeta = await parseReportMeta(reportPath);
      
      // Extract date and test ID from directory name if not in report
      const dirParts = dir.name.split('_');
      if (dirParts.length >= 2) {
        if (!parsedMeta.executionDate) {
          parsedMeta.executionDate = dirParts[0];
        }
        if (!parsedMeta.testId) {
          parsedMeta.testId = dirParts[1];
        }
      }

      // Get directory info
      const { size, lastModified } = await getDirectoryInfo(dirPath);

      // Check for optional files
      const screenshotPath = path.join(dirPath, 'screenshot.png');
      const logPath = path.join(dirPath, 'log.txt');

      const testResult: TestResultFile = {
        meta: {
          testId: parsedMeta.testId || 'unknown',
          executionDate: parsedMeta.executionDate || 'unknown',
          status: parsedMeta.status || 'pending',
          duration: parsedMeta.duration,
          executor: parsedMeta.executor,
          environment: parsedMeta.environment,
          browser: parsedMeta.browser
        },
        reportPath,
        screenshotPath: await fs.pathExists(screenshotPath) ? screenshotPath : undefined,
        logPath: await fs.pathExists(logPath) ? logPath : undefined,
        directoryPath: dirPath,
        size,
        lastModified
      };

      results.push(testResult);
    }

    // Apply filters
    const filteredResults = input.filter 
      ? results.filter(result => matchesFilter(result, input.filter!))
      : results;

    // Apply sorting
    const sortedResults = input.sortBy 
      ? sortResults(filteredResults, input.sortBy, input.sortOrder)
      : sortResults(filteredResults, 'executionDate', 'desc'); // Default sort

    // Apply pagination
    const offset = input.offset || 0;
    const limit = input.limit;
    const paginatedResults = limit 
      ? sortedResults.slice(offset, offset + limit)
      : sortedResults.slice(offset);

    return {
      success: true,
      results: paginatedResults,
      totalCount: results.length,
      filteredCount: filteredResults.length,
      warnings
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during results listing';
    return {
      success: false,
      error: `Results listing error: ${message}`
    };
  }
}