#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { diffSourceVersions } from "./src/check-updates-core.ts";
import type { Dataset } from "./src/schema.ts";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const datasetPath = join(here, "..", "template/src/data/wcag-criteria.json");
const dataset = JSON.parse(readFileSync(datasetPath, "utf8")) as Dataset;

async function currentWcagCommit(): Promise<string> {
  const res = await fetch(
    "https://api.github.com/repos/w3c/wcag/commits/main?per_page=1",
  );
  if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
  const data = (await res.json()) as { sha: string };
  return data.sha.slice(0, 7);
}

function currentAxeCoreVersion(): string {
  const pkg = require("axe-core/package.json") as { version: string };
  return pkg.version;
}

const current = {
  wcagJsonCommit: await currentWcagCommit(),
  axeCoreVersion: currentAxeCoreVersion(),
};

const result = diffSourceVersions(dataset.sourceVersions, current);
if (result.changed) {
  console.log("# WCAG source updates detected\n");
  for (const n of result.notes) console.log(`- ${n}`);
  process.exit(1);
} else {
  console.log("No upstream changes since last build.");
  process.exit(0);
}
