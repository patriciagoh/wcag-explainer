import { useCallback, useEffect, useState } from "react";

const IDS_KEY = "wcag-explainer:checklist";
const NAME_KEY = "wcag-explainer:project";

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(IDS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** #9 Project-aware checklist persisted to localStorage. */
export function useChecklist() {
  const [ids, setIds] = useState<Set<string>>(() => load());
  const [projectName, setProjectName] = useState<string>(
    () => localStorage.getItem(NAME_KEY) ?? "",
  );

  useEffect(() => {
    localStorage.setItem(IDS_KEY, JSON.stringify([...ids]));
  }, [ids]);
  useEffect(() => {
    localStorage.setItem(NAME_KEY, projectName);
  }, [projectName]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const has = useCallback((id: string) => ids.has(id), [ids]);
  const clear = useCallback(() => setIds(new Set()), []);

  return { ids, toggle, has, clear, projectName, setProjectName };
}
