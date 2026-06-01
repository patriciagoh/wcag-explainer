# wcag-explainer — OSS Hardening & Reference-Grade Exemplar

**Date:** 2026-06-01
**Status:** Approved (design)
**Scope:** This repository only. Becomes the reference template future skill projects copy.

## Goal

Take an already well-built Claude Code skill repo and bring it to a **reference-grade
open-source bar**: presentable, contribution-ready, and an exemplar layout others copy.
This is **additive hardening, not a restructure** — the existing layout is sound.

## Hard Invariant

`template/` MUST remain a **self-contained, copy-clean** app. The skill copies it verbatim
into the user's working directory (`SKILL.md` step 2). Therefore:

- No root `package.json` / npm workspace that would entangle `template/`.
- No shared/base config hoisted out of `template/`.
- Nothing added to `template/` that only makes sense in the source repo.

## Current State (baseline)

Present and healthy:
- Valid `SKILL.md`, detailed `README.md`, MIT `LICENSE`, sane root `.gitignore`.
- Three clear surfaces: `template/` (Vite + React 19 + TS + Tailwind app), `scripts/`
  (3-phase dataset pipeline), `docs/` (GitHub Pages).
- Strong vitest coverage in both `template/` and `scripts/`.
- Two workflows: `check-updates.yml` (weekly upstream-drift PR), `deploy-pages.yml`.

Gaps:
- No CI runs lint/tests — both workflows skip the suites entirely.
- Missing OSS hygiene: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue/PR templates, CHANGELOG.
- Enrichment (Phase 2) is a manual, human-driven Claude session — not reproducible by a
  contributor and not runnable headlessly. (Output is committed, so the app still builds
  without it.)

## Target Layout (additions marked NEW)

```
wcag-explainer/
├── SKILL.md                       # unchanged
├── README.md                      # + CI badge, link to CONTRIBUTING
├── LICENSE                        # unchanged
├── ARCHITECTURE.md                # NEW — layout + "reuse this for future skills"
├── CONTRIBUTING.md                # NEW
├── CODE_OF_CONDUCT.md             # NEW (Contributor Covenant 2.1)
├── SECURITY.md                    # NEW
├── CHANGELOG.md                   # NEW (Keep a Changelog)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # NEW — lint + test, both packages
│   │   ├── check-updates.yml      # unchanged (stays detect-only)
│   │   └── deploy-pages.yml       # unchanged
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml         # NEW
│   │   ├── feature_request.yml    # NEW
│   │   └── config.yml             # NEW
│   └── PULL_REQUEST_TEMPLATE.md   # NEW
├── template/                      # UNCHANGED — copy-clean invariant
├── scripts/
│   ├── enrich.ts                  # NEW — scripted enrichment CLI entry
│   ├── src/enrich/                # NEW — testable enrichment core
│   │   ├── hash.ts
│   │   ├── prompts.ts
│   │   ├── client.ts
│   │   └── enrich-core.ts
│   └── enrich-with-claude.md      # trimmed to "manual fallback (no API key)" note
└── docs/                          # unchanged (+ this spec under docs/superpowers/specs/)
```

## Section 1 — CI test/lint gate (`ci.yml`)

- Triggers: `pull_request` and `push` to `main`.
- Node 20, npm cache. Matrix over the two packages:
  - **template**: `npm ci` → `npm run lint` → `npm run build` → `npm test`
  - **scripts**: `npm ci` → `npm test`
- Gates PRs; provides the "healthy" badge in README.

## Section 2 — Enrichment automation (`enrich.ts`)

Codify the manual `enrich-with-claude.md` procedure, preserving its design (the `inputHash`
skip-if-fresh cache, per-principle batching). Decomposed for isolation and testability:

- `scripts/src/enrich/hash.ts` — `inputHash`: sha256 of normalized
  `{ officialText, scrapedExamples, axeRules }` with sorted keys. Matches the documented spec
  so existing committed cache entries remain valid (no needless re-enrichment).
- `scripts/src/enrich/prompts.ts` — load + `{{var}}`-substitute the templates in
  `scripts/prompts/`. Pure function; easy to unit test.
- `scripts/src/enrich/client.ts` — thin Anthropic SDK wrapper behind an **interface**
  (`EnrichmentClient`) so tests inject a mock and CI makes **no real API calls**. Uses
  **prompt caching** on the static system/prompt content to cut cost on multi-criterion runs.
- `scripts/src/enrich/enrich-core.ts` — per-criterion orchestration: skip if cache fresh;
  else generate `plainEnglish`, `whyItMatters`, `quickCheck`, `commonMistakes`, and pass/fail
  `codeExamples` (via `html-to-jsx`), applying the existing pass/fail label heuristic;
  validate against the zod schema **before** writing `cache/{id}.json`. Takes the client as a
  parameter (dependency injection).
- `scripts/enrich.ts` — CLI entry: flags `--only=<principle>` (1–4), `--force`, bounded
  concurrency. Reads `ANTHROPIC_API_KEY` from env; fails clearly if absent.

Model: default **Claude Opus 4.8** (`claude-opus-4-8`) — quality-sensitive content, run rarely
and incrementally. Env-overridable (e.g. to Sonnet 4.6 `claude-sonnet-4-6`) for cost.

Implementation note: pull in the `claude-api` skill when building `client.ts` (SDK usage,
prompt caching, model IDs).

**`check-updates.yml` stays detect-only.** We deliberately do NOT auto-spend tokens in
scheduled CI. Dataset regeneration is a documented maintainer command (`npm run enrich`).
`enrich-with-claude.md` is kept but trimmed to a short "manual fallback if you don't have an
API key" pointer.

New `scripts/package.json` entries: `"enrich": "tsx enrich.ts"` (+ deps:
`@anthropic-ai/sdk`, and `p-limit` or equivalent for concurrency if needed).

## Section 3 — OSS hygiene set

- **CONTRIBUTING.md** — the two-package dev setup; how to run lint/tests; the
  fetch → enrich → merge pipeline (and that enrichment needs an API key, is maintainer-only,
  and that the committed dataset means contributors rarely need it); PR process; commit style.
- **CODE_OF_CONDUCT.md** — Contributor Covenant 2.1, contact = maintainer email.
- **SECURITY.md** — private reporting channel; scope; explicit note that no secrets live in the
  repo and `ANTHROPIC_API_KEY` is supplied only at enrichment time via env.
- **.github/ISSUE_TEMPLATE/** — `bug_report.yml`, `feature_request.yml`, `config.yml`
  (config points to the hosted app + discussions, discourages "how do I use it" issues).
- **.github/PULL_REQUEST_TEMPLATE.md** — checklist: tests pass, lint clean, dataset
  unchanged-or-regenerated-intentionally, docs updated.
- **CHANGELOG.md** — Keep a Changelog format; seed `[Unreleased]` + an initial release entry.

## Section 4 — Reference exemplar doc (`ARCHITECTURE.md`)

The deliverable that makes this an exemplar future projects copy. Documents:
- The three surfaces (skill / template / scripts / docs) and what each is for.
- The **copy-clean invariant** and why there's no root workspace.
- The dataset pipeline pattern (fetch deterministic → enrich LLM+cached → merge validated).
- CI + hygiene conventions.
- A short "Reusing this layout for a new skill project" section: what to copy, what to rename,
  what to drop.

## Section 5 — Testing strategy

- Keep all existing vitest suites in `template/` and `scripts/`.
- New tests for the enrichment core (TDD): `hash` determinism + sorted-key normalization;
  `prompts` substitution; `enrich-core` skip-on-fresh-hash, schema validation of output,
  pass/fail heuristic selection — all against a **mocked** `EnrichmentClient`.
- `ci.yml` runs everything; no test makes a network/API call.

## Out of Scope (YAGNI)

- No monorepo/workspace restructure (violates copy-clean invariant).
- No rewrite of the `template/` app.
- No auto-spending API tokens in scheduled CI.
- No change to the dataset *content* — `enrich.ts` must reproduce the existing committed
  output shape, not regenerate/alter shipped data.

## Success Criteria

- `ci.yml` green on a PR: lint + build + tests pass for both packages.
- `npm run enrich` (with API key) reproduces cache entries and **skips** all currently-fresh
  criteria (proving hash compatibility) — no spurious dataset churn.
- All hygiene files present; repo passes a GitHub "community standards" check.
- `ARCHITECTURE.md` lets a reader stand up an equivalently-structured new skill project.
