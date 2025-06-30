import * as path from 'path';
import { validateTestCase } from './manual-test-validate';
import { TestCase, TestCaseFile, ListFilter, SortField, ListResult, Priority } from '../models';
import { directoryExists, getYamlFiles, parseTestCaseFile } from '../utils/file-system-utils';

// Re-export types for backward compatibility
export type { TestCaseFile, ListFilter, SortField, ListResult } from '../models';


/**
 * Result type for file parsing
 */
type ParseFileResult = 
  | { success: true; testCase: TestCaseFile; warnings: string[] }
  | { success: false; error: string };

/**
 * Parse test case file with file metadata
 */
async function parseTestCaseFileWithMetadata(filePath: string): Promise<ParseFileResult> {
  const result = await parseTestCaseFile(filePath);
  
  if (!result.success) {
    return {
      success: false,
      error: `Invalid test case format: ${result.error}`
    };
  }
  
  try {
    const fs = await import('fs-extra');
    const stat = await fs.stat(filePath);
    const testCase: TestCaseFile = {
      ...result.testCase,
      fileName: path.basename(filePath),
      filePath,
      lastModified: stat.mtime
    };
    
    return {
      success: true,
      testCase,
      warnings: result.warnings
    };
  } catch (error) {
    return {
      success: false,
      error: `File metadata error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Filter strategies
interface FilterStrategy {
  apply(testCase: TestCaseFile): boolean;
}

class FeatureFilter implements FilterStrategy {
  constructor(private feature: string) {}
  
  apply(testCase: TestCaseFile): boolean {
    return testCase.meta.feature === this.feature;
  }
}

class PriorityFilter implements FilterStrategy {
  constructor(private priority: Priority) {}
  
  apply(testCase: TestCaseFile): boolean {
    return testCase.meta.priority === this.priority;
  }
}

class TagsFilter implements FilterStrategy {
  constructor(private tags: string[]) {}
  
  apply(testCase: TestCaseFile): boolean {
    if (!testCase.meta.tags || testCase.meta.tags.length === 0) {
      return false;
    }
    return this.tags.some(tag => testCase.meta.tags?.includes(tag));
  }
}

class AuthorFilter implements FilterStrategy {
  constructor(private author: string) {}
  
  apply(testCase: TestCaseFile): boolean {
    return testCase.meta.author === this.author;
  }
}

/**
 * Create filter strategies from filter options
 */
function createFilterStrategies(filter: ListFilter): FilterStrategy[] {
  const strategies: FilterStrategy[] = [];
  
  if (filter.feature) {
    strategies.push(new FeatureFilter(filter.feature));
  }
  
  if (filter.priority) {
    strategies.push(new PriorityFilter(filter.priority));
  }
  
  if (filter.tags && filter.tags.length > 0) {
    strategies.push(new TagsFilter(filter.tags));
  }
  
  if (filter.author) {
    strategies.push(new AuthorFilter(filter.author));
  }
  
  return strategies;
}

/**
 * Apply filters to test cases using strategy pattern
 */
function applyFilters(testCases: TestCaseFile[], filter: ListFilter): TestCaseFile[] {
  const strategies = createFilterStrategies(filter);
  
  if (strategies.length === 0) {
    return testCases;
  }
  
  return testCases.filter(testCase => 
    strategies.every(strategy => strategy.apply(testCase))
  );
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
    const yamlFilesResult = await getYamlFiles(dirPath);
    
    if (!yamlFilesResult.success) {
      throw new Error(yamlFilesResult.error);
    }
    
    if (yamlFilesResult.files.length === 0) {
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
    
    for (const filePath of yamlFilesResult.files) {
      const result = await parseTestCaseFileWithMetadata(filePath);
      if (result.success) {
        testCases.push(result.testCase);
        warnings.push(...result.warnings);
      } else {
        warnings.push(`${path.basename(filePath)}: ${result.error}`);
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