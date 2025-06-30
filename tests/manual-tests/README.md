# マニュアルテスト実行ガイド

このドキュメントは、YAMLで定義されたテストケースをPlaywright MCPサーバーを使って実行するための手順書です。

## 前提条件

- Playwright MCPサーバーが`.mcp.json`で設定済み
- Claude Codeでこのプロジェクトを開いている

## テスト実行手順

### 1. テストケースの特定
```bash
# 利用可能なテストケースを確認
ls tests/manual-tests/test-cases/
```

### 2. YAMLテストケースの解析
指定されたYAMLファイルを読み込み、以下の要素を抽出：
- `meta.id`: テストケースID
- `meta.title`: テストタイトル  
- `scenario.given`: 前提条件
- `scenario.when`: 実行操作
- `scenario.then`: 期待結果

### 3. Playwright MCP実行ステップ

#### 3.1 ブラウザ操作とナビゲーション
```javascript
// URLへのナビゲート
mcp__playwright__browser_navigate(url)
```

#### 3.2 検証項目の実行
- **ページタイトル確認**: 戻り値の`Page Title`をチェック
- **テキスト表示確認**: `Page Snapshot`のYAML構造でテキスト存在を確認
- **要素確認**: heading, link, button等の要素が正しく表示されているか

#### 3.3 スクリーンショット取得
```javascript
// 証跡用スクリーンショット
mcp__playwright__browser_take_screenshot({
  filename: "tests/manual-tests/test-results/YYYYMMDD_<TEST-ID>/screenshot.png"
})
```

### 4. 結果レポート生成

#### 4.1 ファイル名規則
```
tests/manual-tests/test-results/YYYYMMDD_<TEST-ID>/
├── report.md          # テストレポート
└── screenshot.png     # スクリーンショット
```

#### 4.2 レポート構造
```markdown
# YYYYMMDD_<TEST-ID>

| 項目 | 値 |
|------|-----|
| **Test ID** | <TEST-ID> |
| **実行日時** | YYYY-MM-DD HH:MM JST |
| **実行環境** | Playwright MCP / Claude Code |
| **結果** | ✅ Passed / ❌ Failed |

## 実行ステップと結果
### Given: <前提条件>
### When: <実行操作>  
### Then: <検証結果>

## 総合判定
```

## YAML操作マッピング

### ナビゲーション操作
- `ブラウザで "URL" にアクセスする` → `mcp__playwright__browser_navigate`

### 検証操作
- `ページタイトルが "タイトル" であること` → Page Titleとの文字列比較
- `"テキスト" が表示されていること` → Page Snapshot内のテキスト検索
- `"テキスト" が画面上に表示されていること` → heading, paragraph等での確認

### インタラクション操作
- `"ボタン" をクリックする` → `mcp__playwright__browser_click`
- `"フィールド" に "値" を入力する` → `mcp__playwright__browser_type`

## 判定基準

### ✅ PASS条件
- すべての検証項目が期待値と一致
- エラーや例外が発生していない
- 必要なページ要素が正しく表示されている

### ❌ FAIL条件  
- 検証項目が期待値と異なる
- ページの読み込みエラー
- 要素が見つからない
- タイムアウト発生

## 注意事項

- パラメータ化された値（`{{today}}`等）は実行時に動的に置換
- ロケータは Role/ID/Text セレクタを優先
- スクリーンショットは必ず証跡として保存
- 実行環境とブラウザ情報をレポートに記載

## クイック実行コマンド（Claude向け）

```
<TEST-ID>のマニュアルテストを実行してください
```

例：
```
TC-TOP-PAGE-001のマニュアルテストを実行してください
```