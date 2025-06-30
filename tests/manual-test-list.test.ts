import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listTestCases } from '../src/tools/manual-test-list';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('manual_test_list', () => {
  const testDir = path.join(process.cwd(), 'test-fixtures');
  const testCasesDir = path.join(testDir, 'tests', 'manual-tests', 'test-cases');

  beforeEach(async () => {
    // Create test directory structure
    await fs.ensureDir(testCasesDir);
    
    // Create sample test case files
    const testCase1 = `meta:
  id: TC-LOGIN-001
  title: ログイン機能のテスト
  feature: ログイン
  priority: high
  tags: [smoke, regression]
  author: tester1
  lastUpdated: 2025-06-30
scenario:
  given:
    - ユーザーがログアウト状態
  when:
    - ログインフォームにアクセス
  then:
    - フォームが表示される
`;

    const testCase2 = `meta:
  id: TC-LOGIN-002
  title: 無効なログインのテスト
  feature: ログイン
  priority: medium
  tags: [regression]
  author: tester2
  lastUpdated: 2025-06-29
scenario:
  given:
    - ユーザーがログアウト状態
  when:
    - 無効な認証情報を入力
  then:
    - エラーメッセージが表示される
`;

    const testCase3 = `meta:
  id: TC-SEARCH-001
  title: 商品検索機能のテスト
  feature: 検索
  priority: high
  tags: [smoke]
  author: tester1
  lastUpdated: 2025-06-28
scenario:
  given:
    - ユーザーがトップページにアクセス
  when:
    - 商品名で検索実行
  then:
    - 検索結果が表示される
`;

    await fs.writeFile(path.join(testCasesDir, 'login-001.yml'), testCase1);
    await fs.writeFile(path.join(testCasesDir, 'login-002.yml'), testCase2);
    await fs.writeFile(path.join(testCasesDir, 'search-001.yml'), testCase3);
    
    // Create non-YAML file (should be ignored)
    await fs.writeFile(path.join(testCasesDir, 'README.md'), '# Test Cases');
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(testDir);
  });

  describe('basic listing', () => {
    it('should list all test case files', async () => {
      const result = await listTestCases(testCasesDir);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.testCases).toHaveLength(3);
        
        const ids = result.testCases.map(tc => tc.meta.id);
        expect(ids).toContain('TC-LOGIN-001');
        expect(ids).toContain('TC-LOGIN-002');
        expect(ids).toContain('TC-SEARCH-001');
      }
    });

    it('should ignore non-YAML files', async () => {
      const result = await listTestCases(testCasesDir);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const files = result.testCases.map(tc => tc.fileName);
        expect(files).not.toContain('README.md');
      }
    });

    it('should handle empty directory', async () => {
      const emptyDir = path.join(testDir, 'empty');
      await fs.ensureDir(emptyDir);
      
      const result = await listTestCases(emptyDir);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.testCases).toHaveLength(0);
      }
    });

    it('should handle non-existent directory', async () => {
      const nonExistentDir = path.join(testDir, 'does-not-exist');
      
      const result = await listTestCases(nonExistentDir);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/directory not found|does not exist/i);
      }
    });
  });

  describe('filtering', () => {
    it('should filter by feature', async () => {
      const result = await listTestCases(testCasesDir, { feature: 'ログイン' });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.testCases).toHaveLength(2);
        result.testCases.forEach(tc => {
          expect(tc.meta.feature).toBe('ログイン');
        });
      }
    });

    it('should filter by priority', async () => {
      const result = await listTestCases(testCasesDir, { priority: 'high' });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.testCases).toHaveLength(2);
        result.testCases.forEach(tc => {
          expect(tc.meta.priority).toBe('high');
        });
      }
    });

    it('should filter by tags', async () => {
      const result = await listTestCases(testCasesDir, { tags: ['smoke'] });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.testCases).toHaveLength(2);
        result.testCases.forEach(tc => {
          expect(tc.meta.tags).toContain('smoke');
        });
      }
    });

    it('should filter by author', async () => {
      const result = await listTestCases(testCasesDir, { author: 'tester1' });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.testCases).toHaveLength(2);
        result.testCases.forEach(tc => {
          expect(tc.meta.author).toBe('tester1');
        });
      }
    });

    it('should apply multiple filters', async () => {
      const result = await listTestCases(testCasesDir, {
        feature: 'ログイン',
        priority: 'high'
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.testCases).toHaveLength(1);
        expect(result.testCases[0].meta.id).toBe('TC-LOGIN-001');
      }
    });

    it('should return empty result when no matches', async () => {
      const result = await listTestCases(testCasesDir, { feature: '存在しない機能' });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.testCases).toHaveLength(0);
      }
    });
  });

  describe('sorting', () => {
    it('should sort by ID by default', async () => {
      const result = await listTestCases(testCasesDir);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const ids = result.testCases.map(tc => tc.meta.id);
        expect(ids).toEqual(['TC-LOGIN-001', 'TC-LOGIN-002', 'TC-SEARCH-001']);
      }
    });

    it('should sort by lastUpdated when specified', async () => {
      const result = await listTestCases(testCasesDir, {}, 'lastUpdated');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const dates = result.testCases.map(tc => tc.meta.lastUpdated);
        expect(dates).toEqual(['2025-06-30', '2025-06-29', '2025-06-28']);
      }
    });

    it('should sort by priority when specified', async () => {
      const result = await listTestCases(testCasesDir, {}, 'priority');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const priorities = result.testCases.map(tc => tc.meta.priority);
        // high comes before medium
        expect(priorities.filter(p => p === 'high')).toHaveLength(2);
        expect(priorities.filter(p => p === 'medium')).toHaveLength(1);
        expect(priorities.indexOf('high')).toBeLessThan(priorities.indexOf('medium'));
      }
    });
  });

  describe('return value structure', () => {
    it('should return correct structure on success', async () => {
      const result = await listTestCases(testCasesDir);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result).toHaveProperty('testCases');
        expect(result).toHaveProperty('totalCount');
        expect(Array.isArray(result.testCases)).toBe(true);
        expect(typeof result.totalCount).toBe('number');
        expect(result.totalCount).toBe(result.testCases.length);
        
        // Check test case structure
        if (result.testCases.length > 0) {
          const testCase = result.testCases[0];
          expect(testCase).toHaveProperty('meta');
          expect(testCase).toHaveProperty('scenario');
          expect(testCase).toHaveProperty('fileName');
          expect(testCase).toHaveProperty('filePath');
        }
      }
    });

    it('should return error structure on failure', async () => {
      const result = await listTestCases('/invalid/path');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      }
    });
  });

  describe('error handling', () => {
    it('should handle invalid YAML files gracefully', async () => {
      const invalidYamlFile = path.join(testCasesDir, 'invalid.yml');
      await fs.writeFile(invalidYamlFile, 'invalid: yaml: content: [');
      
      const result = await listTestCases(testCasesDir);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Should skip invalid files and continue
        expect(result.testCases).toHaveLength(3); // Only valid files
        expect(result.warnings).toBeDefined();
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toMatch(/invalid\.yml/);
      }
    });

    it('should handle files that are not test cases', async () => {
      const nonTestCaseFile = path.join(testCasesDir, 'config.yml');
      await fs.writeFile(nonTestCaseFile, 'config:\n  setting: value');
      
      const result = await listTestCases(testCasesDir);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Should skip non-test-case files
        expect(result.testCases).toHaveLength(3);
        expect(result.warnings).toBeDefined();
        expect(result.warnings.some(w => w.includes('config.yml'))).toBe(true);
      }
    });
  });
});