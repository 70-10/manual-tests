import { describe, it, expect } from 'vitest';
import { createTestCase } from '../../src/tools/manual-test-create';
import type { CreateTestCaseInput, CreateResult } from '../../src/models';

describe('manual-test-create', () => {
  describe('createTestCase', () => {
    describe('基本的なテストケース作成', () => {
      it('login templateで基本的なテストケースを作成できる', () => {
        const input: CreateTestCaseInput = {
          template: 'login',
          meta: {
            title: 'ログイン機能のテスト',
            feature: 'login',
            priority: 'high',
            tags: ['smoke', 'regression'],
            author: 'test-user'
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.yamlContent).toContain('meta:');
          expect(result.yamlContent).toContain('title: ログイン機能のテスト');
          expect(result.yamlContent).toContain('feature: login');
          expect(result.yamlContent).toContain('priority: high');
          expect(result.yamlContent).toContain('tags: [smoke, regression]');
          expect(result.yamlContent).toContain('author: test-user');
          expect(result.generatedId).toMatch(/^TC-LOGIN-\d{3}$/);
        }
      });

      it('form templateで基本的なテストケースを作成できる', () => {
        const input: CreateTestCaseInput = {
          template: 'form',
          meta: {
            title: 'フォーム入力のテスト',
            feature: 'form',
            priority: 'medium'
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.yamlContent).toContain('title: フォーム入力のテスト');
          expect(result.yamlContent).toContain('feature: form');
          expect(result.yamlContent).toContain('priority: medium');
          expect(result.generatedId).toMatch(/^TC-FORM-\d{3}$/);
        }
      });

      it('navigation templateで基本的なテストケースを作成できる', () => {
        const input: CreateTestCaseInput = {
          template: 'navigation',
          meta: {
            title: 'ナビゲーションのテスト',
            feature: 'navigation',
            priority: 'low'
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.yamlContent).toContain('title: ナビゲーションのテスト');
          expect(result.yamlContent).toContain('feature: navigation');
          expect(result.yamlContent).toContain('priority: low');
          expect(result.generatedId).toMatch(/^TC-NAVIGATION-\d{3}$/);
        }
      });

      it('api templateで基本的なテストケースを作成できる', () => {
        const input: CreateTestCaseInput = {
          template: 'api',
          meta: {
            title: 'API呼び出しのテスト',
            feature: 'api',
            priority: 'high'
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.yamlContent).toContain('title: API呼び出しのテスト');
          expect(result.yamlContent).toContain('feature: api');
          expect(result.yamlContent).toContain('priority: high');
          expect(result.generatedId).toMatch(/^TC-API-\d{3}$/);
        }
      });
    });

    describe('カスタムシナリオ付きテストケース作成', () => {
      it('カスタムシナリオを含むテストケースを作成できる', () => {
        const input: CreateTestCaseInput = {
          template: 'login',
          meta: {
            title: 'ログイン機能のテスト',
            feature: 'login',
            priority: 'high'
          },
          scenario: {
            given: ['ユーザーがログアウト状態である'],
            when: ['ログインページにアクセスする', 'ユーザー名とパスワードを入力する'],
            then: ['ダッシュボードにリダイレクトされる']
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.yamlContent).toContain('given:');
          expect(result.yamlContent).toContain('- ユーザーがログアウト状態である');
          expect(result.yamlContent).toContain('when:');
          expect(result.yamlContent).toContain('- ログインページにアクセスする');
          expect(result.yamlContent).toContain('- ユーザー名とパスワードを入力する');
          expect(result.yamlContent).toContain('then:');
          expect(result.yamlContent).toContain('- ダッシュボードにリダイレクトされる');
        }
      });

      it('部分的なカスタムシナリオでもテンプレートと結合できる', () => {
        const input: CreateTestCaseInput = {
          template: 'form',
          meta: {
            title: 'フォーム送信のテスト',
            feature: 'form',
            priority: 'medium'
          },
          scenario: {
            given: ['フォームページが表示されている'],
            // when と then はテンプレートから補完される
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.yamlContent).toContain('given:');
          expect(result.yamlContent).toContain('- フォームページが表示されている');
          expect(result.yamlContent).toContain('when:');
          expect(result.yamlContent).toContain('then:');
        }
      });
    });

    describe('エラーハンドリング', () => {
      it('無効なtemplateでエラーを返す', () => {
        const input = {
          template: 'invalid' as any,
          meta: {
            title: 'テスト',
            feature: 'test',
            priority: 'high' as const
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Invalid template');
        }
      });

      it('空のtitleでエラーを返す', () => {
        const input: CreateTestCaseInput = {
          template: 'login',
          meta: {
            title: '',
            feature: 'login',
            priority: 'high'
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('title');
        }
      });

      it('空のfeatureでエラーを返す', () => {
        const input: CreateTestCaseInput = {
          template: 'login',
          meta: {
            title: 'テスト',
            feature: '',
            priority: 'high'
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('feature');
        }
      });

      it('無効なpriorityでエラーを返す', () => {
        const input = {
          template: 'login' as const,
          meta: {
            title: 'テスト',
            feature: 'login',
            priority: 'invalid' as any
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('priority');
        }
      });
    });

    describe('ID生成', () => {
      it('featureに基づいて適切なIDを生成する', () => {
        const testCases = [
          { feature: 'login', expectedPrefix: 'TC-LOGIN-' },
          { feature: 'user-management', expectedPrefix: 'TC-USER_MANAGEMENT-' },
          { feature: 'product-search', expectedPrefix: 'TC-PRODUCT_SEARCH-' },
          { feature: 'api-integration', expectedPrefix: 'TC-API_INTEGRATION-' }
        ];

        testCases.forEach(({ feature, expectedPrefix }) => {
          const input: CreateTestCaseInput = {
            template: 'form',
            meta: {
              title: `${feature}のテスト`,
              feature,
              priority: 'medium'
            }
          };

          const result = createTestCase(input);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.generatedId).toMatch(new RegExp(`^${expectedPrefix.replace(/[-]/g, '\\-')}\\d{3}$`));
          }
        });
      });

      it('同じfeatureでも異なるIDを生成する', () => {
        const input: CreateTestCaseInput = {
          template: 'login',
          meta: {
            title: 'ログインテスト',
            feature: 'login',
            priority: 'high'
          }
        };

        const result1 = createTestCase(input);
        const result2 = createTestCase(input);

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);

        if (result1.success && result2.success) {
          expect(result1.generatedId).not.toBe(result2.generatedId);
        }
      });
    });

    describe('YAML構造', () => {
      it('生成されたYAMLが正しい構造を持つ', () => {
        const input: CreateTestCaseInput = {
          template: 'login',
          meta: {
            title: 'ログイン機能のテスト',
            feature: 'login',
            priority: 'high',
            tags: ['smoke'],
            author: 'tester'
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(true);
        if (result.success) {
          const yamlLines = result.yamlContent.split('\n');
          
          // メタデータセクション
          expect(yamlLines).toContain('meta:');
          expect(yamlLines.some(line => line.includes('id:'))).toBe(true);
          expect(yamlLines.some(line => line.includes('title:'))).toBe(true);
          expect(yamlLines.some(line => line.includes('feature:'))).toBe(true);
          expect(yamlLines.some(line => line.includes('priority:'))).toBe(true);
          expect(yamlLines.some(line => line.includes('tags:'))).toBe(true);
          expect(yamlLines.some(line => line.includes('author:'))).toBe(true);
          expect(yamlLines.some(line => line.includes('lastUpdated:'))).toBe(true);

          // シナリオセクション
          expect(yamlLines).toContain('scenario:');
          expect(yamlLines.some(line => line.includes('given:'))).toBe(true);
          expect(yamlLines.some(line => line.includes('when:'))).toBe(true);
          expect(yamlLines.some(line => line.includes('then:'))).toBe(true);
        }
      });

      it('tagsとauthorが省略された場合でも正しいYAMLを生成する', () => {
        const input: CreateTestCaseInput = {
          template: 'form',
          meta: {
            title: 'フォームテスト',
            feature: 'form',
            priority: 'low'
          }
        };

        const result = createTestCase(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.yamlContent).toContain('title: フォームテスト');
          expect(result.yamlContent).toContain('feature: form');
          expect(result.yamlContent).toContain('priority: low');
          // tags と author は含まれない、または空の値
          expect(result.yamlContent).not.toContain('tags: []');
          expect(result.yamlContent).not.toContain('author: ""');
        }
      });
    });
  });
});