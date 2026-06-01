import { describe, it, expect } from "vitest";
import { stableStringify, inputHash } from "./hash.ts";

describe("stableStringify", () => {
  it("sorts object keys recursively", () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });
  it("preserves array order", () => {
    expect(stableStringify([3, 1, 2])).toBe("[3,1,2]");
  });
  it("serializes null like JSON", () => {
    expect(stableStringify(null)).toBe("null");
    expect(stableStringify({ a: null })).toBe('{"a":null}');
  });
});

describe("inputHash", () => {
  const raw = {
    officialText: "All non-text content...",
    scrapedExamples: [{ label: "Pass", code: "<img alt='x'>", sourceTechnique: "H37" }],
    axeRules: [{ ruleId: "image-alt", impact: "critical", description: "d", url: "https://x" }],
  };
  it("is stable regardless of key order in input", () => {
    const reordered = { axeRules: raw.axeRules, scrapedExamples: raw.scrapedExamples, officialText: raw.officialText };
    expect(inputHash(raw as never)).toBe(inputHash(reordered as never));
  });
  it("returns a 64-char hex sha256", () => {
    expect(inputHash(raw as never)).toMatch(/^[0-9a-f]{64}$/);
  });
  it("changes when officialText changes", () => {
    expect(inputHash(raw as never)).not.toBe(inputHash({ ...raw, officialText: "different" } as never));
  });
});
