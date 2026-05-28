import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { datasetSchema, type Dataset } from "./schema.ts";
import type { RawCriterion } from "./assemble-raw.ts";

const require = createRequire(import.meta.url);

type CacheEntry = {
  inputHash: string;
  plainEnglish: string;
  whyItMatters: string;
  quickCheck: string;
  commonMistakes: string[];
  codeExamples: Array<{
    label: string;
    kind: "pass" | "fail";
    language: "jsx" | "tsx" | "html" | "css";
    code: string;
    note?: string;
    source?: string;
  }>;
};

function loadCache(cacheDir: string, id: string): CacheEntry {
  const path = join(cacheDir, `${id}.json`);
  if (!existsSync(path)) {
    throw new Error(`cache miss for ${id} at ${path} — run Phase 2 enrichment`);
  }
  return JSON.parse(readFileSync(path, "utf8")) as CacheEntry;
}

function readAxeCoreVersion(): string {
  try {
    const pkg = require("axe-core/package.json") as { version: string };
    return pkg.version;
  } catch {
    return "unknown";
  }
}

export function mergeDataset(raw: RawCriterion[], cacheDir: string): Dataset {
  const criteria = raw.map((r) => {
    const cache = loadCache(cacheDir, r.id);
    return {
      id: r.id,
      title: r.title,
      level: r.level,
      version: r.version,
      principle: r.principle,
      guideline: r.guideline,
      officialText: r.officialText,
      plainEnglish: cache.plainEnglish,
      whyItMatters: cache.whyItMatters,
      quickCheck: cache.quickCheck,
      url: r.url,
      codeExamples: cache.codeExamples,
      axeRules: r.axeRules,
      commonMistakes: cache.commonMistakes,
      relatedCriteria: [],
    };
  });

  const dataset: Dataset = {
    sourceVersions: {
      wcagVersion: "2.2",
      wcagPublished: "2023-10-05",
      wcagJsonCommit: process.env.WCAG_JSON_COMMIT ?? "unknown",
      axeCoreVersion: readAxeCoreVersion(),
      builtAt: new Date().toISOString(),
    },
    criteria,
  };

  return datasetSchema.parse(dataset);
}
