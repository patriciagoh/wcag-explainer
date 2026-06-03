import type { CodeExample as CodeExampleType } from "../types.ts";
import { CopyButton } from "./CopyButton.tsx";

type Props = { example: CodeExampleType };

export function CodeExample({ example }: Props) {
  const badgeClass =
    example.kind === "pass"
      ? "bg-ok-bg text-ok border-ok-border"
      : "bg-bad-bg text-bad border-bad-border";
  return (
    <figure className="border border-line rounded-md overflow-hidden">
      <figcaption className="flex items-center gap-2 px-3 py-2 border-b border-line bg-oat">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${badgeClass}`}>
          {example.kind === "pass" ? "PASS" : "FAIL"}
        </span>
        <span className="text-sm text-ink">{example.label}</span>
        <span className="ml-auto flex items-center gap-2">
          {example.source && <span className="text-xs text-muted">{example.source}</span>}
          <CopyButton text={example.code} label="Copy" />
        </span>
      </figcaption>
      <pre
        className="p-3 m-0 overflow-x-auto bg-term-bg text-term-text font-mono text-sm"
        tabIndex={0}
        role="region"
        aria-label={`${example.kind === "pass" ? "Passing" : "Failing"} code example${example.label ? `: ${example.label}` : ""}`}
      >
        <code>{example.code}</code>
      </pre>
      {example.note && (
        <p className="px-3 py-2 text-sm text-ink-2 border-t border-line bg-oat">{example.note}</p>
      )}
    </figure>
  );
}
