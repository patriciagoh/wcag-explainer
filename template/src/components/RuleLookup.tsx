import { useMemo, useState } from "react";
import type { Criterion } from "../types.ts";
import { lookupRule } from "../augment.ts";

type Props = {
  all: Criterion[];
  byId: Map<string, Criterion>;
  onSelect: (id: string) => void;
};

const EXAMPLES = ["image-alt", "color-contrast", "label", "alt-text", "tabindex", "aria"];

/** #1 + #7 — paste a scanner/linter rule, jump to the criterion + fix. */
export function RuleLookup({ all, byId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const hits = useMemo(() => lookupRule(query, all), [query, all]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold font-serif text-ink">Rule lookup</h1>
      <p className="text-ink-2 mt-1">
        Your scanner flagged something — find out which WCAG criterion it maps to and how to fix it.
        Works with <strong>axe-core</strong> and <strong>eslint-plugin-jsx-a11y</strong> rule names.
      </p>

      <label htmlFor="rule-q" className="sr-only">
        Rule id
      </label>
      <input
        id="rule-q"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. image-alt, color-contrast, alt-text, tabindex-no-positive"
        className="w-full mt-4 px-3 py-2 border border-muted rounded-md text-sm bg-paper text-ink placeholder:text-muted"
        autoFocus
      />

      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className="text-muted">Try:</span>
        {EXAMPLES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setQuery(e)}
            className="inline-flex items-center min-h-6 px-2 py-1 rounded-md border border-muted bg-paper text-ink-2 hover:bg-matcha-tint font-mono"
          >
            {e}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3" role="status" aria-live="polite">
        {query && hits.length === 0 && (
          <p className="text-ink-2">
            No matching axe-core or jsx-a11y rule. Try a partial id like <code>aria</code> or{" "}
            <code>label</code>.
          </p>
        )}
        {hits.map((h) => (
          <div key={`${h.source}:${h.rule}`} className="border border-line rounded-md p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  h.source === "axe-core"
                    ? "bg-warn-bg text-warn border-warn-border"
                    : "bg-neutral-bg text-neutral border-neutral-border"
                }`}
              >
                {h.source}
              </span>
              <code className="text-sm font-mono text-ink">{h.rule}</code>
              <a
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-matcha-deep hover:underline"
              >
                rule docs →
              </a>
            </div>
            <p className="text-sm text-ink-2 mt-2">{h.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {h.criteria.map((id) => {
                const c = byId.get(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelect(id)}
                    className="text-sm px-3 py-1 rounded-md border bg-matcha-tint text-matcha-deep hover:border-matcha border-matcha-tint-border"
                  >
                    <span className="font-mono mr-1">{id}</span>
                    {c ? c.title : ""} →
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
