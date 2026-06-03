import { useState } from "react";
import type { CodeExample as CodeExampleType } from "../types.ts";
import { CodeExample } from "./CodeExample.tsx";
import { CopyButton } from "./CopyButton.tsx";
import { lineDiff } from "../lib/diff.ts";

type Props = { examples: CodeExampleType[] };

function DiffView({ fail, pass }: { fail: CodeExampleType; pass: CodeExampleType }) {
  const diff = lineDiff(fail.code, pass.code);
  return (
    <figure className="border border-line rounded-md overflow-hidden">
      <figcaption className="flex items-center gap-2 px-3 py-2 border-b border-line bg-oat">
        <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-matcha-tint text-matcha-deep border-matcha-tint-border">
          FIX
        </span>
        <span className="text-sm text-ink">Fail → pass diff</span>
        <span className="ml-auto">
          <CopyButton text={pass.code} label="Copy fixed code" />
        </span>
      </figcaption>
      <pre
        className="p-3 m-0 overflow-x-auto bg-term-bg text-term-text font-mono text-sm"
        tabIndex={0}
        role="region"
        aria-label="Fail to pass code diff"
      >
        <code>
          {diff.map((line, i) => {
            const cls =
              line.type === "add"
                ? "bg-ok-bg text-ok"
                : line.type === "del"
                  ? "bg-bad-bg text-bad"
                  : "";
            const sign = line.type === "add" ? "+" : line.type === "del" ? "-" : " ";
            return (
              <div key={i} className={cls}>
                <span className="select-none mr-2">{sign}</span>
                {line.text || " "}
              </div>
            );
          })}
        </code>
      </pre>
    </figure>
  );
}

export function CodeExamples({ examples }: Props) {
  const [showDiff, setShowDiff] = useState(false);
  const fail = examples.find((e) => e.kind === "fail");
  const pass = examples.find((e) => e.kind === "pass");
  const canDiff = Boolean(fail && pass && fail.language === pass.language);

  return (
    <div>
      {canDiff && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowDiff((v) => !v)}
            aria-pressed={showDiff}
            className="text-sm px-3 py-1 rounded border border-muted bg-paper text-ink-2 hover:bg-matcha-tint"
          >
            {showDiff ? "Show side by side" : "Show fail → pass diff"}
          </button>
        </div>
      )}
      {showDiff && canDiff ? (
        <DiffView fail={fail!} pass={pass!} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examples.map((ex, i) => (
            <CodeExample key={i} example={ex} />
          ))}
        </div>
      )}
    </div>
  );
}
