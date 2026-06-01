import { z } from "zod";

export const codeExampleSchema = z.object({
  label: z.string(),
  kind: z.enum(["pass", "fail"]),
  language: z.enum(["jsx", "tsx", "html", "css"]),
  code: z.string(),
  note: z.string().optional(),
  source: z.string().optional(),
});

export const cacheEntrySchema = z.object({
  inputHash: z.string(),
  plainEnglish: z.string(),
  whyItMatters: z.string(),
  quickCheck: z.string(),
  commonMistakes: z.array(z.string()),
  codeExamples: z.array(codeExampleSchema),
});

export type CacheEntry = z.infer<typeof cacheEntrySchema>;

export const axeRuleSchema = z.object({
  ruleId: z.string(),
  impact: z.enum(["minor", "moderate", "serious", "critical"]),
  description: z.string(),
  url: z.string().url(),
});

export const criterionSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.enum(["A", "AA", "AAA"]),
  version: z.enum(["2.0", "2.1", "2.2"]),
  principle: z.object({
    id: z.enum(["1", "2", "3", "4"]),
    name: z.string(),
  }),
  guideline: z.object({
    id: z.string(),
    name: z.string(),
  }),
  officialText: z.string(),
  plainEnglish: z.string(),
  whyItMatters: z.string(),
  quickCheck: z.string(),
  url: z.string().url(),
  codeExamples: z.array(codeExampleSchema),
  axeRules: z.array(axeRuleSchema),
  commonMistakes: z.array(z.string()),
  relatedCriteria: z.array(z.string()),
});

export const sourceVersionsSchema = z.object({
  wcagVersion: z.literal("2.2"),
  wcagPublished: z.string(),
  wcagJsonCommit: z.string(),
  axeCoreVersion: z.string(),
  builtAt: z.string(),
});

export const datasetSchema = z.object({
  sourceVersions: sourceVersionsSchema,
  criteria: z.array(criterionSchema),
});

export type Criterion = z.infer<typeof criterionSchema>;
export type Dataset = z.infer<typeof datasetSchema>;
export type SourceVersions = z.infer<typeof sourceVersionsSchema>;
