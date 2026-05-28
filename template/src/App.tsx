import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar.tsx";
import { SearchBar } from "./components/SearchBar.tsx";
import { CriterionDetail } from "./components/CriterionDetail.tsx";
import { DatasetFooter } from "./components/DatasetFooter.tsx";
import { useCriteria, groupByPrincipleAndGuideline } from "./hooks/useCriteria.ts";
import { useSearch } from "./hooks/useSearch.ts";

function readHash(): string | null {
  const h = window.location.hash.replace(/^#/, "");
  return h || null;
}

export function App() {
  const { all, byId, sourceVersions } = useCriteria();
  const { query, setQuery, filtered } = useSearch(all);
  const grouped = groupByPrincipleAndGuideline(filtered);

  const [selectedId, setSelectedId] = useState<string | null>(() => readHash());

  useEffect(() => {
    const onHashChange = () => setSelectedId(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const select = (id: string) => {
    window.location.hash = id;
  };

  const selected = selectedId ? byId.get(selectedId) ?? null : null;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 min-h-0">
        <aside className="w-80 border-r flex flex-col">
          <SearchBar value={query} onChange={setQuery} />
          <Sidebar grouped={grouped} selectedId={selectedId} onSelect={select} />
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          {selected ? (
            <CriterionDetail criterion={selected} />
          ) : (
            <p className="text-gray-600">Select a criterion from the sidebar to begin.</p>
          )}
        </main>
      </div>
      <DatasetFooter versions={sourceVersions} />
    </div>
  );
}

export default App;
