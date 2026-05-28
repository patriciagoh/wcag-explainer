import * as cheerio from "cheerio";

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

type TocEntry = {
  principleId: string;
  principleName: string;
  guidelineId: string;
  guidelineName: string;
};

function buildTocIndex(html: string): Map<string, TocEntry> {
  const $ = cheerio.load(html);
  const index = new Map<string, TocEntry>();

  $("a.principle").each((_, principleAnchor) => {
    const $p = $(principleAnchor);
    const principleId = $p.find("strong span").text().trim().replace(/\.$/, "");
    const principleName = $p.find("> span").text().trim();
    const $principleLi = $p.parent("li");

    $principleLi.find("> ul > li").each((_, guidelineLi) => {
      const $gl = $(guidelineLi);
      const $gAnchor = $gl.children("a").first();
      const guidelineId = $gAnchor.find("strong span").text().trim();
      const guidelineName = $gAnchor.find("> span").text().trim();

      $gl.find("> ul > li[data-versions]").each((_, scLi) => {
        const $sc = $(scLi);
        const $scAnchor = $sc.children("a").first();
        const criterionId = $scAnchor.find("strong span").text().trim();
        if (criterionId) {
          index.set(criterionId, {
            principleId,
            principleName,
            guidelineId,
            guidelineName,
          });
        }
      });
    });
  });

  return index;
}

function pickEarliestVersion(raw: string): "2.0" | "2.1" | "2.2" {
  const tokens = raw.trim().split(/\s+/);
  if (tokens.includes("2.0")) return "2.0";
  if (tokens.includes("2.1")) return "2.1";
  return "2.2";
}

export function parseQuickrefHtml(html: string): WcagBase[] {
  const $ = cheerio.load(html);
  const toc = buildTocIndex(html);
  const out: WcagBase[] = [];

  $(".sc-wrapper").each((_, wrapper) => {
    const $w = $(wrapper);
    const versions = $w.attr("data-versions") ?? "";
    const $header = $w.children("header");
    const $h4 = $header.find("h4").first();
    const id = $h4.find("strong").first().text().trim();
    const title = $h4.find("span").first().text().trim();
    if (!id || !title) return;

    const $level = $header.find("[class^=level-]").first();
    const levelClass = $level.attr("class") ?? "";
    const levelMatch = /\blevel-(a|aa|aaa)\b/.exec(levelClass);
    if (!levelMatch) return;
    const levelText = levelMatch[1].toUpperCase() as "A" | "AA" | "AAA";

    const officialText = $w
      .find("div.sc-content div.sc-text")
      .first()
      .text()
      .trim()
      .replace(/\s+/g, " ");

    const understandingUrl =
      $w.find("div.understanding a").first().attr("href") ?? "";

    const tocEntry = toc.get(id);
    if (!tocEntry) {
      return;
    }

    const principleIdNum = tocEntry.principleId as "1" | "2" | "3" | "4";

    out.push({
      id,
      title,
      level: levelText,
      version: pickEarliestVersion(versions),
      principle: { id: principleIdNum, name: tocEntry.principleName },
      guideline: { id: tocEntry.guidelineId, name: tocEntry.guidelineName },
      officialText,
      url: understandingUrl,
    });
  });

  return out;
}

export async function fetchQuickref(
  url = "https://www.w3.org/WAI/WCAG22/quickref/",
): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WCAG quickref fetch failed: ${res.status}`);
  return res.text();
}
