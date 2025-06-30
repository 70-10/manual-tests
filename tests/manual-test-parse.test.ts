import { describe, it, expect } from 'vitest';
import { parseTestCase } from '../src/tools/manual-test-parse';

describe('manual_test_parse', () => {
  describe('basic YAML parsing', () => {
    it('should parse valid test case YAML', () => {
      const yamlContent = `
meta:
  id: TC-TEST-001
  title: Basic test case
  feature: テスト機能
  priority: high
  tags: [smoke]
scenario:
  given:
    - ブラウザを開いていない状態
  when:
    - ブラウザで "https://example.com" にアクセスする
  then:
    - ページタイトルが "Example Domain" であること
`;

      const result = parseTestCase(yamlContent);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.testCase.meta.id).toBe('TC-TEST-001');
        expect(result.testCase.meta.title).toBe('Basic test case');
        expect(result.testCase.scenario.given).toHaveLength(1);
        expect(result.testCase.scenario.when).toHaveLength(1);
        expect(result.testCase.scenario.then).toHaveLength(1);
      }
    });

    it('should fail for invalid YAML', () => {
      const invalidYaml = `
meta:
  id: TC-TEST-001
  [invalid syntax
`;

      const result = parseTestCase(invalidYaml);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error).toMatch(/YAML syntax error/);
      }
    });
  });

  describe('variable substitution', () => {
    it('should substitute {{today}} variable', () => {
      const yamlContent = `
meta:
  id: TC-TEST-001
  title: Test with today variable
  priority: high
scenario:
  given:
    - 今日は {{today}} です
  when:
    - '{{today}} の記録を確認する'
  then:
    - '{{today}} が表示されること'
`;

      const result = parseTestCase(yamlContent);
      expect(result.success).toBe(true);

      if (result.success) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        expect(result.processedSteps.given[0]).toBe(`今日は ${today} です`);
        expect(result.processedSteps.when[0]).toBe(`${today} の記録を確認する`);
        expect(result.processedSteps.then[0]).toBe(`${today} が表示されること`);
      }
    });

    it('should substitute {{timestamp}} variable', () => {
      const yamlContent = `
meta:
  id: TC-TEST-001
  title: Test with timestamp
  priority: high
scenario:
  given:
    - タイムスタンプ {{timestamp}} で開始
  when:
    - 操作を実行する
  then:
    - 結果を確認する
`;

      const result = parseTestCase(yamlContent);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.processedSteps.given[0]).toMatch(/^タイムスタンプ \d+ で開始$/);
      }
    });

    it('should substitute test_data variables', () => {
      const yamlContent = `
meta:
  id: TC-TEST-001
  title: Test with test data
  priority: high
scenario:
  given:
    - ユーザー {{test_data.users.valid_user.username}} でログイン準備
  when:
    - '{{test_data.users.valid_user.username}} でログインする'
    - 'パスワード {{test_data.users.valid_user.password}} を入力'
  then:
    - '{{test_data.users.valid_user.email}} が表示されること'
`;

      const projectMeta = {
        test_data: {
          users: {
            valid_user: {
              username: 'test_user',
              password: 'test_password123',
              email: 'test@example.com'
            }
          }
        }
      };

      const result = parseTestCase(yamlContent, projectMeta);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.processedSteps.given[0]).toBe('ユーザー test_user でログイン準備');
        expect(result.processedSteps.when[0]).toBe('test_user でログインする');
        expect(result.processedSteps.when[1]).toBe('パスワード test_password123 を入力');
        expect(result.processedSteps.then[0]).toBe('test@example.com が表示されること');
      }
    });

    it('should substitute environment variables', () => {
      const yamlContent = `
meta:
  id: TC-TEST-001
  title: Test with environment
  priority: high
scenario:
  given:
    - ブラウザを開いていない状態
  when:
    - 'ブラウザで {{environments.production}} にアクセスする'
  then:
    - ページが正しく表示されること
`;

      const projectMeta = {
        environments: {
          production: 'https://example.com',
          staging: 'https://staging.example.com'
        }
      };

      const result = parseTestCase(yamlContent, projectMeta);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.processedSteps.when[0]).toBe('ブラウザで https://example.com にアクセスする');
      }
    });

    it('should handle missing variables gracefully', () => {
      const yamlContent = `
meta:
  id: TC-TEST-001
  title: Test with missing variable
  priority: high
scenario:
  given:
    - 状態を {{missing_variable}} に設定
  when:
    - 操作を実行する
  then:
    - 結果を確認する
`;

      const result = parseTestCase(yamlContent);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.processedSteps.given[0]).toBe('状態を {{missing_variable}} に設定');
        expect(result.warnings).toContain('Variable not found: missing_variable');
      }
    });
  });

  describe('return value structure', () => {
    it('should return correct structure on success', () => {
      const yamlContent = `
meta:
  id: TC-TEST-001
  title: Structure test
  priority: high
scenario:
  given:
    - 初期状態
  when:
    - 操作実行
  then:
    - 結果確認
`;

      const result = parseTestCase(yamlContent);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result).toHaveProperty('testCase');
        expect(result).toHaveProperty('processedSteps');
        expect(result).toHaveProperty('warnings');
        expect(result.processedSteps).toHaveProperty('given');
        expect(result.processedSteps).toHaveProperty('when');
        expect(result.processedSteps).toHaveProperty('then');
        expect(Array.isArray(result.processedSteps.given)).toBe(true);
        expect(Array.isArray(result.processedSteps.when)).toBe(true);
        expect(Array.isArray(result.processedSteps.then)).toBe(true);
      }
    });

    it('should return error structure on failure', () => {
      const invalidYaml = `invalid yaml [content`;

      const result = parseTestCase(invalidYaml);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      }
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple variable types in single step', () => {
      const yamlContent = `
meta:
  id: TC-TEST-001
  title: Complex variable test
  priority: high
scenario:
  given:
    - 今日 {{today}} にユーザー {{test_data.users.valid_user.username}} が {{environments.production}} にアクセス
  when:
    - 操作を実行する
  then:
    - 結果を確認する
`;

      const projectMeta = {
        test_data: {
          users: {
            valid_user: {
              username: 'test_user'
            }
          }
        },
        environments: {
          production: 'https://example.com'
        }
      };

      const result = parseTestCase(yamlContent, projectMeta);
      expect(result.success).toBe(true);

      if (result.success) {
        const today = new Date().toISOString().split('T')[0];
        expect(result.processedSteps.given[0]).toBe(
          `今日 ${today} にユーザー test_user が https://example.com にアクセス`
        );
      }
    });
  });
});