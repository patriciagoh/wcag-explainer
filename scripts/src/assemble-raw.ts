import type { WcagBase } from "./fetchers/wcag.ts";
import type { ScrapedExample } from "./fetchers/techniques.ts";
import type { AxeRuleForCriterion } from "./fetchers/axe.ts";

export type RawCriterion = WcagBase & {
  scrapedExamples: ScrapedExample[];
  axeRules: AxeRuleForCriterion[];
};

export function assembleRaw(
  wcag: WcagBase[],
  examplesByCriterion: Record<string, ScrapedExample[]>,
  rulesByCriterion: Record<string, AxeRuleForCriterion[]>,
): RawCriterion[] {
  return wcag.map((w) => ({
    ...w,
    scrapedExamples: examplesByCriterion[w.id] ?? [],
    axeRules: rulesByCriterion[w.id] ?? [],
  }));
}
