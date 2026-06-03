import { useMemo, useState } from "react";
import type { Criterion, CodeExample } from "../types.ts";

type Props = {
  all: Criterion[];
  onSelect: (id: string) => void;
};

type Card = { criterion: Criterion; example: CodeExample };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** #8 Spot-the-violation: show a snippet, guess pass or fail, learn the criterion. */
export function Quiz({ all, onSelect }: Props) {
  const pool = useMemo<Card[]>(() => {
    const cards: Card[] = [];
    for (const c of all) {
      for (const ex of c.codeExamples) cards.push({ criterion: c, example: ex });
    }
    return shuffle(cards);
  }, [all]);

  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<"pass" | "fail" | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const card = pool[i % pool.length];
  const revealed = answer !== null;
  const correct = revealed && answer === card.example.kind;

  const guess = (g: "pass" | "fail") => {
    if (revealed) return;
    setAnswer(g);
    setScore((s) => ({ right: s.right + (g === card.example.kind ? 1 : 0), total: s.total + 1 }));
  };
  const next = () => {
    setAnswer(null);
    setI((n) => n + 1);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold font-serif text-ink">Spot the violation</h1>
        <p className="text-sm text-ink-2" role="status" aria-live="polite">
          Score: {score.right}/{score.total}
        </p>
      </div>
      <p className="text-ink-2 mt-1">
        Does this snippet <strong>pass</strong> or <strong>fail</strong> its WCAG criterion?
      </p>

      <pre
        className="mt-4 p-3 rounded-md bg-term-bg text-term-text font-mono text-sm overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="Code snippet to evaluate"
      >
        <code>{card.example.code}</code>
      </pre>
      <p className="text-xs text-muted mt-1">
        Language: {card.example.language}
        {card.example.label ? ` · ${card.example.label}` : ""}
      </p>

      {!revealed ? (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => guess("pass")}
            className="px-4 py-2 rounded-md border bg-ok-bg hover:border-ok border-ok-border text-ok font-medium"
          >
            ✓ Pass
          </button>
          <button
            type="button"
            onClick={() => guess("fail")}
            className="px-4 py-2 rounded-md border bg-bad-bg hover:border-bad border-bad-border text-bad font-medium"
          >
            ✕ Fail
          </button>
        </div>
      ) : (
        <div className="mt-4 border border-line rounded-md p-4" role="status" aria-live="polite">
          <p className={`font-semibold ${correct ? "text-ok" : "text-bad"}`}>
            {correct ? "Correct!" : "Not quite."} This example is a{" "}
            <strong>{card.example.kind.toUpperCase()}</strong>.
          </p>
          <p className="text-sm text-ink-2 mt-2">
            Criterion{" "}
            <button
              type="button"
              onClick={() => onSelect(card.criterion.id)}
              className="text-matcha-deep hover:underline font-medium"
            >
              {card.criterion.id} — {card.criterion.title} →
            </button>
          </p>
          <p className="text-sm text-ink-2 mt-1">{card.criterion.plainEnglish}</p>
          <button
            type="button"
            onClick={next}
            className="mt-4 px-4 py-2 rounded-pill bg-ink text-oat font-semibold font-sans hover:bg-ink-2"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
