// Report generation utilities

import * as path from 'path';
import type { ReportSection, TestResultSummary, ReportGenerationInput, GeneratedReport } from '../../models';

/**
 * Parse report.md file content to extract test metadata
 */
export function parseReportMetadata(reportContent: string): {
  testId?: string;
  title?: string;
  status?: string;
  executionDate?: string;
  duration?: number;
  executor?: string;
} {
  const patterns = {
    testId: /\*\*Test ID\*\*:\s*([^\n]+)/,
    title: /\*\*Title\*\*:\s*([^\n]+)/,
    status: /\*\*Status\*\*:\s*([^\n]+)/,
    executionDate: /\*\*Execution Date\*\*:\s*([^\n]+)/,
    duration: /\*\*Duration\*\*:\s*(\d+)ms/,
    executor: /\*\*Executor\*\*:\s*([^\n]+)/,
  };

  const metadata: any = {};

  // Extract each field using regex patterns
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = reportContent.match(pattern);
    if (match) {
      if (key === 'duration') {
        metadata[key] = parseInt(match[1], 10);
      } else if (key === 'status') {
        metadata[key] = match[1].trim().toLowerCase();
      } else {
        metadata[key] = match[1].trim();
      }
    }
  }

  return metadata;
}

/**
 * Calculate test execution summary statistics
 */
export function calculateTestSummary(testResults: any[]): TestResultSummary {
  const counts = testResults.reduce(
    (acc, result) => {
      acc.total++;
      switch (result.status) {
        case 'passed':
          acc.passed++;
          break;
        case 'failed':
          acc.failed++;
          break;
        case 'skipped':
          acc.skipped++;
          break;
        case 'pending':
          acc.pending++;
          break;
      }
      
      if (result.duration) {
        acc.totalDuration += result.duration;
      }
      
      return acc;
    },
    { total: 0, passed: 0, failed: 0, skipped: 0, pending: 0, totalDuration: 0 }
  );

  const passRate = counts.total > 0 ? Math.round((counts.passed / counts.total) * 10000) / 100 : 0;

  return {
    totalTests: counts.total,
    passed: counts.passed,
    failed: counts.failed,
    skipped: counts.skipped,
    pending: counts.pending,
    passRate,
    executionTime: counts.totalDuration > 0 ? counts.totalDuration : undefined,
  };
}

/**
 * Generate summary section content
 */
export function generateSummarySection(
  summary: TestResultSummary,
  description?: string
): ReportSection {
  let content = '## Test Execution Summary\n\n';
  
  if (description) {
    content += `${description}\n\n`;
  }

  content += [
    `**Total Tests:** ${summary.totalTests}`,
    `**Passed:** ${summary.passed}`,
    `**Failed:** ${summary.failed}`,
    `**Skipped:** ${summary.skipped}`,
    `**Pending:** ${summary.pending}`,
    `**Pass Rate:** ${summary.passRate}%`,
  ].join('\n');

  if (summary.executionTime) {
    content += `\n**Total Execution Time:** ${summary.executionTime}ms`;
  }

  return {
    title: 'Summary',
    content,
    type: 'summary',
  };
}

/**
 * Generate test results table section
 */
export function generateResultsTableSection(testResults: any[]): ReportSection {
  if (testResults.length === 0) {
    return {
      title: 'Test Results Table',
      content: '## Test Results\n\nNo test results found.',
      type: 'test-detail',
    };
  }

  let content = `## Test Results

| Test ID | Status | Duration | Executor |
|---------|--------|----------|----------|
`;

  for (const result of testResults) {
    const duration = result.duration ? `${result.duration}ms` : 'N/A';
    const executor = result.executor || 'N/A';
    const status = result.status || 'unknown';
    
    content += `| ${result.testId} | ${status} | ${duration} | ${executor} |\n`;
  }

  return {
    title: 'Test Results Table',
    content,
    type: 'test-detail',
  };
}

/**
 * Generate individual test detail sections
 */
export function generateTestDetailSections(
  testResults: any[],
  input: ReportGenerationInput
): ReportSection[] {
  return testResults.map(result => {
    let content = `## ${result.testId}\n\n`;
    
    const details = [
      ['Status', result.status || 'unknown'],
      ['Title', result.title],
      ['Execution Date', result.executionDate],
      ['Duration', result.duration ? `${result.duration}ms` : undefined],
      ['Executor', result.executor],
    ];

    for (const [label, value] of details) {
      if (value) {
        content += `**${label}:** ${value}\n`;
      }
    }

    // Add screenshot if requested and available
    if (input.includeScreenshots && result.screenshotPath) {
      const relativePath = path.relative(path.dirname(input.outputPath), result.screenshotPath);
      content += `\n**Screenshot:**\n![Screenshot](${relativePath})`;
    }

    return {
      title: result.testId,
      content,
      type: 'test-detail',
    };
  });
}

/**
 * Generate warnings section if warnings exist
 */
export function generateWarningsSection(warnings: string[]): ReportSection | null {
  if (warnings.length === 0) {
    return null;
  }

  const content = `## Warnings\n\n${warnings.map(w => `- ${w}`).join('\n')}`;

  return {
    title: 'Warnings',
    content,
    type: 'error',
  };
}

/**
 * Compile all sections into final markdown report
 */
export function compileMarkdownReport(report: GeneratedReport): string {
  let content = `# ${report.title}\n\n*Generated on ${report.generatedAt}*\n\n`;

  for (const section of report.sections) {
    content += `${section.content}\n\n`;
  }

  return content;
}