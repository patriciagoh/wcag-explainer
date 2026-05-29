import type { CodeExample as CodeExampleType } from "../types.ts";
import { CopyButton } from "./CopyButton.tsx";

type Props = { example: CodeExampleType };

export function CodeExample({ example }: Props) {
  const badgeClass =
    example.kind === "pass"
      ? "bg-green-100 text-green-900 border-green-300"
      : "bg-red-100 text-red-900 border-red-300";
  return (
    <figure className="border rounded-md overflow-hidden">
      <figcaption className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${badgeClass}`}>
          {example.kind === "pass" ? "PASS" : "FAIL"}
        </span>
        <span className="text-sm">{example.label}</span>
        <span className="ml-auto flex items-center gap-2">
          {example.source && <span className="text-xs text-gray-500">{example.source}</span>}
          <CopyButton text={example.code} label="Copy" />
        </span>
      </figcaption>
      <pre className="p-3 m-0 overflow-x-auto bg-gray-900 text-gray-100 text-sm">
        <code>{example.code}</code>
      </pre>
      {example.note && (
        <p className="px-3 py-2 text-sm text-gray-700 border-t bg-gray-50">{example.note}</p>
      )}
    </figure>
  );
}
