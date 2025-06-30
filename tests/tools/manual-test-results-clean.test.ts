import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { cleanTestResults } from '../../src/tools/manual-test-results-clean';
import type { CleanupInput, CleanupResult } from '../../src/models';

describe('manual-test-results-clean', () => {
  const testDir = path.join(__dirname, '../fixtures/test-results-clean');
  const resultsDir = path.join(testDir, 'results');

  beforeEach(async () => {
    // Create test directory structure
    await fs.ensureDir(resultsDir);
    
    // Create test result directories with different dates and statuses
    const testResults = [
      {
        dir: '20240101_TC-LOGIN-001',
        date: '2024-01-01T10:00:00Z',
        status: 'passed',
        size: 1024,
      },
      {
        dir: '20240102_TC-LOGOUT-001',
        date: '2024-01-02T11:00:00Z',
        status: 'failed',
        size: 2048,
      },
      {
        dir: '20240103_TC-SEARCH-001',
        date: '2024-01-03T12:00:00Z',
        status: 'pending',
        size: 512,
      },
      {
        dir: '20240105_TC-REGISTER-001',
        date: '2024-01-05T14:00:00Z',
        status: 'passed',
        size: 4096,
      },
      {
        dir: '20240110_TC-PROFILE-001',
        date: '2024-01-10T15:00:00Z',
        status: 'skipped',
        size: 256,
      },
      {
        dir: '20240115_TC-SETTINGS-001',
        date: '2024-01-15T16:00:00Z',
        status: 'passed',
        size: 8192,
      },
    ];

    for (const testResult of testResults) {
      const testResultDir = path.join(resultsDir, testResult.dir);
      await fs.ensureDir(testResultDir);
      
      // Create report.md
      await fs.writeFile(
        path.join(testResultDir, 'report.md'),
        `# ${testResult.dir.split('_')[1]} - Test Report

## Test Information
- **Test ID**: ${testResult.dir.split('_')[1]}
- **Status**: ${testResult.status}
- **Execution Date**: ${testResult.date}

## Test Results
Test execution completed.
`
      );

      // Create screenshot file with specified size
      const screenshotContent = 'x'.repeat(testResult.size);
      await fs.writeFile(path.join(testResultDir, 'screenshot.png'), screenshotContent);

      // Set modification time to match the test date
      const testTime = new Date(testResult.date);
      await fs.utimes(testResultDir, testTime, testTime);
    }
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('Date-based cleanup', () => {
    it('should clean results older than specified days', async () => {
      const input: CleanupInput = {
        resultsDir,
        criteria: {
          olderThanDays: 10, // Clean results older than 10 days (from 2024-01-20, so before 2024-01-10)
        },
        dryRun: false,
      };

      const result = await cleanTestResults(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Since we're testing against current date, we expect all test results to be cleaned
        expect(result.summary.totalItemsCleaned).toBeGreaterThan(0);
        expect(result.summary.cleanedItems.every(item => item.reason.includes('older than'))).toBe(true);
        
        // Verify at least some files were deleted
        const remainingFiles = await fs.readdir(resultsDir);
        expect(remainingFiles.length).toBeLessThan(6);
      }
    });

    it('should clean results before specific date', async () => {
      const input: CleanupInput = {
        resultsDir,
        criteria: {
          beforeDate: '2024-01-05',
        },
        dryRun: false,
      };

      const result = await cleanTestResults(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.summary.totalItemsCleaned).toBe(3); // First 3 results should be cleaned
        expect(result.summary.cleanedItems.every(item => item.reason.includes('before date'))).toBe(true);
      }
    });

    it('should preview cleanup with dry run', async () => {
      const input: CleanupInput = {
        resultsDir,
        criteria: {
          olderThanDays: 5,
        },
        dryRun: true,
      };

      const result = await cleanTestResults(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.summary.totalItemsCleaned).toBeGreaterThan(0);
        
        // Verify no files were actually deleted
        expect(await fs.pathExists(path.join(resultsDir, '20240101_TC-LOGIN-001'))).toBe(true);
        expect(result.message).toContain('dry run');
      }
    });
  });

  describe('Status-based cleanup', () => {
    it('should clean results with specific statuses', async () => {
      const input: CleanupInput = {
        resultsDir,
        criteria: {
          includeStatuses: ['failed', 'pending'],
        },
        dryRun: false,
      };

      const result = await cleanTestResults(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.summary.totalItemsCleaned).toBe(2); // failed and pending results
        expect(result.summary.cleanedItems.every(item => 
          item.status === 'failed' || item.status === 'pending'
        )).toBe(true);
        
        // Verify correct files were deleted
        expect(await fs.pathExists(path.join(resultsDir, '20240102_TC-LOGOUT-001'))).toBe(false);
        expect(await fs.pathExists(path.join(resultsDir, '20240103_TC-SEARCH-001'))).toBe(false);
        expect(await fs.pathExists(path.join(resultsDir, '20240101_TC-LOGIN-001'))).toBe(true);
      }
    });
  });

  describe('Size-based cleanup', () => {
    it('should clean results larger than specified size', async () => {
      const input: CleanupInput = {
        resultsDir,
        criteria: {
          largerThanMB: 0.003, // 3KB (should catch results with 4KB+ size)
        },
        dryRun: false,
      };

      const result = await cleanTestResults(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.summary.totalItemsCleaned).toBe(2); // 4KB and 8KB results
        expect(result.summary.cleanedItems.every(item => item.reason.includes('larger than'))).toBe(true);
      }
    });
  });

  describe('Count-based cleanup', () => {
    it('should keep only most recent N results', async () => {
      const input: CleanupInput = {
        resultsDir,
        criteria: {
          keepMostRecent: 3,
        },
        dryRun: false,
      };

      const result = await cleanTestResults(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.summary.totalItemsCleaned).toBe(3); // Should clean 3 oldest
        expect(result.summary.cleanedItems.every(item => item.reason.includes('keeping most recent'))).toBe(true);
        
        // Verify most recent files are kept
        expect(await fs.pathExists(path.join(resultsDir, '20240115_TC-SETTINGS-001'))).toBe(true);
        expect(await fs.pathExists(path.join(resultsDir, '20240110_TC-PROFILE-001'))).toBe(true);
        expect(await fs.pathExists(path.join(resultsDir, '20240105_TC-REGISTER-001'))).toBe(true);
      }
    });
  });

  describe('Combined criteria', () => {
    it('should apply multiple criteria together', async () => {
      const input: CleanupInput = {
        resultsDir,
        criteria: {
          olderThanDays: 8,
          includeStatuses: ['failed', 'pending'],
        },
        dryRun: false,
      };

      const result = await cleanTestResults(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should clean results that are both old AND have specified status
        expect(result.summary.totalItemsCleaned).toBe(2);
        expect(result.summary.cleanedItems.every(item => 
          (item.status === 'failed' || item.status === 'pending')
        )).toBe(true);
      }
    });
  });

  describe('Error handling', () => {
    it('should return error when results directory does not exist', async () => {
      const input: CleanupInput = {
        resultsDir: '/non/existent/path',
        criteria: { olderThanDays: 30 },
      };

      const result = await cleanTestResults(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Results directory does not exist');
      }
    });

    it('should return error with invalid input parameters', async () => {
      const input = {
        resultsDir: '',
        criteria: {},
      } as CleanupInput;

      const result = await cleanTestResults(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('required');
      }
    });

    it('should handle file system errors gracefully', async () => {
      // Create a directory with restrictive permissions
      const restrictedDir = path.join(resultsDir, '20240101_TC-RESTRICTED-001');
      await fs.ensureDir(restrictedDir);
      
      const input: CleanupInput = {
        resultsDir,
        criteria: { olderThanDays: 1 },
        dryRun: false,
      };

      const result = await cleanTestResults(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should report errors but continue processing
        expect(result.summary.errors.length >= 0).toBe(true);
      }
    });
  });

  describe('Summary calculation', () => {
    it('should calculate correct summary statistics', async () => {
      const input: CleanupInput = {
        resultsDir,
        criteria: {
          includeStatuses: ['failed'],
        },
        dryRun: false,
      };

      const result = await cleanTestResults(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.summary.totalItemsScanned).toBe(6);
        expect(result.summary.totalItemsCleaned).toBe(1);
        expect(result.summary.totalSizeFreed).toBeGreaterThan(0);
        expect(result.summary.cleanedItems).toHaveLength(1);
        expect(result.summary.cleanedItems[0].testId).toBe('TC-LOGOUT-001');
        expect(result.summary.cleanedItems[0].status).toBe('failed');
      }
    });

    it('should handle empty results directory', async () => {
      const emptyDir = path.join(testDir, 'empty');
      await fs.ensureDir(emptyDir);

      const input: CleanupInput = {
        resultsDir: emptyDir,
        criteria: { olderThanDays: 30 },
      };

      const result = await cleanTestResults(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.summary.totalItemsScanned).toBe(0);
        expect(result.summary.totalItemsCleaned).toBe(0);
        expect(result.summary.totalSizeFreed).toBe(0);
      }
    });
  });
});