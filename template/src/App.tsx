import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/Sidebar.tsx";
import { SearchBar } from "./components/SearchBar.tsx";
import { FacetFilter } from "./components/FacetFilter.tsx";
import { CriterionDetail } from "./components/CriterionDetail.tsx";
import { Welcome } from "./components/Welcome.tsx";
import { RuleLookup } from "./components/RuleLookup.tsx";
import { Quiz } from "./components/Quiz.tsx";
import { Checklist } from "./components/Checklist.tsx";
import { DatasetFooter } from "./components/DatasetFooter.tsx";
import { useCriteria, groupByPrincipleAndGuideline } from "./hooks/useCriteria.ts";
import { useSearch } from "./hooks/useSearch.ts";
import { useChecklist } from "./hooks/useChecklist.ts";
import { matchesFacets } from "./augment.ts";

function readHash(): string | null {
  const h = window.location.hash.replace(/^#/, "");
  return h || null;
}

type Mode = "reference" | "lookup" | "quiz" | "checklist";

// Canonical hosted docs. Absolute so it resolves from the hosted app and from
// any locally-scaffolded copy (which doesn't bundle the docs itself).
const DOCS_URL = "https://patriciagoh.github.io/wcag-explainer/docs/";

const TABS: { id: Mode; label: string }[] = [
  { id: "reference", label: "Reference" },
  { id: "lookup", label: "Rule lookup" },
  { id: "quiz", label: "Quiz" },
  { id: "checklist", label: "My checklist" },
];

export function App() {
  const { all, byId, sourceVersions } = useCriteria();
  const { query, setQuery, filtered } = useSearch(all);
  const checklist = useChecklist();

  const [mode, setMode] = useState<Mode>("reference");
  const [component, setComponent] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const facetFiltered = useMemo(
    () => filtered.filter((c) => matchesFacets(c.id, component, role)),
    [filtered, component, role],
  );
  const grouped = groupByPrincipleAndGuideline(facetFiltered);

  const [selectedId, setSelectedId] = useState<string | null>(() => readHash());
  useEffect(() => {
    const onHashChange = () => setSelectedId(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Selecting a criterion (from anywhere) deep-links it and jumps to Reference.
  const select = (id: string) => {
    window.location.hash = id;
    setMode("reference");
  };

  const selected = selectedId ? byId.get(selectedId) ?? null : null;

  const goHome = () => {
    window.location.hash = "";
    setMode("reference");
  };

  return (
    <div className="flex flex-col h-screen bg-oat text-ink-2">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-matcha-deep focus:text-oat focus:px-3 focus:py-2 focus:rounded focus:shadow focus:outline focus:outline-2 focus:outline-matcha-deep"
      >
        Skip to main content
      </a>
      <header className="bg-paper border-b border-line px-4 py-2 flex items-center gap-4 h-[66px]">
        <h1 className="text-base font-serif font-medium text-ink m-0">
          <button type="button" onClick={goHome} className="hover:underline" title="Home">
            WCAG 2.2 Explainer
          </button>
        </h1>
        <nav aria-label="Modes" className="flex gap-1">
          {TABS.map((t) => {
            const active = mode === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                aria-current={active ? "true" : undefined}
                className={`font-sans text-sm px-3 py-1 border-b-2 ${
                  active
                    ? "text-ink font-bold border-yolk"
                    : "text-ink-2 font-medium border-transparent hover:text-ink"
                }`}
              >
                {t.label}
                {t.id === "checklist" && checklist.ids.size > 0 && (
                  <span className="ml-1.5 text-xs px-1.5 rounded-full bg-matcha-tint text-matcha-deep">
                    {checklist.ids.size}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-sm text-matcha-deep hover:underline"
        >
          Docs &amp; how it's built ↗
        </a>
      </header>

      <div className="flex flex-1 min-h-0">
        {mode === "reference" ? (
          <>
            <aside className="w-80 bg-paper border-r border-line flex flex-col">
              <SearchBar value={query} onChange={setQuery} />
              <FacetFilter
                component={component}
                role={role}
                onComponent={setComponent}
                onRole={setRole}
              />
              <Sidebar grouped={grouped} selectedId={selectedId} onSelect={select} />
              <div role="status" aria-live="polite" className="sr-only">
                {facetFiltered.length} of {all.length} criteria match
              </div>
            </aside>
            <main id="main" tabIndex={-1} className="flex-1 overflow-y-auto p-6">
              {selected ? (
                <CriterionDetail
                  criterion={selected}
                  inChecklist={checklist.has(selected.id)}
                  onToggleChecklist={checklist.toggle}
                />
              ) : (
                <Welcome byId={byId} total={all.length} onSelect={select} onMode={setMode} />
              )}
            </main>
          </>
        ) : (
          <main id="main" tabIndex={-1} className="flex-1 overflow-y-auto">
            {mode === "lookup" && <RuleLookup all={all} byId={byId} onSelect={select} />}
            {mode === "quiz" && <Quiz all={all} onSelect={select} />}
            {mode === "checklist" && (
              <Checklist
                all={all}
                selectedIds={checklist.ids}
                projectName={checklist.projectName}
                onProjectName={checklist.setProjectName}
                onToggle={checklist.toggle}
                onClear={checklist.clear}
                onSelect={select}
              />
            )}
          </main>
        )}
      </div>
      <DatasetFooter versions={sourceVersions} />
    </div>
  );
}

export default App;
