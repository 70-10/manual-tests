import { Result } from './result';

/**
 * Tool information structure
 */
export interface ToolInfo {
  name: string;
  description: string;
  usage: {
    example: string;
    inputDescription: string;
    outputDescription: string;
  };
}

/**
 * Usage guidelines structure
 */
export interface UsageGuidelines {
  general: string[];
  errorHandling: string[];
}

/**
 * Client guidance information
 */
export interface ClientGuidance {
  recommendedPatterns: string[];
  outputHandling: string[];
}

/**
 * Help information data structure
 */
export interface HelpData {
  tools: ToolInfo[];
  guidelines: UsageGuidelines;
  clientGuidance: ClientGuidance;
}

/**
 * Result type for help operations
 */
export type HelpResult = Result<HelpData>;