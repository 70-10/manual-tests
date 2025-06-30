import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initProject } from '../../src/tools/manual-test-init';
import type { InitProjectInput, InitResult } from '../../src/models';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('manual-test-init', () => {
  const testDir = path.join(process.cwd(), 'test-temp-init');

  beforeEach(async () => {
    // Ensure clean test environment
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Cleanup
    process.chdir(process.cwd().replace('/test-temp-init', ''));
    await fs.remove(testDir);
  });

  describe('initProject', () => {
    describe('基本的なプロジェクト初期化', () => {
      it('最小構成でプロジェクトを初期化できる', async () => {
        const input: InitProjectInput = {
          projectName: 'test-project',
          baseUrl: 'https://example.com'
        };

        const result = await initProject(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.createdDirectories).toContain('tests/manual-tests');
          expect(result.createdDirectories).toContain('tests/manual-tests/test-cases');
          expect(result.createdDirectories).toContain('tests/manual-tests/test-results');
          expect(result.createdFiles).toContain('tests/manual-tests/project-meta.yml');
          expect(result.createdFiles).toContain('tests/manual-tests/README.md');
        }
      });

      it('作成されたproject-meta.ymlが正しい構造を持つ', async () => {
        const input: InitProjectInput = {
          projectName: 'test-project',
          baseUrl: 'https://example.com',
          environments: {
            production: 'https://example.com',
            staging: 'https://staging.example.com'
          }
        };

        const result = await initProject(input);

        expect(result.success).toBe(true);

        const projectMetaPath = 'tests/manual-tests/project-meta.yml';
        const exists = await fs.pathExists(projectMetaPath);
        expect(exists).toBe(true);

        const content = await fs.readFile(projectMetaPath, 'utf-8');
        expect(content).toContain('project:');
        expect(content).toContain('name: test-project');
        expect(content).toContain('environments:');
        expect(content).toContain('production: https://example.com');
        expect(content).toContain('staging: https://staging.example.com');
        expect(content).toContain('features:');
        expect(content).toContain('test_data:');
        expect(content).toContain('common_selectors:');
      });

      it('README.mdが作成される', async () => {
        const input: InitProjectInput = {
          projectName: 'test-project',
          baseUrl: 'https://example.com'
        };

        const result = await initProject(input);

        expect(result.success).toBe(true);

        const readmePath = 'tests/manual-tests/README.md';
        const exists = await fs.pathExists(readmePath);
        expect(exists).toBe(true);

        const content = await fs.readFile(readmePath, 'utf-8');
        expect(content).toContain('# Manual Tests');
        expect(content).toContain('test-project');
        expect(content).toContain('## 使用方法');
        expect(content).toContain('## ディレクトリ構造');
      });
    });

    describe('カスタム設定でのプロジェクト初期化', () => {
      it('カスタム機能リスト付きで初期化できる', async () => {
        const input: InitProjectInput = {
          projectName: 'custom-project',
          baseUrl: 'https://custom.com',
          features: [
            { name: 'login', description: 'ユーザーログイン機能' },
            { name: 'search', description: '商品検索機能' }
          ]
        };

        const result = await initProject(input);

        expect(result.success).toBe(true);

        const projectMetaPath = 'tests/manual-tests/project-meta.yml';
        const content = await fs.readFile(projectMetaPath, 'utf-8');
        expect(content).toContain('name: login');
        expect(content).toContain('description: ユーザーログイン機能');
        expect(content).toContain('name: search');
        expect(content).toContain('description: 商品検索機能');
      });

      it('テストデータテンプレート有効化', async () => {
        const input: InitProjectInput = {
          projectName: 'test-project',
          baseUrl: 'https://example.com',
          testDataTemplate: true
        };

        const result = await initProject(input);

        expect(result.success).toBe(true);

        const projectMetaPath = 'tests/manual-tests/project-meta.yml';
        const content = await fs.readFile(projectMetaPath, 'utf-8');
        expect(content).toContain('users:');
        expect(content).toContain('valid_user:');
        expect(content).toContain('username:');
        expect(content).toContain('password:');
        expect(content).toContain('products:');
        expect(content).toContain('sample_product:');
      });

      it('MCP設定ファイルを作成する', async () => {
        const input: InitProjectInput = {
          projectName: 'test-project',
          baseUrl: 'https://example.com',
          mcpConfig: true
        };

        const result = await initProject(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.createdFiles).toContain('.mcp.json');
        }

        const mcpConfigPath = '.mcp.json';
        const exists = await fs.pathExists(mcpConfigPath);
        expect(exists).toBe(true);

        const content = await fs.readFile(mcpConfigPath, 'utf-8');
        const config = JSON.parse(content);
        expect(config.mcpServers).toBeDefined();
        expect(config.mcpServers['manual-tests']).toBeDefined();
        expect(config.mcpServers['manual-tests'].type).toBe('stdio');
      });
    });

    describe('既存ファイルの処理', () => {
      it('既存ファイルがある場合はエラーを返す', async () => {
        // 既存ファイルを作成
        await fs.ensureDir('tests/manual-tests');
        await fs.writeFile('tests/manual-tests/project-meta.yml', 'existing content');

        const input: InitProjectInput = {
          projectName: 'test-project',
          baseUrl: 'https://example.com'
        };

        const result = await initProject(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('already exists');
        }
      });

      it('force=trueで既存ファイルを上書きできる', async () => {
        // 既存ファイルを作成
        await fs.ensureDir('tests/manual-tests');
        await fs.writeFile('tests/manual-tests/project-meta.yml', 'existing content');

        const input: InitProjectInput = {
          projectName: 'test-project',
          baseUrl: 'https://example.com',
          force: true
        };

        const result = await initProject(input);

        expect(result.success).toBe(true);

        const content = await fs.readFile('tests/manual-tests/project-meta.yml', 'utf-8');
        expect(content).not.toBe('existing content');
        expect(content).toContain('name: test-project');
      });
    });

    describe('ディレクトリ構造', () => {
      it('必要なディレクトリがすべて作成される', async () => {
        const input: InitProjectInput = {
          projectName: 'test-project',
          baseUrl: 'https://example.com'
        };

        const result = await initProject(input);

        expect(result.success).toBe(true);

        const expectedDirs = [
          'tests/manual-tests',
          'tests/manual-tests/test-cases',
          'tests/manual-tests/test-results',
          'tests/manual-tests/templates'
        ];

        for (const dir of expectedDirs) {
          const exists = await fs.pathExists(dir);
          expect(exists).toBe(true);
        }
      });

      it('テンプレートファイルが作成される', async () => {
        const input: InitProjectInput = {
          projectName: 'test-project',
          baseUrl: 'https://example.com'
        };

        const result = await initProject(input);

        expect(result.success).toBe(true);

        const templatePath = 'tests/manual-tests/templates/test-case-template.yml';
        const exists = await fs.pathExists(templatePath);
        expect(exists).toBe(true);

        const content = await fs.readFile(templatePath, 'utf-8');
        expect(content).toContain('# テストケーステンプレート');
        expect(content).toContain('meta:');
        expect(content).toContain('scenario:');
      });
    });

    describe('エラーハンドリング', () => {
      it('空のprojectNameでエラーを返す', async () => {
        const input: InitProjectInput = {
          projectName: '',
          baseUrl: 'https://example.com'
        };

        const result = await initProject(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('projectName');
        }
      });

      it('無効なbaseUrlでエラーを返す', async () => {
        const input: InitProjectInput = {
          projectName: 'test-project',
          baseUrl: 'invalid-url'
        };

        const result = await initProject(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('baseUrl');
        }
      });

      it('無効なenvironmentsでエラーを返す', async () => {
        const input: InitProjectInput = {
          projectName: 'test-project',
          baseUrl: 'https://example.com',
          environments: {
            production: 'invalid-url'
          }
        };

        const result = await initProject(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('environments');
        }
      });
    });

    describe('作成されるファイルの内容', () => {
      it('project-meta.ymlに正しいデフォルト値が含まれる', async () => {
        const input: InitProjectInput = {
          projectName: 'default-test',
          baseUrl: 'https://default.com'
        };

        const result = await initProject(input);

        expect(result.success).toBe(true);

        const content = await fs.readFile('tests/manual-tests/project-meta.yml', 'utf-8');
        
        // プロジェクト情報
        expect(content).toContain('name: default-test');
        expect(content).toContain('version: 1.0.0');
        
        // 環境設定
        expect(content).toContain('production: https://default.com');
        
        // デフォルト機能
        expect(content).toContain('name: top-page');
        expect(content).toContain('name: login');
        
        // セレクタ例
        expect(content).toContain('login_form:');
        expect(content).toContain('username_field:');
      });

      it('MCP設定が正しく生成される', async () => {
        const input: InitProjectInput = {
          projectName: 'mcp-test',
          baseUrl: 'https://mcp.com',
          mcpConfig: true
        };

        const result = await initProject(input);

        expect(result.success).toBe(true);

        const content = await fs.readFile('.mcp.json', 'utf-8');
        const config = JSON.parse(content);
        
        expect(config.mcpServers['manual-tests'].command).toBe('npx');
        expect(config.mcpServers['manual-tests'].args).toContain('github:70-10/manual-tests-mcp');
      });
    });
  });
});