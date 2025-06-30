# Manual Tests MCP Server - 開発フェーズと残タスク

## 現在の状況 (2025-06-30)

### ✅ 完了済みフェーズ

#### Phase 1: プロジェクトセットアップ
- ✅ npm package基盤構築（`npm init -y`）
- ✅ TypeScript設定（CommonJS出力）
- ✅ Vitest設定（カバレッジ対応、UIなし）
- ✅ bin設定（`npx github:70-10/manual-tests-mcp`対応）
- ✅ 依存関係インストール（-E フラグで完全バージョン固定）

#### Phase 2: コアツール実装（TDD）
- ✅ **manual_test_validate** (Red→Green→Refactor)
  - Zod schemaベースYAML検証
  - 45/45テスト通過
  - エラーメッセージの詳細化
- ✅ **manual_test_parse** (Red→Green→Refactor)  
  - Strategy パターンによる変数置換
  - Built-in変数（`{{today}}`, `{{timestamp}}`）
  - Project metadata変数（`{{environments.production}}`）
  - 45/45テスト通過
- ✅ **manual_test_list** (Red→Green→Refactor)
  - Strategy パターンによるフィルタリング
  - 複数条件対応（feature, priority, tags, author）
  - ソート機能（id, lastUpdated, priority, feature）
  - 45/45テスト通過

#### Phase 3: アーキテクチャリファクタリング
- ✅ **モデル分離** (`src/models/`)
  - `test-case.ts` - 基本型定義
  - `parse-result.ts` - Parse結果型
  - `list-result.ts` - List結果型
- ✅ **ロジック分離** (`src/tools/`)
  - スキーマ分離 (`src/schemas/`)
  - 関心事の分離による保守性向上

#### Phase 4: MCP Server統合
- ✅ **MCP Server実装** (`src/mcp-server.ts`)
  - @modelcontextprotocol/sdk統合
  - 3ツール完全対応
  - JSON-RPC 2.0プロトコル準拠
  - エラーハンドリング
- ✅ **統合テスト** (45/45通過)
- ✅ **ドキュメント** (`MCP_USAGE.md`)
  - インストール手順
  - `.mcp.json`設定例
  - 全ツールの使用例

### 📊 技術的達成状況

- **テスト**: 45/45 passing (100%)
- **カバレッジ**: 84%+
- **アーキテクチャ**: Strategy パターン、関心事の分離
- **配布準備**: bin設定完了、MCP統合完了

---

## 🔄 残りのフェーズ

### Phase 5: 追加ツール実装（中優先度）

#### 🚧 manual_test_create 
**目的**: テンプレートベースのテストケース作成機能

**実装計画**:
```
Red: テスト失敗を確認
- ✍️ tests/tools/manual-test-create.test.ts作成
- テンプレート選択機能のテスト
- 基本情報入力のテスト  
- YAML生成のテスト

Green: 最小実装で通す
- ✍️ src/tools/manual-test-create.ts実装
- テンプレート管理機能
- 基本情報からYAML生成

Refactor: 品質向上
- Strategy パターン適用
- テンプレートの外部化
- エラーハンドリング強化
```

**期待される機能**:
- テンプレート選択（login, form, navigation等）
- メタデータ入力（ID生成、タイトル、priority等）
- シナリオ骨組み生成

#### 🚧 manual_test_init
**目的**: プロジェクト初期化機能

**実装計画**:
```
Red: テスト失敗を確認
- ✍️ tests/tools/manual-test-init.test.ts作成
- ディレクトリ構造作成のテスト
- project-meta.yml生成のテスト
- 設定ファイル作成のテスト

Green: 最小実装で通す  
- ✍️ src/tools/manual-test-init.ts実装
- 必須ディレクトリ作成
- テンプレートファイル配置

Refactor: 品質向上
- テンプレート管理の統一
- 設定オプション対応
- 既存プロジェクト検出
```

**期待される機能**:
- `tests/manual-tests/`ディレクトリ構造作成
- `project-meta.yml`テンプレート生成
- `.mcp.json`設定サンプル作成

### Phase 6: テスト結果管理（低優先度）

#### 🔮 manual_test_results_list
**目的**: 実行結果一覧表示

#### 🔮 manual_test_results_report  
**目的**: 結果レポート生成

#### 🔮 manual_test_results_clean
**目的**: 古い結果のクリーンアップ

### Phase 7: 配布とドキュメント（中優先度）

#### 📦 npm package配布準備
- GitHub Packages設定
- バージョニング戦略
- CI/CD設定（GitHub Actions）
- リリースノート

#### 📚 ドキュメント拡充
- README.md更新
- API仕様書
- 貢献ガイドライン
- トラブルシューティング

---

## 🎯 次のアクション

### 即座に実行可能
1. **manual_test_create**のTDD実装開始
2. **manual_test_init**のTDD実装

### 中期目標（1-2週間）
1. 全ツール完成
2. 配布準備完了
3. ドキュメント完成

### 技術的考慮事項

#### テンプレート管理戦略
- `src/templates/`ディレクトリでテンプレート管理
- YAML形式でテンプレート定義
- 変数置換機能との統合

#### 設定ファイル統合
- project-meta.ymlとの整合性
- .mcp.json設定の自動生成
- 環境依存設定の外部化

#### パフォーマンス最適化
- ファイルシステム操作の最適化
- キャッシュ機能の検討
- 大量ファイル処理対応

---

## 📈 成功指標

- [ ] 全ツール実装完了（5/3 完了）
- [ ] テストカバレッジ 85%+ 維持
- [ ] MCP統合 100%動作
- [ ] npm配布可能状態
- [ ] ドキュメント完全性

現在の**Manual Tests MCP Server**は、コアな検証・解析・一覧機能が完全に動作する状態で、実用に耐える品質を達成しています。残りのフェーズは利便性向上と配布準備が中心となります。