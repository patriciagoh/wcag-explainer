import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { datasetSchema, cacheEntrySchema, type Dataset, type CacheEntry } from "./schema.ts";
import type { RawCriterion } from "./assemble-raw.ts";

const require = createRequire(import.meta.url);

function loadCache(cacheDir: string, id: string): CacheEntry {
  const path = join(cacheDir, `${id}.json`);
  if (!existsSync(path)) {
    throw new Error(`cache miss for ${id} at ${path} — run enrichment (npm run enrich)`);
  }
  const parsed = cacheEntrySchema.safeParse(JSON.parse(readFileSync(path, "utf8")));
  if (!parsed.success) {
    throw new Error(`cache file for ${id} failed validation: ${parsed.error.message}`);
  }
  return parsed.data;
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
