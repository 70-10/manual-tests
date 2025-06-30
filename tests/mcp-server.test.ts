import { describe, it, expect } from 'vitest';
import { ManualTestsServer } from '../src/mcp-server';

describe('ManualTestsServer', () => {
  describe('Server initialization', () => {
    it('should create server instance', () => {
      const server = new ManualTestsServer();
      expect(server).toBeInstanceOf(ManualTestsServer);
    });
  });

  describe('Integration with existing tools', () => {
    it('should have access to all tool functions', async () => {
      // Test that the MCP server can access the underlying tool functions
      const { validateTestCase } = await import('../src/tools/manual-test-validate');
      const { parseTestCase } = await import('../src/tools/manual-test-parse');
      const { listTestCases } = await import('../src/tools/manual-test-list');
      
      expect(typeof validateTestCase).toBe('function');
      expect(typeof parseTestCase).toBe('function');
      expect(typeof listTestCases).toBe('function');
    });

    it('should have validate tool integration', async () => {
      const { validateTestCase } = await import('../src/tools/manual-test-validate');
      
      const yamlContent = `
meta:
  id: TC-TEST-001
  title: Test case
  priority: high
scenario:
  given:
    - Initial state
  when:
    - Action
  then:
    - Expected result
`;
      
      const result = validateTestCase(yamlContent);
      expect(result.isValid).toBe(true);
    });

    it('should have parse tool integration', async () => {
      const { parseTestCase } = await import('../src/tools/manual-test-parse');
      
      const yamlContent = `
meta:
  id: TC-TEST-001
  title: Test with variables
  priority: high
scenario:
  given:
    - Today is {{today}}
  when:
    - Action
  then:
    - Result
`;
      
      const result = parseTestCase(yamlContent);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.processedSteps.given[0]).toMatch(/Today is \d{4}-\d{2}-\d{2}/);
      }
    });
  });

  describe('Build verification', () => {
    it('should have compiled MCP server entry point', async () => {
      // Check that the built file exists
      const fs = await import('fs-extra');
      const path = await import('path');
      
      const builtFile = path.join(process.cwd(), 'dist', 'mcp-server.js');
      const exists = await fs.pathExists(builtFile);
      expect(exists).toBe(true);
    });

    it('should export ManualTestsServer class', () => {
      expect(ManualTestsServer).toBeDefined();
      expect(typeof ManualTestsServer).toBe('function');
    });
  });
});