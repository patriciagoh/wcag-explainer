# Manual enrichment fallback (no API key)

Phase 2 enrichment is normally run with the scripted CLI:

```bash
cd scripts
ANTHROPIC_API_KEY=sk-... npm run enrich              # all criteria, incremental
ANTHROPIC_API_KEY=sk-... npm run enrich -- --only=1  # one principle (IDs 1–4)
ANTHROPIC_API_KEY=sk-... npm run enrich -- --force   # re-enrich all, ignore hashes
```

It reads `raw/criteria-raw.json`, calls the Claude API per criterion using the templates in
`prompts/`, and writes `cache/{id}.json` (skipping criteria whose `inputHash` is unchanged).

**If you don't have an API key**, you can perform the same steps by hand in a Claude Code
session: for each criterion in `raw/criteria-raw.json`, apply the `prompts/*.md` templates,
and write a `cache/{id}.json` matching `cacheEntrySchema` in `src/schema.ts` (fields:
`inputHash`, `plainEnglish`, `whyItMatters`, `quickCheck`, `commonMistakes[]`,
`codeExamples[]`).

Don't try to compute `inputHash` by hand. Write the entry with `"inputHash": ""`, then let
the canonical function fill it in (no API call):

```bash
npm run enrich -- --reconcile   # recomputes inputHash for every cache/{id}.json
npm run build:dataset -- --merge
```
