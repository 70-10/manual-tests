import * as fs from 'fs-extra';
import * as path from 'path';
import { validateTestCase, type TestCase, type Priority } from './manual-test-validate';

export interface TestCaseFile {
  meta: TestCase['meta'];
  scenario: TestCase['scenario'];
  precondition?: TestCase['precondition'];
  notes?: TestCase['notes'];
  fileName: string;
  filePath: string;
}

export interface ListFilter {
  feature?: string;
  priority?: Priority;
  tags?: string[];
  author?: string;
}

export type SortField = 'id' | 'lastUpdated' | 'priority' | 'feature';

export interface ListSuccessResult {
  success: true;
  testCases: TestCaseFile[];
  totalCount: number;
  warnings: string[];
}

export interface ListErrorResult {
  success: false;
  error: string;
}

export type ListResult = ListSuccessResult | ListErrorResult;

/**
 * Check if directory exists
 */
async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get all YAML files from directory
 */
async function getYamlFiles(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(file => 
      file.endsWith('.yml') || file.endsWith('.yaml')
    ).map(file => path.join(dirPath, file));
  } catch (error) {
    throw new Error(`Failed to read directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse test case file
 */
async function parseTestCaseFile(filePath: string): Promise<{ testCase: TestCaseFile; warnings: string[] } | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const validation = validateTestCase(content);
    
    if (!validation.isValid || !validation.parsedData) {
      return null; // Invalid test case, will be reported as warning
    }
    
    const testCase: TestCaseFile = {
      ...validation.parsedData,
      fileName: path.basename(filePath),
      filePath
    };
    
    return { testCase, warnings: [] };
  } catch (error) {
    return null; // File read error, will be reported as warning
  }
}

/**
 * Apply filters to test cases
 */
function applyFilters(testCases: TestCaseFile[], filter: ListFilter): TestCaseFile[] {
  return testCases.filter(testCase => {
    // Feature filter
    if (filter.feature && testCase.meta.feature !== filter.feature) {
      return false;
    }
    
    // Priority filter
    if (filter.priority && testCase.meta.priority !== filter.priority) {
      return false;
    }
    
    // Tags filter
    if (filter.tags && filter.tags.length > 0) {
      if (!testCase.meta.tags || testCase.meta.tags.length === 0) {
        return false;
      }
      // Check if test case has at least one of the required tags
      const hasRequiredTag = filter.tags.some(tag => 
        testCase.meta.tags?.includes(tag)
      );
      if (!hasRequiredTag) {
        return false;
      }
    }
    
    // Author filter
    if (filter.author && testCase.meta.author !== filter.author) {
      return false;
    }
    
    return true;
  });
}

/**
 * Sort test cases
 */
function sortTestCases(testCases: TestCaseFile[], sortBy: SortField = 'id'): TestCaseFile[] {
  return [...testCases].sort((a, b) => {
    switch (sortBy) {
      case 'id':
        return a.meta.id.localeCompare(b.meta.id);
      
      case 'lastUpdated':
        const dateA = typeof a.meta.lastUpdated === 'string' 
          ? a.meta.lastUpdated 
          : a.meta.lastUpdated?.toISOString().split('T')[0] || '';
        const dateB = typeof b.meta.lastUpdated === 'string'
          ? b.meta.lastUpdated
          : b.meta.lastUpdated?.toISOString().split('T')[0] || '';
        return dateB.localeCompare(dateA); // Most recent first
      
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.meta.priority] - priorityOrder[b.meta.priority];
      
      case 'feature':
        const featureA = a.meta.feature || '';
        const featureB = b.meta.feature || '';
        return featureA.localeCompare(featureB);
      
      default:
        return 0;
    }
  });
}

/**
 * List test cases from directory
 */
export async function listTestCases(
  dirPath: string,
  filter: ListFilter = {},
  sortBy: SortField = 'id'
): Promise<ListResult> {
  try {
    // Check if directory exists
    if (!(await directoryExists(dirPath))) {
      return {
        success: false,
        error: `Directory not found: ${dirPath}`
      };
    }
    
    // Get YAML files
    const yamlFiles = await getYamlFiles(dirPath);
    
    if (yamlFiles.length === 0) {
      return {
        success: true,
        testCases: [],
        totalCount: 0,
        warnings: []
      };
    }
    
    // Parse test case files
    const testCases: TestCaseFile[] = [];
    const warnings: string[] = [];
    
    for (const filePath of yamlFiles) {
      const result = await parseTestCaseFile(filePath);
      if (result) {
        testCases.push(result.testCase);
        warnings.push(...result.warnings);
      } else {
        warnings.push(`Failed to parse test case file: ${path.basename(filePath)}`);
      }
    }
    
    // Apply filters
    const filteredTestCases = applyFilters(testCases, filter);
    
    // Sort test cases
    const sortedTestCases = sortTestCases(filteredTestCases, sortBy);
    
    return {
      success: true,
      testCases: sortedTestCases,
      totalCount: sortedTestCases.length,
      warnings
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Failed to list test cases: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}