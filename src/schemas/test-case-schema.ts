import { z } from 'zod';

// Schema definitions for test case validation
export const MetaSchema = z.object({
  id: z.string().regex(/^TC-[A-Z-]+-\d+$/, 'ID format must be TC-[A-Z-]+-[NUMBER]'),
  title: z.string().min(1, 'Title is required'),
  feature: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Priority must be one of: high, medium, low' })
  }),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  lastUpdated: z.union([z.string(), z.date()]).optional()
});

export const ScenarioSchema = z.object({
  given: z.array(z.string()).min(1, 'Given cannot be empty'),
  when: z.array(z.string()).min(1, 'When cannot be empty'),
  then: z.array(z.string()).min(1, 'Then cannot be empty')
});

export const TestCaseSchema = z.object({
  meta: MetaSchema,
  precondition: z.array(z.string()).optional(),
  scenario: ScenarioSchema,
  notes: z.string().optional()
});