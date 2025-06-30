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

**Parameters:**
- `yamlContent` (string): YAML content of the test case to validate

**Example:**
```json
{
  "name": "manual_test_validate",
  "arguments": {
    "yamlContent": "meta:\n  id: TC-LOGIN-001\n  title: ログイン機能のテスト\n  priority: high\n  tags: [smoke, regression]\nscenario:\n  given:\n    - ユーザーがログアウト状態\n  when:\n    - ログインフォームにアクセス\n  then:\n    - フォームが表示される"
  }
}
```

**Response:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": [],
  "parsedData": { ... }
}
```

#### 2. manual_test_parse
Parses test cases with variable substitution and content processing.

**Parameters:**
- `yamlContent` (string): YAML content of the test case to parse
- `projectMeta` (object, optional): Project metadata for variable substitution

**Variable Types:**
- `{{today}}` - Current date in YYYY-MM-DD format
- `{{timestamp}}` - Current timestamp
- `{{environments.production}}` - Environment URL from project metadata
- `{{test_data.users.valid_user.username}}` - Test data from project metadata

**Example:**
```json
{
  "name": "manual_test_parse", 
  "arguments": {
    "yamlContent": "meta:\n  id: TC-LOGIN-001\n  title: ログイン機能のテスト\n  priority: high\nscenario:\n  given:\n    - 今日は {{today}} です\n  when:\n    - \"{{environments.production}}/login\" にアクセス\n    - ユーザー名 \"{{test_data.users.valid_user.username}}\" を入力\n  then:\n    - ログインが成功する",
    "projectMeta": {
      "environments": {
        "production": "https://example.com"
      },
      "test_data": {
        "users": {
          "valid_user": {
            "username": "test_user"
          }
        }
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "testCase": { ... },
  "processedSteps": {
    "given": ["今日は 2025-06-30 です"],
    "when": ["https://example.com/login にアクセス", "ユーザー名 test_user を入力"],
    "then": ["ログインが成功する"]
  },
  "warnings": []
}
```

#### 3. manual_test_list
Lists test cases with advanced filtering and sorting options.

**Parameters:**
- `dirPath` (string): Path to the directory containing test case files
- `filter` (object, optional): Filter options
  - `feature` (string): Filter by feature name
  - `priority` (string): Filter by priority (high, medium, low)
  - `tags` (array): Filter by tags
  - `author` (string): Filter by author
- `sortBy` (string, optional): Sort field (id, lastUpdated, priority, feature)

**Example:**
```json
{
  "name": "manual_test_list",
  "arguments": {
    "dirPath": "./tests/manual-tests/test-cases",
    "filter": {
      "priority": "high",
      "tags": ["smoke"]
    },
    "sortBy": "lastUpdated"
  }
}
```

**Response:**
```json
{
  "success": true,
  "testCases": [
    {
      "meta": {
        "id": "TC-LOGIN-001",
        "title": "ログイン機能のテスト",
        "priority": "high",
        "tags": ["smoke", "regression"]
      },
      "scenario": { ... },
      "fileName": "login-001.yml",
      "filePath": "/full/path/to/login-001.yml"
    }
  ],
  "totalCount": 1,
  "warnings": []
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

## Usage in Claude Code

### Validate Test Case
```
manual_test_validateツールを使って以下のYAMLをチェックしてください:

meta:
  id: TC-TEST-001
  title: テストケース
  priority: high
scenario:
  given: [初期状態]
  when: [操作]
  then: [期待結果]
```

### Parse with Variables
```
manual_test_parseツールを使って変数を置換してください:

YAML:
meta:
  id: TC-TEST-001
  title: 今日のテスト
  priority: high
scenario:
  given:
    - 今日は {{today}} です
  when:
    - {{environments.production}} にアクセス
  then:
    - 結果を確認

Project Meta:
{
  "environments": {
    "production": "https://example.com"
  }
}
```

### List Test Cases
```
manual_test_listツールを使ってtest-casesディレクトリから高優先度のテストケースを一覧してください:

{
  "dirPath": "./tests/manual-tests/test-cases",
  "filter": {
    "priority": "high"
  },
  "sortBy": "lastUpdated"
}
```

## Error Handling

All tools return structured error information:

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

Validation errors include specific field information:
```json
{
  "isValid": false,
  "errors": [
    "meta.id: ID format must be TC-[A-Z-]+-[NUMBER]",
    "scenario.given: Required"
  ],
  "warnings": []
}
```

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