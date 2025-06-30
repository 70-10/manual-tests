# Manual Tests

YAMLで定義されたテストケースをPlaywright MCPサーバーで実行するマニュアルテストフレームワークです。

## 特徴

- **人間が読みやすいYAML形式**でテストケースを記述
- **Claude Code + Playwright MCP**による自動実行
- **given/when/then構造**でテストシナリオを整理
- **プロジェクトメタ情報**による一貫性のあるテストケース作成
- **Markdown形式**の詳細な実行レポート生成

## クイックスタート

### 0. 初期設定（必須）

まず`project-meta.yml`を編集して、あなたのプロジェクトに合わせて設定：

```yaml
project:
  name: "Your Service Name"          # あなたのサービス名
  description: "Service description"

environments:
  production: "https://your-service.com"  # 実際のURL

features:
  - name: "ログイン"
    id: "LOGIN"
    base_url: "/login"
```

### 1. テストケース作成

Claude Codeで新しいテストケースを作成：

```
ログイン機能のテストケースを作成してください
```

### 2. テスト実行

作成されたテストケースを実行：

```
TC-LOGIN-001のマニュアルテストを実行してください
```

### 3. 結果確認

実行結果は`tests/manual-tests/test-results/<test_name>/`に保存されます：
- `report.md` - 詳細レポート
- `screenshot.png` - スクリーンショット画像

## テストケース作成方法

### 1. Claude Codeで作成（推奨）

Claude Codeに機能名を指定してテストケース作成を依頼：

```
<機能名>のテストケースを作成してください
```

**例：**
- `ログイン機能のテストケースを作成してください`
- `商品検索のテストケースを作成してください`  
- `ユーザー登録フォームのテストケースを作成してください`

Claude Codeが`project-meta.yml`の情報を参照し、以下を自動的に処理します：
- プロジェクト設定の確認（対象環境、機能一覧）
- テストデータの活用（ユーザー情報、共通データ）
- 一貫したテストケースIDの生成
- 標準的なYAMLファイルの作成

### 2. 手動作成（テンプレート使用）

```bash
cp tests/manual-tests/templates/test-case-template.yml tests/manual-tests/test-cases/your-test-case.yml
```

### 3. YAMLテストケースの構造

```yaml
meta:
  id: TC-FEATURE-001          # 一意のテストID
  title: テスト内容の説明        # 日本語でのテスト概要
  feature: 機能名             # テスト対象機能
  priority: high|medium|low    # 優先度
  tags: [smoke, regression]    # タグ
  author: あなたの名前          # 作成者
  lastUpdated: YYYY-MM-DD     # 最終更新日

precondition:
  - テスト実行の前提条件1
  - テスト実行の前提条件2

scenario:
  given:
    - 初期状態の説明
    
  when:
    - ブラウザで "https://example.com" にアクセスする
    - "ログイン" ボタンをクリックする
    - "ユーザー名" フィールドに "test_user" を入力する
    
  then:
    - ページタイトルが "ダッシュボード" であること
    - "ようこそ" のテキストが画面上に表示されていること
    - エラーメッセージが表示されていないこと

notes: |
  追加の注意事項やメモ
```

### 3. 命名規則

- **テストID**: `TC-<FEATURE>-<連番>` (例: `TC-LOGIN-001`)
- **ファイル名**: `<feature>-<連番>.yml` (例: `login-001.yml`)

※ Claude Codeで作成する場合、適切な命名が自動的に適用されます

### 4. 操作パターン

#### ナビゲーション
```yaml
when:
  - ブラウザで "URL" にアクセスする
```

#### 要素操作
```yaml
when:
  - "ボタン名" ボタンをクリックする
  - "フィールド名" フィールドに "値" を入力する
  - "オプション" を選択する
```

#### 検証項目
```yaml
then:
  - ページタイトルが "期待値" であること
  - "テキスト" が画面上に表示されていること
  - "要素" が存在すること
  - エラーメッセージが表示されていないこと
```

## テスト実行方法

### Claude Codeでの実行

1. **テストケース作成**
   ```
   <機能名>のテストケースを作成してください
   ```

2. **個別テスト実行**
   ```
   <TEST-ID>のマニュアルテストを実行してください
   ```

3. **実行される手順**
   - YAMLファイル読み込み・解析
   - Playwright MCPでブラウザ操作実行
   - 検証項目チェック
   - スクリーンショット取得
   - 結果レポート生成

### 実行結果の確認

実行完了後、以下の場所で結果を確認：

- **テスト結果フォルダ**: `tests/manual-tests/test-results/YYYYMMDD_<TEST-ID>/`
- **詳細レポート**: `report.md`
- **スクリーンショット**: `screenshot.png`

## プロジェクト構造

```
manual-tests/
├── README.md                    # このファイル
├── CLAUDE.md                    # Claude Code向けの指示
├── project-meta.yml             # プロジェクトメタ情報
├── .mcp.json                   # Playwright MCP設定
└── tests/
    └── manual-tests/
        ├── README.md           # 技術仕様詳細
        ├── templates/          # 各種テンプレート
        │   ├── test-case-template.yml
        │   └── test-result-template.md
        ├── test-cases/         # YAMLテストケース
        │   └── top-page-001.yml
        └── test-results/       # 実行結果レポート
            └── 20250630_TC-TOP-PAGE-001/
                ├── report.md
                └── screenshot.png
```

## プロジェクトメタ情報の設定

### project-meta.ymlの構成

```yaml
project:
  name: "Your Service Name"          # プロジェクト名
  description: "Service description"  # 説明
  
environments:
  production: "https://your-service.com"     # 本番環境
  staging: "https://staging.your-service.com"  # ステージング環境
  
test_data:
  users:
    valid_user:
      username: "test_user"
      password: "test_password"
      
features:
  - name: "ログイン"
    id: "LOGIN"
    base_url: "/login"
    description: "ユーザー認証機能"
```

### 初期設定手順

1. **project-meta.yml編集**: あなたのサービスに合わせて設定
2. **環境URL設定**: 実際のサービスURLに変更
3. **テストデータ準備**: 安全なテスト用ユーザー情報を設定
4. **機能定義**: テスト対象機能を追加

## ベストプラクティス

### テストケース作成時
- **project-meta.yml**の情報を活用して一貫性を保つ
- **具体的で測定可能**な検証項目を記述
- **動的な値**は`{{today}}`のようにパラメータ化
- **タグ**でテストの種類を分類（smoke, regression, e2e等）

### テスト実行時
- 実行前に**前提条件**を確認
- **スクリーンショット**で結果を視覚的に確認
- **失敗時**は詳細ログを確認して原因を特定

## 技術詳細

詳細な技術仕様については以下を参照：
- [技術仕様](tests/manual-tests/README.md)
- [テストケーステンプレート](tests/manual-tests/templates/test-case-template.yml)
- [結果レポートテンプレート](tests/manual-tests/templates/test-result-template.md)