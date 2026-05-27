import { describe, it, expect } from "vitest";
import { groupRulesByCriterion } from "./axe.ts";

describe("groupRulesByCriterion", () => {
  it("maps wcag tags to criterion ids", () => {
    const rules = [
      {
        ruleId: "color-contrast",
        impact: "serious" as const,
        description: "Ensures contrast ratio",
        tags: ["wcag2aa", "wcag143"],
      },
      {
        ruleId: "button-name",
        impact: "critical" as const,
        description: "Buttons must have names",
        tags: ["wcag2a", "wcag412"],
      },
    ];
    const result = groupRulesByCriterion(rules);
    expect(result["1.4.3"]).toHaveLength(1);
    expect(result["1.4.3"][0].ruleId).toBe("color-contrast");
    expect(result["4.1.2"][0].ruleId).toBe("button-name");
  });

  it("ignores rules with no wcag tag", () => {
    const rules = [
      { ruleId: "best-practice-1", impact: "minor" as const, description: "x", tags: ["best-practice"] },
    ];
    expect(Object.keys(groupRulesByCriterion(rules))).toHaveLength(0);
  });

  it("converts wcag tag like 'wcag143' to id '1.4.3'", () => {
    const rules = [
      { ruleId: "r", impact: "minor" as const, description: "d", tags: ["wcag143"] },
    ];
    const result = groupRulesByCriterion(rules);
    expect(result["1.4.3"]).toBeDefined();
  });
});
