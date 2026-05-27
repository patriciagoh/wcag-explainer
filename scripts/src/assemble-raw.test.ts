import { describe, it, expect } from "vitest";
import { assembleRaw } from "./assemble-raw.ts";
import type { WcagBase } from "./fetchers/wcag.ts";
import type { ScrapedExample } from "./fetchers/techniques.ts";
import type { AxeRuleForCriterion } from "./fetchers/axe.ts";

describe("assembleRaw", () => {
  const wcag: WcagBase[] = [
    {
      id: "1.4.3",
      title: "Contrast (Minimum)",
      level: "AA",
      version: "2.0",
      principle: { id: "1", name: "Perceivable" },
      guideline: { id: "1.4", name: "Distinguishable" },
      officialText: "Text contrast...",
      url: "https://w3.org/...",
    },
  ];
  const examplesByCriterion: Record<string, ScrapedExample[]> = {
    "1.4.3": [{ label: "Pass", code: "<p>ok</p>", sourceTechnique: "G18" }],
  };
  const rulesByCriterion: Record<string, AxeRuleForCriterion[]> = {
    "1.4.3": [
      { ruleId: "color-contrast", impact: "serious", description: "x", url: "https://..." },
    ],
  };

  it("merges into one raw entry per criterion", () => {
    const result = assembleRaw(wcag, examplesByCriterion, rulesByCriterion);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "1.4.3",
      title: "Contrast (Minimum)",
      scrapedExamples: [{ sourceTechnique: "G18" }],
      axeRules: [{ ruleId: "color-contrast" }],
    });
  });

  it("includes criteria with no scraped examples or rules", () => {
    const result = assembleRaw(wcag, {}, {});
    expect(result).toHaveLength(1);
    expect(result[0].scrapedExamples).toEqual([]);
    expect(result[0].axeRules).toEqual([]);
  });
});
