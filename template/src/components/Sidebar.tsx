import { useState } from "react";
import type { PrincipleGroup } from "../hooks/useCriteria.ts";

type Props = {
  grouped: PrincipleGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function Sidebar({ grouped, selectedId, onSelect }: Props) {
  const [showAaa, setShowAaa] = useState(false);

  return (
    <nav aria-label="WCAG criteria" className="overflow-y-auto h-full text-sm">
      <div className="px-3 py-2 border-b">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showAaa}
            onChange={(e) => setShowAaa(e.target.checked)}
          />
          Show AAA criteria
        </label>
      </div>
      {grouped.map((principle) => (
        <section key={principle.id} className="py-2">
          <h2 className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
            {principle.id}. {principle.name}
          </h2>
          {principle.guidelines.map((g) => {
            const visible = g.criteria.filter((c) => showAaa || c.level !== "AAA");
            if (visible.length === 0) return null;
            return (
              <div key={g.id} className="mt-2">
                <h3 className="px-3 text-xs font-medium text-gray-700">
                  {g.id} {g.name}
                </h3>
                <ul className="list-none m-0 p-0">
                  {visible.map((c) => {
                    const selected = c.id === selectedId;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(c.id)}
                          aria-current={selected ? "true" : undefined}
                          className={`w-full text-left px-3 py-1 hover:bg-gray-100 ${
                            selected ? "bg-blue-50 font-medium" : ""
                          }`}
                        >
                          <span className="font-mono text-xs mr-2">{c.id}</span>
                          {c.title}
                          {c.level === "AAA" && (
                            <span className="ml-2 text-xs text-gray-500">AAA</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>
      ))}
    </nav>
  );
}
