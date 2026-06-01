import { useMemo } from "react";
import type { Criterion, Dataset } from "../types.ts";
import datasetJson from "../data/wcag-criteria.json";

const dataset = datasetJson as Dataset;

export type GuidelineGroup = {
  id: string;
  name: string;
  criteria: Criterion[];
};

export type PrincipleGroup = {
  id: "1" | "2" | "3" | "4";
  name: string;
  guidelines: GuidelineGroup[];
};

export function groupByPrincipleAndGuideline(criteria: Criterion[]): PrincipleGroup[] {
  const byPrinciple = new Map<string, PrincipleGroup>();
  for (const c of criteria) {
    const pid = c.principle.id;
    if (!byPrinciple.has(pid)) {
      byPrinciple.set(pid, { id: pid, name: c.principle.name, guidelines: [] });
    }
    const principle = byPrinciple.get(pid)!;
    let guideline = principle.guidelines.find((g) => g.id === c.guideline.id);
    if (!guideline) {
      guideline = { id: c.guideline.id, name: c.guideline.name, criteria: [] };
      principle.guidelines.push(guideline);
    }
    guideline.criteria.push(c);
  }
  return Array.from(byPrinciple.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function useCriteria() {
  const all = dataset.criteria;
  const byId = useMemo(() => {
    const m = new Map<string, Criterion>();
    for (const c of all) m.set(c.id, c);
    return m;
  }, [all]);
  const grouped = useMemo(() => groupByPrincipleAndGuideline(all), [all]);
  return { all, byId, grouped, sourceVersions: dataset.sourceVersions };
}
