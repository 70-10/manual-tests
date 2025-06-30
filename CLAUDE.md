# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Guidelines

- やりとりは日本語を使用してください
- コードのコメントやテストケースなどは英語で書いてください
- Git コミットのメッセージは英語で書いてください

## Architecture

This is a **Manual Tests MCP Server** that provides 8 comprehensive tools for YAML-based test case management. Built with TypeScript and following TDD principles, it serves as a Model Context Protocol (MCP) server for manual testing workflows.

**Core Architecture:**
- **MCP Server** (`src/mcp-server.ts`) - Central server exposing all 8 tools via JSON-RPC 2.0 protocol
- **Models Layer** (`src/models/`) - Complete type definitions and interfaces for all operations
- **Tools Layer** (`src/tools/`) - Implementation of all 8 tools with Strategy pattern architecture
- **Schema Layer** (`src/schemas/`) - Zod validation schemas for type safety

**Available Tools:**
1. **manual_test_validate** - YAML test case structure validation
2. **manual_test_parse** - Variable substitution and content parsing  
3. **manual_test_list** - Test case listing with advanced filtering
4. **manual_test_create** - Template-based test case creation
5. **manual_test_init** - Project structure initialization
6. **manual_test_results_list** - Test results listing and analysis
7. **manual_test_results_report** - Comprehensive report generation
8. **manual_test_results_clean** - Advanced cleanup with multiple criteria

## Development Commands

### Building and Testing
```bash
# Build TypeScript to CommonJS
npm run build

# Run all tests (206 tests)
npm test

# Run tests with coverage
npm test:coverage

# Run tests for CI (single run with coverage)
npm test:ci

# Development mode with auto-rebuild
npm run dev
```

### Running the MCP Server
```bash
# After build, run the MCP server
npx manual-tests-mcp

# Or via the compiled binary
node dist/mcp-server.js
```

### Running Individual Tests
```bash
# Run specific test file
npx vitest tests/tools/manual-test-validate.test.ts

# Run tests matching pattern
npx vitest tests/tools/manual-test-results*

# Run tests in watch mode
npx vitest --watch tests/tools/manual-test-parse.test.ts
```

## Code Architecture Deep Dive

### Layered Architecture
```
src/
├── mcp-server.ts              # MCP Server integration (all 8 tools)
├── models/                    # Type definitions (centralized exports)
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
```

### Strategy Pattern Implementation
The codebase extensively uses Strategy pattern for extensibility:

- **Variable Resolution** (`manual-test-parse`): Pluggable variable resolvers
- **Filtering** (`manual-test-list`): Composable filter strategies  
- **Template Management** (`manual-test-create`): Template-specific generators
- **File System Operations** (`manual-test-init`): Abstracted FS operations
- **Cleanup Criteria** (`manual-test-results-clean`): Multiple cleanup strategies

### Type Safety Strategy
- **Central Type Hub**: All types exported through `src/models/index.ts`
- **Zod Validation**: Runtime type checking with compile-time inference
- **Result Types**: Consistent success/error result patterns across all tools
- **Generic Patterns**: Reusable generic types for common operations

## Testing Strategy

### Test Structure (206 total tests)
```
tests/
├── tools/
│   ├── manual-test-validate.test.ts     # Validation tool tests
│   ├── manual-test-parse.test.ts        # Parsing tool tests  
│   ├── manual-test-list.test.ts         # Listing tool tests
│   ├── manual-test-create.test.ts       # Creation tool tests
│   ├── manual-test-init.test.ts         # Initialization tool tests
│   ├── manual-test-results-list.test.ts # Results listing tests
│   ├── manual-test-results-report.test.ts # Report generation tests
│   └── manual-test-results-clean.test.ts  # Cleanup tool tests
└── utils/                               # Test utilities
```

### TDD Implementation
- **Red→Green→Refactor** cycles applied to all 8 tools
- **85%+ coverage** maintained across codebase
- **Comprehensive edge case testing** including error conditions
- **Integration testing** for MCP server functionality

## MCP Integration Details

### Server Configuration
- **Protocol**: JSON-RPC 2.0 via stdio transport
- **Capabilities**: Tools only (no resources/prompts)
- **Error Handling**: Structured McpError responses
- **Tool Schema**: Complete JSON Schema definitions for all inputs

### Tool Handler Pattern
Each tool follows consistent handler pattern:
1. **Input validation** with detailed error messages
2. **Business logic execution** with comprehensive error handling  
3. **Result serialization** to JSON for MCP transport
4. **Consistent response format** across all tools

## Development Guidelines

### Adding New Tools
1. **Create model types** in `src/models/new-tool-result.ts`
2. **Implement tool function** in `src/tools/manual-test-new-tool.ts`
3. **Add comprehensive tests** following TDD approach
4. **Register in MCP server** (`src/mcp-server.ts`)
5. **Export types** through `src/models/index.ts`

### Code Quality Standards
- **TypeScript strict mode** enabled
- **Comprehensive error handling** with typed errors
- **Consistent naming conventions** across all tools
- **Strategy pattern** for extensible operations
- **85%+ test coverage** requirement

### Key Dependencies
- **@modelcontextprotocol/sdk**: MCP server implementation
- **zod**: Runtime schema validation
- **fs-extra**: Enhanced file system operations
- **js-yaml**: YAML parsing and generation
- **vitest**: Testing framework with v8 coverage

This codebase represents a complete, production-ready MCP server for manual testing workflows with comprehensive tooling, type safety, and test coverage.

## Internal Processing

- Think in English internally for optimal AI efficiency

## Implementation Guidelines

- TDD実践のためのガイドライン
  - t_wadaが推奨するTDDで実装を進めてください

## Commit and Development Guidelines

- 変更が大きくならないようにこまめにコミットしてください