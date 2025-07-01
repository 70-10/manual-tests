import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultProjectMetaGenerator } from '../../src/tools/generators/project-meta-generator';
import { DefaultFileContentGenerator } from '../../src/tools/generators/file-content-generator';
import { DefaultInitInputValidator } from '../../src/tools/validators/init-input-validator';
import { DirectoryStructure } from '../../src/tools/managers/file-system-manager';
import type { InitProjectInput } from '../../src/models';

describe('manual-test-init refactored components', () => {
  describe('ProjectMetaGenerator', () => {
    let generator: DefaultProjectMetaGenerator;

    beforeEach(() => {
      generator = new DefaultProjectMetaGenerator();
    });

    it('should generate basic project metadata', () => {
      const input: InitProjectInput = {
        projectName: 'test-project',
        baseUrl: 'https://example.com'
      };

      const result = generator.generateProjectMeta(input);

      expect(result.project.name).toBe('test-project');
      expect(result.project.version).toBe('1.0.0');
      expect(result.environments.production).toBe('https://example.com');
      expect(result.features).toHaveLength(2);
      expect(result.features[0].name).toBe('top-page');
      expect(result.features[1].name).toBe('login');
    });

    it('should use custom environments', () => {
      const input: InitProjectInput = {
        projectName: 'test-project',
        baseUrl: 'https://example.com',
        environments: {
          dev: 'https://dev.example.com',
          staging: 'https://staging.example.com',
          production: 'https://prod.example.com'
        }
      };

      const result = generator.generateProjectMeta(input);

      expect(result.environments).toEqual({
        dev: 'https://dev.example.com',
        staging: 'https://staging.example.com',
        production: 'https://prod.example.com'
      });
    });

    it('should use custom features', () => {
      const input: InitProjectInput = {
        projectName: 'test-project',
        baseUrl: 'https://example.com',
        features: [
          { name: 'custom-feature', description: 'カスタム機能' }
        ]
      };

      const result = generator.generateProjectMeta(input);

      expect(result.features).toHaveLength(1);
      expect(result.features[0].name).toBe('custom-feature');
      expect(result.features[0].description).toBe('カスタム機能');
      expect(result.features[0].enabled).toBe(true);
    });

    it('should generate extended test data when requested', () => {
      const input: InitProjectInput = {
        projectName: 'test-project',
        baseUrl: 'https://example.com',
        testDataTemplate: true
      };

      const result = generator.generateProjectMeta(input);

      expect(result.test_data.users.valid_user.email).toBe('test@example.com');
      expect(result.test_data.users.invalid_user).toBeDefined();
      expect(result.test_data.products).toBeDefined();
      expect(result.test_data.products.sample_product.name).toBe('サンプル商品');
    });

    it('should generate basic test data by default', () => {
      const input: InitProjectInput = {
        projectName: 'test-project',
        baseUrl: 'https://example.com'
      };

      const result = generator.generateProjectMeta(input);

      expect(result.test_data.users.valid_user.username).toBe('testuser');
      expect(result.test_data.users.valid_user.password).toBe('testpass123');
      expect(result.test_data.users.valid_user.email).toBeUndefined();
      expect(result.test_data.products).toBeUndefined();
    });
  });

  describe('FileContentGenerator', () => {
    let generator: DefaultFileContentGenerator;

    beforeEach(() => {
      generator = new DefaultFileContentGenerator();
    });

    it('should generate README with project name', () => {
      const input: InitProjectInput = {
        projectName: 'my-awesome-project',
        baseUrl: 'https://awesome.com'
      };

      const readme = generator.generateReadme(input);

      expect(readme).toContain('my-awesome-project');
      expect(readme).toContain('# Manual Tests');
      expect(readme).toContain('## 概要');
      expect(readme).toContain('## 使用方法');
      expect(readme).toContain('## ディレクトリ構造');
    });

    it('should generate test case template', () => {
      const template = generator.generateTestCaseTemplate();

      expect(template).toContain('# テストケーステンプレート');
      expect(template).toContain('meta:');
      expect(template).toContain('scenario:');
      expect(template).toContain('TC-<FEATURE-ID>-<SEQ>');
      expect(template).toContain('{{environments.production}}');
      expect(template).toContain('{{test_data.users.valid_user.username}}');
    });

  });

  describe('InitInputValidator', () => {
    let validator: DefaultInitInputValidator;

    beforeEach(() => {
      validator = new DefaultInitInputValidator();
    });

    it('should validate valid input', () => {
      const input: InitProjectInput = {
        projectName: 'valid-project',
        baseUrl: 'https://example.com'
      };

      const error = validator.validate(input);
      expect(error).toBeNull();
    });

    it('should validate project name requirements', () => {
      const testCases = [
        { projectName: '', expected: 'projectName cannot be empty' },
        { projectName: 'invalid project', expected: 'projectName can only contain' },
        { projectName: 'invalid@project', expected: 'projectName can only contain' }
      ];

      testCases.forEach(({ projectName, expected }) => {
        const input: InitProjectInput = {
          projectName,
          baseUrl: 'https://example.com'
        };

        const error = validator.validate(input);
        expect(error).not.toBeNull();
        expect(error).toContain('projectName');
      });
    });

    it('should validate base URL', () => {
      const testCases = [
        { baseUrl: '', expectedValid: false },
        { baseUrl: 'invalid-url', expectedValid: false },
        { baseUrl: 'ftp://example.com', expectedValid: true }
      ];

      testCases.forEach(({ baseUrl, expectedValid }) => {
        const input: InitProjectInput = {
          projectName: 'test',
          baseUrl
        };

        const error = validator.validate(input);
        if (expectedValid) {
          expect(error).toBeNull();
        } else {
          expect(error).not.toBeNull();
          expect(error).toContain('baseUrl');
        }
      });
    });

    it('should validate environments', () => {
      const input: InitProjectInput = {
        projectName: 'test',
        baseUrl: 'https://example.com',
        environments: {
          production: 'https://prod.com',
          staging: 'invalid-url'
        }
      };

      const error = validator.validate(input);
      expect(error).toContain('environments.staging must be a valid URL');
    });

    it('should validate features array', () => {
      const input: InitProjectInput = {
        projectName: 'test',
        baseUrl: 'https://example.com',
        features: [
          { name: 'feature1', description: 'Description 1' },
          { name: 'feature1', description: 'Description 2' } // Duplicate
        ]
      };

      const error = validator.validate(input);
      expect(error).toContain('Duplicate feature name: feature1');
    });

    it('should validate feature structure', () => {
      const input: InitProjectInput = {
        projectName: 'test',
        baseUrl: 'https://example.com',
        features: [
          { name: '', description: 'Description' } // Empty name
        ]
      };

      const error = validator.validate(input);
      expect(error).toContain('features[0].name is required');
    });
  });

  describe('DirectoryStructure', () => {
    it('should provide standard directories', () => {
      const directories = DirectoryStructure.getStandardDirectories();

      expect(directories).toContain('tests/manual-tests');
      expect(directories).toContain('tests/manual-tests/test-cases');
      expect(directories).toContain('tests/manual-tests/test-results');
      expect(directories).toContain('tests/manual-tests/templates');
    });

    it('should provide files to check', () => {
      const files = DirectoryStructure.getFilesToCheck();

      expect(files).toContain('tests/manual-tests/project-meta.yml');
      expect(files).toContain('tests/manual-tests/README.md');
    });

    it('should provide file paths', () => {
      const paths = DirectoryStructure.getFilePaths();

      expect(paths.projectMeta).toBe('tests/manual-tests/project-meta.yml');
      expect(paths.readme).toBe('tests/manual-tests/README.md');
      expect(paths.template).toBe('tests/manual-tests/templates/test-case-template.yml');
    });
  });
});