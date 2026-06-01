# wcag-explainer OSS Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring wcag-explainer to a reference-grade open-source bar — CI test/lint gate, full OSS hygiene, a scripted (reproducible) dataset enrichment step, and an architecture doc others can copy.

**Architecture:** Purely additive. The existing layout (`SKILL.md` + `template/` + `scripts/` + `docs/`) is preserved. `template/` stays copy-clean (no root workspace). New work lands in `.github/`, root hygiene files, and a new `scripts/src/enrich/` module that codifies the previously-manual Phase 2 enrichment behind a mockable client interface.

**Tech Stack:** Node 20, TypeScript (tsx), vitest, zod, `@anthropic-ai/sdk`, GitHub Actions.

**Branch:** `chore/oss-hardening` (already created).

---

## File Structure

**Group A — CI & hygiene (no code logic):**
- Create `.github/workflows/ci.yml` — lint + test gate, both packages
- Create `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`, `ARCHITECTURE.md`
- Create `.github/ISSUE_TEMPLATE/{bug_report.yml,feature_request.yml,config.yml}`, `.github/PULL_REQUEST_TEMPLATE.md`
- Modify `README.md` — add CI badge + CONTRIBUTING link

**Group B — Enrichment automation (TDD):**
- Modify `scripts/src/schema.ts` — add `cacheEntrySchema` / `CacheEntry`
- Create `scripts/src/enrich/hash.ts` — canonical `inputHash`
- Create `scripts/src/enrich/prompts.ts` — load + `{{var}}` substitution
- Create `scripts/src/enrich/client.ts` — `EnrichmentClient` interface + Anthropic impl
- Create `scripts/src/enrich/enrich-core.ts` — per-criterion orchestration
- Create `scripts/enrich.ts` — CLI entry (`--only`, `--force`, `--reconcile`)
- Modify `scripts/package.json` — `@anthropic-ai/sdk` dep + `enrich` script
- Modify `scripts/enrich-with-claude.md` — trim to manual-fallback note
- One-time: run `--reconcile`, commit normalized hashes

---

# GROUP A — CI & Hygiene

### Task 1: CI test/lint workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        package: [template, scripts]
    defaults:
      run:
        working-directory: ${{ matrix.package }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
          cache-dependency-path: ${{ matrix.package }}/package-lock.json
      - run: npm ci
      - name: Lint (template only)
        if: matrix.package == 'template'
        run: npm run lint
      - name: Build (template only)
        if: matrix.package == 'template'
        run: npm run build
      - name: Test
        run: npm test
```

- [ ] **Step 2: Validate YAML locally**

Run: `cd /Users/patricia/wcag-explainer && node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/ci.yml','utf8');if(!s.includes('npm ci'))process.exit(1);console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add .github/workflows/ci.yml
git commit -m "ci: run lint + tests for template and scripts on PRs"
```

> Note: the matrix runs `scripts` tests too; this depends on Group B not breaking `scripts` test — Group B keeps all existing scripts tests green.

---

### Task 2: CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Write the file**

```markdown
# Contributing to wcag-explainer

Thanks for your interest! This repo is both a **Claude Code skill** and the
**source project** that builds the skill's dataset. Most contributions touch one of
two self-contained packages.

## Repository layout

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full picture. In short:

- `template/` — the React app the skill scaffolds. **Self-contained**; has its own
  `package.json`. The skill copies this verbatim, so don't add repo-only tooling here.
- `scripts/` — the dataset build pipeline (fetch → enrich → merge). Its own `package.json`.
- `docs/` — published to GitHub Pages.

## Dev setup

Each package installs independently:

```bash
cd template && npm ci      # the app
cd ../scripts && npm ci    # the pipeline
```

## Running checks (what CI runs)

```bash
# App
cd template && npm run lint && npm run build && npm test
# Pipeline
cd ../scripts && npm test
```

All PRs must pass `.github/workflows/ci.yml` (lint + build + tests).

## The dataset

The shipped dataset (`template/src/data/wcag-criteria.json`) is **committed**, so you do
**not** need to regenerate it to work on the app. Regeneration is a three-phase,
maintainer-only pipeline (fetch is deterministic; enrich calls the Claude API and needs
`ANTHROPIC_API_KEY`; merge validates against a zod schema). See the
"For skill authors" section of [README.md](README.md).

If your change would alter the dataset, regenerate it intentionally and call that out in
your PR — don't hand-edit `wcag-criteria.json`.

## Commits & PRs

- Conventional-commit style prefixes (`feat:`, `fix:`, `docs:`, `ci:`, `chore:`).
- Keep `template/` copy-clean — nothing that only makes sense in this repo.
- Add or update tests for behavior changes.
- Fill in the PR template checklist.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).
```

- [ ] **Step 2: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add CONTRIBUTING.md
git commit -m "docs: add CONTRIBUTING guide"
```

---

### Task 3: CODE_OF_CONDUCT.md

**Files:**
- Create: `CODE_OF_CONDUCT.md`

- [ ] **Step 1: Fetch the canonical Contributor Covenant 2.1 markdown and set the contact**

Use the official text from <https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md>. In the "Enforcement" section, set the reporting contact to **patricia.goh@ada.support**. Do not alter other wording.

Run to verify the contact line is present after writing:
`cd /Users/patricia/wcag-explainer && grep -q "patricia.goh@ada.support" CODE_OF_CONDUCT.md && echo ok`
Expected: `ok`

- [ ] **Step 2: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add CODE_OF_CONDUCT.md
git commit -m "docs: add Contributor Covenant code of conduct"
```

---

### Task 4: SECURITY.md

**Files:**
- Create: `SECURITY.md`

- [ ] **Step 1: Write the file**

```markdown
# Security Policy

## Reporting a vulnerability

Please report security issues privately by emailing **patricia.goh@ada.support**
with the details and steps to reproduce. Do not open a public issue for security
reports. You can expect an acknowledgement within a few business days.

## Scope

This project ships a static React app and a build-time dataset pipeline. There is no
server component and no user data is collected by the app.

## Secrets

No secrets are stored in this repository. The dataset enrichment step
(`scripts/enrich.ts`) reads an `ANTHROPIC_API_KEY` from the environment at run time
only; it is never committed. Do not paste API keys into issues, PRs, or code.

## Supported versions

The latest `main` is the only supported version.
```

- [ ] **Step 2: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add SECURITY.md
git commit -m "docs: add security policy"
```

---

### Task 5: Issue & PR templates

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/ISSUE_TEMPLATE/config.yml`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] **Step 1: Write `bug_report.yml`**

```yaml
name: Bug report
description: Something in the app or pipeline isn't working
labels: [bug]
body:
  - type: dropdown
    id: area
    attributes:
      label: Area
      options: [The app (template), The dataset pipeline (scripts), The skill scaffolding, Docs]
    validations:
      required: true
  - type: textarea
    id: what
    attributes:
      label: What happened?
      description: What did you expect, and what happened instead?
    validations:
      required: true
  - type: textarea
    id: repro
    attributes:
      label: Steps to reproduce
    validations:
      required: true
  - type: input
    id: env
    attributes:
      label: Environment
      description: OS, Node version, browser (if app-related)
```

- [ ] **Step 2: Write `feature_request.yml`**

```yaml
name: Feature request
description: Suggest an improvement
labels: [enhancement]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem
      description: What problem would this solve?
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposed solution
```

- [ ] **Step 3: Write `config.yml`**

```yaml
blank_issues_enabled: false
contact_links:
  - name: Try the hosted app
    url: https://patriciagoh.github.io/wcag-explainer/
    about: Just want to look up a WCAG criterion? Use the hosted app — no setup needed.
```

- [ ] **Step 4: Write `PULL_REQUEST_TEMPLATE.md`**

```markdown
## What & why

<!-- What does this change and why? -->

## Checklist

- [ ] `cd template && npm run lint && npm run build && npm test` passes
- [ ] `cd scripts && npm test` passes
- [ ] `template/` stays copy-clean (no repo-only tooling added to it)
- [ ] If the dataset changed, it was regenerated intentionally (not hand-edited)
- [ ] Docs/CHANGELOG updated if behavior changed
```

- [ ] **Step 5: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add .github/ISSUE_TEMPLATE .github/PULL_REQUEST_TEMPLATE.md
git commit -m "docs: add issue and PR templates"
```

---

### Task 6: CHANGELOG.md

**Files:**
- Create: `CHANGELOG.md`

- [ ] **Step 1: Write the file**

```markdown
# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- CI workflow running lint + tests for both the app and the pipeline.
- Contribution scaffolding: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue/PR templates.
- ARCHITECTURE.md documenting the repo layout as a reusable skill-project template.
- Scripted dataset enrichment (`scripts/enrich.ts`) using the Anthropic SDK, replacing
  the manual Claude-session procedure while preserving the input-hash incremental cache.

## [0.1.0]

### Added
- Initial release: WCAG 2.2 criterion-explainer skill, hosted demo, and three-phase
  dataset pipeline (fetch / enrich / merge).
```

- [ ] **Step 2: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add CHANGELOG.md
git commit -m "docs: add changelog"
```

---

### Task 7: ARCHITECTURE.md

**Files:**
- Create: `ARCHITECTURE.md`

- [ ] **Step 1: Write the file**

```markdown
# Architecture

This repo is a Claude Code **skill** and the **source project** that builds its dataset.
It's structured so the same layout can be reused for future skill projects.

## The three surfaces

| Path        | What it is | Audience |
|-------------|-----------|----------|
| `SKILL.md`  | Instructions Claude follows when a user invokes the skill | Claude / end users |
| `template/` | The Vite + React + TS + Tailwind app, **copied verbatim** into the user's dir | End users |
| `scripts/`  | The dataset build pipeline (fetch → enrich → merge) | Maintainers |
| `docs/`     | Visual docs published to GitHub Pages | Public |

## The copy-clean invariant

`template/` is copied wholesale into the user's working directory by the skill
(`SKILL.md` step 2). Therefore:

- It has its **own** `package.json` and lockfile and must build standalone.
- There is **no root `package.json` / workspace** — a workspace would entangle
  `template/` with repo-only tooling and break the verbatim copy.
- Don't add anything to `template/` that only makes sense in this source repo.

## The dataset pipeline

`template/src/data/wcag-criteria.json` is built in three phases (in `scripts/`):

1. **Fetch** (`build-dataset.ts --fetch`) — deterministic; scrapes W3C + axe-core into
   `scripts/raw/criteria-raw.json`. Commit the result.
2. **Enrich** (`enrich.ts`) — calls the Claude API to generate per-criterion plain-English
   text, examples, and common mistakes into `scripts/cache/{id}.json`. Incremental: each
   entry stores an `inputHash` (sha256 of the criterion's raw inputs); unchanged criteria
   are skipped. Needs `ANTHROPIC_API_KEY`. Maintainer-only.
3. **Merge** (`build-dataset.ts --merge`) — joins raw + cache, validates against a zod
   schema, writes the shipped dataset.

The enriched cache and shipped dataset are **committed**, so contributors never need to
run enrichment to work on the app.

## CI

- `ci.yml` — lint + test gate on PRs (both packages).
- `check-updates.yml` — weekly; opens a PR if upstream WCAG/axe-core drifts. Detect-only;
  it does not spend API tokens.
- `deploy-pages.yml` — builds app + docs to GitHub Pages on push to `main`.

## Reusing this layout for a new skill project

1. Copy `SKILL.md` (rewrite the steps), a fresh `template/` app, and the `.github/`
   hygiene set + `ci.yml`.
2. If the skill ships generated data, mirror the `scripts/` fetch → enrich → merge pattern
   with an input-hash cache so regeneration is incremental.
3. Keep the copy-clean invariant: the thing the skill scaffolds lives in `template/` and
   builds on its own.
```

- [ ] **Step 2: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add ARCHITECTURE.md
git commit -m "docs: add architecture / reusable-layout doc"
```

---

### Task 8: README badge + CONTRIBUTING link

**Files:**
- Modify: `README.md` (badge row near top; add a Contributing line near License)

- [ ] **Step 1: Add the CI badge to the badge block**

Insert this badge as the FIRST badge in the existing badge block (immediately after the
`# wcag-explainer` heading paragraph, before the "Live app" badge):

```markdown
[![CI](https://github.com/patriciagoh/wcag-explainer/actions/workflows/ci.yml/badge.svg)](https://github.com/patriciagoh/wcag-explainer/actions/workflows/ci.yml)
```

- [ ] **Step 2: Add a Contributing section above `## License`**

```markdown
## Contributing

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and
[ARCHITECTURE.md](ARCHITECTURE.md). This project follows the
[Contributor Covenant](CODE_OF_CONDUCT.md).
```

- [ ] **Step 3: Verify both insertions**

Run: `cd /Users/patricia/wcag-explainer && grep -q "workflows/ci.yml/badge.svg" README.md && grep -q "CONTRIBUTING.md" README.md && echo ok`
Expected: `ok`

- [ ] **Step 4: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add README.md
git commit -m "docs: add CI badge and contributing section to README"
```

---

# GROUP B — Enrichment Automation (TDD)

### Task 9: cacheEntrySchema in schema.ts

**Files:**
- Modify: `scripts/src/schema.ts`
- Test: `scripts/src/schema.test.ts` (append)

- [ ] **Step 1: Write the failing test** (append to `scripts/src/schema.test.ts`)

```typescript
import { cacheEntrySchema } from "./schema.ts";

describe("cacheEntrySchema", () => {
  it("accepts a valid cache entry", () => {
    const entry = {
      inputHash: "abc123",
      plainEnglish: "Images need alt text.",
      whyItMatters: "Screen reader users get nothing otherwise.",
      quickCheck: "Run axe DevTools.",
      commonMistakes: ["Missing alt attribute."],
      codeExamples: [
        { label: "Pass", kind: "pass", language: "jsx", code: "<img alt='x' />", source: "H37" },
      ],
    };
    expect(() => cacheEntrySchema.parse(entry)).not.toThrow();
  });

  it("rejects an entry missing inputHash", () => {
    expect(() => cacheEntrySchema.parse({ plainEnglish: "x" })).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/patricia/wcag-explainer/scripts && npx vitest run src/schema.test.ts -t cacheEntrySchema`
Expected: FAIL — `cacheEntrySchema` is not exported.

- [ ] **Step 3: Add the schema** (in `scripts/src/schema.ts`, after `codeExampleSchema`)

```typescript
export const cacheEntrySchema = z.object({
  inputHash: z.string(),
  plainEnglish: z.string(),
  whyItMatters: z.string(),
  quickCheck: z.string(),
  commonMistakes: z.array(z.string()),
  codeExamples: z.array(codeExampleSchema),
});

export type CacheEntry = z.infer<typeof cacheEntrySchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/patricia/wcag-explainer/scripts && npx vitest run src/schema.test.ts -t cacheEntrySchema`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add scripts/src/schema.ts scripts/src/schema.test.ts
git commit -m "feat(scripts): add cacheEntrySchema for enrichment output"
```

---

### Task 10: hash.ts — canonical inputHash

**Files:**
- Create: `scripts/src/enrich/hash.ts`
- Test: `scripts/src/enrich/hash.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { stableStringify, inputHash } from "./hash.ts";

describe("stableStringify", () => {
  it("sorts object keys recursively", () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });
  it("preserves array order", () => {
    expect(stableStringify([3, 1, 2])).toBe("[3,1,2]");
  });
});

describe("inputHash", () => {
  const raw = {
    officialText: "All non-text content...",
    scrapedExamples: [{ label: "Pass", code: "<img alt='x'>", sourceTechnique: "H37" }],
    axeRules: [{ ruleId: "image-alt", impact: "critical", description: "d", url: "https://x" }],
  };
  it("is stable regardless of key order in input", () => {
    const reordered = { axeRules: raw.axeRules, scrapedExamples: raw.scrapedExamples, officialText: raw.officialText };
    expect(inputHash(raw as never)).toBe(inputHash(reordered as never));
  });
  it("returns a 64-char hex sha256", () => {
    expect(inputHash(raw as never)).toMatch(/^[0-9a-f]{64}$/);
  });
  it("changes when officialText changes", () => {
    expect(inputHash(raw as never)).not.toBe(inputHash({ ...raw, officialText: "different" } as never));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/patricia/wcag-explainer/scripts && npx vitest run src/enrich/hash.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** `scripts/src/enrich/hash.ts`

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/patricia/wcag-explainer/scripts && npx vitest run src/enrich/hash.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add scripts/src/enrich/hash.ts scripts/src/enrich/hash.test.ts
git commit -m "feat(scripts): add canonical inputHash for enrichment cache"
```

---

### Task 11: prompts.ts — load & substitute templates

**Files:**
- Create: `scripts/src/enrich/prompts.ts`
- Test: `scripts/src/enrich/prompts.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { fillTemplate, loadPrompt } from "./prompts.ts";

describe("fillTemplate", () => {
  it("substitutes {{vars}}", () => {
    expect(fillTemplate("Hi {{name}} ({{level}})", { name: "1.1.1", level: "A" })).toBe("Hi 1.1.1 (A)");
  });
  it("throws on a missing var", () => {
    expect(() => fillTemplate("Hi {{name}}", {})).toThrow(/name/);
  });
});

describe("loadPrompt", () => {
  it("loads a real prompt file containing its placeholder", () => {
    expect(loadPrompt("plain-english")).toContain("{{officialText}}");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/patricia/wcag-explainer/scripts && npx vitest run src/enrich/prompts.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** `scripts/src/enrich/prompts.ts`

```typescript
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROMPTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "prompts");

export function loadPrompt(name: string): string {
  return readFileSync(join(PROMPTS_DIR, `${name}.md`), "utf8");
}

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    if (!(key in vars)) throw new Error(`Missing template var: ${key}`);
    return vars[key];
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/patricia/wcag-explainer/scripts && npx vitest run src/enrich/prompts.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add scripts/src/enrich/prompts.ts scripts/src/enrich/prompts.test.ts
git commit -m "feat(scripts): add prompt loading + template substitution"
```

---

### Task 12: client.ts — EnrichmentClient interface + Anthropic impl

**Files:**
- Create: `scripts/src/enrich/client.ts`
- Test: `scripts/src/enrich/client.test.ts`
- Modify: `scripts/package.json` (add dependency)

> **IMPLEMENTATION NOTE:** When writing the Anthropic call, load the `claude-api` skill
> first — it covers SDK usage, prompt caching, and current model IDs. The code below is the
> target; reconcile with the skill's guidance if they differ (e.g. model ID).

- [ ] **Step 1: Add the dependency**

Run:
```bash
cd /Users/patricia/wcag-explainer/scripts && npm install @anthropic-ai/sdk@^0.40.0
```
Expected: adds `@anthropic-ai/sdk` to `dependencies` and updates the lockfile.

- [ ] **Step 2: Write the failing test** (interface shape only — no network)

```typescript
import { describe, it, expect } from "vitest";
import { createAnthropicClient } from "./client.ts";

describe("createAnthropicClient", () => {
  it("returns an object with a complete() method", () => {
    const client = createAnthropicClient({ apiKey: "test-key" });
    expect(typeof client.complete).toBe("function");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd /Users/patricia/wcag-explainer/scripts && npx vitest run src/enrich/client.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement** `scripts/src/enrich/client.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";

/** Minimal seam the enrichment core depends on. Tests inject a mock. */
export interface EnrichmentClient {
  complete(prompt: string): Promise<string>;
}

const SYSTEM_PROMPT =
  "You are an expert web accessibility engineer turning WCAG success criteria into clear, " +
  "accurate, developer-facing content. Follow each task's stated output format exactly — " +
  "no preamble, no markdown fences unless asked.";

export function createAnthropicClient(opts: { apiKey: string; model?: string }): EnrichmentClient {
  const anthropic = new Anthropic({ apiKey: opts.apiKey });
  const model = opts.model ?? "claude-opus-4-8";
  return {
    async complete(prompt: string): Promise<string> {
      const res = await anthropic.messages.create({
        model,
        max_tokens: 1024,
        // Cache the static system block to cut cost across many criteria.
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: prompt }],
      });
      const text = res.content.find((b) => b.type === "text");
      if (!text || text.type !== "text") throw new Error("No text block in model response");
      return text.text.trim();
    },
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /Users/patricia/wcag-explainer/scripts && npx vitest run src/enrich/client.test.ts`
Expected: PASS (1 test)

- [ ] **Step 6: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add scripts/src/enrich/client.ts scripts/src/enrich/client.test.ts scripts/package.json scripts/package-lock.json
git commit -m "feat(scripts): add Anthropic enrichment client behind an interface"
```

---

### Task 13: enrich-core.ts — per-criterion orchestration

**Files:**
- Create: `scripts/src/enrich/enrich-core.ts`
- Test: `scripts/src/enrich/enrich-core.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { pickPassFail, enrichCriterion } from "./enrich-core.ts";
import { cacheEntrySchema } from "../schema.ts";
import type { EnrichmentClient } from "./client.ts";

const rawWithExamples = {
  id: "1.1.1",
  title: "Non-text Content",
  level: "A",
  officialText: "All non-text content...",
  scrapedExamples: [
    { label: "Sufficient: image with alt", code: "<img alt='x'>", sourceTechnique: "H37" },
    { label: "Failure: missing alt", code: "<img>", sourceTechnique: "F65" },
  ],
  axeRules: [{ ruleId: "image-alt", impact: "critical", description: "Images need alt", url: "https://x" }],
} as never;

describe("pickPassFail", () => {
  it("matches pass/fail by label hints", () => {
    const { pass, fail } = pickPassFail(rawWithExamples.scrapedExamples);
    expect(pass?.sourceTechnique).toBe("H37");
    expect(fail?.sourceTechnique).toBe("F65");
  });
});

describe("enrichCriterion", () => {
  // Mock client: returns a valid JSON array for common-mistakes, plain text otherwise.
  const mock: EnrichmentClient = {
    async complete(prompt: string) {
      if (prompt.includes("JSON array")) return '["Mistake one.", "Mistake two."]';
      if (prompt.includes("HTML → JSX") || prompt.includes("HTML")) return "<img alt=\"x\" />";
      return "Generated text.";
    },
  };

  it("produces a schema-valid cache entry with inputHash and pass/fail examples", async () => {
    const entry = await enrichCriterion(rawWithExamples, mock);
    expect(() => cacheEntrySchema.parse(entry)).not.toThrow();
    expect(entry.inputHash).toMatch(/^[0-9a-f]{64}$/);
    expect(entry.commonMistakes).toEqual(["Mistake one.", "Mistake two."]);
    expect(entry.codeExamples.map((e) => e.kind)).toEqual(["pass", "fail"]);
  });

  it("handles a criterion with no scraped examples (no code examples)", async () => {
    const bare = { ...rawWithExamples, scrapedExamples: [] } as never;
    const entry = await enrichCriterion(bare, mock);
    expect(entry.codeExamples).toEqual([]);
    expect(() => cacheEntrySchema.parse(entry)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/patricia/wcag-explainer/scripts && npx vitest run src/enrich/enrich-core.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** `scripts/src/enrich/enrich-core.ts`

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/patricia/wcag-explainer/scripts && npx vitest run src/enrich/enrich-core.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add scripts/src/enrich/enrich-core.ts scripts/src/enrich/enrich-core.test.ts
git commit -m "feat(scripts): add per-criterion enrichment orchestration"
```

---

### Task 14: enrich.ts CLI + package script

**Files:**
- Create: `scripts/enrich.ts`
- Modify: `scripts/package.json` (add `enrich` script)

- [ ] **Step 1: Implement** `scripts/enrich.ts`

```typescript
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
    only: args.find((a) => a.startsWith("--only="))?.split("=")[1],
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

await main();
```

- [ ] **Step 2: Add the `enrich` script to `scripts/package.json`**

In the `"scripts"` block, add (after `"check-updates"`):

```json
    "enrich": "tsx enrich.ts",
```

- [ ] **Step 3: Verify it type-checks and the no-key guard works**

Run: `cd /Users/patricia/wcag-explainer/scripts && ANTHROPIC_API_KEY= npx tsx enrich.ts --only=4 2>&1 | head -2`
Expected: prints `ANTHROPIC_API_KEY not set...` and exits non-zero (no network call made).

- [ ] **Step 4: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add scripts/enrich.ts scripts/package.json
git commit -m "feat(scripts): add enrich CLI (--only/--force/--reconcile)"
```

---

### Task 15: Reconcile legacy hashes & trim the manual doc

This makes the incremental cache work with the canonical hash function: after reconciling,
a subsequent `npm run enrich` (with a key) skips every unchanged criterion — proving the
pipeline is reproducible without re-spending tokens. Content is not regenerated.

**Files:**
- Modify: `scripts/cache/*.json` (inputHash field only, via `--reconcile`)
- Modify: `scripts/enrich-with-claude.md` (trim to fallback note)

- [ ] **Step 1: Run reconcile across all criteria**

Run: `cd /Users/patricia/wcag-explainer/scripts && npx tsx enrich.ts --reconcile`
Expected: `Reconciled inputHash for <N> cache files (no content change).`

- [ ] **Step 2: Confirm only `inputHash`/formatting changed, not enriched content**

Run: `cd /Users/patricia/wcag-explainer && git diff --stat scripts/cache | tail -3`
Expected: cache files show small diffs. Spot-check one:
`git diff scripts/cache/1.1.1.json | grep -E '^\+' | grep -iv inputhash | grep -v '^+++'`
Expected: no lines containing changed `plainEnglish`/`whyItMatters`/etc. (formatting-only or empty).

- [ ] **Step 3: Verify the merge still produces a schema-valid dataset**

Run: `cd /Users/patricia/wcag-explainer/scripts && npm run build:dataset -- --merge`
Expected: `Wrote .../wcag-criteria.json with <N> criteria` (no schema error).

- [ ] **Step 4: Confirm the shipped dataset is unchanged**

Run: `cd /Users/patricia/wcag-explainer && git diff --stat template/src/data/wcag-criteria.json`
Expected: no output (the merged dataset doesn't include `inputHash`, so it's byte-identical except `builtAt`). If only `builtAt` changed, revert that file: `git checkout template/src/data/wcag-criteria.json`.

- [ ] **Step 5: Trim `scripts/enrich-with-claude.md`** to a short fallback note. Replace its entire contents with:

```markdown
# Manual enrichment fallback (no API key)

Phase 2 enrichment is normally run with the scripted CLI:

```bash
cd scripts
ANTHROPIC_API_KEY=sk-... npm run enrich            # all criteria, incremental
ANTHROPIC_API_KEY=sk-... npm run enrich -- --only=1  # one principle
```

It reads `raw/criteria-raw.json`, calls the Claude API per criterion using the templates in
`prompts/`, and writes `cache/{id}.json` (skipping criteria whose `inputHash` is unchanged).

**If you don't have an API key**, you can perform the same steps by hand in a Claude Code
session: for each criterion in `raw/criteria-raw.json`, apply the `prompts/*.md` templates,
and write a `cache/{id}.json` matching `cacheEntrySchema` in `src/schema.ts` (fields:
`inputHash`, `plainEnglish`, `whyItMatters`, `quickCheck`, `commonMistakes[]`,
`codeExamples[]`). Compute `inputHash` with `src/enrich/hash.ts`. Then run
`npm run build:dataset -- --merge`.
```

- [ ] **Step 6: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add scripts/cache scripts/enrich-with-claude.md
git commit -m "chore(scripts): reconcile cache hashes to canonical fn; trim manual doc"
```

---

### Task 16: Full verification

- [ ] **Step 1: Scripts test suite green (incl. new enrich tests)**

Run: `cd /Users/patricia/wcag-explainer/scripts && npm test`
Expected: all test files pass, including `src/enrich/*.test.ts`.

- [ ] **Step 2: App suite + lint + build green**

Run: `cd /Users/patricia/wcag-explainer/template && npm ci && npm run lint && npm run build && npm test`
Expected: lint clean, build succeeds, tests pass.

- [ ] **Step 3: Confirm enrich is now a no-op on fresh data** (proves reproducible incrementality; requires a key — skip if unavailable and note it)

Run: `cd /Users/patricia/wcag-explainer/scripts && ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY npx tsx enrich.ts 2>&1 | head -1`
Expected: `0/<N> criteria to enrich (<N> fresh, skipped).`

- [ ] **Step 4: GitHub community-standards check** (manual)

Confirm all present: README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue templates, PR template.

Run: `cd /Users/patricia/wcag-explainer && for f in README.md LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md .github/PULL_REQUEST_TEMPLATE.md .github/ISSUE_TEMPLATE/config.yml .github/workflows/ci.yml ARCHITECTURE.md CHANGELOG.md; do [ -f "$f" ] && echo "ok $f" || echo "MISSING $f"; done`
Expected: all `ok`.

---

## Self-Review

**Spec coverage:**
- CI test/lint gate → Task 1 ✓
- Enrichment automation (hash/prompts/client/core/CLI) → Tasks 9–14 ✓
- check-updates stays detect-only → untouched (verified by omission) ✓
- Opus 4.8 default, env override → Task 12 (`client.ts`) ✓
- OSS hygiene (CONTRIBUTING/CoC/SECURITY/templates/CHANGELOG) → Tasks 2–6 ✓
- ARCHITECTURE exemplar doc → Task 7 ✓
- README badge → Task 8 ✓
- Testing strategy (mock client, no network in CI) → Tasks 9–13 ✓
- Success criterion "enrich skips fresh" → Tasks 15 (reconcile) + 16 step 3 ✓
- Dataset content unchanged → Task 15 step 4 ✓

**Placeholder scan:** No TBD/TODO; every code step has complete code; CoC uses the named
canonical source + concrete contact email.

**Type consistency:** `inputHash`, `EnrichmentClient.complete`, `cacheEntrySchema`/`CacheEntry`,
`pickPassFail`, `enrichCriterion` names are consistent across Tasks 9–15. `CacheEntry` fields
match `merge.ts`'s existing `CacheEntry` type and the committed cache shape.
