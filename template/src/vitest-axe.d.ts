// Declaration-merging shim for vitest-axe's custom matchers. The empty
// interfaces and the `T = any` generic are required to merge into vitest's
// own `Assertion<T = any>` signature, so the corresponding lint rules are
// intentionally disabled for this file only.
/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import "vitest";
import type { AxeMatchers } from "vitest-axe/matchers";

declare module "vitest" {
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
