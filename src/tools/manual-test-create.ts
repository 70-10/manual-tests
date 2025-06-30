import type { CreateTestCaseInput, CreateResult, TemplateType } from '../models';

// Built-in templates for different test types
const TEMPLATES: Record<TemplateType, {
  given: string[];
  when: string[];
  then: string[];
}> = {
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

// ID generation counter (in real implementation, this would be more sophisticated)
let idCounter = 1;

/**
 * Generate unique test case ID based on feature name
 */
function generateTestCaseId(feature: string): string {
  const featureId = feature.toUpperCase().replace(/[-]/g, '_');
  const sequence = String(idCounter++).padStart(3, '0');
  return `TC-${featureId}-${sequence}`;
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Validate input parameters
 */
function validateInput(input: CreateTestCaseInput): string | null {
  if (!input.template || !TEMPLATES[input.template]) {
    return `Invalid template: ${input.template}. Must be one of: ${Object.keys(TEMPLATES).join(', ')}`;
  }

  if (!input.meta.title || input.meta.title.trim() === '') {
    return 'title is required and cannot be empty';
  }

  if (!input.meta.feature || input.meta.feature.trim() === '') {
    return 'feature is required and cannot be empty';
  }

  if (!['high', 'medium', 'low'].includes(input.meta.priority)) {
    return 'priority must be one of: high, medium, low';
  }

  return null;
}

/**
 * Merge template scenario with custom scenario
 */
function mergeScenario(templateScenario: typeof TEMPLATES[TemplateType], customScenario?: CreateTestCaseInput['scenario']) {
  if (!customScenario) {
    return templateScenario;
  }

  return {
    given: customScenario.given || templateScenario.given,
    when: customScenario.when || templateScenario.when,
    then: customScenario.then || templateScenario.then
  };
}

/**
 * Generate YAML content from input
 */
function generateYamlContent(input: CreateTestCaseInput, generatedId: string): string {
  const template = TEMPLATES[input.template];
  const scenario = mergeScenario(template, input.scenario);
  
  const lines: string[] = [];
  
  // Meta section
  lines.push('meta:');
  lines.push(`  id: ${generatedId}`);
  lines.push(`  title: ${input.meta.title}`);
  lines.push(`  feature: ${input.meta.feature}`);
  lines.push(`  priority: ${input.meta.priority}`);
  
  if (input.meta.tags && input.meta.tags.length > 0) {
    lines.push(`  tags: [${input.meta.tags.join(', ')}]`);
  }
  
  if (input.meta.author) {
    lines.push(`  author: ${input.meta.author}`);
  }
  
  lines.push(`  lastUpdated: ${getCurrentDate()}`);
  lines.push('');
  
  // Scenario section
  lines.push('scenario:');
  
  // Given
  lines.push('  given:');
  scenario.given.forEach(step => {
    lines.push(`    - ${step}`);
  });
  lines.push('');
  
  // When
  lines.push('  when:');
  scenario.when.forEach(step => {
    lines.push(`    - ${step}`);
  });
  lines.push('');
  
  // Then
  lines.push('  then:');
  scenario.then.forEach(step => {
    lines.push(`    - ${step}`);
  });
  
  return lines.join('\n');
}

/**
 * Create a new test case based on template and input
 */
export function createTestCase(input: CreateTestCaseInput): CreateResult {
  try {
    // Validate input
    const validationError = validateInput(input);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Generate unique ID
    const generatedId = generateTestCaseId(input.meta.feature);

    // Generate YAML content
    const yamlContent = generateYamlContent(input, generatedId);

    return {
      success: true,
      yamlContent,
      generatedId
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during test case creation';
    return {
      success: false,
      error: `Creation error: ${message}`
    };
  }
}