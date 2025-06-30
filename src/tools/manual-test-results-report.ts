import * as fs from 'fs-extra';
import * as path from 'path';
import type { 
  ReportGenerationInput, 
  ReportResult, 
  GeneratedReport,
  TestResultSummary,
  ReportSection
} from '../models';
import {
  parseReportMetadata,
  calculateTestSummary,
  generateSummarySection,
  generateResultsTableSection,
  generateTestDetailSections,
  generateWarningsSection,
  compileMarkdownReport,
} from './generators/report-generator';

/**
 * Validate input parameters
 */
function validateInput(input: ReportGenerationInput): string | null {
  if (!input.resultsDir || typeof input.resultsDir !== 'string') {
    return 'resultsDir is required and must be a string';
  }

  if (!input.outputPath || typeof input.outputPath !== 'string') {
    return 'outputPath is required and must be a string';
  }

  return null;
}


/**
 * Scan results directory and collect test data
 */
async function collectTestResults(resultsDir: string): Promise<{
  testResults: any[];
  warnings: string[];
}> {
  const testResults: any[] = [];
  const warnings: string[] = [];

  const entries = await fs.readdir(resultsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const testDirPath = path.join(resultsDir, entry.name);
    const reportPath = path.join(testDirPath, 'report.md');

    try {
      if (await fs.pathExists(reportPath)) {
        const reportContent = await fs.readFile(reportPath, 'utf8');
        const metadata = parseReportMetadata(reportContent);
        
        // Extract test ID from directory name if not found in content
        if (!metadata.testId) {
          const dirNameMatch = entry.name.match(/\d+_(.+)/);
          if (dirNameMatch) {
            metadata.testId = dirNameMatch[1];
          } else {
            metadata.testId = entry.name;
          }
        }

        const screenshotPath = path.join(testDirPath, 'screenshot.png');
        const hasScreenshot = await fs.pathExists(screenshotPath);

        testResults.push({
          ...metadata,
          directoryName: entry.name,
          directoryPath: testDirPath,
          reportPath,
          screenshotPath: hasScreenshot ? screenshotPath : undefined,
        });
      } else {
        warnings.push(`No report.md found in ${entry.name}`);
      }
    } catch (error) {
      warnings.push(`Failed to process ${entry.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { testResults, warnings };
}


/**
 * Generate all report sections
 */
function generateReportSections(
  testResults: any[],
  summary: TestResultSummary,
  input: ReportGenerationInput,
  warnings: string[]
): ReportSection[] {
  const sections: ReportSection[] = [];

  // Add summary section if requested
  if (input.includeSummary !== false) {
    sections.push(generateSummarySection(summary, input.description));
  }

  // Add test results table
  sections.push(generateResultsTableSection(testResults));

  // Add individual test details
  sections.push(...generateTestDetailSections(testResults, input));

  // Add warnings section if there are any
  const warningsSection = generateWarningsSection(warnings);
  if (warningsSection) {
    sections.push(warningsSection);
  }

  return sections;
}


/**
 * Generate test report from results directory
 */
export async function generateTestReport(input: ReportGenerationInput): Promise<ReportResult> {
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

    // Ensure output directory exists
    const outputDir = path.dirname(input.outputPath);
    try {
      await fs.ensureDir(outputDir);
    } catch (error) {
      return {
        success: false,
        error: `Failed to create output directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // Collect test results
    const { testResults, warnings } = await collectTestResults(input.resultsDir);

    // Calculate summary
    const summary = calculateTestSummary(testResults);

    // Generate report sections
    const sections = generateReportSections(testResults, summary, input, warnings);

    // Create report object
    const report: GeneratedReport = {
      title: input.title || 'Test Execution Report',
      generatedAt: new Date().toISOString(),
      summary,
      sections,
      format: input.format || 'markdown',
    };

    // Generate and write report
    const reportContent = compileMarkdownReport(report);
    await fs.writeFile(input.outputPath, reportContent, 'utf8');

    return {
      success: true,
      reportPath: input.outputPath,
      report,
      message: `Report generated successfully at ${input.outputPath}`,
    };

  } catch (error) {
    return {
      success: false,
      error: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}