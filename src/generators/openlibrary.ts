/**
 * Open Library Generator
 *
 * Searches for an author by name and fetches their published books.
 *
 * @flag --openlibrary <author-name>
 * @example mcp-me generate ./profile --openlibrary "Isaac Asimov"
 * @auth None required (public API)
 * @api https://openlibrary.org/developers/api
 * @data identity (name, bio), projects (books), faq
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface OLAuthor {
  key: string;
  name: string;
  birth_date?: string;
  bio?: string | { value: string };
  wikipedia?: string;
  links?: { url: string; title: string }[];
}

interface OLWork {
  key: string;
  title: string;
  first_publish_year?: number;
  covers?: number[];
  subject?: string[];
}

interface OLSearchResult {
  numFound: number;
  docs: { key: string; name: string; work_count: number; top_work: string }[];
}

export const openlibraryGenerator: GeneratorSource = {
  name: "openlibrary",
  flag: "openlibrary",
  flagArg: "<author-name>",
  description: "Open Library books published by author",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const authorName = config.username as string;
    if (!authorName) throw new Error("Author name is required for Open Library");

    console.log(`  [OpenLibrary] Searching for author "${authorName}"...`);
    const searchResp = await fetch(
      `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(authorName)}&limit=1`,
      { headers: { "User-Agent": "mcp-me-generator" } },
    );
    if (!searchResp.ok) throw new Error(`Open Library API error: ${searchResp.status}`);
    const searchData = (await searchResp.json()) as OLSearchResult;

    if (searchData.numFound === 0) throw new Error(`Author "${authorName}" not found on Open Library`);
    const authorKey = searchData.docs[0].key;

    const authorResp = await fetch(`https://openlibrary.org/authors/${authorKey}.json`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    const author = (await authorResp.json()) as OLAuthor;

    console.log(`  [OpenLibrary] Fetching works for ${author.name}...`);
    const worksResp = await fetch(
      `https://openlibrary.org/authors/${authorKey}/works.json?limit=50`,
      { headers: { "User-Agent": "mcp-me-generator" } },
    );
    const worksData = (await worksResp.json()) as { entries: OLWork[] };
    const works = worksData.entries ?? [];
    console.log(`  [OpenLibrary] Found ${works.length} works.`);

    const bio = typeof author.bio === "string" ? author.bio : author.bio?.value;

    const projects = works.slice(0, 20).map((w) => ({
      name: w.title,
      description: w.title,
      url: `https://openlibrary.org${w.key}`,
      status: "completed" as const,
      technologies: w.subject?.slice(0, 5) ?? [],
      start_date: w.first_publish_year ? `${w.first_publish_year}` : undefined,
      category: "book",
    }));

    const identity: PartialProfile["identity"] = {
      ...(author.name ? { name: author.name } : {}),
      ...(bio ? { bio } : {}),
      contact: {
        social: [{ platform: "openlibrary", url: `https://openlibrary.org/authors/${authorKey}` }],
      },
    };

    const faq: PartialProfile["faq"] = works.length > 0
      ? [{
          question: "Have you published any books?",
          answer: `Yes, ${works.length} work(s) found on Open Library. Notable: ${works.slice(0, 3).map((w) => w.title).join(", ")}.`,
          category: "writing",
        }]
      : [];

    return { identity, projects, faq };
  },
};
