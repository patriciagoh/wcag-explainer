import { describe, it, expect } from "vitest";
import { diffSourceVersions } from "./check-updates-core.ts";

describe("diffSourceVersions", () => {
  const baseline = {
    wcagVersion: "2.2" as const,
    wcagPublished: "2023-10-05",
    wcagJsonCommit: "a7f3e2c",
    axeCoreVersion: "4.10.2",
    builtAt: "2026-05-27T10:00:00Z",
  };

  it("reports no changes when nothing differs", () => {
    const result = diffSourceVersions(baseline, {
      wcagJsonCommit: "a7f3e2c",
      axeCoreVersion: "4.10.2",
    });
    expect(result.changed).toBe(false);
    expect(result.notes).toEqual([]);
  });

  it("reports axe-core version bump", () => {
    const result = diffSourceVersions(baseline, {
      wcagJsonCommit: "a7f3e2c",
      axeCoreVersion: "4.11.0",
    });
    expect(result.changed).toBe(true);
    expect(result.notes.some((n) => n.includes("axe-core"))).toBe(true);
  });

  it("reports wcag commit change", () => {
    const result = diffSourceVersions(baseline, {
      wcagJsonCommit: "b1c4d5e",
      axeCoreVersion: "4.10.2",
    });
    expect(result.changed).toBe(true);
    expect(result.notes.some((n) => n.includes("WCAG json"))).toBe(true);
  });
});
