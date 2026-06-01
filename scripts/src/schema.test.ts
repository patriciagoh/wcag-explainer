import { describe, it, expect } from "vitest";
import { criterionSchema, datasetSchema } from "./schema.ts";

const validCriterion = {
  id: "1.4.3",
  title: "Contrast (Minimum)",
  level: "AA",
  version: "2.0",
  principle: { id: "1", name: "Perceivable" },
  guideline: { id: "1.4", name: "Distinguishable" },
  officialText: "The visual presentation of text...",
  plainEnglish: "Text must have enough contrast against its background.",
  whyItMatters: "Low contrast text is unreadable for ~15% of users over 50.",
  quickCheck: "Open devtools → Accessibility → check Contrast.",
  url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum",
  codeExamples: [
    {
      label: "Pass: sufficient contrast",
      kind: "pass",
      language: "jsx",
      code: "<p style={{ color: '#222', background: '#fff' }}>Hello</p>",
    },
  ],
  axeRules: [
    {
      ruleId: "color-contrast",
      impact: "serious",
      description: "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
      url: "https://dequeuniversity.com/rules/axe/4.10/color-contrast",
    },
  ],
  commonMistakes: ["Light gray on white text", "Buttons with low-contrast hover states"],
  relatedCriteria: ["1.4.6", "1.4.11"],
};

describe("criterionSchema", () => {
  it("accepts a valid criterion", () => {
    expect(() => criterionSchema.parse(validCriterion)).not.toThrow();
  });

  it("rejects an invalid level", () => {
    expect(() => criterionSchema.parse({ ...validCriterion, level: "B" })).toThrow();
  });

  it("rejects a missing required field", () => {
    const { plainEnglish, ...rest } = validCriterion;
    expect(() => criterionSchema.parse(rest)).toThrow();
  });
});

describe("datasetSchema", () => {
  it("accepts a valid dataset", () => {
    const ds = {
      sourceVersions: {
        wcagVersion: "2.2",
        wcagPublished: "2023-10-05",
        wcagJsonCommit: "a7f3e2c",
        axeCoreVersion: "4.10.2",
        builtAt: "2026-05-27T10:00:00Z",
      },
      criteria: [validCriterion],
    };
    expect(() => datasetSchema.parse(ds)).not.toThrow();
  });
});

import { cacheEntrySchema } from "./schema.ts";

describe("cacheEntrySchema", () => {
  it("accepts a valid cache entry", () => {
    const entry = {
      inputHash: "abc123",
      plainEnglish: "Images need alt text.",
      whyItMatters: "Screen reader users get nothing otherwise.",
      quickCheck: "Run axe DevTools.",
      commonMistakes: ["Missing alt attribute."],
      codeExamples: [
        { label: "Pass", kind: "pass", language: "jsx", code: "<img alt='x' />", source: "H37" },
      ],
    };
    expect(() => cacheEntrySchema.parse(entry)).not.toThrow();
  });

  it("rejects an entry missing inputHash", () => {
    expect(() => cacheEntrySchema.parse({ plainEnglish: "x" })).toThrow();
  });
});
