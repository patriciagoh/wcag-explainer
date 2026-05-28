import type { AxeRule } from "../types.ts";

type Props = { rules: AxeRule[] };

const impactClass: Record<AxeRule["impact"], string> = {
  minor: "bg-gray-100 text-gray-800",
  moderate: "bg-yellow-100 text-yellow-900",
  serious: "bg-orange-100 text-orange-900",
  critical: "bg-red-100 text-red-900",
};

export function AxeRuleBadges({ rules }: Props) {
  if (rules.length === 0) {
    return <p className="text-sm text-gray-600">No axe-core rules map to this criterion.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2 list-none p-0">
      {rules.map((r) => (
        <li key={r.ruleId}>
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block px-2 py-1 rounded text-sm border ${impactClass[r.impact]}`}
            title={r.description}
          >
            {r.ruleId} <span className="text-xs ml-1">({r.impact})</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
