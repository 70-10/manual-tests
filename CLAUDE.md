# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a manual testing framework that executes YAML-defined test cases using Playwright MCP server integration. The framework translates human-readable test scenarios into programmatic browser operations.

**Core Components:**
- **project-meta.yml** - Project configuration with environments, test data, and feature definitions
- **YAML Test Cases** in `tests/manual-tests/test-cases/` with given/when/then structure
- **Playwright MCP** integration via `.mcp.json` for browser automation  
- **Markdown Reports** generated in `tests/manual-tests/test-results/`

**Key Files:**
- `project-meta.yml` - MUST be configured first with target URLs and features
- `.mcp.json` - Playwright MCP server configuration
- `tests/manual-tests/README.md` - Technical specifications
- `tests/manual-tests/template.md` - Test case template with examples

## Manual Test Execution

### Quick Command - Test Execution
```
<TEST-ID>のマニュアルテストを実行してください
```

**Examples:**
- `TC-TOP-PAGE-001のマニュアルテストを実行してください`
- `TC-LOGIN-001のマニュアルテストを実行してください`

### Quick Command - Test Case Creation
```
<機能名>のテストケースを作成してください
```

**Examples:**
- `ログイン機能のテストケースを作成してください`
- `商品検索のテストケースを作成してください`
- `ユーザー登録フォームのテストケースを作成してください`

**Test Case Creation Process:**
1. **Read project-meta.yml** to understand project context and available features
2. **Identify target feature** from the features list in project-meta.yml
3. **Use project metadata** (environments, test_data, common_selectors) for consistency
4. **Generate appropriate test ID** following `TC-<FEATURE-ID>-<SEQ>` pattern (e.g., TC-LOGIN-001)
5. **Create YAML file** at `tests/manual-tests/test-cases/<feature>-<seq>.yml`
6. **Apply project defaults** and reference existing test cases for consistency

**Test Execution Process:**
1. **Read test case YAML** and parse given/when/then structure
2. **Execute scenario steps** using Playwright MCP functions in sequence
3. **Verify assertions** (page titles, text display, element presence)
4. **Create test result directory** at `tests/manual-tests/test-results/YYYYMMDD_<TEST-ID>/`
5. **Capture screenshot** and save as `tests/manual-tests/test-results/YYYYMMDD_<TEST-ID>/screenshot.png`
6. **Generate report** at `tests/manual-tests/test-results/YYYYMMDD_<TEST-ID>/report.md`

### Key Operation Mappings
- `ブラウザで "URL" にアクセスする` → `mcp__playwright__browser_navigate`
- `ページタイトルが "タイトル" であること` → Verify Page Title response
- `"テキスト" が画面上に表示されていること` → Check Page Snapshot YAML structure
- `"ボタン" をクリックする` → `mcp__playwright__browser_click`
- `"フィールド" に "値" を入力する` → `mcp__playwright__browser_type`

For detailed procedures and test case creation, see the main [README.md](./README.md).