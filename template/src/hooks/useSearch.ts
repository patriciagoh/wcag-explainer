import { useState, useMemo } from "react";
import type { Criterion } from "../types.ts";

export function filterCriteria(all: Criterion[], query: string): Criterion[] {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((c) => {
    return (
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.plainEnglish.toLowerCase().includes(q)
    );
  });
}

export function useSearch(all: Criterion[]) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterCriteria(all, query), [all, query]);
  return { query, setQuery, filtered };
}
