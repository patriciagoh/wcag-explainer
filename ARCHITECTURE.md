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
