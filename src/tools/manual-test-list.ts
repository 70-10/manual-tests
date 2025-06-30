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
 * Result type for file parsing
 */
type ParseFileResult = 
  | { success: true; testCase: TestCaseFile; warnings: string[] }
  | { success: false; error: string };

/**
 * Parse test case file with detailed error information
 */
async function parseTestCaseFile(filePath: string): Promise<ParseFileResult> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const validation = validateTestCase(content);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid test case format: ${validation.errors.join(', ')}`
      };
    }
    
    if (!validation.parsedData) {
      return {
        success: false,
        error: 'No parsed data available'
      };
    }
    
    const testCase: TestCaseFile = {
      ...validation.parsedData,
      fileName: path.basename(filePath),
      filePath
    };
    
    return {
      success: true,
      testCase,
      warnings: []
    };
  } catch (error) {
    return {
      success: false,
      error: `File read error: ${error instanceof Error ? error.message : 'Unknown error'}`
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