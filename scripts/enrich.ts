#!/usr/bin/env tsx
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { RawCriterion } from "./src/assemble-raw.ts";
import { inputHash } from "./src/enrich/hash.ts";
import { enrichCriterion } from "./src/enrich/enrich-core.ts";
import { createAnthropicClient } from "./src/enrich/client.ts";

const here = dirname(fileURLToPath(import.meta.url));
const RAW_PATH = join(here, "raw/criteria-raw.json");
const CACHE_DIR = join(here, "cache");

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    // `|| undefined` maps a bare `--only=` (empty value) to "no filter" rather
    // than silently selecting everything.
    only: args.find((a) => a.startsWith("--only="))?.slice("--only=".length) || undefined,
    force: args.includes("--force"),
    reconcile: args.includes("--reconcile"),
  };
}

function cachePath(id: string): string {
  return join(CACHE_DIR, `${id}.json`);
}

function isFresh(raw: RawCriterion): boolean {
  const path = cachePath(raw.id);
  if (!existsSync(path)) return false;
  const cached = JSON.parse(readFileSync(path, "utf8")) as { inputHash?: string };
  return cached.inputHash === inputHash(raw);
}

function writeEntry(id: string, entry: unknown): void {
  writeFileSync(cachePath(id), JSON.stringify(entry, null, 2) + "\n");
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const idx = next++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main(): Promise<void> {
  const { only, force, reconcile } = parseArgs();
  const raw = JSON.parse(readFileSync(RAW_PATH, "utf8")) as RawCriterion[];
  const selected = only ? raw.filter((r) => r.principle.id === only) : raw;
  if (only && selected.length === 0) {
    console.error(`--only="${only}" matched no criteria. Valid principle IDs are: 1, 2, 3, 4.`);
    process.exit(1);
  }

  // --reconcile: recompute inputHash for existing cache files WITHOUT calling the API.
  // Used once to normalize legacy hashes to the canonical function. Content untouched.
  if (reconcile) {
    let n = 0;
    for (const r of selected) {
      const path = cachePath(r.id);
      if (!existsSync(path)) continue;
      const entry = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
      entry.inputHash = inputHash(r);
      writeEntry(r.id, entry);
      n++;
    }
    console.log(`Reconciled inputHash for ${n} cache files (no content change).`);
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not set. Enrichment calls the Claude API. Aborting.");
    process.exit(1);
  }
  const client = createAnthropicClient({ apiKey, model: process.env.ENRICH_MODEL });

  const todo = force ? selected : selected.filter((r) => !isFresh(r));
  console.log(`${todo.length}/${selected.length} criteria to enrich (${selected.length - todo.length} fresh, skipped).`);
  mkdirSync(CACHE_DIR, { recursive: true });

  await mapWithConcurrency(todo, 4, async (r) => {
    const entry = await enrichCriterion(r, client);
    writeEntry(r.id, entry);
    console.log(`  ✓ ${r.id}`);
  });
}

await main().catch((err: unknown) => {
  console.error("Enrichment failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
