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
