#!/usr/bin/env tsx
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchWcagJson, parseWcagJson } from "./src/fetchers/wcag.ts";
import { fetchTechnique, extractExamplesFromTechnique, type ScrapedExample } from "./src/fetchers/techniques.ts";
import { loadAxeRules, groupRulesByCriterion } from "./src/fetchers/axe.ts";
import { assembleRaw, type RawCriterion } from "./src/assemble-raw.ts";
import { mergeDataset } from "./src/merge.ts";

const here = dirname(fileURLToPath(import.meta.url));
const RAW_PATH = join(here, "raw/criteria-raw.json");
const CACHE_DIR = join(here, "cache");
const OUTPUT_PATH = join(here, "..", "template/src/data/wcag-criteria.json");

const WCAG_JSON_URL = "https://raw.githubusercontent.com/w3c/wcag/main/_data/wcag22.json";

const TECHNIQUES_BY_CRITERION: Record<string, string[]> = {
  "1.4.3": ["G18", "G145"],
  "1.1.1": ["H37", "H67", "H86"],
};

async function fetchPhase(): Promise<void> {
  console.log("Phase 1.1: fetching wcag.json...");
  const wcagInput = await fetchWcagJson(WCAG_JSON_URL);
  const wcagBase = parseWcagJson(wcagInput);
  console.log(`  → ${wcagBase.length} criteria`);

  console.log("Phase 1.2: scraping technique pages...");
  const examples: Record<string, ScrapedExample[]> = {};
  for (const [criterionId, techniqueIds] of Object.entries(TECHNIQUES_BY_CRITERION)) {
    const all: ScrapedExample[] = [];
    for (const tid of techniqueIds) {
      try {
        const html = await fetchTechnique(tid);
        all.push(...extractExamplesFromTechnique(html, tid));
      } catch (e) {
        console.warn(`  ! technique ${tid} for ${criterionId} failed: ${(e as Error).message}`);
      }
    }
    examples[criterionId] = all;
  }

  console.log("Phase 1.3: reading axe-core rules...");
  const rules = await loadAxeRules();
  const rulesByCriterion = groupRulesByCriterion(rules);

  console.log("Phase 1.4: assembling raw...");
  const raw = assembleRaw(wcagBase, examples, rulesByCriterion);

  mkdirSync(dirname(RAW_PATH), { recursive: true });
  writeFileSync(RAW_PATH, JSON.stringify(raw, null, 2));
  console.log(`Wrote ${RAW_PATH}`);
}

async function mergePhase(): Promise<void> {
  const raw = JSON.parse(readFileSync(RAW_PATH, "utf8")) as RawCriterion[];
  const dataset = mergeDataset(raw, CACHE_DIR);
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(dataset, null, 2));
  console.log(`Wrote ${OUTPUT_PATH} with ${dataset.criteria.length} criteria`);
}

const cmd = process.argv[2];
if (cmd === "--fetch") {
  await fetchPhase();
} else if (cmd === "--merge") {
  await mergePhase();
} else if (cmd === "--rebuild-changed") {
  await fetchPhase();
  await mergePhase();
} else {
  console.error("Usage: tsx build-dataset.ts [--fetch | --merge | --rebuild-changed]");
  process.exit(1);
}
