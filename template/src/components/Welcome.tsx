import type { Criterion } from "../types.ts";

type Mode = "reference" | "lookup" | "quiz" | "checklist";

type Props = {
  byId: Map<string, Criterion>;
  total: number;
  onSelect: (id: string) => void;
  onMode: (mode: Mode) => void;
};

const FEATURED = ["1.1.1", "1.4.3", "2.1.1", "2.4.7", "3.3.2", "4.1.2"];

const REFERENCES: { group: string; links: { label: string; href: string; note: string }[] }[] = [
  {
    group: "The standard (W3C)",
    links: [
      { label: "WCAG 2.2 specification", href: "https://www.w3.org/TR/WCAG22/", note: "The normative spec" },
      { label: "How to Meet WCAG (Quick Reference)", href: "https://www.w3.org/WAI/WCAG22/quickref/", note: "Filterable checklist + techniques" },
      { label: "Understanding WCAG 2.2", href: "https://www.w3.org/WAI/WCAG22/Understanding/", note: "Intent & examples per criterion" },
      { label: "W3C Web Accessibility Initiative (WAI)", href: "https://www.w3.org/WAI/", note: "Introductions & resources" },
    ],
  },
  {
    group: "Testing tools",
    links: [
      { label: "axe-core rules", href: "https://dequeuniversity.com/rules/axe/4.10", note: "The rules this app maps to" },
      { label: "axe DevTools (browser extension)", href: "https://www.deque.com/axe/devtools/", note: "Scan a real page" },
      { label: "eslint-plugin-jsx-a11y", href: "https://github.com/jsx-eslint/eslint-plugin-jsx-a11y", note: "Lint JSX for a11y issues" },
      { label: "WebAIM Contrast Checker", href: "https://webaim.org/resources/contrastchecker/", note: "For 1.4.3 / 1.4.11" },
    ],
  },
  {
    group: "Learn more",
    links: [
      { label: "MDN — Accessibility", href: "https://developer.mozilla.org/en-US/docs/Web/Accessibility", note: "Practical web a11y docs" },
      { label: "WebAIM", href: "https://webaim.org/", note: "Articles & training" },
      { label: "The A11y Project checklist", href: "https://www.a11yproject.com/checklist/", note: "Friendly plain-language checklist" },
      { label: "ARIA Authoring Practices (APG)", href: "https://www.w3.org/WAI/ARIA/apg/", note: "Patterns for custom widgets" },
    ],
  },
];

const MODES: { mode: Mode; emoji: string; title: string; desc: string }[] = [
  { mode: "lookup", emoji: "🔎", title: "Rule lookup", desc: "Your scanner flagged a rule? Find the criterion and the fix." },
  { mode: "quiz", emoji: "🎯", title: "Quiz", desc: "Spot the violation — practice pass vs. fail." },
  { mode: "checklist", emoji: "✅", title: "My checklist", desc: "Build a project checklist or a PR-review template." },
];

export function Welcome({ byId, total, onSelect, onMode }: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">WCAG 2.2 Explainer</h1>
      <p className="mt-3 text-lg text-gray-700">
        A working engineer's guide to all {total} WCAG&nbsp;2.2 success criteria — each in plain English,
        with <span className="text-green-700 font-medium">passing</span> and{" "}
        <span className="text-red-700 font-medium">failing</span> code, what a real user experiences,
        the common mistakes, and the axe-core rules that catch them.
      </p>

      <h2 className="text-base font-semibold mt-8 mb-2 text-gray-800">Start here</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <div className="text-sm font-semibold text-blue-900">📚 Browse criteria</div>
          <p className="text-sm text-gray-700 m-0 mt-1">
            Pick any criterion from the sidebar on the left, or filter it by component or your role.
          </p>
        </div>
        {MODES.map((m) => (
          <button
            key={m.mode}
            type="button"
            onClick={() => onMode(m.mode)}
            className="text-left border rounded-lg p-4 hover:border-blue-400 hover:bg-gray-50"
          >
            <div className="text-sm font-semibold">
              {m.emoji} {m.title}
            </div>
            <p className="text-sm text-gray-600 m-0 mt-1">{m.desc}</p>
          </button>
        ))}
      </div>

      <h2 className="text-base font-semibold mt-8 mb-2 text-gray-800">Jump to a common criterion</h2>
      <div className="flex flex-wrap gap-2">
        {FEATURED.map((id) => {
          const c = byId.get(id);
          if (!c) return null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className="text-sm px-3 py-1.5 rounded-full border bg-white hover:bg-blue-50 hover:border-blue-300"
            >
              <span className="font-mono text-xs text-gray-500 mr-1.5">{id}</span>
              {c.title}
            </button>
          );
        })}
      </div>

      <h2 className="text-base font-semibold mt-8 mb-2 text-gray-800">Official docs &amp; tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {REFERENCES.map((col) => (
          <section key={col.group} aria-label={col.group}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              {col.group}
            </h3>
            <ul className="list-none p-0 m-0 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 hover:underline font-medium"
                  >
                    {l.label} ↗
                  </a>
                  <p className="text-xs text-gray-500 m-0">{l.note}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Curious how this is built?{" "}
        <a
          href="https://patriciagoh.github.io/wcag-explainer/docs/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:underline"
        >
          Read the docs ↗
        </a>{" "}
        — the dataset is generated from the W3C Quickref, W3C techniques, and axe-core, then enriched.
      </p>
    </div>
  );
}
