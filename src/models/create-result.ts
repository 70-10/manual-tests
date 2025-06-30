// Test case creation result types

export type TemplateType = 'login' | 'form' | 'navigation' | 'api';

export interface CreateMetaInput {
  title: string;
  feature: string;
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
  author?: string;
}

export interface CreateScenarioInput {
  given?: string[];
  when?: string[];
  then?: string[];
}

export interface CreateTestCaseInput {
  template: TemplateType;
  meta: CreateMetaInput;
  scenario?: CreateScenarioInput;
}

export interface CreateSuccessResult {
  success: true;
  yamlContent: string;
  generatedId: string;
}

export interface CreateErrorResult {
  success: false;
  error: string;
}

export type CreateResult = CreateSuccessResult | CreateErrorResult;