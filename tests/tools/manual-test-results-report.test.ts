import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { generateTestReport } from '../../src/tools/manual-test-results-report';
import type { ReportGenerationInput, ReportResult } from '../../src/models';

describe('manual-test-results-report', () => {
  const testDir = path.join(__dirname, '../fixtures/test-results-report');
  const resultsDir = path.join(testDir, 'results');
  const outputPath = path.join(testDir, 'report.md');

  beforeEach(async () => {
    // Create test directory structure
    await fs.ensureDir(resultsDir);
    
    // Create sample test result directories
    const testResult1 = path.join(resultsDir, '20240101_TC-LOGIN-001');
    const testResult2 = path.join(resultsDir, '20240102_TC-LOGOUT-001');
    const testResult3 = path.join(resultsDir, '20240103_TC-SEARCH-001');
    
    await fs.ensureDir(testResult1);
    await fs.ensureDir(testResult2);
    await fs.ensureDir(testResult3);
    
    // Create report.md files
    await fs.writeFile(
      path.join(testResult1, 'report.md'),
      `# TC-LOGIN-001 - Test Report

## Test Information
- **Test ID**: TC-LOGIN-001
- **Title**: Login functionality test
- **Status**: passed
- **Execution Date**: 2024-01-01T10:00:00Z
- **Duration**: 5000ms
- **Executor**: test-user

## Test Results
Test completed successfully.
`
    );

    await fs.writeFile(
      path.join(testResult2, 'report.md'),
      `# TC-LOGOUT-001 - Test Report

## Test Information
- **Test ID**: TC-LOGOUT-001
- **Title**: Logout functionality test  
- **Status**: failed
- **Execution Date**: 2024-01-02T11:00:00Z
- **Duration**: 3000ms
- **Executor**: test-user

## Test Results
Test failed due to timeout.
`
    );

    await fs.writeFile(
      path.join(testResult3, 'report.md'),
      `# TC-SEARCH-001 - Test Report

## Test Information
- **Test ID**: TC-SEARCH-001
- **Title**: Search functionality test
- **Status**: pending
- **Execution Date**: 2024-01-03T12:00:00Z
- **Executor**: test-user

## Test Results
Test execution pending.
`
    );

    // Create screenshot files
    await fs.writeFile(path.join(testResult1, 'screenshot.png'), 'fake-image-data');
    await fs.writeFile(path.join(testResult2, 'screenshot.png'), 'fake-image-data');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('Successful report generation', () => {
    it('should generate markdown report with default settings', async () => {
      const input: ReportGenerationInput = {
        resultsDir,
        outputPath,
      };

      const result = await generateTestReport(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.reportPath).toBe(outputPath);
        expect(result.report.format).toBe('markdown');
        expect(result.report.summary.totalTests).toBe(3);
        expect(result.report.summary.passed).toBe(1);
        expect(result.report.summary.failed).toBe(1);
        expect(result.report.summary.pending).toBe(1);
        expect(result.report.summary.passRate).toBeCloseTo(33.33, 2);
        expect(result.report.sections).toHaveLength(5); // summary + table + 3 test details
        expect(await fs.pathExists(outputPath)).toBe(true);
      }
    });

    it('should generate report with custom title and description', async () => {
      const input: ReportGenerationInput = {
        resultsDir,
        outputPath,
        title: 'Custom Test Report',
        description: 'This is a custom test report description',
      };

      const result = await generateTestReport(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.report.title).toBe('Custom Test Report');
        expect(result.report.sections[0].content).toContain('This is a custom test report description');
      }
    });

    it('should include screenshots when requested', async () => {
      const input: ReportGenerationInput = {
        resultsDir,
        outputPath,
        includeScreenshots: true,
      };

      const result = await generateTestReport(input);

      expect(result.success).toBe(true);
      if (result.success) {
        const reportContent = await fs.readFile(outputPath, 'utf8');
        expect(reportContent).toContain('screenshot.png');
      }
    });

    it('should generate report without summary when requested', async () => {
      const input: ReportGenerationInput = {
        resultsDir,
        outputPath,
        includeSummary: false,
      };

      const result = await generateTestReport(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.report.sections.filter(s => s.type === 'summary')).toHaveLength(0);
      }
    });

    it('should handle empty results directory', async () => {
      const emptyDir = path.join(testDir, 'empty');
      await fs.ensureDir(emptyDir);

      const input: ReportGenerationInput = {
        resultsDir: emptyDir,
        outputPath,
      };

      const result = await generateTestReport(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.report.summary.totalTests).toBe(0);
        expect(result.report.summary.passed).toBe(0);
        expect(result.report.summary.failed).toBe(0);
        expect(result.report.summary.pending).toBe(0);
        expect(result.report.summary.passRate).toBe(0);
      }
    });
  });

  describe('Error handling', () => {
    it('should return error when results directory does not exist', async () => {
      const input: ReportGenerationInput = {
        resultsDir: '/non/existent/path',
        outputPath,
      };

      const result = await generateTestReport(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Results directory does not exist');
      }
    });

    it('should return error when output directory does not exist and cannot be created', async () => {
      const input: ReportGenerationInput = {
        resultsDir,
        outputPath: '/root/forbidden/report.md', // Should fail on most systems
      };

      const result = await generateTestReport(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('output directory');
      }
    });

    it('should return error with invalid input parameters', async () => {
      const input = {
        resultsDir: '',
        outputPath: '',
      } as ReportGenerationInput;

      const result = await generateTestReport(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('required');
      }
    });
  });

  describe('Report format validation', () => {
    it('should calculate correct pass rate', async () => {
      // Add one more passed test to make calculations easier
      const testResult4 = path.join(resultsDir, '20240104_TC-REGISTER-001');
      await fs.ensureDir(testResult4);
      await fs.writeFile(
        path.join(testResult4, 'report.md'),
        `# TC-REGISTER-001 - Test Report

## Test Information
- **Test ID**: TC-REGISTER-001
- **Status**: passed
- **Execution Date**: 2024-01-04T13:00:00Z

## Test Results
Test completed successfully.
`
      );

      const input: ReportGenerationInput = {
        resultsDir,
        outputPath,
      };

      const result = await generateTestReport(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.report.summary.totalTests).toBe(4);
        expect(result.report.summary.passed).toBe(2);
        expect(result.report.summary.failed).toBe(1);
        expect(result.report.summary.pending).toBe(1);
        expect(result.report.summary.passRate).toBe(50);
      }
    });

    it('should generate valid markdown structure', async () => {
      const input: ReportGenerationInput = {
        resultsDir,
        outputPath,
      };

      const result = await generateTestReport(input);

      expect(result.success).toBe(true);
      if (result.success) {
        const reportContent = await fs.readFile(outputPath, 'utf8');
        
        // Check markdown structure
        expect(reportContent).toContain('# '); // Main title
        expect(reportContent).toContain('## '); // Section headers
        expect(reportContent).toContain('**Total Tests:**'); // Summary table
        expect(reportContent).toContain('**Pass Rate:**'); // Pass rate
        expect(reportContent).toMatch(/\| Test ID \| Status \| Duration \|/); // Test results table
      }
    });
  });
});