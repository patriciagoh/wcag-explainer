import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseQuickrefHtml } from "./wcag.ts";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, "__fixtures__/quickref-sample.html"), "utf8");

describe("parseQuickrefHtml", () => {
  it("extracts all criteria from the quickref HTML", () => {
    const result = parseQuickrefHtml(fixture);
    expect(result.map((c) => c.id)).toEqual(["1.1.1", "1.4.3", "1.4.6", "2.4.11"]);
  });

  it("maps levels correctly (A / AA / AAA)", () => {
    const result = parseQuickrefHtml(fixture);
    const byId = Object.fromEntries(result.map((c) => [c.id, c]));
    expect(byId["1.1.1"].level).toBe("A");
    expect(byId["1.4.3"].level).toBe("AA");
    expect(byId["1.4.6"].level).toBe("AAA");
  });

  it("picks the earliest version (2.0 over 2.1/2.2)", () => {
    const result = parseQuickrefHtml(fixture);
    const byId = Object.fromEntries(result.map((c) => [c.id, c]));
    expect(byId["1.1.1"].version).toBe("2.0");
    expect(byId["2.4.11"].version).toBe("2.2");
  });

  it("resolves principle and guideline names from the TOC", () => {
    const result = parseQuickrefHtml(fixture);
    const c143 = result.find((c) => c.id === "1.4.3")!;
    expect(c143.principle).toEqual({ id: "1", name: "Perceivable" });
    expect(c143.guideline).toEqual({ id: "1.4", name: "Distinguishable" });

    const c2411 = result.find((c) => c.id === "2.4.11")!;
    expect(c2411.principle).toEqual({ id: "2", name: "Operable" });
    expect(c2411.guideline).toEqual({ id: "2.4", name: "Navigable" });
  });

  it("extracts official text and url", () => {
    const result = parseQuickrefHtml(fixture);
    const c143 = result.find((c) => c.id === "1.4.3")!;
    expect(c143.officialText).toMatch(/contrast ratio of at least 4\.5:1/);
    expect(c143.url).toContain("Understanding/contrast-minimum");
  });
});
