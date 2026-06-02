import { useState } from "react";
import type { Criterion } from "../types.ts";
import { CopyButton } from "./CopyButton.tsx";
import { checklistToMarkdown, checklistToPrTemplate } from "../lib/exporters.ts";

type Props = {
  all: Criterion[];
  selectedIds: Set<string>;
  projectName: string;
  onProjectName: (v: string) => void;
  onToggle: (id: string) => void;
  onClear: () => void;
  onSelect: (id: string) => void;
};

/** #9 Project-aware checklist + Markdown / PR-template export. */
export function Checklist({
  all,
  selectedIds,
  projectName,
  onProjectName,
  onToggle,
  onClear,
  onSelect,
}: Props) {
  const [format, setFormat] = useState<"checklist" | "pr">("checklist");
  const selected = all.filter((c) => selectedIds.has(c.id));
  const output =
    format === "checklist"
      ? checklistToMarkdown(selected, projectName)
      : checklistToPrTemplate(selected, projectName);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">My checklist</h1>
      <p className="text-gray-600 mt-1">
        Pick the criteria relevant to your project, then export a checklist or a PR-review template.
        Your selection is saved in this browser.
      </p>

      <label className="block mt-4 text-sm">
        <span className="font-medium">Project name (optional)</span>
        <input
          type="text"
          value={projectName}
          onChange={(e) => onProjectName(e.target.value)}
          placeholder="e.g. Checkout redesign"
          className="w-full mt-1 px-3 py-2 border rounded text-sm"
        />
      </label>

      {selected.length === 0 ? (
        <p className="mt-6 text-gray-600">
          No criteria selected yet. Use the <strong>＋ Add to checklist</strong> button on any
          criterion, or pick from the full list in Reference mode.
        </p>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-3">
            <h2 className="text-lg font-semibold m-0">{selected.length} selected</h2>
            <button type="button" onClick={onClear} className="text-sm text-blue-700 hover:underline">
              Clear all
            </button>
          </div>
          <ul className="mt-2 divide-y border rounded">
            {selected
              .sort((a, b) => a.id.localeCompare(b.id))
              .map((c) => (
                <li key={c.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                  <button
                    type="button"
                    onClick={() => onToggle(c.id)}
                    aria-label={`Remove ${c.id} from checklist`}
                    className="inline-flex items-center justify-center min-w-6 min-h-6 text-red-700 hover:bg-red-50 rounded"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="text-left hover:underline"
                  >
                    <span className="font-mono mr-2">{c.id}</span>
                    {c.title} <span className="text-gray-500">({c.level})</span>
                  </button>
                </li>
              ))}
          </ul>

          <div className="mt-6 flex items-center gap-3">
            <div className="inline-flex rounded border overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => setFormat("checklist")}
                aria-pressed={format === "checklist"}
                className={`px-3 py-1 ${format === "checklist" ? "bg-blue-600 text-white font-semibold ring-1 ring-inset ring-blue-700" : "bg-white"}`}
              >
                Checklist
              </button>
              <button
                type="button"
                onClick={() => setFormat("pr")}
                aria-pressed={format === "pr"}
                className={`px-3 py-1 border-l ${format === "pr" ? "bg-blue-600 text-white font-semibold ring-1 ring-inset ring-blue-700" : "bg-white"}`}
              >
                PR template
              </button>
            </div>
            <CopyButton text={output} label="Copy Markdown" className="text-sm px-3 py-1" />
          </div>
          <pre
            className="mt-3 p-3 rounded-md bg-gray-50 border text-sm overflow-x-auto whitespace-pre-wrap"
            tabIndex={0}
            role="region"
            aria-label="Markdown export"
          >
            {output}
          </pre>
        </>
      )}
    </div>
  );
}
