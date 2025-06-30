import { Result } from './result';

/**
 * Workflow step structure
 */
export interface WorkflowStep {
  tool: string;
  description: string;
  order: number;
  optional?: boolean;
}

/**
 * Complete workflow definition
 */
export interface Workflow {
  name: string;
  description: string;
  steps: WorkflowStep[];
  recommendedOrder: string[];
}

/**
 * Tool integration pattern
 */
export interface IntegrationPattern {
  name: string;
  description: string;
  toolSequence: string[];
  example?: string;
}

/**
 * Common use case scenario
 */
export interface UseCase {
  title: string;
  description: string;
  steps: string[];
  tools: string[];
}

/**
 * Workflow information data structure
 */
export interface WorkflowData {
  workflows: Workflow[];
  integrationPatterns: IntegrationPattern[];
  commonUseCases: UseCase[];
}

/**
 * Result type for workflow operations
 */
export type WorkflowResult = Result<WorkflowData>;