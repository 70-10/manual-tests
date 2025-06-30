# 20250630_TC-TOP-PAGE-001

| 項目         | 値                                       |
| ------------ | ---------------------------------------- |
| **Test ID**  | TC-TOP-PAGE-001                          |
| **実行日時** | 2025-06-30 13:06 JST                    |
| **実行環境** | Playwright MCP / Claude Code             |
| **結果**     | ✅ Passed                                |

## ログ概要

- 実行時間: < 5 s
- リトライ回数: 0
- スクリーンショット: screenshot.png

## テスト実行詳細

### YAMLテストケース解析結果
- **テストID:** TC-TOP-PAGE-001
- **タイトル:** トップページが正しく表示される
- **対象URL:** https://example.com

### 実行ステップと結果

#### Given: ブラウザを開いていない状態
✅ **実行完了** - Playwright MCPサーバーでブラウザセッション開始

#### When: ブラウザで "https://example.com" にアクセスする
✅ **実行完了** - 正常にページにナビゲート完了
- Page URL: https://example.com/

#### Then: 検証項目
1. **ページタイトルが "Example Domain" であること**
   - ✅ **PASS** - 実際の値: "Example Domain"
   
2. **"Example Domain" のテキストが画面上に表示されていること**
   - ✅ **PASS** - heading "Example Domain" [level=1] で確認

### スクリーンショット証跡
- ファイル名: screenshot.png
- 取得時刻: 2025-06-30 13:06 JST
- 内容: Example Domainページの表示確認

## 総合判定
**✅ テスト成功** - すべての検証項目をクリア