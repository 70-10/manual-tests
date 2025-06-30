import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'js-yaml';
import type { InitProjectInput, InitResult, ProjectMetaTemplate } from '../models';

/**
 * URL validation helper
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate input parameters
 */
function validateInput(input: InitProjectInput): string | null {
  if (!input.projectName || input.projectName.trim() === '') {
    return 'projectName is required and cannot be empty';
  }

  if (!input.baseUrl || !isValidUrl(input.baseUrl)) {
    return 'baseUrl is required and must be a valid URL';
  }

  if (input.environments) {
    for (const [env, url] of Object.entries(input.environments)) {
      if (!isValidUrl(url)) {
        return `environments.${env} must be a valid URL`;
      }
    }
  }

  return null;
}

/**
 * Create project metadata template
 */
function createProjectMetaTemplate(input: InitProjectInput): ProjectMetaTemplate {
  const environments = input.environments || {
    production: input.baseUrl
  };

  const features = input.features || [
    { name: 'top-page', description: 'トップページ機能' },
    { name: 'login', description: 'ログイン機能' }
  ];

  const testData = input.testDataTemplate ? {
    users: {
      valid_user: {
        username: 'testuser',
        password: 'testpass123',
        email: 'test@example.com'
      },
      invalid_user: {
        username: 'invalid',
        password: 'wrong'
      }
    },
    products: {
      sample_product: {
        name: 'サンプル商品',
        price: 1000,
        description: 'テスト用の商品'
      }
    }
  } : {
    users: {
      valid_user: {
        username: 'testuser',
        password: 'testpass123'
      }
    }
  };

  return {
    project: {
      name: input.projectName,
      description: `${input.projectName}のマニュアルテスト`,
      version: '1.0.0'
    },
    environments,
    features: features.map(f => ({
      ...f,
      enabled: true
    })),
    test_data: testData,
    common_selectors: {
      login_form: {
        username_field: '#username',
        password_field: '#password',
        login_button: '#login-button'
      },
      navigation: {
        home_link: 'a[href="/"]',
        logout_button: '#logout'
      }
    }
  };
}

/**
 * Create README.md content
 */
function createReadmeContent(input: InitProjectInput): string {
  return `# Manual Tests

${input.projectName}のマニュアルテストプロジェクトです。

## 概要

このプロジェクトでは、YAML形式でテストケースを定義し、MCP Serverを通じてテストケースの管理・実行を行います。

## 使用方法

### 1. MCP Server設定

\`.mcp.json\`ファイルにMCP Serverの設定を追加してください：

\`\`\`json
{
  "mcpServers": {
    "manual-tests": {
      "type": "stdio",
      "command": "npx",
      "args": ["github:70-10/manual-tests-mcp"]
    }
  }
}
\`\`\`

### 2. テストケース作成

\`test-cases/\`ディレクトリにYAMLファイルでテストケースを作成します。

テンプレートファイルは \`templates/test-case-template.yml\` を参照してください。

### 3. 利用可能なツール

- **manual_test_validate**: テストケースの構文チェック
- **manual_test_parse**: 変数置換処理
- **manual_test_list**: テストケース一覧表示
- **manual_test_create**: テンプレートベースのテストケース作成

## ディレクトリ構造

\`\`\`
tests/manual-tests/
├── README.md              # このファイル
├── project-meta.yml       # プロジェクト設定
├── test-cases/           # テストケースYAMLファイル
├── test-results/         # テスト実行結果
└── templates/           # テンプレートファイル
    └── test-case-template.yml
\`\`\`

## 設定ファイル

### project-meta.yml

プロジェクト全体の設定を管理します：

- **environments**: 環境URL設定
- **features**: 機能定義
- **test_data**: テストデータ
- **common_selectors**: 共通セレクタ

## 変数システム

テストケース内で以下の変数が使用できます：

- \`{{today}}\`: 今日の日付
- \`{{timestamp}}\`: タイムスタンプ
- \`{{environments.production}}\`: 環境URL
- \`{{test_data.users.valid_user.username}}\`: テストデータ

詳細は \`templates/test-case-template.yml\` を参照してください。
`;
}

/**
 * Create MCP configuration
 */
function createMcpConfig(): object {
  return {
    mcpServers: {
      'manual-tests': {
        type: 'stdio',
        command: 'npx',
        args: ['github:70-10/manual-tests-mcp']
      }
    }
  };
}

/**
 * Create test case template content
 */
function createTestCaseTemplate(): string {
  return `# テストケーステンプレート
# 使用方法: 
# 1. このファイルを test-cases/<feature>-<seq>.yml にコピー
# 2. <> で囲まれた部分を実際の値に置換
# 3. project-meta.yml の features, test_data, common_selectors を参照
# 4. 不要なコメント行は削除

meta:
  id: TC-<FEATURE-ID>-<SEQ>              # 例: TC-LOGIN-001, TC-SEARCH-002
  title: <テストケースのタイトル>          # 例: ログイン機能が正常に動作する
  feature: <機能名>                      # project-meta.yml の features.name を参照
  priority: <優先度>                     # high, medium, low のいずれか
  tags: [<タグ1>, <タグ2>]               # 例: [smoke, regression], [ui, api]
  author: <作成者名>                     # 例: 開発者名 または 空欄
  lastUpdated: <YYYY-MM-DD>              # 例: 2025-06-30

# テスト実行前の前提条件
precondition:
  - <前提条件1>                          # 例: インターネット接続があること
  - <前提条件2>                          # 例: テストユーザーアカウントが作成されていること
  # 他の前提条件があれば追加

# テストシナリオ（Given-When-Then形式）
scenario:
  given:
    - <初期状態1>                        # 例: ブラウザを開いていない状態
    - <初期状態2>                        # 例: ユーザーがログアウトしている状態
    # 他の初期状態があれば追加
    
  when:
    - <実行操作1>                        # 例: ブラウザで "{{environments.production}}/login" にアクセスする
    - <実行操作2>                        # 例: "ユーザー名" に "{{test_data.users.valid_user.username}}" を入力する
    - <実行操作3>                        # 例: "パスワード" に "{{test_data.users.valid_user.password}}" を入力する
    - <実行操作4>                        # 例: "ログイン" ボタンをクリックする
    # 他の操作があれば追加
    
  then:
    - <検証項目1>                        # 例: ページタイトルが "ダッシュボード" であること
    - <検証項目2>                        # 例: "ようこそ、{{test_data.users.valid_user.username}}さん" のテキストが表示されること
    - <検証項目3>                        # 例: "ログアウト" ボタンが表示されること
    # 他の検証項目があれば追加

# テストケース作成時の注意事項
notes: |
  - ロケータは Role/ID/Text セレクタを優先
  - 動的値はパラメータ化（例: "{{today}}", "{{test_data.users.valid_user.username}}"）
  - project-meta.yml の common_selectors を活用
  - 環境URL は {{environments.production}} などの変数を使用
  - 複雑な操作は複数のステップに分割
  - 検証項目は具体的で測定可能なものにする

# 利用可能な変数例（project-meta.yml参照）:
# - {{environments.production}}        # 本番環境URL
# - {{environments.staging}}           # ステージング環境URL
# - {{test_data.users.valid_user.username}}    # 有効ユーザー名
# - {{test_data.users.valid_user.password}}    # 有効パスワード
# - {{test_data.products.sample_product.name}} # サンプル商品名
# - {{common_selectors.login_form.username_field}} # ユーザー名フィールド
# - {{today}}                          # 今日の日付
# - {{timestamp}}                      # タイムスタンプ

# 操作例:
# - ブラウザで "{{environments.production}}" にアクセスする
# - "{{common_selectors.login_form.username_field}}" に "{{test_data.users.valid_user.username}}" を入力する
# - "{{common_selectors.login_form.login_button}}" をクリックする
# - ページタイトルが "ホーム" であること
# - "{{test_data.users.valid_user.username}}" のテキストが表示されること
`;
}

/**
 * Check if files already exist
 */
async function checkExistingFiles(force: boolean): Promise<string | null> {
  if (force) {
    return null; // Skip check if force is true
  }

  const filesToCheck = [
    'tests/manual-tests/project-meta.yml',
    'tests/manual-tests/README.md'
  ];

  for (const file of filesToCheck) {
    if (await fs.pathExists(file)) {
      return `File already exists: ${file}. Use force=true to overwrite.`;
    }
  }

  return null;
}

/**
 * Initialize manual test project structure
 */
export async function initProject(input: InitProjectInput): InitResult {
  try {
    // Validate input
    const validationError = validateInput(input);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Check existing files
    const existingError = await checkExistingFiles(input.force || false);
    if (existingError) {
      return {
        success: false,
        error: existingError
      };
    }

    const createdDirectories: string[] = [];
    const createdFiles: string[] = [];

    // Create directory structure
    const directories = [
      'tests/manual-tests',
      'tests/manual-tests/test-cases',
      'tests/manual-tests/test-results',
      'tests/manual-tests/templates'
    ];

    for (const dir of directories) {
      await fs.ensureDir(dir);
      createdDirectories.push(dir);
    }

    // Create project-meta.yml
    const projectMeta = createProjectMetaTemplate(input);
    const projectMetaPath = 'tests/manual-tests/project-meta.yml';
    await fs.writeFile(projectMetaPath, yaml.dump(projectMeta, { 
      indent: 2,
      noRefs: true,
      sortKeys: false
    }));
    createdFiles.push(projectMetaPath);

    // Create README.md
    const readmeContent = createReadmeContent(input);
    const readmePath = 'tests/manual-tests/README.md';
    await fs.writeFile(readmePath, readmeContent);
    createdFiles.push(readmePath);

    // Create test case template
    const templateContent = createTestCaseTemplate();
    const templatePath = 'tests/manual-tests/templates/test-case-template.yml';
    await fs.writeFile(templatePath, templateContent);
    createdFiles.push(templatePath);

    // Create MCP config if requested
    if (input.mcpConfig) {
      const mcpConfig = createMcpConfig();
      const mcpConfigPath = '.mcp.json';
      await fs.writeFile(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
      createdFiles.push(mcpConfigPath);
    }

    return {
      success: true,
      createdFiles,
      createdDirectories,
      message: `Project '${input.projectName}' initialized successfully!`
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during project initialization';
    return {
      success: false,
      error: `Initialization error: ${message}`
    };
  }
}