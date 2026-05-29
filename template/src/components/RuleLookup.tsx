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
      <h1 className="text-2xl font-semibold">Rule lookup</h1>
      <p className="text-gray-600 mt-1">
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
        className="w-full mt-4 px-3 py-2 border rounded text-sm"
        autoFocus
      />

      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className="text-gray-500">Try:</span>
        {EXAMPLES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setQuery(e)}
            className="px-2 py-0.5 rounded border bg-white hover:bg-gray-50 font-mono"
          >
            {e}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {query && hits.length === 0 && (
          <p className="text-gray-600">
            No matching axe-core or jsx-a11y rule. Try a partial id like <code>aria</code> or{" "}
            <code>label</code>.
          </p>
        )}
        {hits.map((h) => (
          <div key={`${h.source}:${h.rule}`} className="border rounded-md p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  h.source === "axe-core"
                    ? "bg-yellow-100 text-yellow-900 border-yellow-300"
                    : "bg-violet-100 text-violet-900 border-violet-300"
                }`}
              >
                {h.source}
              </span>
              <code className="text-sm font-mono">{h.rule}</code>
              <a
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-blue-700 hover:underline"
              >
                rule docs →
              </a>
            </div>
            <p className="text-sm text-gray-700 mt-2">{h.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {h.criteria.map((id) => {
                const c = byId.get(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelect(id)}
                    className="text-sm px-3 py-1 rounded border bg-blue-50 hover:bg-blue-100 border-blue-200"
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
