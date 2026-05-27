import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { extractExamplesFromTechnique } from "./techniques.ts";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, "__fixtures__/technique-g18.html"), "utf8");

describe("extractExamplesFromTechnique", () => {
  it("returns code blocks with example titles", () => {
    const result = extractExamplesFromTechnique(fixture, "G18");
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0]).toMatchObject({
      label: expect.stringContaining("Sufficient contrast"),
      code: expect.stringContaining("#222"),
      sourceTechnique: "G18",
    });
  });

  it("returns empty array on malformed HTML", () => {
    const result = extractExamplesFromTechnique("<html></html>", "G18");
    expect(result).toEqual([]);
  });
});
