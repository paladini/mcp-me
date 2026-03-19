/**
 * Substack Generator
 *
 * Fetches your Substack newsletter posts via RSS feed.
 *
 * @flag --substack <publication>
 * @example mcp-me generate ./profile --substack platformer
 * @auth None required (public RSS feed)
 * @api https://<publication>.substack.com/feed
 * @data identity, projects (articles), interests (topics), faq
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface SubstackItem {
  title: string;
  link: string;
  pubDate: string;
  categories: string[];
}

function parseSubstackRSS(xml: string): SubstackItem[] {
  const items: SubstackItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1]
      ?? "Untitled";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";

    const categories: string[] = [];
    const catRegex = /<category>(.*?)<\/category>/g;
    let catMatch;
    while ((catMatch = catRegex.exec(block)) !== null) {
      categories.push(catMatch[1]);
    }

    items.push({ title, link, pubDate, categories });
  }

  return items;
}

export const substackGenerator: GeneratorSource = {
  name: "substack",
  flag: "substack",
  flagArg: "<publication>",
  description: "Substack newsletter posts (via RSS)",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const publication = config.username as string;
    if (!publication) throw new Error("Substack publication name is required");

    console.log(`  [Substack] Fetching RSS feed for ${publication}...`);
    const resp = await fetch(`https://${publication}.substack.com/feed`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    if (!resp.ok) throw new Error(`Substack RSS error: ${resp.status} ${resp.statusText}`);

    const xml = await resp.text();
    const items = parseSubstackRSS(xml);
    console.log(`  [Substack] Found ${items.length} posts.`);

    const tagCounts: Record<string, number> = {};
    for (const item of items) {
      for (const cat of item.categories) tagCounts[cat] = (tagCounts[cat] ?? 0) + 1;
    }

    const topTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a).slice(0, 10);

    const projects = items.slice(0, 10).map((item) => ({
      name: item.title,
      description: item.title,
      url: item.link,
      status: "completed" as const,
      technologies: item.categories,
      start_date: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : undefined,
      category: "newsletter",
    }));

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [{ platform: "substack", url: `https://${publication}.substack.com`, username: publication }],
      },
    };

    const faq: PartialProfile["faq"] = items.length > 0
      ? [{
          question: "Do you write a newsletter?",
          answer: `Yes, I publish on Substack at ${publication}.substack.com with ${items.length} posts.${topTags.length > 0 ? ` Topics: ${topTags.slice(0, 5).map(([t]) => t).join(", ")}.` : ""}`,
          category: "writing",
        }]
      : [];

    return { identity, projects, interests: { topics: topTags.map(([t]) => t) }, faq };
  },
};
