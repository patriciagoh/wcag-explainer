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
