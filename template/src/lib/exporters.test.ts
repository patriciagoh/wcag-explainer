import { describe, it, expect } from "vitest";
import { criterionToMarkdown, checklistToMarkdown, checklistToPrTemplate } from "./exporters.ts";
import datasetJson from "../data/wcag-criteria.json";
import type { Dataset } from "../types.ts";

const all = (datasetJson as Dataset).criteria;
const c = all.find((x) => x.id === "1.1.1")!;

describe("criterionToMarkdown", () => {
  it("includes the heading, why, and quick check", () => {
    const md = criterionToMarkdown(c);
    expect(md).toContain("## 1.1.1 Non-text Content (Level A)");
    expect(md).toContain("**Why it matters:**");
    expect(md).toContain("**Quick check:**");
    expect(md).toContain(c.url);
  });
});

describe("checklistToMarkdown", () => {
  it("renders a checkbox per selected criterion with the project name", () => {
    const md = checklistToMarkdown([c], "Checkout");
    expect(md).toContain("# Checkout — Accessibility checklist");
    expect(md).toContain("- [ ] **1.1.1 Non-text Content** (A)");
  });
});

describe("checklistToPrTemplate", () => {
  it("renders a PR-review checklist", () => {
    const pr = checklistToPrTemplate([c], "");
    expect(pr).toContain("### Accessibility review");
    expect(pr).toContain("`1.1.1` Non-text Content");
  });
});
