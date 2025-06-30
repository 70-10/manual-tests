# Manual Tests MCP Server

YAML-based manual test case management MCP server with 11 comprehensive tools for test automation workflows.

## Overview

**Manual Tests MCP Server** is a Model Context Protocol (MCP) server that streamlines manual testing workflows. It manages test cases in YAML format, supporting the entire test lifecycle from test execution tracking to report generation.

### 🎯 Quick Start for AI Agents

**New to this MCP server? Start with the workflow discovery tools:**

```bash
# Essential first steps - run these in order:
manual_test_workflow()    # Learn workflow patterns
manual_test_help()        # Get tool usage examples  
manual_test_schema()      # Understand data structures
```

These tools will guide you through all available workflows and usage patterns.

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

## Getting Started

### 🚀 First Steps - Essential for New Users

**Before using any other tools, start with these workflow discovery tools:**

```typescript
// 1. Get comprehensive help for all 11 tools
manual_test_help()

// 2. Learn recommended workflows and usage patterns  
manual_test_workflow()

// 3. Understand YAML/JSON schemas and variable substitution
manual_test_schema()
```

**Why start here?**
- **`manual_test_help`** provides detailed usage examples for all 11 tools
- **`manual_test_workflow`** shows you proven workflow patterns and integration strategies
- **`manual_test_schema`** gives you the complete structure specifications

These three tools contain all the guidance you need to effectively use this MCP server. **Always consult the workflow tool first** - it will save you time and ensure you follow best practices.

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

### First Steps - Start Here!

**🎯 Before doing anything else, run these discovery tools:**

1. **`manual_test_workflow`** - Learn the recommended workflow patterns
2. **`manual_test_help`** - Get detailed usage examples for all tools  
3. **`manual_test_schema`** - Understand the YAML/JSON structure requirements

### Basic Workflow (After Learning from Workflow Tool)

1. **Project Initialization** - Create project structure and metadata with `manual_test_init`
2. **Test Case Creation** - Generate template-based test cases with `manual_test_create`
3. **Validation** - Check YAML structure with `manual_test_validate`
4. **Execution Management** - Search test cases based on conditions with `manual_test_list`
5. **Report Generation** - Create comprehensive test result reports with `manual_test_results_report`

> 💡 **Pro Tip**: The workflow tool (`manual_test_workflow`) provides 4 different workflow patterns with specific tool sequences. Always check it first!

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
