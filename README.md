# wcag-explainer

A Claude Code skill that scaffolds a local WCAG 2.2 criterion-explainer React app.

## For end users (engineers being onboarded)

In any Claude Code session, ask Claude to use the `wcag-explainer` skill. It scaffolds a React app into `./wcag-explainer/`, installs deps, and starts a dev server. Open the URL it prints.

## For skill authors (you, rebuilding the dataset)

The dataset shipped at `template/src/data/wcag-criteria.json` is built from three sources:

- W3C WCAG 2.2 structured data (`github.com/w3c/wcag`)
- Scraped W3C technique pages (linked from each criterion)
- axe-core rule metadata

There's a three-phase pipeline in `scripts/`:

### Phase 1: fetch (automated)

```bash
cd scripts
npm install
npm run build:dataset -- --fetch
```

Writes `scripts/raw/criteria-raw.json`. Deterministic; commit it.

### Phase 2: enrich (Claude Code session)

Open a Claude Code session in this skill directory and say:

> Follow `scripts/enrich-with-claude.md`. Start with principle 1.

Claude reads each raw criterion and writes per-criterion `scripts/cache/{id}.json`. Cached per input hash; re-runs only re-enrich criteria with changed inputs. Recommended: one CC session per principle (~10–32 criteria each), commit between batches.

### Phase 3: merge (automated)

```bash
cd scripts
npm run build:dataset -- --merge
```

Writes `template/src/data/wcag-criteria.json`. Validates against zod schema; fails loudly on missing fields.

### Checking for upstream updates

```bash
cd scripts
npm run check-updates
```

Diffs upstream WCAG + axe-core against the shipped dataset. Exits non-zero if anything changed. The `.github/workflows/check-updates.yml` runs this weekly and opens a PR.

### Updating after upstream changes

```bash
cd scripts
npm run build:dataset -- --fetch    # re-fetch
# Open a Claude Code session, follow enrich-with-claude.md
npm run build:dataset -- --merge    # re-merge
```

The enrichment cache skips unchanged criteria automatically.

## Files

- `SKILL.md` — what Claude does on user invocation
- `template/` — the Vite + React + TS + Tailwind app, copied per invocation
- `scripts/` — dataset build pipeline
- `.github/workflows/check-updates.yml` — weekly upstream drift PR
