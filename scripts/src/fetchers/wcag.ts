type WcagJsonInput = {
  principles: Array<{
    id: string;
    name: string;
    guidelines: Array<{
      id: string;
      name: string;
      successcriteria: Array<{
        id: string;
        name: string;
        level: "A" | "AA" | "AAA";
        versions: Array<"2.0" | "2.1" | "2.2">;
        text: string;
        url: string;
      }>;
    }>;
  }>;
};

export type WcagBase = {
  id: string;
  title: string;
  level: "A" | "AA" | "AAA";
  version: "2.0" | "2.1" | "2.2";
  principle: { id: "1" | "2" | "3" | "4"; name: string };
  guideline: { id: string; name: string };
  officialText: string;
  url: string;
};

export function parseWcagJson(input: WcagJsonInput): WcagBase[] {
  const out: WcagBase[] = [];
  for (const p of input.principles) {
    for (const g of p.guidelines) {
      for (const c of g.successcriteria) {
        out.push({
          id: c.id,
          title: c.name,
          level: c.level,
          version: c.versions.sort()[0],
          principle: { id: p.id as "1" | "2" | "3" | "4", name: p.name },
          guideline: { id: g.id, name: g.name },
          officialText: c.text,
          url: c.url,
        });
      }
    }
  }
  return out;
}

export async function fetchWcagJson(url: string): Promise<WcagJsonInput> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WCAG fetch failed: ${res.status}`);
  return res.json() as Promise<WcagJsonInput>;
}
