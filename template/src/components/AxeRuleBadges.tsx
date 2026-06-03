import type { AxeRule } from "../types.ts";

type Props = { rules: AxeRule[] };

const impactClass: Record<AxeRule["impact"], string> = {
  minor: "bg-neutral-bg text-neutral border-neutral-border",
  moderate: "bg-warn-bg text-warn border-warn-border",
  serious: "bg-bad-bg text-bad border-bad-border",
  critical: "bg-bad-bg text-bad border-bad-border",
};

export function AxeRuleBadges({ rules }: Props) {
  if (rules.length === 0) {
    return <p className="text-sm text-muted">No axe-core rules map to this criterion.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2 list-none p-0">
      {rules.map((r) => (
        <li key={r.ruleId}>
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block px-2 py-1 rounded-pill text-xs font-mono border ${impactClass[r.impact]}`}
            title={r.description}
          >
            {r.ruleId} <span className="text-xs ml-1">({r.impact})</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
