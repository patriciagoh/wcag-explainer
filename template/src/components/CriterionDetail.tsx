import type { Criterion } from "../types.ts";
import { CodeExample } from "./CodeExample.tsx";
import { AxeRuleBadges } from "./AxeRuleBadges.tsx";
import { RelatedCriteria } from "./RelatedCriteria.tsx";

type Props = { criterion: Criterion };

const levelClass: Record<Criterion["level"], string> = {
  A: "bg-blue-100 text-blue-900 border-blue-300",
  AA: "bg-purple-100 text-purple-900 border-purple-300",
  AAA: "bg-gray-200 text-gray-900 border-gray-400",
};

export function CriterionDetail({ criterion }: Props) {
  return (
    <article className="prose max-w-none">
      <header className="flex items-baseline gap-3 not-prose">
        <h1 className="text-2xl font-semibold m-0">
          {criterion.id} — {criterion.title}
        </h1>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded border ${levelClass[criterion.level]}`}
          aria-label={`WCAG level ${criterion.level}`}
        >
          {criterion.level}
        </span>
        {criterion.version === "2.2" && (
          <span className="text-xs px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-900">
            New in 2.2
          </span>
        )}
      </header>

      <section aria-labelledby="plain-english-h">
        <h2 id="plain-english-h" className="text-lg font-semibold mt-6">Plain English</h2>
        <p>{criterion.plainEnglish}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 not-prose">
        <section aria-labelledby="why-h" className="border rounded p-3 bg-amber-50">
          <h3 id="why-h" className="text-sm font-semibold m-0 mb-1">Why it matters</h3>
          <p className="text-sm m-0">{criterion.whyItMatters}</p>
        </section>
        <section aria-labelledby="check-h" className="border rounded p-3 bg-sky-50">
          <h3 id="check-h" className="text-sm font-semibold m-0 mb-1">Quick check (30s)</h3>
          <p className="text-sm m-0">{criterion.quickCheck}</p>
        </section>
      </div>

      <section aria-labelledby="examples-h">
        <h2 id="examples-h" className="text-lg font-semibold mt-6">Code examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          {criterion.codeExamples.map((ex, i) => (
            <CodeExample key={i} example={ex} />
          ))}
        </div>
      </section>

      <section aria-labelledby="mistakes-h">
        <h2 id="mistakes-h" className="text-lg font-semibold mt-6">Common mistakes</h2>
        <ul>
          {criterion.commonMistakes.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="axe-h" className="not-prose">
        <h2 id="axe-h" className="text-lg font-semibold mt-6">Axe-core rules</h2>
        <AxeRuleBadges rules={criterion.axeRules} />
      </section>

      <section aria-labelledby="official-h">
        <h2 id="official-h" className="text-lg font-semibold mt-6">Official text</h2>
        <blockquote className="border-l-4 pl-4 italic text-gray-700">
          {criterion.officialText}
        </blockquote>
        <p>
          <a href={criterion.url} target="_blank" rel="noopener noreferrer">
            Read on W3C →
          </a>
        </p>
      </section>

      {criterion.relatedCriteria.length > 0 && (
        <section aria-labelledby="related-h" className="not-prose">
          <h2 id="related-h" className="text-lg font-semibold mt-6">Related criteria</h2>
          <RelatedCriteria ids={criterion.relatedCriteria} />
        </section>
      )}
    </article>
  );
}
