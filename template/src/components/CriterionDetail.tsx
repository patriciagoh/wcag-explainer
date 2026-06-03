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
  A: "bg-neutral-bg text-neutral border-neutral-border",
  AA: "bg-ok-bg text-ok border-ok-border",
  AAA: "bg-warn-bg text-warn border-warn-border",
};

export function CriterionDetail({ criterion, inChecklist, onToggleChecklist }: Props) {
  const facets = getFacets(criterion.id);
  return (
    <article className="prose max-w-none">
      <header className="flex items-baseline gap-3 flex-wrap not-prose">
        <p className="basis-full m-0 font-sans uppercase tracking-[0.18em] text-matcha-deep font-semibold text-xs">
          <span className="inline-block w-[22px] h-[1.5px] bg-matcha align-middle mr-2.5" />
          {criterion.principle.name}
        </p>
        <h1 className="basis-full text-3xl font-serif font-normal tracking-tight text-ink m-0">
          {criterion.id} — {criterion.title}
        </h1>
        <span
          className={`font-mono text-xs font-bold uppercase px-2.5 py-1 rounded-pill border ${levelClass[criterion.level]}`}
          aria-label={`WCAG level ${criterion.level}`}
        >
          {criterion.level}
        </span>
        {criterion.version === "2.2" && (
          <span className="font-mono text-xs font-bold uppercase px-2.5 py-1 rounded-pill border border-warn-border bg-warn-bg text-warn">
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
            className={`inline-flex items-center min-h-6 text-xs px-2 py-1 rounded border ${
              inChecklist
                ? "bg-matcha text-paper border-matcha-deep font-semibold ring-1 ring-inset ring-matcha-deep"
                : "bg-paper hover:bg-oat"
            }`}
          >
            {inChecklist ? "✓ In checklist" : "＋ Add to checklist"}
          </button>
        )}
        <CopyButton text={permalink(criterion.id)} label="🔗 Copy link" />
        <CopyButton text={criterionToMarkdown(criterion)} label="⧉ Copy as Markdown" />
        {facets.components.map((c) => (
          <span key={c} className="text-xs px-2 py-0.5 rounded-pill bg-neutral-bg text-neutral border border-neutral-border">
            {c}
          </span>
        ))}
      </div>

      <section aria-labelledby="plain-english-h">
        <h2 id="plain-english-h" className="text-lg font-semibold mt-6">Plain English</h2>
        <p>{criterion.plainEnglish}</p>
      </section>

      <section aria-labelledby="experience-h" className="not-prose">
        <h2 id="experience-h" className="text-lg font-serif font-medium text-ink mt-6">What the user experiences</h2>
        <ExperienceCallout criterionId={criterion.id} />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 not-prose">
        <section aria-labelledby="why-h" className="rounded-md p-3 bg-warn-bg">
          <h3 id="why-h" className="text-sm font-semibold m-0 mb-1 text-warn">Why it matters</h3>
          <p className="text-sm m-0 text-warn">{criterion.whyItMatters}</p>
        </section>
        <section aria-labelledby="check-h" className="rounded-md p-3 bg-matcha-tint">
          <h3 id="check-h" className="text-sm font-semibold m-0 mb-1 text-ink">Quick check (30s)</h3>
          <p className="text-sm m-0 text-ink-2">{criterion.quickCheck}</p>
        </section>
      </div>

      <section aria-labelledby="examples-h" className="not-prose">
        <h2 id="examples-h" className="text-lg font-serif font-medium text-ink mt-6">Code examples</h2>
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
        <h2 id="axe-h" className="text-lg font-serif font-medium text-ink mt-6">Axe-core rules</h2>
        <AxeRuleBadges rules={criterion.axeRules} />
      </section>

      <section aria-labelledby="official-h">
        <h2 id="official-h" className="text-lg font-semibold mt-6">Official text</h2>
        <blockquote className="border-l-4 pl-4 italic text-ink-2">
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
          <h2 id="related-h" className="text-lg font-serif font-medium text-ink mt-6">Related criteria</h2>
          <RelatedCriteria ids={criterion.relatedCriteria} />
        </section>
      )}
    </article>
  );
}
