import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

import {
  readYamlFile,
  writeYamlFile,
  readTextFile,
  writeTextFile,
  directoryExists,
  getYamlFiles,
  parseTestCaseFile
} from '../../src/utils/file-system-utils';

describe('File System Utils', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fs-utils-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('readYamlFile', () => {
    it('should read and parse YAML file successfully', async () => {
      const yamlPath = path.join(tempDir, 'test.yml');
      const yamlContent = 'name: test\nvalue: 123';
      await fs.writeFile(yamlPath, yamlContent);

      const result = await readYamlFile(yamlPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'test', value: 123 });
      }
    });

    it('should handle invalid YAML', async () => {
      const yamlPath = path.join(tempDir, 'invalid.yml');
      const invalidYaml = 'name: test\n  invalid: yaml';
      await fs.writeFile(yamlPath, invalidYaml);

      const result = await readYamlFile(yamlPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('YAML parsing error');
      }
    });

    it('should handle file not found', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent.yml');

      const result = await readYamlFile(nonExistentPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('File not found');
      }
    });
  });

  describe('writeYamlFile', () => {
    it('should write YAML file successfully', async () => {
      const yamlPath = path.join(tempDir, 'output.yml');
      const data = { name: 'test', value: 123 };

      const result = await writeYamlFile(yamlPath, data);

      expect(result.success).toBe(true);
      
      const written = await fs.readFile(yamlPath, 'utf-8');
      expect(written).toContain('name: test');
      expect(written).toContain('value: 123');
    });

    it('should handle write errors', async () => {
      const invalidPath = path.join('/nonexistent', 'output.yml');
      const data = { name: 'test' };

      const result = await writeYamlFile(invalidPath, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to write file');
      }
    });
  });

  describe('readTextFile', () => {
    it('should read text file successfully', async () => {
      const textPath = path.join(tempDir, 'test.txt');
      const content = 'Hello World';
      await fs.writeFile(textPath, content);

      const result = await readTextFile(textPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.content).toBe(content);
      }
    });

    it('should handle file not found', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent.txt');

      const result = await readTextFile(nonExistentPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('File not found');
      }
    });
  });

  describe('writeTextFile', () => {
    it('should write text file successfully', async () => {
      const textPath = path.join(tempDir, 'output.txt');
      const content = 'Hello World';

      const result = await writeTextFile(textPath, content);

      expect(result.success).toBe(true);

      const written = await fs.readFile(textPath, 'utf-8');
      expect(written).toBe(content);
    });
  });

  describe('directoryExists', () => {
    it('should return true for existing directory', async () => {
      const result = await directoryExists(tempDir);
      expect(result).toBe(true);
    });

    it('should return false for non-existing directory', async () => {
      const nonExistentDir = path.join(tempDir, 'nonexistent');
      const result = await directoryExists(nonExistentDir);
      expect(result).toBe(false);
    });

    it('should return false for file path', async () => {
      const filePath = path.join(tempDir, 'file.txt');
      await fs.writeFile(filePath, 'content');
      
      const result = await directoryExists(filePath);
      expect(result).toBe(false);
    });
  });

  describe('getYamlFiles', () => {
    it('should find YAML files in directory', async () => {
      await fs.writeFile(path.join(tempDir, 'test1.yml'), 'test: 1');
      await fs.writeFile(path.join(tempDir, 'test2.yaml'), 'test: 2');
      await fs.writeFile(path.join(tempDir, 'test.txt'), 'not yaml');

      const result = await getYamlFiles(tempDir);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.files).toHaveLength(2);
        expect(result.files.some(f => f.endsWith('test1.yml'))).toBe(true);
        expect(result.files.some(f => f.endsWith('test2.yaml'))).toBe(true);
      }
    });

    it('should handle empty directory', async () => {
      const result = await getYamlFiles(tempDir);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.files).toHaveLength(0);
      }
    });

    it('should handle non-existing directory', async () => {
      const nonExistentDir = path.join(tempDir, 'nonexistent');
      const result = await getYamlFiles(nonExistentDir);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to read directory');
      }
    });
  });

  describe('parseTestCaseFile', () => {
    it('should parse valid test case file', async () => {
      const yamlPath = path.join(tempDir, 'test-case.yml');
      const validTestCase = `meta:
  id: TC-TEST-001
  title: Test Case
  feature: Test Feature
  priority: high
  tags: [test]
  author: test
  lastUpdated: 2025-06-30
precondition:
  - Test precondition
scenario:
  given:
    - Given step
  when:
    - When step
  then:
    - Then step`;
      await fs.writeFile(yamlPath, validTestCase);

      const result = await parseTestCaseFile(yamlPath);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.testCase.meta.id).toBe('TC-TEST-001');
        expect(result.testCase.meta.title).toBe('Test Case');
      }
    });

    it('should handle invalid test case file', async () => {
      const yamlPath = path.join(tempDir, 'invalid.yml');
      const invalidTestCase = `meta:\n  id: TC-TEST-001\n# missing required fields`;
      await fs.writeFile(yamlPath, invalidTestCase);

      const result = await parseTestCaseFile(yamlPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should handle file not found', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent.yml');

      const result = await parseTestCaseFile(nonExistentPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('File not found');
      }
    });
  });
});