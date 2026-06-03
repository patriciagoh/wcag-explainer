# wcag-explainer docs — Matcha Oat Reskin (Phase 3)

**Goal:** Reskin the three static GitHub Pages docs files (`docs/index.html`,
`docs/features.html`, `docs/build-pipeline.html` + shared `docs/styles.css`) to the
Matcha Oat identity so they are visually one system with the already-reskinned app
(Phase 2). Tokens are **consumed from `matcha-oat-design-system`, synced into `docs/`,
and CI-guarded against drift** — mirroring the established pattern in the sibling
`a11y-design-review-checklist`.

**Why:** Phase 2 reskinned the React app (`template/`) to Matcha Oat, but the docs still
carry the original blue-600/white palette (`docs/styles.css` defines its own local
`:root` of Tailwind blue/gray hexes). The docs and the app it documents now look like
two different products.

**Branch:** `phase3-docs-matcha-reskin` off `main`.

**Non-goals:** No changes to the app (`template/`), the dataset pipeline (`scripts/`),
or docs *content* — this is purely a visual/token reskin. No new docs pages.

---

## Architecture

The docs are build-less static HTML linking a single `styles.css`. Following the
design-system README's guidance for static consumers (and `a11y-design-review-checklist`
verbatim): **vendor `tokens.css` + `fonts.css` into `docs/` via a sync script, link them
in each page, and reference `var(--…)` everywhere — never hardcode a hex or font.** CI
re-runs the sync and fails on drift, and a `check-no-raw-values` guard fails on any
hardcoded design value.

"The one rule" (from `matcha-oat-design-system`): real values live only in `tokens.css`
(font delivery in `fonts.css`). Consumers reference tokens.

### Where the sync infrastructure lives
`docs/` becomes a third package-bearing area (alongside `template/` and `scripts/`,
each of which already has its own `package.json`):

- `docs/package.json` + `docs/package-lock.json` — `matcha-oat-design-system` as a
  `devDependency` (git dep: `github:patriciagoh/matcha-oat-design-system`).
- `docs/scripts/sync-tokens.mjs` — copies `tokens.css` + `fonts.css` from
  `node_modules/matcha-oat-design-system/` into `docs/`. Identical in spirit to
  `a11y-design-review-checklist/scripts/sync-tokens.mjs`.
- `docs/tokens.css`, `docs/fonts.css` — committed synced copies.
- `.gitignore` — add `docs/node_modules`.

---

## Components & changes

### 1. HTML (`index.html`, `features.html`, `build-pipeline.html`)
- In each `<head>`, before `styles.css`:
  ```html
  <link rel="stylesheet" href="fonts.css" />
  <link rel="stylesheet" href="tokens.css" />
  ```
- Replace inline hardcoded hexes and old token references (`var(--accent)`,
  `var(--accent-ink)`, `var(--green)`, `var(--red)`, `var(--ink-dim)`, `var(--mono)`,
  `var(--sans)`) with Matcha tokens. The build-pipeline diagram and the `.chip`
  variants carry most of the inline hexes.

### 2. `styles.css` rewrite (token mapping)
Delete the local `:root` blue/white palette block entirely; reference Matcha tokens
defined by the linked `tokens.css`. Mapping mirrors the app's Phase 2 reskin so docs and
app read as one system:

| Old (docs) | Matcha Oat |
|---|---|
| `--bg`/`--panel` white, `--bg-soft` slate-50 | `var(--oat)` page · `var(--paper)` cards/raised |
| `--ink` gray-900 | `var(--ink)` (headings) |
| body text | `var(--ink-2)` |
| `--muted` / `--ink-dim` | `var(--muted)` (meta, captions) |
| `--line` / `--line-soft` | `var(--line)` / `var(--line-2)` |
| `--accent` blue-600 (rules, fills) | `var(--matcha)` (rules/dots) · primary fills `var(--ink)` bg + `var(--oat)` text |
| `--accent-ink` blue-700 (links) | `var(--matcha-deep)` + a `var(--yolk)` underline on prominent links |
| `--accent-bg`/`--accent-border` blue-50/200 | `var(--matcha-tint)` / `var(--matcha-tint-border)` |
| `--green`/`--green-bg` (pass) | `ok` family: `var(--ok)` / `var(--ok-bg)` / `var(--ok-border)` |
| `--red`/`--red-bg` (fail) | `bad` family: `var(--bad)` / `var(--bad-bg)` / `var(--bad-border)` |
| 5 decorative hues `--a-blue/-emerald/-amber/-violet/-rose` (card stripes, diagram, syntax, chips) | **collapse to matcha + yolk + neutral** — no new hues; matches the app's "one accent" rule. Stripes/diagram use `var(--matcha)`/`var(--line-2)`; "why/caution" cues use the `warn` (yolk-tint) family; n/a-ish chips use the `neutral` family |
| system serif/sans/mono | `var(--serif)` headings (weight **400**) · `var(--sans)` body/UI · `var(--mono)` code/meta/numerals |
| light code blocks (`pre`) | terminal-dark: `var(--term-bg)` bg, `var(--term-text)` text; syntax tokens recolored within the warm palette (no rainbow) |
| `--radius` 12px | `var(--r-md)` (and `--r-sm`/`--r-lg`/`--r-pill` as appropriate) |
| ad-hoc shadows | `var(--shadow-card)` (brown-tinted) |

Plus the app's signature idioms (from `matcha-oat-design-system/styles.css`):
- **Eyebrow** — uppercase tracked label in `var(--matcha-deep)` preceded by a short
  matcha rule, opening sections.
- **"Why this matters" callout** — flat `var(--warn-bg)` (yolk-tint) box, `var(--r-md)`,
  **no border/no left bar**, uppercase `var(--warn)` label + body (mirrors `.d2-why`).
- **Active nav** — `var(--ink)` + bold + 2px `var(--yolk)` underline (not a tinted pill);
  signaled by weight + color + underline, never color alone.
- **Focus** — `var(--focus)` ring on every interactive element.
- **Motion** — keep transitions short/`ease`; carry a
  `@media (prefers-reduced-motion: reduce)` block.

### 3. CI guardrail (`.github/workflows/ci.yml`)
- Add `docs` to the test matrix `package: [template, scripts, docs]`.
- `docs/package.json` `"test"` script runs:
  1. sync-drift check — `node scripts/sync-tokens.mjs` then
     `git diff --exit-code tokens.css fonts.css` (fails if committed copies drift from
     the pinned dep);
  2. `node node_modules/matcha-oat-design-system/scripts/check-no-raw-values.mjs index.html features.html build-pipeline.html styles.css`.
- The existing matrix already runs `npm ci` (installs the dep) and `npm test`; lint/build
  steps are gated `template`-only and stay untouched, so adding `docs` needs no new steps
  beyond the matrix entry.

### 4. Deploy fix (`.github/workflows/deploy-pages.yml`)
- The assemble step currently runs `cp docs/*.html docs/styles.css _site/docs/`. Update it
  to also copy the synced token files:
  `cp docs/*.html docs/styles.css docs/tokens.css docs/fonts.css _site/docs/`
  (otherwise the live docs 404 on the newly-linked stylesheets).

---

## Accessibility (WCAG 2.2 AA — preserved)
The docs are already AA-hardened; the reskin must not regress it. Per the design system's
guarantees: green **text** uses `var(--matcha-deep)` (5.6:1), never `var(--matcha)`
(non-text only); pass/fail/caution carry a text/shape cue alongside color (1.4.1); the
`var(--focus)` ring ships on all interactives (2.4.7); `prefers-reduced-motion` is honored
(2.3.3). The semantic `ok`/`bad`/`warn`/`neutral` families are all AA on their own `-bg`.

---

## Testing & verification
1. `cd docs && npm ci && npm test` — sync-drift check clean, `check-no-raw-values` passes
   on all 3 HTML files + `styles.css` (no stray hex/font).
2. Serve `docs/` locally and eyeball each page beside the live app
   (`https://patriciagoh.github.io/wcag-explainer/`) — confirm one shared system: oat
   background, serif headings, matcha rules/links, single yolk accent, terminal-dark code.
3. Confirm no decorative rainbow remains (stripes/diagram/syntax all within
   matcha+yolk+neutral).
4. Dry-run the deploy assemble `cp` line locally to confirm `tokens.css`/`fonts.css` land
   in `_site/docs/`.
5. Manual a11y spot-check: focus ring visible, reduced-motion honored, color never the
   sole cue.

---

## Files touched
- **New:** `docs/package.json`, `docs/package-lock.json`, `docs/scripts/sync-tokens.mjs`,
  `docs/tokens.css`, `docs/fonts.css`
- **Modified:** `docs/styles.css`, `docs/index.html`, `docs/features.html`,
  `docs/build-pipeline.html`, `.github/workflows/ci.yml`,
  `.github/workflows/deploy-pages.yml`, `.gitignore`
