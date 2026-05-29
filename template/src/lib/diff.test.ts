import { describe, it, expect } from "vitest";
import { lineDiff } from "./diff.ts";

describe("lineDiff", () => {
  it("marks unchanged lines as same", () => {
    const d = lineDiff("a\nb", "a\nb");
    expect(d.every((l) => l.type === "same")).toBe(true);
  });

  it("detects an added line", () => {
    const d = lineDiff("a\nc", "a\nb\nc");
    expect(d.find((l) => l.type === "add")?.text).toBe("b");
  });

  it("detects a removed line", () => {
    const d = lineDiff("a\nb\nc", "a\nc");
    expect(d.find((l) => l.type === "del")?.text).toBe("b");
  });

  it("represents a one-line replacement as a del + add", () => {
    const d = lineDiff('<img src="x" />', '<img src="x" alt="A cat" />');
    expect(d.some((l) => l.type === "del")).toBe(true);
    expect(d.some((l) => l.type === "add")).toBe(true);
  });
});
