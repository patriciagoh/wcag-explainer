# Enrich WCAG Dataset with Claude (Phase 2)

You are enriching `scripts/raw/criteria-raw.json` to produce per-criterion cache files in `scripts/cache/`. Phase 1 (fetch) and Phase 3 (merge) are separate — you only do the LLM-rewrite step.

## Inputs

- `scripts/raw/criteria-raw.json` — list of raw criteria
- `scripts/prompts/*.md` — prompt templates for each field

## Output

For each criterion in `criteria-raw.json`, write `scripts/cache/{id}.json` with this shape:

```json
{
  "inputHash": "<sha256 of the raw entry, normalized JSON>",
  "plainEnglish": "...",
  "whyItMatters": "...",
  "quickCheck": "...",
  "commonMistakes": ["...", "..."],
  "codeExamples": [
    { "label": "...", "kind": "pass", "language": "jsx", "code": "...", "source": "G18" },
    { "label": "...", "kind": "fail", "language": "jsx", "code": "...", "source": "F65" }
  ]
}
```

## Procedure

1. **Compute `inputHash`** for each raw entry: sha256 of `JSON.stringify({ officialText, scrapedExamples, axeRules }, sortedKeys)`.

2. **For each criterion in `criteria-raw.json`:**
   a. If `scripts/cache/{id}.json` exists AND its `inputHash` matches the current hash → skip.
   b. Otherwise:
      - Read `scripts/prompts/plain-english.md`, substitute `{{id}}`, `{{title}}`, `{{level}}`, `{{officialText}}`, generate `plainEnglish`.
      - Repeat for `why-it-matters.md` → `whyItMatters`.
      - Repeat for `quick-check.md` → `quickCheck`.
      - Build `axeRulesDescriptions` (one per line: `- {ruleId}: {description}`), substitute into `common-mistakes.md`, generate `commonMistakes` (JSON-parse the response into a string array).
      - Pick the best 1 pass example and 1 fail example from `scrapedExamples`. Heuristic: prefer examples with "pass"/"sufficient"/"correct" in label for pass; "fail"/"insufficient"/"missing" for fail. Fall back to first two if labels are unclear.
      - Read `prompts/html-to-jsx.md`, substitute `{{html}}` with the chosen pass example → produce JSX code. Repeat for fail.
      - Write `scripts/cache/{id}.json`.

3. **Batch by principle** to manage context. Suggested batches:
   - Principle 1 (Perceivable): criteria 1.x — about 27 entries
   - Principle 2 (Operable): criteria 2.x — about 32 entries
   - Principle 3 (Understandable): criteria 3.x — about 17 entries
   - Principle 4 (Robust): criteria 4.x — about 10 entries

4. **Commit between batches:** `git add scripts/cache/ && git commit -m "data: enrich principle N criteria"`.

5. When done, run `cd scripts && npm run build:dataset -- --merge` to produce the final `template/src/data/wcag-criteria.json`.

## If a criterion has no scraped examples

Generate plausible pass/fail code from your knowledge of how engineers typically handle the criterion. Mark `source` as `"synthesized"` in the output. Quality may be lower for these; we accept that.

## If a criterion has no axe rules

`axeRulesDescriptions` becomes an empty list. `commonMistakes` still gets generated, just without axe-rule grounding.

## If your token budget runs low

Save what you've done, commit, end the session. Next session resumes by skipping any criterion whose `cache/{id}.json` is fresh.
