# wcag-explainer — Matcha Oat Reskin (Phase 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Reskin the wcag-explainer React/Vite/Tailwind app to the Matcha Oat identity by consuming `matcha-oat-design-system` (the Tailwind preset + `tokens.css`/`fonts.css`) — clean & restrained — preserving all functionality and WCAG 2.2 AA.

**Architecture:** Add `matcha-oat-design-system` as a git dependency. Wire its **Tailwind preset** into `template/tailwind.config.js` so every Matcha color/font is available as a semantic utility (`bg-oat`, `text-ink`, `text-matcha-deep`, `font-serif`, …) that resolves to a `var(--…)` from `tokens.css` — keeping tokens.css the single source of truth even for Tailwind utilities. Import `tokens.css` + `fonts.css` at the app entry. Rewrite all ~150 stock-Tailwind color/typography utilities across 15 components to semantic Matcha utilities, matching the approved preview. CI gains a guardrail forbidding hardcoded hex/font literals and stock numeric color utilities.

**Tech Stack:** React 19, Vite, Tailwind CSS v3.4.19 (+ `@tailwindcss/typography`), Vitest, ESLint, TypeScript. App lives in `template/`. CI at `.github/workflows/ci.yml` (Node 24, matrix `[template, scripts]`).

**Visual target:** the approved mockup `wcag-matcha-preview.html` (repo root, uncommitted) — match its look. Delete it at the end.

**Branch:** create `phase2-matcha-reskin` off `main`.

**Repo paths:** all app files under `/Users/patricia/wcag-explainer/template/`. The dependency is installed in `template/` (that's where `tailwind.config.js`/`package.json` live).

---

## Token / utility mapping (stock Tailwind → Matcha semantic utility)

The Matcha preset (`matcha-oat-design-system/tailwind-preset`) exposes these color groups (use with `bg-`/`text-`/`border-`/`ring-`/`divide-`/`fill-`/`stroke-`):
`oat`, `paper`, `ink` (+`ink-2`), `muted`, `line` (+`line-2`), `matcha` (+`matcha-deep`,`matcha-tint`,`matcha-tint-border`), `yolk` (+`yolk-deep`,`yolk-tint`,`yolk-tint-text`), `term-bg`/`term-bar`/`term-line`/`term-text`, and semantic `ok`/`bad`/`warn`/`neutral` each with `-bg` and `-border` (e.g. `text-ok`, `bg-ok-bg`, `border-ok-border`). Fonts: `font-serif`/`font-sans`/`font-mono`. Radii `rounded-sm/md/lg/xl/pill`, shadow `shadow-card`, `max-w-content`.

> **Opacity caveat:** these colors resolve to `var(--…)`, so Tailwind opacity modifiers (`bg-oat/50`, `text-ink/80`) DO NOT work — never add them. Use a solid token.

| Stock utility(s) | Matcha utility |
|---|---|
| `bg-white`, page `bg-gray-50` | surfaces `bg-paper`; app/page background `bg-oat` |
| `bg-gray-100` (hover) | `bg-matcha-tint` |
| `bg-gray-900` / `text-gray-100` (code block) | `bg-term-bg` / `text-term-text` |
| `text-gray-900` (headings) | `text-ink` + `font-serif` on headings |
| `text-gray-800/700` (body) | `text-ink-2` |
| `text-gray-600/500` (meta, captions, criterion numbers) | `text-muted` + `font-mono` for numbers/labels |
| `border-gray-200/300` (dividers, card borders) | `border-line-2` |
| form-control borders (inputs/search/select) | `border-muted` (≥3:1, WCAG 1.4.11) |
| `text-white` on dark/accent fills | `text-oat` |
| accent `bg-blue-600`/`ring-blue-700` (primary action) | primary button `bg-ink text-oat`; active *tab* → **ink text + bold + 2px yolk underline** (NOT a tinted pill — mirror the design-system `.sw-links a.active` idiom: `text-ink font-bold` with a `border-b-2 border-yolk`), inactive tab `text-ink-2 font-medium`. Nav uses `font-sans` (13px), not mono. |
| `bg-blue-50`/`bg-blue-100` (selected sidebar item, info chips) | `bg-matcha-tint` (selected nav also `border-l` `border-matcha`, `text-matcha-deep`) |
| `text-blue-900/700/600` (links, accent text) | `text-matcha-deep` |
| `border-blue-200/300` | `border-matcha-tint-border` |
| pass / success `green-*` / `emerald-*` | `ok` family (`bg-ok-bg`/`text-ok`/`border-ok-border`) |
| fail / error / critical `red-*` | `bad` family (`bg-bad-bg`/`text-bad`/`border-bad-border`) |
| caution / "why this matters" / moderate `amber-*`/`yellow-*` | `warn` family (`bg-warn-bg`/`text-warn`/`border-warn-border`) |
| neutral / minor / "n-a" `gray-*` chips | `neutral` family (`bg-neutral-bg`/`text-neutral`/`border-neutral-border`) |
| decorative category hues `purple-*`/`violet-*`/`indigo-*`/`orange-*`/`sky-*` (facet/disability tags, non-semantic) | consolidate to `neutral` family, or `matcha-tint`/`bg-matcha-tint text-matcha-deep` if they read as "active/brand" — **keep it restrained; do not introduce new hues.** Pair any remaining color cue with text so meaning is never color-only (1.4.1). |

**Conformance badges (CriterionDetail):** graded by level (user-approved) — **Level A → `neutral` family**, **Level AA → `ok` family** (matcha-tint), **Level AAA → `warn` family** (yolk-tint). Principle badge → `neutral` family. WCAG-version badge → `warn` family. All use `font-mono`, uppercase, `rounded-pill`.

**Typography (mirror the design-system idioms in `matcha-oat-design-system/styles.css`):**
- Display title (`h1`) → `font-serif font-normal` (weight **400**, not bold), large, `tracking-tight`; an emphasized word may be `italic text-matcha-deep`. Section headings (`h2`) → `font-serif font-medium text-ink`.
- **Eyebrow** (principle/section label above a title) → `font-sans` uppercase, `tracking-[0.18em]`, `text-matcha-deep font-semibold`, preceded by a short matcha rule (a `before:` 22px×1.5px `bg-matcha`, or a small `<span>` rule element).
- Criterion numbers, badges, footer meta, code, stats → `font-mono`. **Nav links → `font-sans`** (13px), not mono.
- Body default → `font-sans text-ink-2` (set as base in `index.css`).
- Prominent links → `text-matcha-deep font-semibold` with a **yolk underline** (`border-b-[1.5px] border-yolk`, no `text-decoration`); plain inline links may use `underline` + `text-matcha-deep`.
- **"Why this matters" callout** → flat `bg-warn-bg` (yolk-tint) box, `rounded-md`, **no border / no left bar**; a small uppercase `font-bold tracking-wider text-warn` (yolk-deep) label + `text-warn` body. (Mirror `.d2-why`, not a bordered alert.)

---

### Task 1: Wire the design system (dependency + preset + global CSS)

**Files:** Modify `template/package.json` (+ lock), `template/tailwind.config.js`, `template/src/main.tsx`, `template/src/index.css`.

- [ ] **Step 1: Add the design system as a dependency**

```bash
cd /Users/patricia/wcag-explainer/template
npm install github:patriciagoh/matcha-oat-design-system
```
Expected: adds `"matcha-oat-design-system": "github:patriciagoh/matcha-oat-design-system"` to `dependencies` and updates `package-lock.json`. (Runtime CSS imports come from it, so it's a regular dependency, not devDependency.)

- [ ] **Step 2: Wire the Tailwind preset** — replace the full contents of `template/tailwind.config.js` with:

```javascript
import typography from "@tailwindcss/typography";
import matchaOat from "matcha-oat-design-system/tailwind-preset";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [matchaOat],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Map the typography plugin (`prose`) onto Matcha tokens so long-form
      // copy matches the palette instead of Tailwind's default gray.
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "var(--ink-2)",
            "--tw-prose-headings": "var(--ink)",
            "--tw-prose-links": "var(--matcha-deep)",
            "--tw-prose-bold": "var(--ink)",
            "--tw-prose-counters": "var(--muted)",
            "--tw-prose-bullets": "var(--line-2)",
            "--tw-prose-hr": "var(--line-2)",
            "--tw-prose-quotes": "var(--ink-2)",
            "--tw-prose-quote-borders": "var(--matcha)",
            "--tw-prose-code": "var(--ink)",
            "--tw-prose-pre-bg": "var(--term-bg)",
            "--tw-prose-pre-code": "var(--term-text)",
            fontFamily: "var(--sans)",
          },
        },
      },
    },
  },
  plugins: [typography],
};
```

- [ ] **Step 3: Import tokens + fonts at the app entry** — in `template/src/main.tsx`, add the two imports **above** `import './index.css'` (so the `:root` vars + fonts load before the stylesheet that references them):

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'matcha-oat-design-system/tokens.css'
import 'matcha-oat-design-system/fonts.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: Set base typography/surface + re-point the focus ring** — replace the full contents of `template/src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base surface + type come from the Matcha Oat tokens (single source of truth,
   loaded via matcha-oat-design-system/tokens.css in main.tsx). */
@layer base {
  body {
    background: var(--oat);
    color: var(--ink-2);
    font-family: var(--sans);
  }
}

/* Visible focus indicator for keyboard users (WCAG 2.4.7).
   matcha-deep reads >=3:1 against oat/paper and against matcha-tint controls (1.4.11). */
:focus-visible {
  outline: var(--focus);
  outline-offset: var(--focus-offset);
}

/* Honor reduced-motion preferences (2.3.3). */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
(`color-scheme: light dark` is removed — there is no dark mode, and it can make form controls render dark.)

- [ ] **Step 5: Verify the build resolves the preset + imports**

Run:
```bash
cd /Users/patricia/wcag-explainer/template
npm run build
```
Expected: `tsc -b && vite build` succeeds (preset import resolves, CSS imports resolve, no errors). The app still uses stock color utilities at this point — that's fine; this task only wires the system. New Matcha utilities (`bg-oat`, etc.) are now available.

- [ ] **Step 6: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add template/package.json template/package-lock.json template/tailwind.config.js template/src/main.tsx template/src/index.css
git commit -m "feat: consume matcha-oat-design-system (preset + tokens + fonts)"
```

---

### Task 2: Reskin the app shell (layout, header/tabs, sidebar, footer, welcome)

**Files:** Modify `template/src/App.tsx`, `template/src/components/Sidebar.tsx`, `template/src/components/DatasetFooter.tsx`, `template/src/components/Welcome.tsx`.

**Reference:** match `wcag-matcha-preview.html` (header + tabs + sidebar + footer). Use the mapping table. Preserve every element, `className` structure (only swap color/font utilities), id, `aria-*`, route/handler logic. **Visual only.**

- [ ] **Step 1: Reskin `App.tsx`** — the root layout + header + nav tabs:
  - Root container background → `bg-oat` (and `text-ink-2`), via the existing root `div`.
  - Header: `bg-paper`, bottom border `border-line` (66px tall, like `.sw-nav`). App title/brand → `font-serif font-medium text-ink` (~21px).
  - Nav tabs (`font-sans`, 13px, sentence case): inactive → `text-ink-2 font-medium hover:text-ink`; active (`aria-current="page"`) → `text-ink font-bold` with a **2px yolk underline** (`border-b-2 border-yolk` or a `::after` rule) — replace `bg-blue-600 text-white ring-1 ring-blue-700`. No tinted pill.
  - Skip link keeps its `sr-only focus:*` pattern; its visible focus styles use Matcha (`bg-matcha-deep text-oat` if it had a colored background).

- [ ] **Step 2: Reskin `Sidebar.tsx`** — section eyebrows → `font-mono text-muted uppercase tracking-wide`; list items → `text-ink-2`; criterion numbers → `font-mono text-muted`; hover → `hover:bg-matcha-tint`; selected (was `bg-blue-50 font-medium`) → `bg-matcha-tint text-matcha-deep font-semibold` + left accent `border-l-2 border-matcha`.

- [ ] **Step 3: Reskin `DatasetFooter.tsx`** — `bg-paper border-t border-line-2`, meta text `font-mono text-muted`, any link `text-matcha-deep`.

- [ ] **Step 4: Reskin `Welcome.tsx`** — headings `font-serif text-ink`, body `text-ink-2`, any accent `text-matcha-deep`. Replace any stock grays/blues per the table.

- [ ] **Step 5: Verify build + lint + tests + no stock utilities in these files**

```bash
cd /Users/patricia/wcag-explainer/template
npm run build && npm run lint && npm test
grep -REn '\b(bg|text|border|ring|from|to|via|divide|fill|stroke|placeholder|decoration|caret|accent)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)\b' src/App.tsx src/components/Sidebar.tsx src/components/DatasetFooter.tsx src/components/Welcome.tsx && echo "STILL HAS STOCK UTILITIES (fix)" || echo "shell clean ✓"
```
Expected: build/lint/test pass; `shell clean ✓` (grep finds nothing → exits non-zero → prints clean). (`neutral-100` etc. would match; Matcha's `bg-neutral`/`bg-neutral-bg` have no numeric suffix so they're allowed.)

- [ ] **Step 6: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add template/src/App.tsx template/src/components/Sidebar.tsx template/src/components/DatasetFooter.tsx template/src/components/Welcome.tsx
git commit -m "feat: reskin app shell to Matcha Oat (header, sidebar, footer, welcome)"
```

---

### Task 3: Reskin criterion content + badges + callouts

**Files:** Modify `template/src/components/CriterionDetail.tsx`, `template/src/components/ExperienceCallout.tsx`, `template/src/components/RelatedCriteria.tsx`, `template/src/components/AxeRuleBadges.tsx`.

**Reference:** match `wcag-matcha-preview.html` (criterion page: badges, "why this matters" callout, related-criteria chips). Mapping table applies. **Visual only.**

- [ ] **Step 1: Reskin `CriterionDetail.tsx`**:
  - The `prose` article now inherits Matcha colors from the typography config (Task 1) — leave `prose`/`not-prose` class structure intact.
  - `h1`/section `h2` (the `not-prose` headers) → `font-serif text-ink`; eyebrow/principle line → `font-mono text-matcha-deep uppercase`.
  - **Conformance badges** (graded, user-approved): Level **A** → `bg-neutral-bg text-neutral border-neutral-border`; Level **AA** → `bg-ok-bg text-ok border-ok-border`; Level **AAA** → `bg-warn-bg text-warn border-warn-border`. Principle badge → `neutral` family; WCAG-version badge → `warn` family. All `font-mono text-xs font-bold uppercase rounded-pill border px-2.5 py-1`. (Find the existing A/AA/AAA level→class logic — was blue/purple/emerald — and map by level, not by a single color.)
  - Section background washes (`bg-amber-50`/`bg-sky-50`/`bg-emerald-50`) → `bg-warn-bg` (caution), `bg-matcha-tint` (info), `bg-ok-bg` (success) per meaning.

- [ ] **Step 2: Reskin `ExperienceCallout.tsx`** — the callout (`border-l-4 border-blue-500 bg-blue-50`): make it the **flat "Why this matters"** treatment from the preview — `bg-warn-bg rounded-md` (yolk-tint), **no border, no left bar**; a small uppercase `font-bold tracking-wider text-warn` label + `text-warn` body (mirror `.d2-why`). If a variant is purely informational rather than caution, use `bg-matcha-tint text-ink-2 rounded-md` (still flat, no left bar).

- [ ] **Step 3: Reskin `RelatedCriteria.tsx`** — related-criteria chips/links (`text-blue-600 hover:underline`) → `bg-matcha-tint text-matcha-deep border-matcha-tint-border rounded-pill font-mono` chips (match preview), or plain `text-matcha-deep underline` if rendered as inline links.

- [ ] **Step 4: Reskin `AxeRuleBadges.tsx`** — axe impact levels map by severity: critical/serious → `bad` family; moderate → `warn` family; minor → `neutral` family. Badge shape `font-mono text-xs rounded-pill border`. Any non-severity tag → `neutral` family. No new hues.

- [ ] **Step 5: Verify build + lint + tests + no stock utilities in these files**

```bash
cd /Users/patricia/wcag-explainer/template
npm run build && npm run lint && npm test
grep -REn '\b(bg|text|border|ring|from|to|via|divide|fill|stroke|placeholder|decoration|caret|accent)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)\b' src/components/CriterionDetail.tsx src/components/ExperienceCallout.tsx src/components/RelatedCriteria.tsx src/components/AxeRuleBadges.tsx && echo "STILL HAS STOCK UTILITIES (fix)" || echo "content clean ✓"
```
Expected: build/lint/test pass; `content clean ✓`.

- [ ] **Step 6: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add template/src/components/CriterionDetail.tsx template/src/components/ExperienceCallout.tsx template/src/components/RelatedCriteria.tsx template/src/components/AxeRuleBadges.tsx
git commit -m "feat: reskin criterion content, badges, callouts to Matcha Oat"
```

---

### Task 4: Reskin interactive + code components

**Files:** Modify `template/src/components/CodeExample.tsx`, `template/src/components/CodeExamples.tsx`, `template/src/components/CopyButton.tsx`, `template/src/components/Quiz.tsx`, `template/src/components/Checklist.tsx`, `template/src/components/SearchBar.tsx`, `template/src/components/FacetFilter.tsx`, `template/src/components/RuleLookup.tsx`.

**Reference:** match `wcag-matcha-preview.html` (quiz options correct/incorrect, code block, buttons). Mapping table applies. **Visual only.**

- [ ] **Step 1: Reskin code components** (`CodeExample.tsx`, `CodeExamples.tsx`) — code surface `bg-term-bg text-term-text font-mono rounded-md` (was `bg-gray-900 text-gray-100`). Note: Shiki applies inline token colors to highlighted code via its own theme — leave Shiki output as-is; only restyle the surrounding container/non-highlighted chrome. If a non-highlighted `<pre>`/`<code>` exists, use `term` tokens.

- [ ] **Step 2: Reskin `CopyButton.tsx`** — `text-xs px-2 py-1 rounded border` button: border `border-muted`, text `text-ink-2`, `hover:bg-matcha-tint` (was `hover:bg-gray-100`). Copied/confirmed state → `text-ok`.

- [ ] **Step 3: Reskin `Quiz.tsx`** — options: default → `bg-paper border-muted text-ink rounded-md`; correct → `bg-ok-bg border-ok-border text-ok font-semibold`; incorrect → `bg-bad-bg border-bad-border text-bad`. Submit/primary button → `bg-ink text-oat font-mono uppercase rounded-pill`. Radio/checkbox accents stay native; ensure label text `text-ink-2`.

- [ ] **Step 4: Reskin `Checklist.tsx`** — list rows `text-ink-2`; checked/complete state → `text-ok`; section labels `font-mono text-muted`; any pass/fail markers → `ok`/`bad`.

- [ ] **Step 5: Reskin `SearchBar.tsx`, `FacetFilter.tsx`, `RuleLookup.tsx`** — text inputs/search → `bg-paper border-muted text-ink rounded-md` with `placeholder:text-muted`; focus relies on the global `:focus-visible` ring (don't add `focus:ring-blue-*`). Filter facet chips/toggles: active → `bg-matcha-tint text-matcha-deep border-matcha-tint-border`; inactive → `bg-paper text-ink-2 border-muted`. Labels `font-mono text-muted`. Result rows `text-ink-2`, dividers `border-line-2`.

- [ ] **Step 6: Verify build + lint + tests + no stock utilities in these files**

```bash
cd /Users/patricia/wcag-explainer/template
npm run build && npm run lint && npm test
grep -REn '\b(bg|text|border|ring|from|to|via|divide|fill|stroke|placeholder|decoration|caret|accent)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)\b' src/components/CodeExample.tsx src/components/CodeExamples.tsx src/components/CopyButton.tsx src/components/Quiz.tsx src/components/Checklist.tsx src/components/SearchBar.tsx src/components/FacetFilter.tsx src/components/RuleLookup.tsx && echo "STILL HAS STOCK UTILITIES (fix)" || echo "interactive clean ✓"
```
Expected: build/lint/test pass; `interactive clean ✓`.

- [ ] **Step 7: Final whole-app sweep** — confirm NO stock numeric color utilities remain anywhere in `src` (excluding tests + data):

```bash
cd /Users/patricia/wcag-explainer/template
grep -REn '\b(bg|text|border|ring|from|to|via|divide|fill|stroke|placeholder|decoration|caret|accent)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)\b' --include='*.tsx' --include='*.ts' --include='*.css' src | grep -v '\.test\.' && echo "STILL HAS STOCK UTILITIES (fix remaining)" || echo "whole app clean ✓"
```
Expected: `whole app clean ✓`. Fix any stragglers before committing (re-open the offending file, map per the table).

- [ ] **Step 8: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add template/src/components/CodeExample.tsx template/src/components/CodeExamples.tsx template/src/components/CopyButton.tsx template/src/components/Quiz.tsx template/src/components/Checklist.tsx template/src/components/SearchBar.tsx template/src/components/FacetFilter.tsx template/src/components/RuleLookup.tsx
git commit -m "feat: reskin interactive + code components to Matcha Oat"
```

---

### Task 5: CI guardrail + docs + cleanup + verification

**Files:** Modify `.github/workflows/ci.yml`, `README.md`, `CHANGELOG.md`; delete `wcag-matcha-preview.html`.

- [ ] **Step 1: Add the guardrail to CI** — in `.github/workflows/ci.yml`, add two steps after the existing `Test` step (still inside the `template`-only conditional pattern). Read the file first; append:

```yaml
      - name: No hardcoded design values (tokens only, template)
        if: matrix.package == 'template'
        run: node node_modules/matcha-oat-design-system/scripts/check-no-raw-values.mjs src/index.css
      - name: No stock Tailwind color utilities (semantic tokens only, template)
        if: matrix.package == 'template'
        run: |
          if grep -REn '\b(bg|text|border|ring|from|to|via|divide|fill|stroke|placeholder|decoration|caret|accent)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)\b' --include='*.tsx' --include='*.ts' --include='*.css' src | grep -v '\.test\.'; then
            echo "Found stock Tailwind color utilities — use Matcha semantic tokens (bg-oat, text-matcha-deep, ...)"; exit 1;
          fi
```

- [ ] **Step 2: Update `README.md`** — read it; under the description/visuals mention, add: `The UI is styled with the [matcha-oat-design-system](https://github.com/patriciagoh/matcha-oat-design-system) tokens (single source of truth) via its Tailwind preset.` If a changelog/feature list mentions the look, note the Matcha reskin there too. Do not invent a new top-level section.

- [ ] **Step 3: Update `CHANGELOG.md`** — read it; add a top entry matching the existing format, e.g.:
```
## [Unreleased]
- Reskinned the UI to the Matcha Oat design system (consumes `matcha-oat-design-system` via its Tailwind preset + tokens; WCAG 2.2 AA preserved).
```
(Match the file's actual heading style — if it uses dated `## x.y.z (YYYY-MM-DD)`, mirror that with the real date `2026-06-02`.)

- [ ] **Step 4: Remove the throwaway mockup**

```bash
cd /Users/patricia/wcag-explainer && git rm -f --ignore-unmatch wcag-matcha-preview.html 2>/dev/null; rm -f wcag-matcha-preview.html
```

- [ ] **Step 5: Full verification (CI-equivalent, template package)**

```bash
cd /Users/patricia/wcag-explainer/template
npm ci
npm run lint && npm run build && npm test
node node_modules/matcha-oat-design-system/scripts/check-no-raw-values.mjs src/index.css && echo "no raw values ✓"
grep -REn '\b(bg|text|border|ring|from|to|via|divide|fill|stroke|placeholder|decoration|caret|accent)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)\b' --include='*.tsx' --include='*.ts' --include='*.css' src | grep -v '\.test\.' && echo "STOCK UTILITIES REMAIN (fix)" || echo "semantic-only ✓"
```
Expected: lint OK, build OK, tests pass, `no raw values ✓`, `semantic-only ✓`.

- [ ] **Step 6: Contrast spot-check** — confirm the reskin's key pairings pass WCAG 2.2 AA (all from approved AA tokens; just confirm the reskin used these pairings, no off-token combos): body `ink-2` on `oat` (8.5:1); headings `ink` on `oat`/`paper`; links/accent `matcha-deep` on `oat`/`paper` (5.6–6.0:1); active tab `matcha-deep` on `matcha-tint` (5.25:1); AA badge `ok` on `ok-bg` (5.25:1); AAA badge `warn` on `warn-bg` (6.3:1); A/principle `neutral` on `neutral-bg` (7:1); quiz incorrect `bad` on `bad-bg` (5.97:1); code `term-text` on `term-bg` (10.4:1); form-control borders `muted` (≥3:1, 1.4.11); focus ring `matcha-deep` (≥3:1). The guardrail enforces no off-token colors; this confirms the *pairings* are the AA ones.

- [ ] **Step 7: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add .github/workflows/ci.yml README.md CHANGELOG.md
git commit -m "ci+docs: guardrail (tokens-only) + note Matcha Oat reskin; drop preview"
```

---

## Self-Review

**Spec coverage** (parent spec Phase 2):
- Add git dependency + Tailwind preset + tokens/fonts → Task 1 ✓
- Restyle ~21 components to semantic utilities → Tasks 2–4 (15 styling files + App) ✓
- Re-point focus ring / reduced-motion to Matcha tokens → Task 1 step 4 ✓
- Add guardrail to ci.yml → Task 5 step 1 ✓
- Tests stay green (don't assert on color classes); update any referencing old visuals → Tasks 2–4 run `npm test` each ✓
- Clean & restrained, no new hues, WCAG 2.2 AA preserved → mapping table + Task 5 step 6 ✓
- Preview → approve → implement → preview approved (graded badges), mockup is the visual spec, deleted in Task 5 ✓

**Placeholder scan:** Global wiring (Task 1) + CI (Task 5) are complete, exact code. The per-component utility swaps (Tasks 2–4) are delegated via the explicit mapping table + the approved mockup as visual spec — appropriate for a ~150-instance utility migration across 15 files (the table makes each swap deterministic, and each task ends with build+lint+test+grep gates). Same proven approach as Phase 1.

**Consistency:** semantic utility names (`bg-ok-bg`, `text-warn`, `border-neutral-border`, `font-serif`, …) match the Matcha preset's exposed groups. Badge grading (A→neutral, AA→ok, AAA→warn) is consistent across the mapping table, Task 3 step 1, and the contrast spot-check. The guardrail regex is identical in Tasks 2/3/4 (scoped) and Task 5 (whole-`src`) + ci.yml. The dependency is installed in `template/` where `tailwind.config.js` lives; `node_modules/matcha-oat-design-system/...` paths resolve under `template/`.

**Ordering note:** the CI guardrail is added LAST (Task 5), after the reskin lands — so its commit is green on its own (avoids an intermediate red CI commit). Recommend squash/single-merge-commit at finish regardless.

**Note:** `prose` long-form copy is recolored via the typography config in Task 1 (not per-component), so CriterionDetail's `prose` article needs no inline color utilities. Shiki-highlighted code keeps its own theme colors (out of scope — it's syntax highlighting, not chrome); only the container uses `term` tokens.
