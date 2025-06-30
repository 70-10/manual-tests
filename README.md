# Manual Tests MCP Server

YAML-based manual test case management MCP server with 11 comprehensive tools for test automation workflows.

## Overview

**Manual Tests MCP Server** is a Model Context Protocol (MCP) server that streamlines manual testing workflows. It manages test cases in YAML format, supporting the entire test lifecycle from test execution tracking to report generation.

### Key Features

- **11 Comprehensive Tools** - Validation, parsing, listing, creation, initialization, results management, report generation, cleanup, help, workflows, and schemas
- **YAML-based Test Cases** - Structured test case management and validation
- **Advanced Filtering** - Advanced filtering and search capabilities for test cases and results
- **Template-based Creation** - Test case creation with multiple built-in templates
- **Variable Substitution** - Flexible test environment management through dynamic variable substitution
- **Results Management** - Test result analysis, report generation, and cleanup

### Available Tools

1. **manual_test_validate** - YAML test case structure and syntax validation
2. **manual_test_parse** - Test case parsing with variable substitution and content processing
3. **manual_test_list** - Test case listing with advanced filtering and sorting capabilities
4. **manual_test_create** - New test case creation using built-in templates
5. **manual_test_init** - Manual test project structure initialization
6. **manual_test_results_list** - Test results directory filtering and listing
7. **manual_test_results_report** - Comprehensive test execution report generation
8. **manual_test_results_clean** - Criteria-based test results directory cleanup
9. **manual_test_help** - Comprehensive help information for all tools
10. **manual_test_workflow** - Workflow information and recommended usage patterns
11. **manual_test_schema** - YAML/JSON structure and schema specifications

## Usage

### MCP Configuration

To use with Claude Code or other MCP-compatible clients, add the following to your MCP configuration:

```json
{
  "mcpServers": {
    "manual-tests": {
      "command": "npx",
      "args": ["github:70-10/manual-tests-mcp"]
    }
  }
}
```

### Basic Workflow

1. **Project Initialization** - Create project structure and metadata with `manual_test_init`
2. **Test Case Creation** - Generate template-based test cases with `manual_test_create`
3. **Validation** - Check YAML structure with `manual_test_validate`
4. **Execution Management** - Search test cases based on conditions with `manual_test_list`
5. **Report Generation** - Create comprehensive test result reports with `manual_test_results_report`

### Variable Substitution

You can use dynamic values in test cases:

- `{{today}}` - Current date (YYYY-MM-DD)
- `{{timestamp}}` - Current timestamp
- `{{environments.production}}` - Environment URL
- `{{test_data.users.valid_user.username}}` - Test data

## Development

### Building and Testing

```bash
# Build TypeScript
npm run build

# Run all tests (252 tests)
npm test

# Run with coverage
npm test:coverage

# Development mode with auto-rebuild
npm run dev
```

## License

MIT
