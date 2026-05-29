---
name: wcag-explainer
description: Scaffolds a local interactive WCAG 2.2 criterion-explainer React app — plain-English summaries, JSX pass/fail examples, axe-core rule mapping, common mistakes, and "why it matters" / "quick check" per criterion. Use when an engineer asks for an accessibility reference, WCAG lookup tool, or wants to onboard their team to WCAG.
---

# wcag-explainer skill

> A hosted demo is available at <https://patriciagoh.github.io/wcag-explainer/>. This skill scaffolds a **local, ownable** copy of that app for the user.

When invoked:

1. Determine the target directory. Default: `./wcag-explainer` relative to the user's cwd. If the user mentions a different path, use it. Confirm before overwriting if the directory exists.

2. Copy the contents of `template/` (next to this `SKILL.md`) into the target directory. Include hidden files like `.gitignore`.

3. `cd <target> && npm install`. Wait for completion. If it fails, report the error to the user and stop.

4. Start the dev server in the background: `npm run dev`. Capture the local URL it prints (typically `http://localhost:5173`).

5. Tell the user the app is ready and give them the local URL. Suggest they leave the dev server running and stop it themselves (Ctrl-C in the relevant terminal) when done. Also mention that a hosted version is available at <https://patriciagoh.github.io/wcag-explainer/> if they'd rather not run it locally.

Do **not** attempt to rebuild the dataset on user invocation. The dataset is pre-built and shipped inside `template/src/data/wcag-criteria.json`. If the user wants to rebuild it, point them at the skill directory's `README.md` — that's a skill-author task.
