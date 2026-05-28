import { describe, it, expect } from "vitest";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mergeDataset } from "./merge.ts";
import type { RawCriterion } from "./assemble-raw.ts";

describe("mergeDataset", () => {
  const raw: RawCriterion[] = [
    {
      id: "1.4.3",
      title: "Contrast (Minimum)",
      level: "AA",
      version: "2.0",
      principle: { id: "1", name: "Perceivable" },
      guideline: { id: "1.4", name: "Distinguishable" },
      officialText: "Text contrast...",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum",
      scrapedExamples: [],
      axeRules: [
        { ruleId: "color-contrast", impact: "serious", description: "x", url: "https://dequeuniversity.com/" },
      ],
    },
  ];

  it("validates output against the schema", () => {
    const cacheDir = mkdtempSync(join(tmpdir(), "wcag-cache-"));
    writeFileSync(
      join(cacheDir, "1.4.3.json"),
      JSON.stringify({
        inputHash: "abc",
        plainEnglish: "Make sure text contrasts with its background.",
        whyItMatters: "Low-contrast text excludes ~15% of older users.",
        quickCheck: "Open devtools → Accessibility tab → check contrast.",
        commonMistakes: ["Light gray on white"],
        codeExamples: [
          { label: "Pass", kind: "pass", language: "jsx", code: "<p>ok</p>" },
          { label: "Fail", kind: "fail", language: "jsx", code: "<p>bad</p>" },
        ],
      }),
    );
    const result = mergeDataset(raw, cacheDir);
    expect(result.criteria).toHaveLength(1);
    expect(result.criteria[0].plainEnglish).toMatch(/text contrasts/);
    expect(result.criteria[0].codeExamples).toHaveLength(2);
    expect(result.sourceVersions.wcagVersion).toBe("2.2");
  });

  it("throws on missing cache entry", () => {
    const cacheDir = mkdtempSync(join(tmpdir(), "wcag-cache-"));
    expect(() => mergeDataset(raw, cacheDir)).toThrow(/cache miss/i);
  });
});
