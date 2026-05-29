import type { Criterion } from "../types.ts";
import { CodeExamples } from "./CodeExamples.tsx";
import { AxeRuleBadges } from "./AxeRuleBadges.tsx";
import { RelatedCriteria } from "./RelatedCriteria.tsx";
import { ExperienceCallout } from "./ExperienceCallout.tsx";
import { CopyButton } from "./CopyButton.tsx";
import { getFacets } from "../augment.ts";
import { criterionToMarkdown } from "../lib/exporters.ts";

type Props = {
  criterion: Criterion;
  inChecklist?: boolean;
  onToggleChecklist?: (id: string) => void;
};

function permalink(id: string): string {
  return `${window.location.origin}${window.location.pathname}#${id}`;
}

const levelClass: Record<Criterion["level"], string> = {
  A: "bg-blue-100 text-blue-900 border-blue-300",
  AA: "bg-purple-100 text-purple-900 border-purple-300",
  AAA: "bg-gray-200 text-gray-900 border-gray-400",
};

export function CriterionDetail({ criterion, inChecklist, onToggleChecklist }: Props) {
  const facets = getFacets(criterion.id);
  return (
    <article className="prose max-w-none">
      <header className="flex items-baseline gap-3 flex-wrap not-prose">
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

      <div className="flex items-center gap-2 flex-wrap mt-3 not-prose">
        {onToggleChecklist && (
          <button
            type="button"
            onClick={() => onToggleChecklist(criterion.id)}
            aria-pressed={inChecklist}
            className={`text-xs px-2 py-0.5 rounded border ${
              inChecklist
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {inChecklist ? "✓ In checklist" : "＋ Add to checklist"}
          </button>
        )}
        <CopyButton text={permalink(criterion.id)} label="🔗 Copy link" />
        <CopyButton text={criterionToMarkdown(criterion)} label="⧉ Copy as Markdown" />
        {facets.components.map((c) => (
          <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">
            {c}
          </span>
        ))}
      </div>

      <section aria-labelledby="plain-english-h">
        <h2 id="plain-english-h" className="text-lg font-semibold mt-6">Plain English</h2>
        <p>{criterion.plainEnglish}</p>
      </section>

      <section aria-labelledby="experience-h" className="not-prose">
        <h2 id="experience-h" className="text-lg font-semibold mt-6">What the user experiences</h2>
        <ExperienceCallout criterionId={criterion.id} />
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

      <section aria-labelledby="examples-h" className="not-prose">
        <h2 id="examples-h" className="text-lg font-semibold mt-6">Code examples</h2>
        <CodeExamples examples={criterion.codeExamples} />
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
