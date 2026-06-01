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
  const passMatch = examples.find((e) => has(e.label, PASS_HINTS));
  const failMatch = examples.find((e) => has(e.label, FAIL_HINTS) && e !== passMatch);
  // Only fall back to the first example as "pass" when nothing is labelled a
  // failure — otherwise a lone fail-labelled example would be mislabelled pass.
  const pass = passMatch ?? (failMatch ? undefined : examples[0]);
  const fail = failMatch ?? examples.find((e) => e !== pass);
  return { pass, fail };
}

/** Strip a leading/trailing ```json fence the model may emit despite instructions. */
function stripFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function parseCommonMistakes(raw: string, criterionId: string): string[] {
  try {
    const parsed: unknown = JSON.parse(stripFences(raw));
    if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === "string")) {
      throw new Error("expected a JSON array of strings");
    }
    return parsed as string[];
  } catch (err) {
    throw new Error(
      `Failed to parse commonMistakes for criterion ${criterionId}: ${(err as Error).message}\n` +
        `Raw response: ${raw.slice(0, 200)}`,
    );
  }
}

export async function enrichCriterion(
  raw: RawCriterion,
  client: EnrichmentClient,
): Promise<CacheEntry> {
  const vars = { id: raw.id, title: raw.title, level: raw.level, officialText: raw.officialText };

  // These three prompts are independent — run them concurrently.
  const [plainEnglish, whyItMatters, quickCheck] = await Promise.all([
    client.complete(fillTemplate(loadPrompt("plain-english"), vars)),
    client.complete(fillTemplate(loadPrompt("why-it-matters"), vars)),
    client.complete(fillTemplate(loadPrompt("quick-check"), vars)),
  ]);

  const axeRulesDescriptions = raw.axeRules.map((r) => `- ${r.ruleId}: ${r.description}`).join("\n");
  const mistakesRaw = await client.complete(
    fillTemplate(loadPrompt("common-mistakes"), { ...vars, axeRulesDescriptions }),
  );
  const commonMistakes = parseCommonMistakes(mistakesRaw, raw.id);

  const toJsx = (ex: ScrapedExample) =>
    client.complete(fillTemplate(loadPrompt("html-to-jsx"), { html: ex.code }));

  const { pass, fail } = pickPassFail(raw.scrapedExamples);
  const codeExamples: CacheEntry["codeExamples"] = [];
  if (pass) {
    codeExamples.push({ label: pass.label, kind: "pass", language: "jsx", code: await toJsx(pass), source: pass.sourceTechnique });
  }
  if (fail) {
    codeExamples.push({ label: fail.label, kind: "fail", language: "jsx", code: await toJsx(fail), source: fail.sourceTechnique });
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
