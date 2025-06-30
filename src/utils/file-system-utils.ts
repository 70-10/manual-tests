import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { validateTestCase } from '../tools/manual-test-validate';
import { TestCase } from '../models';

/**
 * Result types for file operations
 */
type FileReadResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

type FileWriteResult = 
  | { success: true }
  | { success: false; error: string };

type TextFileResult = 
  | { success: true; content: string }
  | { success: false; error: string };

type FileListResult = 
  | { success: true; files: string[] }
  | { success: false; error: string };

type ParseTestCaseResult = 
  | { success: true; testCase: TestCase; warnings: string[] }
  | { success: false; error: string };

/**
 * Read and parse YAML file
 */
export async function readYamlFile(filePath: string): Promise<FileReadResult<unknown>> {
  try {
    if (!await fs.pathExists(filePath)) {
      return { success: false, error: 'File not found' };
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const data = yaml.load(content);
    return { success: true, data };
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      return { success: false, error: `YAML parsing error: ${error.message}` };
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to read file: ${message}` };
  }
}

/**
 * Write data as YAML file
 */
export async function writeYamlFile(filePath: string, data: unknown): Promise<FileWriteResult> {
  try {
    const yamlContent = yaml.dump(data, {
      indent: 2,
      noRefs: true,
      sortKeys: false
    });
    await fs.writeFile(filePath, yamlContent);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to write file: ${message}` };
  }
}

/**
 * Read text file
 */
export async function readTextFile(filePath: string): Promise<TextFileResult> {
  try {
    if (!await fs.pathExists(filePath)) {
      return { success: false, error: 'File not found' };
    }

    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to read file: ${message}` };
  }
}

/**
 * Write text file
 */
export async function writeTextFile(filePath: string, content: string): Promise<FileWriteResult> {
  try {
    await fs.writeFile(filePath, content);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to write file: ${message}` };
  }
}

/**
 * Check if directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
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
export async function getYamlFiles(dirPath: string): Promise<FileListResult> {
  try {
    const files = await fs.readdir(dirPath);
    const yamlFiles = files
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
      .map(file => path.join(dirPath, file));
    
    return { success: true, files: yamlFiles };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to read directory: ${message}` };
  }
}

/**
 * Parse test case file
 */
export async function parseTestCaseFile(filePath: string): Promise<ParseTestCaseResult> {
  try {
    if (!await fs.pathExists(filePath)) {
      return { success: false, error: 'File not found' };
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const validation = validateTestCase(content);
    
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join('; ') };
    }
    
    if (!validation.parsedData) {
      return { success: false, error: 'No parsed data available' };
    }
    
    return { 
      success: true, 
      testCase: validation.parsedData,
      warnings: validation.warnings 
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to parse test case file: ${message}` };
  }
}