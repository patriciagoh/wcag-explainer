import { createHash } from "node:crypto";
import type { RawCriterion } from "../assemble-raw.ts";

/** Deterministic JSON: object keys sorted recursively, array order preserved. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    const entries = keys.map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

/** sha256 over the criterion's enrichment-relevant raw inputs. */
export function inputHash(
  raw: Pick<RawCriterion, "officialText" | "scrapedExamples" | "axeRules">,
): string {
  const canonical = stableStringify({
    officialText: raw.officialText,
    scrapedExamples: raw.scrapedExamples,
    axeRules: raw.axeRules,
  });
  return createHash("sha256").update(canonical).digest("hex");
}
