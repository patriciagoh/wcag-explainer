export type RawAxeRule = {
  ruleId: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  description: string;
  tags: string[];
};

export type AxeRuleForCriterion = {
  ruleId: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  description: string;
  url: string;
};

function wcagTagToCriterionId(tag: string): string | null {
  // axe uses tags like "wcag143" for criterion 1.4.3, "wcag412" for 4.1.2,
  // "wcag2410" for 2.4.10. Sections of 1+ digits each.
  const m = /^wcag(\d)(\d)(\d{1,2})$/.exec(tag);
  if (!m) return null;
  return `${m[1]}.${m[2]}.${parseInt(m[3], 10)}`;
}

export function groupRulesByCriterion(
  rules: RawAxeRule[],
): Record<string, AxeRuleForCriterion[]> {
  const out: Record<string, AxeRuleForCriterion[]> = {};
  for (const r of rules) {
    for (const tag of r.tags) {
      const id = wcagTagToCriterionId(tag);
      if (!id) continue;
      if (!out[id]) out[id] = [];
      out[id].push({
        ruleId: r.ruleId,
        impact: r.impact,
        description: r.description,
        url: `https://dequeuniversity.com/rules/axe/4.10/${r.ruleId}`,
      });
    }
  }
  return out;
}

export async function loadAxeRules(): Promise<RawAxeRule[]> {
  const axe = await import("axe-core");
  const rules = (axe.default as any).getRules() as Array<{
    ruleId: string;
    description: string;
    tags: string[];
  }>;
  return rules.map((r) => ({
    ruleId: r.ruleId,
    impact: "moderate",
    description: r.description,
    tags: r.tags,
  }));
}
