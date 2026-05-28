import { describe, it, expect } from "vitest";
import { filterCriteria } from "./useSearch.ts";
import type { Criterion } from "../types.ts";

const c = (overrides: Partial<Criterion>): Criterion => ({
  id: "1.4.3",
  title: "Contrast (Minimum)",
  level: "AA",
  version: "2.0",
  principle: { id: "1", name: "Perceivable" },
  guideline: { id: "1.4", name: "Distinguishable" },
  officialText: "",
  plainEnglish: "Text must have enough contrast against its background.",
  whyItMatters: "",
  quickCheck: "",
  url: "https://w3.org/",
  codeExamples: [],
  axeRules: [],
  commonMistakes: [],
  relatedCriteria: [],
  ...overrides,
});

const all = [
  c({ id: "1.1.1", title: "Non-text Content", plainEnglish: "Provide alt text for images." }),
  c({ id: "1.4.3", title: "Contrast (Minimum)" }),
  c({ id: "2.4.7", title: "Focus Visible", level: "AA", plainEnglish: "Keyboard focus must be visible." }),
];

describe("filterCriteria", () => {
  it("returns all when query is empty", () => {
    expect(filterCriteria(all, "")).toHaveLength(3);
  });
  it("matches by criterion id", () => {
    expect(filterCriteria(all, "1.4.3")).toHaveLength(1);
  });
  it("matches by title (case-insensitive)", () => {
    expect(filterCriteria(all, "contrast")).toHaveLength(1);
  });
  it("matches by plainEnglish keywords", () => {
    expect(filterCriteria(all, "alt text")).toHaveLength(1);
  });
});
