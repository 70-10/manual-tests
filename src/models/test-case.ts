// Core test case types and enums
export type Priority = 'high' | 'medium' | 'low';

export interface TestCaseMeta {
  id: string;
  title: string;
  feature?: string;
  priority: Priority;
  tags?: string[];
  author?: string;
  lastUpdated?: string | Date;
}

export interface TestCaseScenario {
  given: string[];
  when: string[];
  then: string[];
}

export interface TestCase {
  meta: TestCaseMeta;
  precondition?: string[];
  scenario: TestCaseScenario;
  notes?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  parsedData?: TestCase;
}