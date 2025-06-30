// Cleanup operation utilities

import * as fs from 'fs-extra';
import * as path from 'path';
import type { CleanupCriteria, CleanedItem } from '../../models';

/**
 * Get directory size recursively
 */
export async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0;
  
  try {
    const stat = await fs.stat(dirPath);
    if (stat.isFile()) {
      return stat.size;
    }

    const items = await fs.readdir(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      try {
        const itemStat = await fs.stat(itemPath);
        if (itemStat.isDirectory()) {
          totalSize += await getDirectorySize(itemPath);
        } else {
          totalSize += itemStat.size;
        }
      } catch (error) {
        // Skip inaccessible files
        continue;
      }
    }
  } catch (error) {
    // Skip inaccessible directories
    return 0;
  }

  return totalSize;
}

/**
 * Check if a test result matches cleanup criteria
 */
export function matchesCriteria(
  testData: any,
  criteria: CleanupCriteria,
  currentDate: Date = new Date()
): { matches: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const criteriaChecks: boolean[] = [];

  // Date-based criteria  
  if (criteria.olderThanDays) {
    const cutoffDate = new Date(currentDate);
    cutoffDate.setDate(cutoffDate.getDate() - criteria.olderThanDays);
    
    const isOld = testData.lastModified < cutoffDate;
    criteriaChecks.push(isOld);
    if (isOld) {
      reasons.push(`older than ${criteria.olderThanDays} days`);
    }
  }

  if (criteria.beforeDate) {
    const beforeDate = new Date(criteria.beforeDate + 'T00:00:00Z');
    
    const isBeforeDate = testData.lastModified < beforeDate;
    criteriaChecks.push(isBeforeDate);
    if (isBeforeDate) {
      reasons.push(`before date ${criteria.beforeDate}`);
    }
  }

  // Status-based criteria
  if (criteria.includeStatuses && criteria.includeStatuses.length > 0) {
    const hasMatchingStatus = criteria.includeStatuses.includes(testData.status);
    criteriaChecks.push(hasMatchingStatus);
    if (hasMatchingStatus) {
      reasons.push(`status is ${testData.status}`);
    }
  }

  // Size-based criteria
  if (criteria.largerThanMB) {
    const sizeInMB = testData.size / (1024 * 1024);
    const isTooLarge = sizeInMB > criteria.largerThanMB;
    criteriaChecks.push(isTooLarge);
    if (isTooLarge) {
      reasons.push(`larger than ${criteria.largerThanMB}MB`);
    }
  }

  // If only one criteria is specified, use simple OR logic
  // If multiple criteria are specified, use AND logic  
  const matches = criteriaChecks.length === 1 
    ? criteriaChecks[0]
    : criteriaChecks.length > 0 && criteriaChecks.every(check => check);

  return { matches, reasons };
}

/**
 * Apply count-based cleanup (keep most recent N results)
 */
export function applyCountBasedCleanup(
  testResults: any[],
  keepMostRecent: number
): { toClean: any[]; toKeep: any[] } {
  // Sort by modification time (newest first)
  const sorted = [...testResults].sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  
  const toKeep = sorted.slice(0, keepMostRecent);
  const toClean = sorted.slice(keepMostRecent).map(item => ({
    ...item,
    cleanupReasons: ['keeping most recent ' + keepMostRecent + ' results'],
  }));

  return { toClean, toKeep };
}

/**
 * Perform cleanup operation
 */
export async function performCleanup(
  itemsToClean: any[],
  dryRun: boolean
): Promise<{ cleanedItems: CleanedItem[]; errors: string[] }> {
  const cleanedItems: CleanedItem[] = [];
  const errors: string[] = [];

  for (const item of itemsToClean) {
    try {
      const cleanedItem: CleanedItem = {
        path: item.directoryPath,
        type: 'directory',
        size: item.size,
        testId: item.testId,
        executionDate: item.executionDate,
        status: item.status,
        reason: item.cleanupReasons.join(', '),
      };

      if (!dryRun) {
        await fs.remove(item.directoryPath);
      }

      cleanedItems.push(cleanedItem);
    } catch (error) {
      errors.push(`Failed to delete ${item.directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { cleanedItems, errors };
}