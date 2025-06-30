import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listTestResults } from '../../src/tools/manual-test-results-list';
import type { ResultsListInput, ResultsListResult } from '../../src/models';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('manual-test-results-list', () => {
  const testDir = path.join(process.cwd(), 'test-temp-results');
  const resultsDir = path.join(testDir, 'test-results');

  beforeEach(async () => {
    // Ensure clean test environment
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    await fs.ensureDir(resultsDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Cleanup
    process.chdir(process.cwd().replace('/test-temp-results', ''));
    await fs.remove(testDir);
  });

  describe('listTestResults', () => {
    describe('基本的な結果一覧', () => {
      it('空のディレクトリで空の結果を返す', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toEqual([]);
          expect(result.totalCount).toBe(0);
          expect(result.filteredCount).toBe(0);
        }
      });

      it('テスト結果ディレクトリを一覧表示できる', async () => {
        // Create sample test result directories
        const resultDirs = [
          '20250630_TC-LOGIN-001',
          '20250629_TC-FORM-002',
          '20250628_TC-API-003'
        ];

        for (const dir of resultDirs) {
          const dirPath = path.join(resultsDir, dir);
          await fs.ensureDir(dirPath);
          
          // Create report.md
          await fs.writeFile(path.join(dirPath, 'report.md'), `# Test Report for ${dir}

## 実行結果
- テストID: ${dir.split('_')[1]}
- 実行日: ${dir.split('_')[0]}
- ステータス: passed
- 実行者: test-user
- 環境: production
- ブラウザ: chrome
- 実行時間: 1500ms

## 詳細
テストが正常に完了しました。
`);

          // Create screenshot.png
          await fs.writeFile(path.join(dirPath, 'screenshot.png'), 'fake-screenshot-data');
        }

        const input: ResultsListInput = {
          resultsDir: resultsDir
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(3);
          expect(result.totalCount).toBe(3);
          expect(result.filteredCount).toBe(3);
          
          // Check first result structure
          const firstResult = result.results[0];
          expect(firstResult.meta.testId).toMatch(/^TC-\w+-\d+$/);
          expect(firstResult.meta.status).toBe('passed');
          expect(firstResult.reportPath).toContain('report.md');
          expect(firstResult.screenshotPath).toContain('screenshot.png');
        }
      });

      it('レポートファイルからメタデータを抽出できる', async () => {
        const resultDir = '20250630_TC-LOGIN-001';
        const dirPath = path.join(resultsDir, resultDir);
        await fs.ensureDir(dirPath);

        await fs.writeFile(path.join(dirPath, 'report.md'), `# Test Report

## 実行結果
- テストID: TC-LOGIN-001
- 実行日: 2025-06-30
- ステータス: failed
- 実行者: john-doe
- 環境: staging
- ブラウザ: firefox
- 実行時間: 2500ms

## エラー詳細
ログインボタンが見つかりませんでした。
`);

        const input: ResultsListInput = {
          resultsDir: resultsDir
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(1);
          const testResult = result.results[0];
          
          expect(testResult.meta.testId).toBe('TC-LOGIN-001');
          expect(testResult.meta.status).toBe('failed');
          expect(testResult.meta.executor).toBe('john-doe');
          expect(testResult.meta.environment).toBe('staging');
          expect(testResult.meta.browser).toBe('firefox');
          expect(testResult.meta.duration).toBe(2500);
        }
      });
    });

    describe('フィルタリング機能', () => {
      beforeEach(async () => {
        // Create multiple test results with different statuses
        const testResults = [
          { dir: '20250630_TC-LOGIN-001', date: '2025-06-30', status: 'passed', executor: 'alice', environment: 'production' },
          { dir: '20250629_TC-LOGIN-002', date: '2025-06-29', status: 'failed', executor: 'bob', environment: 'staging' },
          { dir: '20250628_TC-FORM-001', date: '2025-06-28', status: 'passed', executor: 'alice', environment: 'production' },
          { dir: '20250627_TC-API-001', date: '2025-06-27', status: 'skipped', executor: 'charlie', environment: 'development' }
        ];

        for (const { dir, date, status, executor, environment } of testResults) {
          const dirPath = path.join(resultsDir, dir);
          await fs.ensureDir(dirPath);
          
          await fs.writeFile(path.join(dirPath, 'report.md'), `# Test Report

## 実行結果
- テストID: ${dir.split('_')[1]}
- 実行日: ${date}
- ステータス: ${status}
- 実行者: ${executor}
- 環境: ${environment}
- ブラウザ: chrome
- 実行時間: 1000ms
`);
        }
      });

      it('ステータスでフィルタリングできる', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          filter: {
            status: 'passed'
          }
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(2);
          expect(result.filteredCount).toBe(2);
          expect(result.totalCount).toBe(4);
          
          result.results.forEach(testResult => {
            expect(testResult.meta.status).toBe('passed');
          });
        }
      });

      it('実行者でフィルタリングできる', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          filter: {
            executor: 'alice'
          }
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(2);
          result.results.forEach(testResult => {
            expect(testResult.meta.executor).toBe('alice');
          });
        }
      });

      it('環境でフィルタリングできる', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          filter: {
            environment: 'production'
          }
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(2);
          result.results.forEach(testResult => {
            expect(testResult.meta.environment).toBe('production');
          });
        }
      });

      it('テストIDでフィルタリングできる', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          filter: {
            testId: 'TC-LOGIN-001'
          }
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(1);
          expect(result.results[0].meta.testId).toBe('TC-LOGIN-001');
        }
      });

      it('日付範囲でフィルタリングできる', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          filter: {
            dateFrom: '2025-06-29',
            dateTo: '2025-06-30'
          }
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(2);
          result.results.forEach(testResult => {
            const date = testResult.meta.executionDate;
            expect(date >= '2025-06-29' && date <= '2025-06-30').toBe(true);
          });
        }
      });

      it('複数条件でフィルタリングできる', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          filter: {
            status: 'passed',
            executor: 'alice',
            environment: 'production'
          }
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(2);
          result.results.forEach(testResult => {
            expect(testResult.meta.status).toBe('passed');
            expect(testResult.meta.executor).toBe('alice');
            expect(testResult.meta.environment).toBe('production');
          });
        }
      });
    });

    describe('ソート機能', () => {
      beforeEach(async () => {
        // Create test results with different dates and durations
        const testResults = [
          { dir: '20250628_TC-LOGIN-001', date: '2025-06-28', duration: 3000 },
          { dir: '20250630_TC-LOGIN-002', date: '2025-06-30', duration: 1000 },
          { dir: '20250629_TC-LOGIN-003', date: '2025-06-29', duration: 2000 }
        ];

        for (const { dir, date, duration } of testResults) {
          const dirPath = path.join(resultsDir, dir);
          await fs.ensureDir(dirPath);
          
          await fs.writeFile(path.join(dirPath, 'report.md'), `# Test Report

## 実行結果
- テストID: ${dir.split('_')[1]}
- 実行日: ${date}
- ステータス: passed
- 実行者: test-user
- 環境: production
- ブラウザ: chrome
- 実行時間: ${duration}ms
`);
        }
      });

      it('実行日昇順でソートできる', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          sortBy: 'executionDate',
          sortOrder: 'asc'
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(3);
          expect(result.results[0].meta.executionDate).toBe('2025-06-28');
          expect(result.results[1].meta.executionDate).toBe('2025-06-29');
          expect(result.results[2].meta.executionDate).toBe('2025-06-30');
        }
      });

      it('実行日降順でソートできる', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          sortBy: 'executionDate',
          sortOrder: 'desc'
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(3);
          expect(result.results[0].meta.executionDate).toBe('2025-06-30');
          expect(result.results[1].meta.executionDate).toBe('2025-06-29');
          expect(result.results[2].meta.executionDate).toBe('2025-06-28');
        }
      });

      it('実行時間でソートできる', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          sortBy: 'duration',
          sortOrder: 'asc'
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(3);
          expect(result.results[0].meta.duration).toBe(1000);
          expect(result.results[1].meta.duration).toBe(2000);
          expect(result.results[2].meta.duration).toBe(3000);
        }
      });
    });

    describe('ページネーション', () => {
      beforeEach(async () => {
        // Create 5 test results
        for (let i = 1; i <= 5; i++) {
          const dir = `2025062${i}_TC-TEST-00${i}`;
          const dirPath = path.join(resultsDir, dir);
          await fs.ensureDir(dirPath);
          
          await fs.writeFile(path.join(dirPath, 'report.md'), `# Test Report

## 実行結果
- テストID: TC-TEST-00${i}
- 実行日: 2025-06-2${i}
- ステータス: passed
- 実行者: test-user
- 環境: production
- ブラウザ: chrome
- 実行時間: ${i * 1000}ms
`);
        }
      });

      it('limitで結果数を制限できる', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          limit: 3
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(3);
          expect(result.totalCount).toBe(5);
          expect(result.filteredCount).toBe(5);
        }
      });

      it('offsetで開始位置を指定できる', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          limit: 2,
          offset: 2
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(2);
          expect(result.totalCount).toBe(5);
          expect(result.filteredCount).toBe(5);
        }
      });
    });

    describe('エラーハンドリング', () => {
      it('存在しないディレクトリでエラーを返す', async () => {
        const input: ResultsListInput = {
          resultsDir: '/nonexistent/directory'
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('directory does not exist');
        }
      });

      it('無効な日付フィルタでエラーを返す', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          filter: {
            dateFrom: 'invalid-date'
          }
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Invalid date format');
        }
      });

      it('無効なソートフィールドでエラーを返す', async () => {
        const input: ResultsListInput = {
          resultsDir: resultsDir,
          sortBy: 'invalid' as any
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Invalid sort field');
        }
      });
    });

    describe('ファイル情報', () => {
      it('ファイルサイズと更新日時を取得できる', async () => {
        const resultDir = '20250630_TC-LOGIN-001';
        const dirPath = path.join(resultsDir, resultDir);
        await fs.ensureDir(dirPath);

        const reportContent = `# Test Report

## 実行結果
- テストID: TC-LOGIN-001
- 実行日: 2025-06-30
- ステータス: passed
- 実行者: test-user
- 環境: production
- ブラウザ: chrome
- 実行時間: 1500ms
`;

        await fs.writeFile(path.join(dirPath, 'report.md'), reportContent);
        await fs.writeFile(path.join(dirPath, 'screenshot.png'), 'fake-screenshot-data');

        const input: ResultsListInput = {
          resultsDir: resultsDir
        };

        const result = await listTestResults(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results).toHaveLength(1);
          const testResult = result.results[0];
          
          expect(testResult.size).toBeGreaterThan(0);
          expect(testResult.lastModified).toBeInstanceOf(Date);
          expect(testResult.directoryPath).toBe(dirPath);
        }
      });
    });
  });
});