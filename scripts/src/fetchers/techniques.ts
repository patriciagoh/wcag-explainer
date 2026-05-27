import * as cheerio from "cheerio";

export type ScrapedExample = {
  label: string;
  code: string;
  sourceTechnique: string;
};

export function extractExamplesFromTechnique(html: string, techniqueId: string): ScrapedExample[] {
  try {
    const $ = cheerio.load(html);
    const examples: ScrapedExample[] = [];
    $("section#examples section.example, section.example").each((_, el) => {
      const $el = $(el);
      const title = $el.find("h3, h4").first().text().trim() || "Example";
      const code = $el.find("pre code").first().text().trim();
      if (code) {
        examples.push({ label: title, code, sourceTechnique: techniqueId });
      }
    });
    return examples;
  } catch {
    return [];
  }
}

export async function fetchTechnique(techniqueId: string): Promise<string> {
  const paths = ["general", "html", "css", "aria", "client-side-script", "failures"];
  for (const p of paths) {
    const try_url = `https://www.w3.org/WAI/WCAG22/Techniques/${p}/${techniqueId}`;
    const res = await fetch(try_url);
    if (res.ok) return res.text();
  }
  throw new Error(`Could not locate technique ${techniqueId}`);
}
