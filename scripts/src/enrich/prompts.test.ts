import { describe, it, expect } from "vitest";
import { fillTemplate, loadPrompt } from "./prompts.ts";

describe("fillTemplate", () => {
  it("substitutes {{vars}}", () => {
    expect(fillTemplate("Hi {{name}} ({{level}})", { name: "1.1.1", level: "A" })).toBe("Hi 1.1.1 (A)");
  });
  it("throws on a missing var", () => {
    expect(() => fillTemplate("Hi {{name}}", {})).toThrow(/name/);
  });
});

describe("loadPrompt", () => {
  it("loads a real prompt file containing its placeholder", () => {
    expect(loadPrompt("plain-english")).toContain("{{officialText}}");
  });
});
