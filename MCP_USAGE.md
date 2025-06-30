# Manual Tests MCP Server Usage

## Installation

### Using npx (Recommended)
```bash
npx github:70-10/manual-tests-mcp
```

### Local Installation
```bash
git clone https://github.com/70-10/manual-tests.git
cd manual-tests
npm install
npm run build
```

## Configuration

Add the MCP server to your Claude Code configuration (`.mcp.json`):

```json
{
  "mcpServers": {
    "manual-tests": {
      "type": "stdio",
      "command": "npx",
      "args": ["github:70-10/manual-tests-mcp"]
    }
  }
}
```

For local installation:
```json
{
  "mcpServers": {
    "manual-tests": {
      "type": "stdio", 
      "command": "node",
      "args": ["path/to/manual-tests/dist/mcp-server.js"]
    }
  }
}
```

## Available Tools

### 1. manual_test_validate

Validates YAML test case content for syntax and structure compliance.

**Parameters:**
- `yamlContent` (string): YAML content of the test case to validate

**Example:**
```yaml
meta:
  id: TC-LOGIN-001
  title: ログイン機能のテスト
  priority: high
  tags: [smoke, regression]
scenario:
  given:
    - ユーザーがログアウト状態
  when:
    - ログインフォームにアクセス
  then:
    - フォームが表示される
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

### 2. manual_test_parse

Parses test case YAML and processes variable substitutions.

**Parameters:**
- `yamlContent` (string): YAML content of the test case to parse
- `projectMeta` (object, optional): Project metadata for variable substitution

**Variable Types:**
- `{{today}}` - Current date in YYYY-MM-DD format
- `{{timestamp}}` - Current timestamp
- `{{environments.production}}` - Environment URL from project metadata
- `{{test_data.users.valid_user.username}}` - Test data from project metadata

**Example:**
```yaml
meta:
  id: TC-LOGIN-001
  title: ログイン機能のテスト
  priority: high
scenario:
  given:
    - 今日は {{today}} です
  when:
    - "{{environments.production}}/login" にアクセス
    - ユーザー名 "{{test_data.users.valid_user.username}}" を入力
  then:
    - ログインが成功する
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

### 3. manual_test_list

Lists test cases from a directory with filtering and sorting options.

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
  "dirPath": "./tests/manual-tests/test-cases",
  "filter": {
    "priority": "high",
    "tags": ["smoke"]
  },
  "sortBy": "lastUpdated"
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