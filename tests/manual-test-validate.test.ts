import { describe, it, expect, beforeEach } from 'vitest';
import { validateTestCase } from '../src/tools/manual-test-validate';

describe('manual_test_validate', () => {
  describe('YAML syntax validation', () => {
    it('should pass for valid YAML', () => {
      const validYaml = `
meta:
  id: TC-TEST-001
  title: Valid test case
  feature: テスト機能
  priority: high
  tags: [smoke]
  author: test
  lastUpdated: 2025-06-30
precondition:
  - テスト前提条件
scenario:
  given:
    - 初期状態
  when:
    - 実行操作
  then:
    - 期待結果
`;
      
      const result = validateTestCase(validYaml);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid YAML syntax', () => {
      const invalidYaml = `
meta:
  id: TC-TEST-001
  title: Invalid YAML
  priority: high
  [invalid syntax here
`;
      
      const result = validateTestCase(invalidYaml);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/YAML syntax error:/);
      expect(result.errors[0]).toMatch(/unexpected end of the stream/);
    });
  });

  describe('required fields validation', () => {
    it('should fail when meta.id is missing', () => {
      const yamlWithoutId = `
meta:
  title: Test without ID
  feature: テスト機能
  priority: high
`;
      
      const result = validateTestCase(yamlWithoutId);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('meta.id: Required');
    });

    it('should fail when meta.title is missing', () => {
      const yamlWithoutTitle = `
meta:
  id: TC-TEST-001
  feature: テスト機能
  priority: high
`;
      
      const result = validateTestCase(yamlWithoutTitle);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('meta.title: Required');
    });

    it('should fail when scenario is missing', () => {
      const yamlWithoutScenario = `
meta:
  id: TC-TEST-001
  title: Test without scenario
  feature: テスト機能
  priority: high
`;
      
      const result = validateTestCase(yamlWithoutScenario);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('scenario: Required');
    });

    it('should fail when scenario.given is missing', () => {
      const yamlWithoutGiven = `
meta:
  id: TC-TEST-001
  title: Test without given
  feature: テスト機能
  priority: high
scenario:
  when:
    - 実行操作
  then:
    - 期待結果
`;
      
      const result = validateTestCase(yamlWithoutGiven);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('scenario.given: Required');
    });
  });

  describe('project meta validation', () => {
    it('should validate priority values', () => {
      const yamlWithInvalidPriority = `
meta:
  id: TC-TEST-001
  title: Test with invalid priority
  feature: テスト機能
  priority: invalid
  tags: [smoke]
scenario:
  given:
    - 初期状態
  when:
    - 実行操作
  then:
    - 期待結果
`;
      
      const result = validateTestCase(yamlWithInvalidPriority);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('meta.priority: Priority must be one of: high, medium, low');
    });

    it('should validate test ID format', () => {
      const yamlWithInvalidId = `
meta:
  id: invalid-id-format
  title: Test with invalid ID format
  feature: テスト機能
  priority: high
scenario:
  given:
    - 初期状態
  when:
    - 実行操作
  then:
    - 期待結果
`;
      
      const result = validateTestCase(yamlWithInvalidId);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('meta.id: ID format must be TC-[A-Z-]+-[NUMBER]');
    });

    it('should validate tags format', () => {
      const yamlWithInvalidTags = `
meta:
  id: TC-TEST-001  
  title: Test with invalid tags
  feature: テスト機能
  priority: high
  tags: "not an array"
scenario:
  given:
    - 初期状態
  when:
    - 実行操作
  then:
    - 期待結果
`;
      
      const result = validateTestCase(yamlWithInvalidTags);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('meta.tags: Expected array, received string');
    });
  });

  describe('scenario structure validation', () => {
    it('should require given, when, then to be arrays', () => {
      const yamlWithInvalidScenario = `
meta:
  id: TC-TEST-001
  title: Test with invalid scenario structure
  feature: テスト機能
  priority: high
scenario:
  given: "not an array"
  when:
    - 実行操作
  then:
    - 期待結果
`;
      
      const result = validateTestCase(yamlWithInvalidScenario);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('scenario.given: Expected array, received string');
    });

    it('should require non-empty arrays for given, when, then', () => {
      const yamlWithEmptyScenario = `
meta:
  id: TC-TEST-001
  title: Test with empty scenario arrays
  feature: テスト機能
  priority: high
scenario:
  given: []
  when:
    - 実行操作
  then:
    - 期待結果
`;
      
      const result = validateTestCase(yamlWithEmptyScenario);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('scenario.given: Given cannot be empty');
    });
  });

  describe('return value structure', () => {
    it('should return validation result with correct structure', () => {
      const validYaml = `
meta:
  id: TC-TEST-001
  title: Valid test case
  feature: テスト機能
  priority: high
  tags: [smoke]
  author: test
  lastUpdated: 2025-06-30
scenario:
  given:
    - 初期状態
  when:
    - 実行操作
  then:
    - 期待結果
`;
      
      const result = validateTestCase(validYaml);
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });
});