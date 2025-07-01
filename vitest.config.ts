import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'json-summary'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 75,
        functions: 80,
        branches: 75,
        statements: 75
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '**/*.test.ts',
        '**/*.d.ts',
        'src/index.ts', // CLI entry point
        'vitest.config.ts', // Configuration file
        'src/models/**/*-result.ts', // Type definition files
        'src/models/common.ts', // Type definition file
        'src/models/test-case.ts' // Type definition file
      ]
    },
    testTimeout: 10000,
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**']
  }
});