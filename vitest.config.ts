import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '**/*.test.ts',
        '**/*.d.ts',
        'src/index.ts' // CLI entry point
      ]
    },
    testTimeout: 10000,
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**']
  }
});