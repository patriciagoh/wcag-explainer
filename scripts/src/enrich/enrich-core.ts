import type { RawCriterion } from "../assemble-raw.ts";
import type { ScrapedExample } from "../fetchers/techniques.ts";
import type { EnrichmentClient } from "./client.ts";
import { inputHash } from "./hash.ts";
import { loadPrompt, fillTemplate } from "./prompts.ts";
import { cacheEntrySchema, type CacheEntry } from "../schema.ts";

const PASS_HINTS = ["pass", "sufficient", "correct"];
const FAIL_HINTS = ["fail", "insufficient", "missing"];

export function pickPassFail(examples: ScrapedExample[]): {
  pass?: ScrapedExample;
  fail?: ScrapedExample;
} {
  const has = (label: string, hints: string[]) => hints.some((h) => label.toLowerCase().includes(h));
  const pass = examples.find((e) => has(e.label, PASS_HINTS)) ?? examples[0];
  const fail =
    examples.find((e) => has(e.label, FAIL_HINTS) && e !== pass) ??
    examples.find((e) => e !== pass);
  return { pass, fail };
}

export async function enrichCriterion(
  raw: RawCriterion,
  client: EnrichmentClient,
): Promise<CacheEntry> {
  const vars = { id: raw.id, title: raw.title, level: raw.level, officialText: raw.officialText };

  const plainEnglish = await client.complete(fillTemplate(loadPrompt("plain-english"), vars));
  const whyItMatters = await client.complete(fillTemplate(loadPrompt("why-it-matters"), vars));
  const quickCheck = await client.complete(fillTemplate(loadPrompt("quick-check"), vars));

  const axeRulesDescriptions = raw.axeRules.map((r) => `- ${r.ruleId}: ${r.description}`).join("\n");
  const mistakesRaw = await client.complete(
    fillTemplate(loadPrompt("common-mistakes"), { ...vars, axeRulesDescriptions }),
  );
  const commonMistakes = JSON.parse(mistakesRaw) as string[];

  const { pass, fail } = pickPassFail(raw.scrapedExamples);
  const codeExamples: CacheEntry["codeExamples"] = [];
  if (pass) {
    const code = await client.complete(fillTemplate(loadPrompt("html-to-jsx"), { html: pass.code }));
    codeExamples.push({ label: pass.label, kind: "pass", language: "jsx", code, source: pass.sourceTechnique });
  }
  if (fail) {
    const code = await client.complete(fillTemplate(loadPrompt("html-to-jsx"), { html: fail.code }));
    codeExamples.push({ label: fail.label, kind: "fail", language: "jsx", code, source: fail.sourceTechnique });
  }

  const entry: CacheEntry = {
    inputHash: inputHash(raw),
    plainEnglish,
    whyItMatters,
    quickCheck,
    commonMistakes,
    codeExamples,
  };
  return cacheEntrySchema.parse(entry);
}
