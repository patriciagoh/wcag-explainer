# wcag-explainer docs — Matcha Oat Reskin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the three static docs pages (`docs/index.html`, `docs/features.html`, `docs/build-pipeline.html` + shared `docs/styles.css`) to the Matcha Oat identity so they read as one system with the already-reskinned app.

**Architecture:** The docs are build-less static HTML. Following the `a11y-design-review-checklist` pattern, vendor `tokens.css` + `fonts.css` from the `matcha-oat-design-system` dependency into `docs/` via a sync script, link them in each page, and reference `var(--…)` everywhere — never hardcode a hex or font. CI re-syncs and fails on drift, and `check-no-raw-values` fails on any hardcoded design value.

**Tech Stack:** Plain HTML/CSS (no build), Node ≥18 for the sync script + CI guard, GitHub Actions (CI matrix + Pages deploy). The dependency is `github:patriciagoh/matcha-oat-design-system`.

**Spec:** `docs/superpowers/specs/2026-06-02-docs-matcha-oat-reskin-design.md`

**Branch:** `phase3-docs-matcha-reskin` (already created off `main`).

---

## File structure

- **Create:** `docs/package.json`, `docs/package-lock.json` (generated), `docs/scripts/sync-tokens.mjs`, `docs/tokens.css` (synced), `docs/fonts.css` (synced)
- **Modify:** `docs/styles.css` (full rewrite), `docs/index.html`, `docs/features.html`, `docs/build-pipeline.html` (head links + inline colors), `.github/workflows/ci.yml`, `.github/workflows/deploy-pages.yml`
- **No change needed:** `.gitignore` already ignores `node_modules/` globally, which covers `docs/node_modules`.

All commands assume working directory `/Users/patricia/wcag-explainer` unless a `cd` is shown.

---

### Task 1: Wire the design system into docs (dependency + sync script + synced files)

**Files:**
- Create: `docs/package.json`
- Create: `docs/scripts/sync-tokens.mjs`
- Generated: `docs/package-lock.json`, `docs/tokens.css`, `docs/fonts.css`

- [ ] **Step 1: Create `docs/package.json`**

```json
{
  "name": "wcag-explainer-docs",
  "version": "1.0.0",
  "private": true,
  "description": "Static GitHub Pages docs for wcag-explainer, skinned with the Matcha Oat design system (matcha-oat-design-system tokens, synced in).",
  "type": "module",
  "scripts": {
    "sync-tokens": "node scripts/sync-tokens.mjs",
    "test": "node scripts/sync-tokens.mjs && git diff --exit-code tokens.css fonts.css && node node_modules/matcha-oat-design-system/scripts/check-no-raw-values.mjs index.html features.html build-pipeline.html styles.css"
  },
  "engines": { "node": ">=18" },
  "devDependencies": {
    "matcha-oat-design-system": "github:patriciagoh/matcha-oat-design-system"
  }
}
```

- [ ] **Step 2: Create `docs/scripts/sync-tokens.mjs`**

```javascript
#!/usr/bin/env node
/**
 * Copy the canonical tokens + fonts from the matcha-oat-design-system dependency
 * into docs/, so the build-less static pages can link real files.
 * CI re-runs this and fails if the committed copies drift from the pinned dep.
 */
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dep = join(root, "node_modules", "matcha-oat-design-system");

for (const file of ["tokens.css", "fonts.css"]) {
  copyFileSync(join(dep, file), join(root, file));
  console.log(`synced ${file}`);
}
```

- [ ] **Step 3: Install the dependency and generate the lockfile + synced files**

Run:
```bash
cd /Users/patricia/wcag-explainer/docs && npm install && npm run sync-tokens
```
Expected: `npm install` creates `docs/package-lock.json` and `docs/node_modules/`; `npm run sync-tokens` prints `synced tokens.css` / `synced fonts.css`, creating `docs/tokens.css` and `docs/fonts.css`.

- [ ] **Step 4: Verify the synced files match the dependency**

Run:
```bash
cd /Users/patricia/wcag-explainer/docs && diff tokens.css node_modules/matcha-oat-design-system/tokens.css && diff fonts.css node_modules/matcha-oat-design-system/fonts.css && echo SYNCED
```
Expected: prints `SYNCED` with no diff output.

- [ ] **Step 5: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add docs/package.json docs/package-lock.json docs/scripts/sync-tokens.mjs docs/tokens.css docs/fonts.css
git commit -m "build(docs): vendor matcha-oat tokens via sync-tokens script

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Link tokens + fonts in all three docs pages

**Files:**
- Modify: `docs/index.html` (before line 15 `<link rel="stylesheet" href="styles.css" />`)
- Modify: `docs/features.html` (before line 14 `<link rel="stylesheet" href="styles.css" />`)
- Modify: `docs/build-pipeline.html` (before line 11 `<link rel="stylesheet" href="styles.css" />`)

- [ ] **Step 1: Add font + token links above the existing `styles.css` link in each file**

In each of the three files, find the line:
```html
<link rel="stylesheet" href="styles.css" />
```
and insert immediately **above** it:
```html
<link rel="stylesheet" href="fonts.css" />
<link rel="stylesheet" href="tokens.css" />
```
(Order matters: `fonts.css` and `tokens.css` must load before `styles.css`, which consumes them.)

- [ ] **Step 2: Verify all three pages link all three stylesheets in order**

Run:
```bash
cd /Users/patricia/wcag-explainer/docs && for f in index.html features.html build-pipeline.html; do echo "== $f =="; grep -nE 'href="(fonts|tokens|styles)\.css"' "$f"; done
```
Expected: each file lists `fonts.css`, then `tokens.css`, then `styles.css`, in that order.

- [ ] **Step 3: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add docs/index.html docs/features.html docs/build-pipeline.html
git commit -m "feat(docs): link matcha-oat fonts + tokens in all docs pages

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Rewrite `docs/styles.css` to Matcha Oat tokens

**Files:**
- Modify: `docs/styles.css` (full replacement)

This replaces the local blue/white `:root` palette with references to the tokens from `tokens.css`. The mapping mirrors the app's Phase 2 reskin. Code blocks stay on a light surface (legibility); only the `.term` mock uses the dark terminal surface. Decorative category hues collapse to matcha + yolk + neutral. No `#` hex and no quoted `font-family` appear anywhere (CI enforces this).

- [ ] **Step 1: Replace the entire contents of `docs/styles.css` with:**

```css
/* Shared docs styling — Matcha Oat design system.
   All color / font / radius / shadow / motion values come from the linked
   tokens.css (matcha-oat-design-system), synced into docs/. Never hardcode a
   hex or font here — CI (check-no-raw-values) enforces it. Used by index.html,
   features.html, and build-pipeline.html. */

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--sans);
  background: var(--oat);
  color: var(--ink-2);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--matcha-deep); }
.wrap { max-width: var(--maxw); margin: 0 auto; padding: 0 var(--gutter); }
@media (max-width: 700px) { .wrap { padding: 0 26px; } }

.skip-link {
  position: absolute; left: -999px; top: 0;
  background: var(--matcha-deep); color: var(--oat); padding: 10px 16px;
  border-radius: 0 0 var(--r-md) 0; font-weight: 700; z-index: 50;
}
.skip-link:focus { left: 0; }

:where(a, button):focus-visible {
  outline: var(--focus);
  outline-offset: var(--focus-offset);
  border-radius: 4px;
}

/* ---------- Header / hero ---------- */
header.hero {
  padding: 56px 0 34px;
  border-bottom: 1px solid var(--line);
  background: var(--oat);
}
.topnav, nav[aria-label="Docs"] {
  display: flex; gap: 16px; font-size: .85rem; margin-bottom: 24px; flex-wrap: wrap;
}
.topnav a, nav[aria-label="Docs"] a {
  text-decoration: none; color: var(--ink-2); font-weight: 500;
  border-bottom: 2px solid transparent; transition: color var(--dur-color) var(--ease);
}
.topnav a:hover, nav[aria-label="Docs"] a:hover { color: var(--ink); }
.topnav a.active, nav[aria-label="Docs"] a[aria-current="page"] {
  color: var(--ink); font-weight: 700; border-bottom-color: var(--yolk);
}

/* eyebrow: short matcha rule + tracked uppercase label (mirrors .sw-eyebrow) */
.eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--sans); font-size: .72rem; font-weight: 600;
  letter-spacing: .18em; text-transform: uppercase; color: var(--matcha-deep);
}
.eyebrow::before {
  content: ""; display: inline-block; width: 22px; height: 1.5px; background: var(--matcha);
}
header.hero h1 {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(1.9rem, 4vw, 2.9rem);
  line-height: 1.05; letter-spacing: -.02em; margin: 18px 0 12px; color: var(--ink);
}
header.hero h1 em { font-style: italic; color: var(--matcha-deep); }
.lede {
  font-family: var(--serif); font-size: 1.2rem; line-height: 1.4;
  color: var(--ink-2); max-width: 60ch; margin: 0;
}
header.hero .lede em { color: var(--matcha-deep); font-style: italic; font-weight: 400; }

/* hero pills (build-pipeline) */
.pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
.pill {
  font-family: var(--mono); font-size: .82rem; color: var(--muted);
  background: var(--paper); border: 1px solid var(--line-2);
  padding: 7px 13px; border-radius: var(--r-pill);
}
.pill b { color: var(--ink-2); }

/* in-page table of contents (build-pipeline) */
.toc { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 26px; font-size: .85rem; }
.toc a { color: var(--muted); text-decoration: none; }
.toc a:hover { color: var(--matcha-deep); text-decoration: underline; }

/* tabs mock (features hero) — mirror app active tab: ink + bold + yolk underline */
.tabsmock { display: inline-flex; gap: 16px; margin-top: 24px; flex-wrap: wrap; }
.tabsmock span {
  font-size: .85rem; padding: 6px 2px; color: var(--ink-2); font-weight: 500;
  border-bottom: 2px solid transparent;
}
.tabsmock .on { color: var(--ink); border-bottom-color: var(--yolk); font-weight: 700; }
.tabsmock .badge {
  font-family: var(--mono); background: var(--matcha-tint); color: var(--matcha-deep);
  border-radius: var(--r-pill); padding: 0 7px; margin-left: 6px; font-size: .7rem;
}

/* ---------- Sections ---------- */
main { padding-bottom: 10px; }
section { padding: 44px 0; border-bottom: 1px solid var(--line); }
section:last-child { border-bottom: none; }
h2 {
  font-family: var(--serif); font-weight: 500;
  font-size: 1.6rem; letter-spacing: -.01em; margin: 0 0 6px;
  color: var(--ink); display: flex; align-items: baseline; gap: 12px;
}
h3 { font-family: var(--serif); font-weight: 500; font-size: 1.1rem; margin: 0 0 8px; color: var(--ink); }
.section-intro { color: var(--ink-2); max-width: 74ch; margin: 6px 0 24px; }
.group-tag {
  font-family: var(--sans); font-size: .72rem; font-weight: 600; letter-spacing: .18em;
  text-transform: uppercase; color: var(--matcha-deep); margin: 0 0 4px;
}

/* number label: small mono eyebrow by default (features "Feature 1 & 7") */
.num {
  font-family: var(--mono); font-size: .72rem; letter-spacing: .1em;
  text-transform: uppercase; color: var(--muted);
}
/* …but a rounded index badge when it sits inside an h2 (build-pipeline "01") */
h2 .num {
  flex: 0 0 auto; display: inline-grid; place-items: center;
  width: 30px; height: 30px; border-radius: var(--r-sm); font-size: .8rem; letter-spacing: 0;
  color: var(--matcha-deep); background: var(--matcha-tint); border: 1px solid var(--matcha-tint-border);
  text-transform: none;
}

/* ---------- Cards / grids ---------- */
.grid { display: grid; gap: 16px; }
.g2 { grid-template-columns: repeat(2, 1fr); }
.g3 { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 820px) { .g2, .g3 { grid-template-columns: 1fr; } }

.card {
  background: var(--paper); border: 1px solid var(--line-2);
  border-left: 3px solid var(--line-2); border-radius: var(--r-lg);
  padding: 18px 18px 16px;
}
.card h3 { margin-top: 0; }
.card p { margin: 6px 0 0; color: var(--ink-2); font-size: .92rem; }
/* category stripes collapse to the matcha / yolk family — no rainbow */
.accent-violet { border-left-color: var(--matcha); }
.accent-teal   { border-left-color: var(--matcha-deep); }
.accent-amber  { border-left-color: var(--yolk); }
.accent-pink   { border-left-color: var(--matcha); }
.accent-blue   { border-left-color: var(--matcha); }

.tag {
  display: inline-block; font-family: var(--mono); font-size: .68rem;
  color: var(--matcha-deep); background: var(--matcha-tint); border: 1px solid var(--matcha-tint-border);
  padding: 3px 8px; border-radius: var(--r-sm); margin-bottom: 10px;
}
.decision .because, .because {
  display: block; margin-top: 10px; font-size: .85rem; color: var(--muted);
  border-top: 1px dashed var(--line-2); padding-top: 9px;
}
.because b { color: var(--ink-2); }
.file code {
  display: block; font-family: var(--mono); font-size: .95rem; color: var(--matcha-deep);
  font-weight: 600; margin: 2px 0 4px;
}
.file .role { font-size: .85rem; }

/* callouts / notes — flat matcha-tint info box */
.callout, .note {
  margin-top: 22px; padding: 14px 16px; border-radius: var(--r-md);
  background: var(--matcha-tint); border: 1px solid var(--matcha-tint-border); color: var(--ink-2);
}
.callout b, .note b { color: var(--ink); }

/* ---------- Why list (build-pipeline) ---------- */
.why-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; }
.why-list li { display: flex; gap: 12px; }
.why-list .dot { color: var(--matcha); flex: 0 0 auto; line-height: 1.5; }
.why-list b { color: var(--ink); }
.why-list .body { color: var(--ink-2); }

/* ---------- Steps (build-pipeline) ---------- */
.steps { list-style: none; counter-reset: step; padding: 0; margin: 0; display: grid; gap: 12px; }
.steps li { counter-increment: step; display: flex; gap: 14px; align-items: flex-start; }
.steps li::before {
  content: counter(step); flex: 0 0 auto;
  width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center;
  font-size: .8rem; font-weight: 700; color: var(--oat); background: var(--matcha-deep);
}
.steps b { color: var(--ink); }
.steps .meta { font-family: var(--mono); font-size: .72rem; color: var(--muted); }

/* ---------- Batches (build-pipeline) ---------- */
.batches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 14px; }
@media (max-width: 700px) { .batches { grid-template-columns: repeat(2, 1fr); } }
.batch {
  border: 1px solid var(--line-2); border-radius: var(--r-md); padding: 14px; text-align: center; background: var(--paper);
}
.batch .p { font-family: var(--mono); font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.batch .n { font-family: var(--mono); font-size: 1.8rem; font-weight: 700; color: var(--matcha-deep); line-height: 1.2; }
.batch .lbl { font-size: .82rem; color: var(--ink-2); }

/* ---------- Diagram (build-pipeline) ---------- */
.diagram {
  margin-top: 18px; padding: 16px; background: var(--paper);
  border: 1px solid var(--line-2); border-radius: var(--r-md); overflow-x: auto;
}
.diagram svg { width: 100%; height: auto; min-width: 640px; }
.legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; font-size: .82rem; color: var(--ink-2); }
.legend .swatch { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 6px; vertical-align: middle; }
/* legend swatches — match the diagram node strokes (matcha / yolk family) */
.legend .s-det  { background: var(--matcha); }
.legend .s-gen  { background: var(--yolk-deep); }
.legend .s-tmpl { background: var(--yolk); }
.legend .s-cons { background: var(--matcha-deep); }

/* ---------- Code blocks (light surface for legibility) ---------- */
pre {
  background: var(--neutral-bg); border: 1px solid var(--line-2); border-radius: var(--r-md);
  padding: 14px 16px; overflow-x: auto; font-family: var(--mono);
  font-size: .82rem; line-height: 1.6; color: var(--ink-2); margin: 0;
}
code.inline {
  font-family: var(--mono); font-size: .86em; color: var(--matcha-deep);
  background: var(--matcha-tint); border: 1px solid var(--matcha-tint-border);
  padding: 1px 6px; border-radius: var(--r-sm);
}
/* JSON/code token spans used in build-pipeline <pre> (on light bg) */
pre .c { color: var(--muted); }            /* comment */
pre .p { color: var(--matcha-deep); }      /* property key */
pre .s { color: var(--yolk-deep); }        /* string */
pre .pass { color: var(--ok); font-weight: 700; }
pre .fail { color: var(--bad); font-weight: 700; }

/* ---------- Terminal mock (build-pipeline) — the one dark surface ---------- */
.term { border: 1px solid var(--term-line); border-radius: var(--r-md); overflow: hidden; background: var(--term-bg); }
.term .bar {
  display: flex; align-items: center; gap: 10px; padding: 9px 14px;
  background: var(--term-bar); border-bottom: 1px solid var(--term-line);
  font-family: var(--mono); font-size: .76rem; color: var(--term-text);
}
.term .dotrow { display: inline-flex; gap: 6px; }
.term .dotrow i { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
.term .dotrow i:nth-child(1) { background: var(--bad-border); }
.term .dotrow i:nth-child(2) { background: var(--yolk); }
.term .dotrow i:nth-child(3) { background: var(--matcha); }
.term pre { border: none; border-radius: 0; background: var(--term-bg); color: var(--term-text); }
.term .out { color: var(--term-text); opacity: .7; }
.term .you { color: var(--yolk); }
.term .cmd { color: var(--term-text); font-weight: 600; }

/* ---------- Features: feature rows + mocks ---------- */
.feature { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: center; margin: 26px 0; }
.feature.rev > div:first-child { order: 2; }
@media (max-width: 820px) { .feature { grid-template-columns: 1fr; } .feature.rev > div:first-child { order: 0; } }
.where { font-size: .85rem; color: var(--muted); }
.where b { color: var(--ink-2); }

.mock {
  background: var(--paper); border: 1px solid var(--line-2); border-radius: var(--r-lg);
  padding: 14px; font-size: .85rem;
}
.mock .mhead { font-family: var(--mono); font-size: .72rem; color: var(--muted); margin-bottom: 10px; text-transform: uppercase; letter-spacing: .08em; }
.mock pre { font-size: .76rem; }

.chip {
  display: inline-block; font-size: .76rem; padding: 3px 9px; border-radius: var(--r-pill);
  border: 1px solid var(--line-2); background: var(--paper); color: var(--muted); font-weight: 500;
}
.chip.axe { color: var(--matcha-deep); border-color: var(--matcha-tint-border); background: var(--matcha-tint); }
.chip.lint { color: var(--warn); border-color: var(--warn-border); background: var(--warn-bg); }
.chip.crit { color: var(--matcha-deep); border-color: var(--matcha-tint-border); background: var(--matcha-tint); }

.codeline { font-family: var(--mono); font-size: .78rem; padding: 3px 8px; border-radius: var(--r-sm); margin: 3px 0; }
.codeline.del { background: var(--bad-bg); color: var(--bad); }
.codeline.add { background: var(--ok-bg); color: var(--ok); }

.exp { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 480px) { .exp { grid-template-columns: 1fr; } }
.exp h4 { margin: 0 0 4px; font-size: .8rem; }
.exp p { margin: 0; font-size: .8rem; color: var(--ink-2); }
.exp .bad { background: var(--bad-bg); border: 1px solid var(--bad-border); border-radius: var(--r-sm); padding: 9px; }
.exp .good { background: var(--ok-bg); border: 1px solid var(--ok-border); border-radius: var(--r-sm); padding: 9px; }

.checkline { font-size: .82rem; padding: 3px 0; color: var(--ink-2); }
.checkline b { font-family: var(--mono); color: var(--matcha-deep); margin-right: 6px; }

.quizmock { display: flex; gap: 8px; }
.quizmock button { font-size: .8rem; padding: 5px 12px; border-radius: var(--r-sm); border: 1px solid var(--line-2); background: var(--paper); cursor: default; }
.quizmock .ok { color: var(--ok); border-color: var(--ok-border); }
.quizmock .no { color: var(--bad); border-color: var(--bad-border); }

/* ---------- index hub cards ---------- */
.hub { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-top: 28px; }
@media (max-width: 700px) { .hub { grid-template-columns: 1fr; } }
.hub .card {
  display: block; text-decoration: none; color: inherit;
  transition: transform var(--dur-base) var(--ease), border-color var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease);
}
.hub .card:hover { border-color: var(--line-2); box-shadow: var(--shadow-card); transform: translateY(-3px); }
.hub .card h2 { font-size: 1.2rem; display: block; }
.hub .card p { color: var(--ink-2); }

/* ---------- Footer ---------- */
footer { border-top: 1px solid var(--line); padding: 30px 0 56px; background: var(--oat); }
footer p { color: var(--ink-2); max-width: 80ch; margin: 0 0 14px; font-size: .92rem; }
.meta-grid { display: flex; flex-wrap: wrap; gap: 8px 10px; }
.meta-grid span {
  font-family: var(--mono); font-size: .78rem; color: var(--muted); background: var(--paper);
  border: 1px solid var(--line-2); border-radius: var(--r-pill); padding: 5px 11px;
}

/* ---------- Reduced motion (WCAG 2.3.3 / 2.2.2) ---------- */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  * {
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [ ] **Step 2: Verify no raw hex or font literals remain in `styles.css`**

Run:
```bash
cd /Users/patricia/wcag-explainer/docs && node node_modules/matcha-oat-design-system/scripts/check-no-raw-values.mjs styles.css
```
Expected: `OK — no raw design values in 1 file(s).`

- [ ] **Step 3: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add docs/styles.css
git commit -m "feat(docs): reskin styles.css to Matcha Oat tokens

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Reskin inline colors in the HTML (diagram SVG, terminal, swatches, var refs)

**Files:**
- Modify: `docs/build-pipeline.html` (SVG `<style>` block, SVG fill/stroke attributes, legend swatches, terminal dots, inline `var()` refs)
- Modify: `docs/features.html` (inline `var()` refs)
- Modify: `docs/index.html` (inline `var()` refs, if any)

After Task 3, `tokens.css` no longer defines `--green`, `--red`, `--accent`, `--accent-ink`, or `--ink-dim`, so any inline reference to those breaks. This task rewrites every inline color in the markup to a defined token, and removes all hardcoded hex from the SVG.

- [ ] **Step 1: Rewrite the build-pipeline diagram SVG `<style>` block**

In `docs/build-pipeline.html`, find the SVG inline style rules (around lines 275–278):
```css
            .lbl { fill:#111827; font-family: var(--sans); font-size: 13.5px; font-weight:600; }
            .sub { fill:#6b7280; font-family: ui-monospace, monospace; font-size: 10px; }
            .phaselbl { fill:#94a3b8; font-family: ui-monospace, monospace; font-size: 11px; letter-spacing:.12em; }
            .edge { stroke:#94a3b8; stroke-width:2; fill:none; marker-end:url(#arrow); }
```
Replace with (adds node helper classes; uses tokens; keeps the unquoted `ui-monospace` keyword which the guard allows):
```css
            .lbl { fill: var(--ink); font-family: var(--sans); font-size: 13.5px; font-weight:600; }
            .sub { fill: var(--muted); font-family: var(--mono); font-size: 10px; }
            .phaselbl { fill: var(--muted); font-family: var(--mono); font-size: 11px; letter-spacing:.12em; }
            .edge { stroke: var(--muted); stroke-width:2; fill:none; marker-end:url(#arrow); }
            .n-fill { fill: var(--paper); }
            .n-tint-matcha { fill: var(--matcha-tint); }
            .n-tint-yolk { fill: var(--warn-bg); }
            .n-det { stroke: var(--matcha); }
            .n-gen { stroke: var(--yolk-deep); }
            .n-tmpl { stroke: var(--yolk); }
            .n-cons { stroke: var(--matcha-deep); }
            .n-plain { stroke: var(--line); }
            .guide { stroke: var(--line); }
            .em-gen { fill: var(--matcha-deep); }
```

- [ ] **Step 2: Replace hardcoded fill/stroke attributes in the SVG with token classes**

Apply these exact edits in `docs/build-pipeline.html` (the SVG body, ~lines 272–328). Each replaces the inline `fill="#…"`/`stroke="#…"` with class names defined above:

| Find (current) | Replace with |
|---|---|
| `<path d="M0,0 L10,5 L0,10 z" fill="#94a3b8"></path>` | `<path d="M0,0 L10,5 L0,10 z" class="phaselbl" style="stroke:none"></path>` |
| `<line x1="300" y1="30" x2="300" y2="430" stroke="#e5e7eb" stroke-dasharray="4 6"></line>` | `<line x1="300" y1="30" x2="300" y2="430" class="guide" stroke-dasharray="4 6"></line>` |
| `<line x1="760" y1="30" x2="760" y2="430" stroke="#e5e7eb" stroke-dasharray="4 6"></line>` | `<line x1="760" y1="30" x2="760" y2="430" class="guide" stroke-dasharray="4 6"></line>` |
| `<rect rx="11" x="30" y="70" width="200" height="58" fill="#f9fafb" stroke="#059669"></rect>` | `<rect rx="11" x="30" y="70" width="200" height="58" class="n-fill n-det"></rect>` |
| `<rect rx="11" x="30" y="160" width="200" height="58" fill="#f9fafb" stroke="#d97706"></rect>` | `<rect rx="11" x="30" y="160" width="200" height="58" class="n-fill n-tmpl"></rect>` |
| `<path d="M360,99 l26,-26 l26,26 l-26,26 z" fill="#eff6ff" stroke="#059669"></path>` | `<path d="M360,99 l26,-26 l26,26 l-26,26 z" class="n-tint-matcha n-det"></path>` |
| `<text x="372" y="103" class="sub" fill="#111827">skip</text>` | `<text x="372" y="103" class="sub" style="fill:var(--ink)">skip</text>` |
| `<rect rx="11" x="345" y="175" width="120" height="64" fill="#f5f3ff" stroke="#7c3aed"></rect>` | `<rect rx="11" x="345" y="175" width="120" height="64" class="n-fill n-gen"></rect>` |
| `<rect rx="11" x="500" y="60" width="210" height="200" fill="#ffffff" stroke="#e5e7eb"></rect>` | `<rect rx="11" x="500" y="60" width="210" height="200" class="n-fill n-plain"></rect>` |
| `<text x="516" y="82" class="sub" fill="#7c3aed">six keys →</text>` | `<text x="516" y="82" class="sub em-gen">six keys →</text>` |
| `<rect rx="11" x="500" y="290" width="210" height="58" fill="#f9fafb" stroke="#059669"></rect>` | `<rect rx="11" x="500" y="290" width="210" height="58" class="n-fill n-det"></rect>` |
| `<rect rx="11" x="790" y="160" width="160" height="60" fill="#fffbeb" stroke="#d97706"></rect>` | `<rect rx="11" x="790" y="160" width="160" height="60" class="n-tint-yolk n-tmpl"></rect>` |
| `<rect rx="11" x="790" y="70" width="160" height="58" fill="#f0fdf4" stroke="#16a34a"></rect>` | `<rect rx="11" x="790" y="70" width="160" height="58" class="n-tint-matcha n-cons"></rect>` |

Note: if any of the rects already carry an existing `class="…"`, merge the new classes into that attribute rather than adding a second `class`. After editing, no `fill="#…"` or `stroke="#…"` should remain in the SVG.

- [ ] **Step 3: Replace the legend swatch inline backgrounds (around lines 344–347)**

| Find | Replace with |
|---|---|
| `<span><i class="swatch" style="background:#059669"></i> deterministic / committed</span>` | `<span><i class="swatch s-det"></i> deterministic / committed</span>` |
| `<span><i class="swatch" style="background:#7c3aed"></i> Claude (generative)</span>` | `<span><i class="swatch s-gen"></i> Claude (generative)</span>` |
| `<span><i class="swatch" style="background:#d97706"></i> templates / validation</span>` | `<span><i class="swatch s-tmpl"></i> templates / validation</span>` |
| `<span><i class="swatch" style="background:#16a34a"></i> consumer</span>` | `<span><i class="swatch s-cons"></i> consumer</span>` |

- [ ] **Step 4: Replace the terminal window dots (around line 391)**

Find:
```html
<div class="bar"><span class="dotrow"><i style="background:#ef4444"></i><i style="background:#f59e0b"></i><i style="background:#22c55e"></i></span> scripts/ · terminal</div>
```
Replace with (colors now come from the `.term .dotrow i:nth-child(...)` rules):
```html
<div class="bar"><span class="dotrow"><i></i><i></i><i></i></span> scripts/ · terminal</div>
```

- [ ] **Step 5: Rewrite remaining inline `var()` color references in all three files**

Run this to find every inline color var still referencing a removed token:
```bash
cd /Users/patricia/wcag-explainer/docs && grep -nE 'var\(--(green|red|accent|accent-ink|ink-dim)\)' index.html features.html build-pipeline.html
```
Apply these replacements to every match (these tokens no longer exist; `var(--mono)`/`var(--sans)` are still valid and need no change):

| Find | Replace with |
|---|---|
| `var(--green)` | `var(--ok)` |
| `var(--red)` | `var(--bad)` |
| `var(--accent-ink)` | `var(--matcha-deep)` |
| `var(--accent)` | `var(--matcha-deep)` |
| `var(--ink-dim)` | `var(--muted)` |

- [ ] **Step 6: Verify no hardcoded hex or stale tokens remain in any page**

Run:
```bash
cd /Users/patricia/wcag-explainer/docs
echo "-- stray hex (should be empty) --"; grep -nE '#[0-9a-fA-F]{3,6}' index.html features.html build-pipeline.html
echo "-- stale tokens (should be empty) --"; grep -nE 'var\(--(green|red|accent|accent-ink|ink-dim)\)' index.html features.html build-pipeline.html
echo "-- guard --"; node node_modules/matcha-oat-design-system/scripts/check-no-raw-values.mjs index.html features.html build-pipeline.html styles.css
```
Expected: both greps print nothing; the guard prints `OK — no raw design values in 4 file(s).`

- [ ] **Step 7: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add docs/index.html docs/features.html docs/build-pipeline.html
git commit -m "feat(docs): retoken inline colors + diagram SVG to Matcha Oat

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Add the docs CI guardrail and fix the Pages deploy

**Files:**
- Modify: `.github/workflows/ci.yml:14` (matrix list)
- Modify: `.github/workflows/deploy-pages.yml` (assemble `cp` line)

- [ ] **Step 1: Add `docs` to the CI test matrix**

In `.github/workflows/ci.yml`, change line 14:
```yaml
        package: [template, scripts]
```
to:
```yaml
        package: [template, scripts, docs]
```
No other CI changes are needed: `npm ci` installs the docs dependency, the existing `Test` step runs `npm test` (which for docs runs the sync-drift check + `check-no-raw-values`), and the template-only steps are already gated with `if: matrix.package == 'template'`.

- [ ] **Step 2: Copy the synced token files into the deployed site**

In `.github/workflows/deploy-pages.yml`, find the assemble line:
```bash
          cp docs/*.html docs/styles.css _site/docs/
```
Replace with:
```bash
          cp docs/*.html docs/styles.css docs/tokens.css docs/fonts.css _site/docs/
```

- [ ] **Step 3: Verify the deploy assemble step locally (dry run)**

Run:
```bash
cd /Users/patricia/wcag-explainer && rm -rf /tmp/_site_test && mkdir -p /tmp/_site_test/docs && cp docs/*.html docs/styles.css docs/tokens.css docs/fonts.css /tmp/_site_test/docs/ && ls /tmp/_site_test/docs/
```
Expected: lists the three HTML files plus `styles.css`, `tokens.css`, `fonts.css` (no error). Then `rm -rf /tmp/_site_test`.

- [ ] **Step 4: Commit**

```bash
cd /Users/patricia/wcag-explainer
git add .github/workflows/ci.yml .github/workflows/deploy-pages.yml
git commit -m "ci(docs): add docs to test matrix + ship tokens to Pages

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the docs CI check exactly as CI will**

Run:
```bash
cd /Users/patricia/wcag-explainer/docs && npm test
```
Expected: `synced tokens.css` / `synced fonts.css`, no `git diff` output (exit 0), then `OK — no raw design values in 4 file(s).`

- [ ] **Step 2: Serve the docs and eyeball each page against the live app**

Run:
```bash
cd /Users/patricia/wcag-explainer/docs && python3 -m http.server 8123
```
Open `http://localhost:8123/index.html`, `features.html`, `build-pipeline.html`. Confirm against `https://patriciagoh.github.io/wcag-explainer/`:
- Oat (`#FAF7EF`) page background, white cards, brown-tinted card hover shadow.
- Serif (Newsreader) headings at weight 400; sans (Hanken Grotesk) body; mono (Space Mono) for code/meta/numbers.
- Matcha rules + matcha-deep links; the single yolk accent on the active nav/tab underline only.
- No decorative rainbow: card stripes, the build-pipeline diagram, and code syntax are all within matcha + yolk + neutral; the diagram legend still reads clearly (each swatch has its text label).
- The `.term` block is the only dark surface; its text is legible.
Stop the server with Ctrl-C.

- [ ] **Step 3: Accessibility spot-check**

- Tab through links/buttons on each page → a visible matcha focus ring appears (`var(--focus)`).
- Enable OS "Reduce Motion" and reload → hover lifts/transitions are suppressed (the `prefers-reduced-motion` block).
- Confirm pass/fail and diagram categories never rely on color alone (each carries a text label/word).

- [ ] **Step 4: Confirm a clean tree and review the branch**

Run:
```bash
cd /Users/patricia/wcag-explainer && git status --short && git log --oneline main..HEAD
```
Expected: clean working tree; the log shows the spec commit plus the Task 1–5 commits.

---

## Self-review notes

- **Spec coverage:** token consumption + sync script (Task 1) ✓; HTML linking (Task 2) ✓; `styles.css` token mapping incl. decorative-hue collapse, terminal, serif/eyebrow/yolk-underline/why-callout idioms, focus ring, reduced motion (Task 3) ✓; inline HTML colors + diagram SVG (Task 4) ✓; CI guardrail + matrix (Task 5) ✓; deploy `cp` fix (Task 5) ✓; WCAG AA preservation verified (Task 6 Step 3) ✓.
- **Deviation from spec (intentional):** the spec line "light code blocks → terminal-dark" is applied only to the `.term` mock; general `<pre>` code blocks stay on a light surface (`--neutral-bg`) because the warm palette lacks bright-enough accents for AA-legible pass/fail syntax on the dark surface. This keeps the reskin WCAG 2.2 AA, which the spec lists as a hard requirement. Diagram syntax/strokes still collapse to matcha+yolk+neutral as specified.
- **Token existence:** every `var(--…)` used (oat, paper, ink, ink-2, muted, line, line-2, matcha, matcha-deep, matcha-tint, matcha-tint-border, yolk, yolk-deep, ok/-bg/-border, bad/-bg/-border, warn/-bg/-border, neutral-bg, term-bg/-bar/-line/-text, serif, sans, mono, r-sm/md/lg/pill, shadow-card, dur-color/base, ease, focus, focus-offset, maxw, gutter) is defined in `tokens.css`.
- **No placeholders:** every code/step shows the actual content or exact command + expected output.
