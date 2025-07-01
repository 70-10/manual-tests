// File content generation strategies

import type { InitProjectInput } from '../../models';

/**
 * Interface for file content generation strategies
 */
export interface FileContentGenerator {
  generateReadme(input: InitProjectInput): string;
  generateTestCaseTemplate(): string;
}

/**
 * Default file content generator implementation
 */
export class DefaultFileContentGenerator implements FileContentGenerator {
  generateReadme(input: InitProjectInput): string {
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

  generateTestCaseTemplate(): string {
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

}

// Default generator instance
export const defaultFileContentGenerator = new DefaultFileContentGenerator();