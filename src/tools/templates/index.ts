// Template management for test case creation

export interface TestCaseTemplate {
  given: string[];
  when: string[];
  then: string[];
}

export type TemplateRegistry = Record<string, TestCaseTemplate>;

/**
 * Base templates for different test scenarios
 */
export const DEFAULT_TEMPLATES: TemplateRegistry = {
  login: {
    given: ['ユーザーがログアウト状態である'],
    when: [
      'ログインページにアクセスする',
      'ユーザー名フィールドに有効なユーザー名を入力する',
      'パスワードフィールドに有効なパスワードを入力する',
      'ログインボタンをクリックする'
    ],
    then: [
      'ダッシュボードページにリダイレクトされる',
      'ユーザー名が表示される',
      'ログアウトボタンが表示される'
    ]
  },
  form: {
    given: ['フォームページが表示されている'],
    when: [
      'フォームの必須フィールドに値を入力する',
      '送信ボタンをクリックする'
    ],
    then: [
      '送信が成功する',
      '成功メッセージが表示される'
    ]
  },
  navigation: {
    given: ['ホームページが表示されている'],
    when: [
      'ナビゲーションメニューをクリックする',
      '目的のページリンクをクリックする'
    ],
    then: [
      '正しいページに遷移する',
      'ページタイトルが正しく表示される'
    ]
  },
  api: {
    given: ['APIエンドポイントが利用可能である'],
    when: [
      'APIリクエストを送信する',
      'レスポンスを受信する'
    ],
    then: [
      'ステータスコードが200である',
      'レスポンスボディが期待される形式である'
    ]
  }
};

/**
 * Template manager interface
 */
export interface TemplateManager {
  getTemplate(templateName: string): TestCaseTemplate | undefined;
  hasTemplate(templateName: string): boolean;
  getAvailableTemplates(): string[];
}

/**
 * Default template manager implementation
 */
export class DefaultTemplateManager implements TemplateManager {
  private templates: TemplateRegistry;

  constructor(templates: TemplateRegistry = DEFAULT_TEMPLATES) {
    this.templates = templates;
  }

  getTemplate(templateName: string): TestCaseTemplate | undefined {
    return this.templates[templateName];
  }

  hasTemplate(templateName: string): boolean {
    return templateName in this.templates;
  }

  getAvailableTemplates(): string[] {
    return Object.keys(this.templates);
  }
}

// Global instance
export const templateManager = new DefaultTemplateManager();