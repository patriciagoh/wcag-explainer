import type { SourceVersions } from "./schema.ts";

export type UpstreamSnapshot = {
  wcagJsonCommit: string;
  axeCoreVersion: string;
};

export type DiffResult = {
  changed: boolean;
  notes: string[];
};

export function diffSourceVersions(
  baseline: SourceVersions,
  current: UpstreamSnapshot,
): DiffResult {
  const notes: string[] = [];
  if (baseline.wcagJsonCommit !== current.wcagJsonCommit) {
    notes.push(`WCAG json: commit ${baseline.wcagJsonCommit} → ${current.wcagJsonCommit}`);
  }
  if (baseline.axeCoreVersion !== current.axeCoreVersion) {
    notes.push(`axe-core: ${baseline.axeCoreVersion} → ${current.axeCoreVersion}`);
  }
  return { changed: notes.length > 0, notes };
}
