# Manual Tests MCP Server

YAML-based manual test case management MCP server with 8 comprehensive tools for test automation workflows.

## Overview

A **Model Context Protocol (MCP) Server** that provides 8 powerful tools for manual testing workflows. Built with TypeScript following TDD principles, it serves as a comprehensive solution for YAML-based test case management, execution tracking, and report generation.

## Features

- **8 Comprehensive Tools** for complete test lifecycle management
- **YAML-based Test Cases** with structured validation and parsing
- **Advanced Filtering & Search** capabilities across test cases and results
- **Template-based Test Creation** with multiple built-in templates
- **Project Initialization** with configurable settings
- **Results Management** with cleanup and reporting tools
- **Type-safe Architecture** with Zod validation schemas
- **Comprehensive Test Coverage** (206+ tests, 85%+ coverage)

## Installation

```bash
npm install
npm run build
```

## MCP Server Usage

### Running the Server

```bash
# Start the MCP server
npx github:70-10/manual-tests-mcp

# Or run directly
node dist/mcp-server.js
```

### Available Tools

The MCP server exposes 8 tools via JSON-RPC 2.0 protocol:

#### 1. manual_test_validate
Validates YAML test case structure and syntax.

```json
{
  "name": "manual_test_validate",
  "arguments": {
    "yamlContent": "meta:\n  id: TC-001\n  title: Test case..."
  }
}
```

#### 2. manual_test_parse
Parses test cases with variable substitution and content processing.

```json
{
  "name": "manual_test_parse", 
  "arguments": {
    "yamlContent": "meta:\n  id: TC-001\n...",
    "projectMeta": {
      "environments": {"prod": "https://example.com"},
      "test_data": {"user": "testuser"}
    }
  }
}
```

#### 3. manual_test_list
Lists test cases with advanced filtering and sorting options.

```json
{
  "name": "manual_test_list",
  "arguments": {
    "dirPath": "./test-cases",
    "filter": {
      "priority": "high",
      "feature": "login",
      "tags": ["smoke"]
    },
    "sortBy": "priority"
  }
}
```

#### 4. manual_test_create
Creates new test cases using built-in templates.

```json
{
  "name": "manual_test_create",
  "arguments": {
    "template": "login",
    "meta": {
      "title": "User Login Test",
      "feature": "authentication", 
      "priority": "high",
      "author": "Test Author"
    },
    "scenario": {
      "given": ["User is on login page"],
      "when": ["User enters credentials"],
      "then": ["User is logged in successfully"]
    }
  }
}
```

#### 5. manual_test_init
Initializes a new manual test project structure.

```json
{
  "name": "manual_test_init",
  "arguments": {
    "projectName": "My Test Project",
    "baseUrl": "https://example.com",
    "features": [
      {"name": "Login", "description": "User authentication"}
    ],
    "environments": {
      "production": "https://prod.example.com",
      "staging": "https://staging.example.com"
    }
  }
}
```

#### 6. manual_test_results_list
Lists test result directories with filtering and sorting.

```json
{
  "name": "manual_test_results_list",
  "arguments": {
    "dirPath": "./test-results",
    "filter": {
      "status": "failed",
      "dateFrom": "2024-01-01",
      "dateTo": "2024-12-31"
    },
    "sortBy": "date"
  }
}
```

#### 7. manual_test_results_report
Generates comprehensive test execution reports.

```json
{
  "name": "manual_test_results_report",
  "arguments": {
    "resultsDir": "./test-results", 
    "outputPath": "./report.md",
    "format": "markdown",
    "title": "Test Execution Report",
    "includeSummary": true,
    "includeScreenshots": true
  }
}
```

#### 8. manual_test_results_clean
Cleans up test result directories based on criteria.

```json
{
  "name": "manual_test_results_clean",
  "arguments": {
    "resultsDir": "./test-results",
    "criteria": {
      "olderThanDays": 30,
      "largerThanMB": 100,
      "includeStatuses": ["passed"]
    },
    "dryRun": true
  }
}
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
# Run all tests (206+ tests)
npm test

# Run with coverage
npm test:coverage

# Run specific test file
npx vitest tests/tools/manual-test-validate.test.ts

# Watch mode
npx vitest --watch
```

### Development Mode

```bash
npm run dev
```

## Architecture

### Core Components

- **MCP Server** (`src/mcp-server.ts`) - JSON-RPC 2.0 server exposing all tools
- **Models Layer** (`src/models/`) - Type definitions and interfaces
- **Tools Layer** (`src/tools/`) - Implementation of all 8 tools
- **Schema Layer** (`src/schemas/`) - Zod validation schemas

### Strategy Pattern Implementation

The codebase uses Strategy pattern for extensibility:

- **Variable Resolution** - Pluggable variable resolvers
- **Filtering** - Composable filter strategies  
- **Template Management** - Template-specific generators
- **File System Operations** - Abstracted FS operations
- **Cleanup Criteria** - Multiple cleanup strategies

### Type Safety

- **Central Type Hub** - All types exported through `src/models/index.ts`
- **Zod Validation** - Runtime type checking with compile-time inference
- **Result Types** - Consistent success/error result patterns
- **Generic Patterns** - Reusable generic types for common operations

## Project Structure

```
src/
├── mcp-server.ts              # MCP Server integration
├── models/                    # Type definitions
│   ├── index.ts              # Central export hub
│   ├── test-case.ts          # Core test case types
│   ├── *-result.ts           # Result types for each tool
│   └── common.ts             # Shared types
├── tools/                     # Tool implementations
│   ├── manual-test-*.ts      # Main tool functions
│   ├── generators/           # Generation utilities
│   ├── managers/             # Management utilities  
│   ├── templates/            # Template definitions
│   └── validators/           # Input validation
└── schemas/                   # Zod validation schemas

tests/
├── tools/                     # Tool-specific tests
│   ├── manual-test-validate.test.ts
│   ├── manual-test-parse.test.ts
│   ├── manual-test-list.test.ts
│   ├── manual-test-create.test.ts
│   ├── manual-test-init.test.ts
│   ├── manual-test-results-list.test.ts
│   ├── manual-test-results-report.test.ts
│   └── manual-test-results-clean.test.ts
└── utils/                     # Test utilities
```

## Configuration

### MCP Configuration

Add to your MCP settings:

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

### Claude Code Integration

When using with Claude Code, the server automatically integrates with the MCP protocol to provide seamless test management capabilities.

## Key Dependencies

- **@modelcontextprotocol/sdk** - MCP server implementation
- **zod** - Runtime schema validation
- **fs-extra** - Enhanced file system operations
- **js-yaml** - YAML parsing and generation
- **vitest** - Testing framework with v8 coverage

## Contributing

1. Follow TDD approach with Red→Green→Refactor cycles
2. Maintain 85%+ test coverage
3. Use TypeScript strict mode
4. Follow existing Strategy pattern architecture
5. Add comprehensive tests for new tools

## License

MIT