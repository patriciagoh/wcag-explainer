// Composition layer for the value-add side datasets. These augment the
// build-pipeline WCAG dataset with app-level data (assistive-tech experience,
// component/role facets, eslint-plugin-jsx-a11y mappings) without touching the
// validated wcag-criteria.json contract.
import type { Criterion } from "./types.ts";
import assistiveTechJson from "./data/assistive-tech.json";
import facetsJson from "./data/facets.json";
import eslintJson from "./data/eslint-jsx-a11y.json";

export type AssistiveExperience = { fail: string; pass: string };
export type Facets = { components: string[]; roles: string[] };
export type EslintRule = { criteria: string[]; description: string; url: string };

const assistiveTech = assistiveTechJson as Record<string, AssistiveExperience>;
const facets = facetsJson as Record<string, Facets>;
export const eslintRules = eslintJson as Record<string, EslintRule>;

export function getExperience(id: string): AssistiveExperience | undefined {
  return assistiveTech[id];
}

export function getFacets(id: string): Facets {
  return facets[id] ?? { components: [], roles: [] };
}

export const allComponents: string[] = [
  ...new Set(Object.values(facets).flatMap((f) => f.components)),
].sort();

export const allRoles: string[] = [
  ...new Set(Object.values(facets).flatMap((f) => f.roles)),
].sort();

export function matchesFacets(
  id: string,
  component: string | null,
  role: string | null,
): boolean {
  const f = getFacets(id);
  if (component && !f.components.includes(component)) return false;
  if (role && !f.roles.includes(role)) return false;
  return true;
}

export type RuleHit = {
  source: "axe-core" | "jsx-a11y";
  rule: string;
  description: string;
  url: string;
  criteria: string[];
};

/**
 * Look up a scanner/linter rule (axe-core or eslint-plugin-jsx-a11y) and return
 * the criteria it maps to. Matches on rule id substring, case-insensitive.
 */
export function lookupRule(query: string, all: Criterion[]): RuleHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: RuleHit[] = [];

  // axe-core rules live on each criterion; invert to ruleId -> criteria.
  const axe = new Map<string, { description: string; url: string; criteria: Set<string> }>();
  for (const c of all) {
    for (const r of c.axeRules) {
      if (!axe.has(r.ruleId)) {
        axe.set(r.ruleId, { description: r.description, url: r.url, criteria: new Set() });
      }
      axe.get(r.ruleId)!.criteria.add(c.id);
    }
  }
  for (const [ruleId, info] of axe) {
    if (ruleId.toLowerCase().includes(q)) {
      hits.push({
        source: "axe-core",
        rule: ruleId,
        description: info.description,
        url: info.url,
        criteria: [...info.criteria].sort(),
      });
    }
  }

  // eslint-plugin-jsx-a11y rules from the side map.
  for (const [rule, info] of Object.entries(eslintRules)) {
    if (rule.toLowerCase().includes(q)) {
      hits.push({
        source: "jsx-a11y",
        rule,
        description: info.description,
        url: info.url,
        criteria: info.criteria,
      });
    }
  }

  return hits.sort((a, b) => a.rule.localeCompare(b.rule));
}
