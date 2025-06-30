import * as fs from 'fs-extra';
import * as path from 'path';
import type { 
  CleanupInput, 
  CleanupResult, 
  CleanupSummary 
} from '../models';
import { parseReportMetadata } from './generators/report-generator';
import {
  getDirectorySize,
  matchesCriteria,
  applyCountBasedCleanup,
  performCleanup
} from './managers/cleanup-manager';

/**
 * Validate input parameters
 */
function validateInput(input: CleanupInput): string | null {
  if (!input.resultsDir || typeof input.resultsDir !== 'string') {
    return 'resultsDir is required and must be a string';
  }

  if (!input.criteria || typeof input.criteria !== 'object') {
    return 'criteria is required and must be an object';
  }

  // Validate that at least one criteria is provided
  const { olderThanDays, beforeDate, includeStatuses, largerThanMB, keepMostRecent } = input.criteria;
  if (!olderThanDays && !beforeDate && !includeStatuses && !largerThanMB && !keepMostRecent) {
    return 'At least one cleanup criteria must be specified';
  }

  // Validate date format
  if (beforeDate && !/^\d{4}-\d{2}-\d{2}$/.test(beforeDate)) {
    return 'beforeDate must be in YYYY-MM-DD format';
  }

  return null;
}


/**
 * Extract test result metadata from directory
 */
async function extractTestMetadata(testDir: string): Promise<{
  testId?: string;
  executionDate?: string;
  status?: string;
  size: number;
  lastModified: Date;
}> {
  const reportPath = path.join(testDir, 'report.md');
  let metadata: any = {};

  // Try to read metadata from report.md
  try {
    if (await fs.pathExists(reportPath)) {
      const reportContent = await fs.readFile(reportPath, 'utf8');
      metadata = parseReportMetadata(reportContent);
    }
  } catch (error) {
    // Continue without metadata if report can't be read
  }

  // Extract test ID from directory name if not found in content
  if (!metadata.testId) {
    const dirName = path.basename(testDir);
    const dirNameMatch = dirName.match(/\d+_(.+)/);
    if (dirNameMatch) {
      metadata.testId = dirNameMatch[1];
    } else {
      metadata.testId = dirName;
    }
  }

  // Get directory stats
  const dirStat = await fs.stat(testDir);
  const size = await getDirectorySize(testDir);

  return {
    ...metadata,
    size,
    lastModified: dirStat.mtime,
  };
}



/**
 * Scan results directory and collect test data
 */
async function scanResultsDirectory(resultsDir: string): Promise<{
  testResults: any[];
  errors: string[];
}> {
  const testResults: any[] = [];
  const errors: string[] = [];

  try {
    const entries = await fs.readdir(resultsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const testDirPath = path.join(resultsDir, entry.name);
      
      try {
        const metadata = await extractTestMetadata(testDirPath);
        testResults.push({
          ...metadata,
          directoryName: entry.name,
          directoryPath: testDirPath,
        });
      } catch (error) {
        errors.push(`Failed to process ${entry.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    errors.push(`Failed to read results directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { testResults, errors };
}


/**
 * Clean test results based on specified criteria
 */
export async function cleanTestResults(input: CleanupInput): Promise<CleanupResult> {
  try {
    // Validate input
    const validationError = validateInput(input);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Check if results directory exists
    if (!(await fs.pathExists(input.resultsDir))) {
      return {
        success: false,
        error: `Results directory does not exist: ${input.resultsDir}`,
      };
    }

    // Scan directory and collect test data
    const { testResults, errors: scanErrors } = await scanResultsDirectory(input.resultsDir);

    let itemsToClean: any[] = [];
    const skippedItems: string[] = [];

    // Apply criteria-based filtering
    if (input.criteria.keepMostRecent) {
      // Count-based cleanup
      const { toClean } = applyCountBasedCleanup(testResults, input.criteria.keepMostRecent);
      itemsToClean = toClean;
    } else {
      // Criteria-based cleanup
      for (const testResult of testResults) {
        const { matches, reasons } = matchesCriteria(testResult, input.criteria);
        
        if (matches) {
          itemsToClean.push({
            ...testResult,
            cleanupReasons: reasons,
          });
        } else {
          skippedItems.push(testResult.directoryName);
        }
      }
    }

    // Perform cleanup
    const { cleanedItems, errors: cleanupErrors } = await performCleanup(itemsToClean, input.dryRun || false);

    // Calculate summary
    const totalSizeFreed = cleanedItems.reduce((sum, item) => sum + item.size, 0);
    const allErrors = [...scanErrors, ...cleanupErrors];

    const summary: CleanupSummary = {
      totalItemsScanned: testResults.length,
      totalItemsCleaned: cleanedItems.length,
      totalSizeFreed,
      cleanedItems,
      skippedItems,
      errors: allErrors,
    };

    const message = input.dryRun 
      ? `dry run completed: ${cleanedItems.length} items would be cleaned, ${totalSizeFreed} bytes would be freed`
      : `Cleanup completed: ${cleanedItems.length} items cleaned, ${totalSizeFreed} bytes freed`;

    return {
      success: true,
      summary,
      message,
    };

  } catch (error) {
    return {
      success: false,
      error: `Failed to clean test results: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}