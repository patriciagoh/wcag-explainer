import { describe, it, expect } from "vitest";
import { pickPassFail, enrichCriterion } from "./enrich-core.ts";
import { cacheEntrySchema } from "../schema.ts";
import type { EnrichmentClient } from "./client.ts";

const rawWithExamples = {
  id: "1.1.1",
  title: "Non-text Content",
  level: "A",
  officialText: "All non-text content...",
  scrapedExamples: [
    { label: "Sufficient: image with alt", code: "<img alt='x'>", sourceTechnique: "H37" },
    { label: "Failure: missing alt", code: "<img>", sourceTechnique: "F65" },
  ],
  axeRules: [{ ruleId: "image-alt", impact: "critical", description: "Images need alt", url: "https://x" }],
};

describe("pickPassFail", () => {
  it("matches pass/fail by label hints", () => {
    const { pass, fail } = pickPassFail(rawWithExamples.scrapedExamples as never);
    expect(pass?.sourceTechnique).toBe("H37");
    expect(fail?.sourceTechnique).toBe("F65");
  });

  it("does not mislabel a single fail-only example as a pass", () => {
    const { pass, fail } = pickPassFail([
      { label: "Failure: missing alt", code: "<img>", sourceTechnique: "F65" },
    ] as never);
    expect(pass).toBeUndefined();
    expect(fail?.sourceTechnique).toBe("F65");
  });

  it("uses the next example as fail when only a pass label matches", () => {
    const { pass, fail } = pickPassFail([
      { label: "Correct usage", code: "a", sourceTechnique: "G1" },
      { label: "Another example", code: "b", sourceTechnique: "G2" },
    ] as never);
    expect(pass?.sourceTechnique).toBe("G1");
    expect(fail?.sourceTechnique).toBe("G2");
  });

  it("falls back to positional pass/fail when no labels match", () => {
    const { pass, fail } = pickPassFail([
      { label: "Example one", code: "a", sourceTechnique: "X1" },
      { label: "Example two", code: "b", sourceTechnique: "X2" },
    ] as never);
    expect(pass?.sourceTechnique).toBe("X1");
    expect(fail?.sourceTechnique).toBe("X2");
  });
});

describe("enrichCriterion", () => {
  // Mock client: returns a valid JSON array for common-mistakes, plain text otherwise.
  const mock: EnrichmentClient = {
    async complete(prompt: string) {
      if (prompt.includes("JSON array")) return '["Mistake one.", "Mistake two."]';
      if (prompt.includes("HTML → JSX") || prompt.includes("HTML")) return "<img alt=\"x\" />";
      return "Generated text.";
    },
  };

  it("produces a schema-valid cache entry with inputHash and pass/fail examples", async () => {
    const entry = await enrichCriterion(rawWithExamples as never, mock);
    expect(() => cacheEntrySchema.parse(entry)).not.toThrow();
    expect(entry.inputHash).toMatch(/^[0-9a-f]{64}$/);
    expect(entry.commonMistakes).toEqual(["Mistake one.", "Mistake two."]);
    expect(entry.codeExamples.map((e) => e.kind)).toEqual(["pass", "fail"]);
  });

  it("handles a criterion with no scraped examples (no code examples)", async () => {
    const bare = { ...rawWithExamples, scrapedExamples: [] };
    const entry = await enrichCriterion(bare as never, mock);
    expect(entry.codeExamples).toEqual([]);
    expect(() => cacheEntrySchema.parse(entry)).not.toThrow();
  });

  it("tolerates fenced JSON in the common-mistakes response", async () => {
    const fencedMock: EnrichmentClient = {
      async complete(prompt: string) {
        if (prompt.includes("JSON array")) return "```json\n[\"Only mistake.\"]\n```";
        return "x";
      },
    };
    const entry = await enrichCriterion(rawWithExamples as never, fencedMock);
    expect(entry.commonMistakes).toEqual(["Only mistake."]);
  });

  it("throws a criterion-scoped error when common-mistakes is not JSON", async () => {
    const badMock: EnrichmentClient = {
      async complete(prompt: string) {
        if (prompt.includes("JSON array")) return "Here are some mistakes you might make.";
        return "x";
      },
    };
    await expect(enrichCriterion(rawWithExamples as never, badMock)).rejects.toThrow(/1\.1\.1/);
  });
});
