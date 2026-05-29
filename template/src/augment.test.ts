import { describe, it, expect } from "vitest";
import { lookupRule, matchesFacets, getExperience, getFacets, allComponents } from "./augment.ts";
import datasetJson from "./data/wcag-criteria.json";
import type { Dataset } from "./types.ts";

const all = (datasetJson as Dataset).criteria;

describe("lookupRule", () => {
  it("maps an axe-core rule to its criteria", () => {
    const hits = lookupRule("image-alt", all);
    const axe = hits.find((h) => h.source === "axe-core" && h.rule === "image-alt");
    expect(axe).toBeTruthy();
    expect(axe!.criteria).toContain("1.1.1");
  });

  it("maps an eslint-plugin-jsx-a11y rule to its criteria", () => {
    const hits = lookupRule("alt-text", all);
    const lint = hits.find((h) => h.source === "jsx-a11y" && h.rule === "alt-text");
    expect(lint).toBeTruthy();
    expect(lint!.criteria).toContain("1.1.1");
  });

  it("returns nothing for an empty query", () => {
    expect(lookupRule("", all)).toEqual([]);
  });
});

describe("facets", () => {
  it("every criterion has at least one component tag", () => {
    expect(all.every((c) => getFacets(c.id).components.length > 0)).toBe(true);
  });

  it("matchesFacets filters by component", () => {
    const someComponent = allComponents[0];
    const matching = all.filter((c) => matchesFacets(c.id, someComponent, null));
    expect(matching.length).toBeGreaterThan(0);
    expect(matching.every((c) => getFacets(c.id).components.includes(someComponent))).toBe(true);
  });

  it("matchesFacets with no filters passes everything", () => {
    expect(all.every((c) => matchesFacets(c.id, null, null))).toBe(true);
  });
});

describe("assistive-tech experience", () => {
  it("has a fail/pass pair for every criterion in the dataset", () => {
    expect(all.every((c) => Boolean(getExperience(c.id)?.fail && getExperience(c.id)?.pass))).toBe(
      true,
    );
  });
});

// guard: keep the augment data in lockstep with the shipped dataset
describe("dataset integrity", () => {
  it("loads all 87 criteria", () => {
    expect(all.length).toBe(87);
  });
});
