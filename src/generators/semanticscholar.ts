/**
 * Semantic Scholar Generator
 *
 * Fetches your academic papers, citation count, h-index, and fields of study.
 *
 * @flag --semanticscholar <author-id>
 * @example mcp-me generate ./profile --semanticscholar 1741101
 * @auth None required (public API)
 * @api https://api.semanticscholar.org/api-docs/
 * @data identity, skills (research fields), projects (top cited papers), faq (impact metrics)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface S2Author {
  authorId: string;
  name: string;
  url: string;
  paperCount: number;
  citationCount: number;
  hIndex: number;
  affiliations?: string[];
  homepage?: string;
}

interface S2Paper {
  paperId: string;
  title: string;
  year: number | null;
  citationCount: number;
  url: string;
  fieldsOfStudy?: string[];
}

export const semanticScholarGenerator: GeneratorSource = {
  name: "semanticscholar",
  flag: "semanticscholar",
  flagArg: "<author-id>",
  description: "Semantic Scholar papers, citations, h-index",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const authorId = config.username as string;
    if (!authorId) throw new Error("Semantic Scholar author ID is required");

    console.log(`  [SemanticScholar] Fetching author ${authorId}...`);
    const authorResp = await fetch(
      `https://api.semanticscholar.org/graph/v1/author/${authorId}?fields=name,url,paperCount,citationCount,hIndex,affiliations,homepage`,
      { headers: { "User-Agent": "mcp-me-generator" } },
    );
    if (!authorResp.ok) throw new Error(`Semantic Scholar API error: ${authorResp.status}`);
    const author = (await authorResp.json()) as S2Author;

    console.log(`  [SemanticScholar] Fetching papers...`);
    const papersResp = await fetch(
      `https://api.semanticscholar.org/graph/v1/author/${authorId}/papers?fields=title,year,citationCount,url,fieldsOfStudy&limit=50`,
      { headers: { "User-Agent": "mcp-me-generator" } },
    );
    const papersData = (await papersResp.json()) as { data: S2Paper[] };
    const papers = papersData.data ?? [];
    console.log(`  [SemanticScholar] Found ${papers.length} papers, h-index: ${author.hIndex}.`);

    const fieldCounts: Record<string, number> = {};
    for (const p of papers) {
      for (const f of p.fieldsOfStudy ?? []) {
        fieldCounts[f] = (fieldCounts[f] ?? 0) + 1;
      }
    }

    const technical = Object.entries(fieldCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([field, count]) => ({
        name: field,
        category: "research",
        description: `${count} paper(s) in this field`,
      }));

    const projects = papers
      .sort((a, b) => b.citationCount - a.citationCount)
      .slice(0, 20)
      .map((p) => ({
        name: p.title,
        description: `${p.citationCount} citations`,
        url: p.url,
        status: "completed" as const,
        technologies: p.fieldsOfStudy ?? [],
        start_date: p.year ? `${p.year}` : undefined,
        category: "publication",
      }));

    const identity: PartialProfile["identity"] = {
      name: author.name,
      contact: {
        social: [{ platform: "semanticscholar", url: author.url, username: authorId }],
        ...(author.homepage ? { website: author.homepage } : {}),
      },
    };

    const faq: PartialProfile["faq"] = [{
      question: "What is your academic impact?",
      answer: `${author.paperCount} papers, ${author.citationCount.toLocaleString()} citations, h-index ${author.hIndex}${author.affiliations?.length ? `. Affiliated with ${author.affiliations.join(", ")}` : ""}.`,
      category: "academic",
    }];

    return { identity, skills: { technical }, projects, faq };
  },
};
