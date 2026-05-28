// @vitest-environment node
import { describe, it, expect } from "vitest";
import { groupByPrincipleAndGuideline } from "./useCriteria.ts";
import type { Criterion } from "../types.ts";

const c = (overrides: Partial<Criterion>): Criterion => ({
  id: "1.4.3",
  title: "Contrast",
  level: "AA",
  version: "2.0",
  principle: { id: "1", name: "Perceivable" },
  guideline: { id: "1.4", name: "Distinguishable" },
  officialText: "",
  plainEnglish: "",
  whyItMatters: "",
  quickCheck: "",
  url: "https://w3.org/",
  codeExamples: [],
  axeRules: [],
  commonMistakes: [],
  relatedCriteria: [],
  ...overrides,
});

describe("groupByPrincipleAndGuideline", () => {
  it("groups criteria under principle → guideline → criteria", () => {
    const criteria = [
      c({ id: "1.4.3" }),
      c({ id: "1.4.6", level: "AAA" }),
      c({ id: "2.4.7", principle: { id: "2", name: "Operable" }, guideline: { id: "2.4", name: "Navigable" } }),
    ];
    const grouped = groupByPrincipleAndGuideline(criteria);
    expect(grouped).toHaveLength(2);
    expect(grouped[0].name).toBe("Perceivable");
    expect(grouped[0].guidelines[0].criteria).toHaveLength(2);
    expect(grouped[1].name).toBe("Operable");
  });

  it("preserves principle id order (1, 2, 3, 4)", () => {
    const criteria = [
      c({ principle: { id: "4", name: "Robust" }, guideline: { id: "4.1", name: "Compatible" } }),
      c({ principle: { id: "1", name: "Perceivable" }, guideline: { id: "1.4", name: "Distinguishable" } }),
    ];
    const grouped = groupByPrincipleAndGuideline(criteria);
    expect(grouped.map((p) => p.id)).toEqual(["1", "4"]);
  });
});
