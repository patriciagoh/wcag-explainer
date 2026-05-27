import { describe, it, expect } from "vitest";
import { parseWcagJson } from "./wcag.ts";
import sample from "./__fixtures__/wcag-sample.json" with { type: "json" };

describe("parseWcagJson", () => {
  it("flattens principle → guideline → criterion into a list", () => {
    const result = parseWcagJson(sample);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "1.4.3",
      title: "Contrast (Minimum)",
      level: "AA",
      version: "2.0",
      principle: { id: "1", name: "Perceivable" },
      guideline: { id: "1.4", name: "Distinguishable" },
      officialText: expect.stringContaining("contrast ratio"),
      url: expect.stringContaining("w3.org"),
    });
  });

  it("picks the earliest version from versions array", () => {
    const result = parseWcagJson(sample);
    expect(result[0].version).toBe("2.0");
  });
});
